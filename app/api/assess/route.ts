import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

interface AssessmentData {
  overallScore: number;
  readinessLevel: string;
  careerPath: string;
  competencyScores: Record<string, number>;
  role: string;
  industry: string;
  yearsExperience: string;
  recaptchaToken?: string;
}

/**
 * Verify reCAPTCHA token (skip on localhost for testing)
 */
async function verifyRecaptcha(token: string, hostname: string): Promise<boolean> {
  // Allow localhost for testing without reCAPTCHA
  if (hostname?.includes('localhost') || hostname?.includes('127.0.0.1')) {
    console.log('Localhost detected - skipping reCAPTCHA for testing');
    return true;
  }

  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('reCAPTCHA secret key not configured');
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    
    // Score above 0.5 is considered human (v3)
    return data.success && data.score > 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

/**
 * Check rate limit using Upstash Redis
 */
async function checkRateLimit(ipAddress: string): Promise<boolean> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Rate limiting disabled: Upstash credentials not configured');
    return true;
  }

  try {
    const hourlyKey = `rate-limit:hourly:${ipAddress}`;
    const dailyKey = `rate-limit:daily:${ipAddress}`;

    // Check hourly limit (5 requests per hour)
    const hourlyResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${hourlyKey}`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    const hourlyData = await hourlyResponse.json();
    const hourlyCount = hourlyData.result ? parseInt(hourlyData.result) : 0;

    if (hourlyCount >= 5) {
      console.warn(`Rate limit exceeded for IP ${ipAddress} (hourly)`);
      return false;
    }

    // Check daily limit (20 requests per day)
    const dailyResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${dailyKey}`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    const dailyData = await dailyResponse.json();
    const dailyCount = dailyData.result ? parseInt(dailyData.result) : 0;

    if (dailyCount >= 20) {
      console.warn(`Rate limit exceeded for IP ${ipAddress} (daily)`);
      return false;
    }

    // Increment counters
    await fetch(`${UPSTASH_REDIS_REST_URL}/incr/${hourlyKey}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    await fetch(`${UPSTASH_REDIS_REST_URL}/incr/${dailyKey}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    // Set expiry: 1 hour for hourly, 24 hours for daily
    await fetch(`${UPSTASH_REDIS_REST_URL}/expire/${hourlyKey}/3600`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    await fetch(`${UPSTASH_REDIS_REST_URL}/expire/${dailyKey}/86400`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - if Redis is down, allow the request
    return true;
  }
}

/**
 * Main assessment endpoint with security
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const hostname = request.headers.get('host') || 'unknown';

    const data: AssessmentData = await request.json();

    // 1. Verify reCAPTCHA (skip on localhost)
    const recaptchaValid = await verifyRecaptcha(data.recaptchaToken || '', hostname);
    if (!recaptchaValid && !hostname.includes('localhost')) {
      console.warn(`reCAPTCHA verification failed for IP ${ipAddress}`);
      return NextResponse.json(
        { error: 'Security verification failed. Please try again.' },
        { status: 403 }
      );
    }

    // 2. Check rate limit
    const rateLimitOk = await checkRateLimit(ipAddress);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Too many assessments. Please try again in an hour.' },
        { status: 429 }
      );
    }

    // 3. Validate input
    if (!data.overallScore || !data.competencyScores || !data.role || !data.industry) {
      return NextResponse.json(
        { error: 'Invalid assessment data' },
        { status: 400 }
      );
    }

    // 4. Extract competencies for Claude
    const sortedCompetencies = Object.entries(data.competencyScores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    const topCompetencies = sortedCompetencies.slice(0, 3).map(([name]) => name).join(', ');
    const bottomCompetencies = sortedCompetencies.slice(-3).reverse().map(([name]) => name).join(', ');

    // 5. Build prompt for Claude
    const prompt = `You are a supportive career coach for Project Managers. Your philosophy: "Yes, everyone can become a PM."

Generate personalized, encouraging feedback for someone who:
- Scored ${data.overallScore}/100 on Project Manager readiness (${data.readinessLevel})
- Career trajectory: ${data.careerPath}
- Current role: ${data.role}
- Industry: ${data.industry}
- Years of experience: ${data.yearsExperience}
- Key strengths: ${topCompetencies}
- Areas to develop: ${bottomCompetencies}

Create warm, empowering feedback that:
1. Validates their existing strengths and how they translate to Project Management
2. Shows how their ${data.role} background directly prepares them for Project Management
3. Identifies 1-2 focus areas for growth (be specific to PM skills)
4. Gives 2-3 concrete, actionable next steps
5. Estimates realistic timeline to PM readiness
6. Ends with an encouraging note about their potential

Keep it conversational, human, and supportive (3-4 short paragraphs).
Focus on: planning, scope management, risk management, team coordination, 
timeline management, stakeholder communication, and resource allocation — 
the core PM competencies.`;

    // 6. Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text();
      console.error('Claude API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate feedback' },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    const feedback = claudeData.content[0].text;

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error in assess endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}
