# PathToPM Skeleton - Setup Guide

This guide will help you set up the PathToPM assessment skeleton in your local folder: `/Users/pamsagarnaga/Claude Cowork Sandbox/PM Assessment`

---

## **Step 1: Download All Files**

All the files below are available for download in `/mnt/user-data/outputs/`. Download each file listed.

---

## **Step 2: Create Your Project Folder Structure**

Navigate to your work directory and create the project structure:

```bash
cd "/Users/pamsagarnaga/Claude Cowork Sandbox"

# Create the main project folder
mkdir -p "PM Assessment"
cd "PM Assessment"

# Create subdirectories
mkdir -p app components lib public
```

Your final structure should look like:
```
PM Assessment/
├── app/
├── components/
├── lib/
├── public/
└── (config files go in root)
```

---

## **Step 3: Place the Files in the Right Locations**

Here's exactly where each downloaded file goes:

### **Root Directory Files** (in `/Users/pamsagarnaga/Claude Cowork Sandbox/PM Assessment/`)
1. `package.json` → root
2. `tsconfig.json` → root
3. `next.config.js` → root
4. `.gitignore` → root

### **App Directory** (`app/` folder)
1. `app-layout.tsx` → `app/layout.tsx` (rename when placing)
2. `app-page.tsx` → `app/page.tsx` (rename when placing)

### **Components Directory** (`components/` folder)
1. `components-LandingPage.tsx` → `components/LandingPage.tsx` (rename)
2. `components-BackgroundForm.tsx` → `components/BackgroundForm.tsx` (rename)
3. `components-AssessmentForm.tsx` → `components/AssessmentForm.tsx` (rename)
4. `components-ResultsPage.tsx` → `components/ResultsPage.tsx` (rename)

### **Lib Directory** (`lib/` folder)
1. `lib-questions.ts` → `lib/questions.ts` (rename)

---

## **File Placement Summary**

```
PM Assessment/
├── app/
│   ├── layout.tsx          (from app-layout.tsx)
│   └── page.tsx            (from app-page.tsx)
├── components/
│   ├── LandingPage.tsx     (from components-LandingPage.tsx)
│   ├── BackgroundForm.tsx  (from components-BackgroundForm.tsx)
│   ├── AssessmentForm.tsx  (from components-AssessmentForm.tsx)
│   └── ResultsPage.tsx     (from components-ResultsPage.tsx)
├── lib/
│   └── questions.ts        (from lib-questions.ts)
├── public/                 (empty for now)
├── package.json
├── tsconfig.json
├── next.config.js
└── .gitignore
```

---

## **Step 4: Install Dependencies**

Open Terminal and navigate to your project:

```bash
cd "/Users/pamsagarnaga/Claude Cowork Sandbox/PM Assessment"
```

Then install dependencies:

```bash
npm install
```

This will take 1-2 minutes. You'll see a `node_modules` folder created.

---

## **Step 5: Run the Development Server**

```bash
npm run dev
```

You should see:
```
> next dev
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

---

## **Step 6: Open in Browser**

Visit: **http://localhost:3000**

You should see the PathToPM landing page!

---

## **Step 7: Test the Flow**

1. Click **"Start Assessment"**
2. Select a role from the dropdown
3. Select an industry from the dropdown
4. Check some transferable skills
5. Click **"Continue to Assessment"**
6. Answer all 24 questions (scroll to answer them all)
7. Watch the progress bar fill up
8. Click **"See Results"** when all are answered
9. See your profile displayed
10. Click **"Edit Answers"** to go back

---

## **Troubleshooting**

### **"npm command not found"**
- Make sure Node.js is installed
- Download from https://nodejs.org (use LTS version)

### **"Module not found: @/components/LandingPage"**
- Make sure files are named exactly as shown above (case-sensitive)
- Make sure files are in the correct directories

### **Port 3000 already in use**
- Stop any other development servers
- Or run: `npm run dev -- -p 3001` (uses port 3001 instead)

### **TypeScript errors**
- These are warnings, not blocking errors
- Run `npm run dev` again

---

## **To Stop the Server**

Press **Ctrl+C** in your Terminal

---

## **Next Steps**

Once the skeleton is working:
1. Confirm the flow is smooth
2. Give feedback on UX/layout
3. I'll build Phase 1B (scoring logic)

---

## **File Naming Reminder**

When you download files, they come with prefixes like:
- `app-layout.tsx` → Rename to `layout.tsx` when placing in `app/` folder
- `components-LandingPage.tsx` → Rename to `LandingPage.tsx` when placing in `components/` folder
- `lib-questions.ts` → Rename to `questions.ts` when placing in `lib/` folder

This is just so you know which folder each file belongs in. Once you place them, remove the prefix!

---

**Ready? Start with Step 1: Download all files, then follow the steps above!**
