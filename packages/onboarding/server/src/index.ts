// ✅ Polyfill for Promise.withResolvers for Node.js < 21
// if (!Promise.withResolvers) {
//   Promise.withResolvers = function <T>() {
//     let resolve: (value: T | PromiseLike<T>) => void;
//     let reject: (reason?: any) => void;
//     const promise = new Promise<T>((res, rej) => {
//       resolve = res;
//       reject = rej;
//     });
//     return { promise, resolve: resolve!, reject: reject! };
//   };
// }

class DOMMatrix {
  constructor() {}
}
(global as any).DOMMatrix = DOMMatrix;

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { Octokit } from "@octokit/rest";
import * as cheerio from "cheerio";

// ✅ Correct import for pdfjs-dist (use the main import)
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

dotenv.config();
const app = express();

// --- Middleware ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://0wqvpl8p-5173.inc1.devtunnels.ms",
  "https://your-frontend-app.vercel.app" // Add your actual frontend Vercel URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS for origin: ${origin}`);
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));

// --- API Keys and Clients ---
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (!GOOGLE_API_KEY || !GITHUB_ACCESS_TOKEN) {
  console.error("FATAL: Missing GOOGLE_API_KEY or GITHUB_ACCESS_TOKEN in .env");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN });

// Gemini model
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;

// --- Reusable Gemini Helper ---
async function generateText(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      GEMINI_URL,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (err: any) {
    const msg = err.response?.data?.error?.message || "Failed to call Gemini API";
    console.error("❌ Gemini REST API error:", msg);
    throw new Error(msg);
  }
}

// Helper: get URL title
async function getUrlTitle(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url, { timeout: 3000 });
    const $ = cheerio.load(data);
    return $("title").text() || "No title found";
  } catch {
    return "Link is broken or could not be reached.";
  }
}

// ✅ Helper: parse PDF buffer (Uint8Array) and extract text + links
async function extractPdfTextAndLinks(data: Uint8Array) {
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  let fullText = "";
  let links: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";

    const annotations = await page.getAnnotations();
    for (const annot of annotations) {
      if (annot.subtype === "Link" && annot.url) links.push(annot.url);
    }
  }

  return { text: fullText, links: [...new Set(links)] };
}

// =================================================================================
// --- PROFILE & RESUME ANALYSIS ENDPOINT ---
// =================================================================================
app.post("/api/analyze-profile", async (req: Request, res: Response) => {
  const { resumeUrl, githubUrl, jobTitle, jobDescription } = req.body;

  try {
    console.log("🚀 Starting advanced profile analysis...");
    let resumeAnalysis = {};
    let githubAnalysis = {};

    // --- 1. Resume Analysis ---
    if (resumeUrl) {
      console.log("📄 Parsing resume from URL...");
      const response = await axios.get(resumeUrl, { responseType: "arraybuffer" });
      const pdfData = new Uint8Array(response.data);
      const { text: resumeText, links: extractedUrls } = await extractPdfTextAndLinks(pdfData);

      console.log(`🔗 Found ${extractedUrls.length} links in resume.`);
      const linkContext = await Promise.all(
        extractedUrls.slice(0, 5).map(async (url: string) => ({
          url,
          title: await getUrlTitle(url),
        }))
      );

      const resumePrompt = `
        You are a highly critical technical recruiter for a "${jobTitle}" position.
        Job Description: ${jobDescription}
        CANDIDATE'S RESUME (TEXT):
        ${resumeText.substring(0, 6000)}
        LINKS FOUND IN RESUME:
        ${JSON.stringify(linkContext, null, 2)}
        INSTRUCTIONS:
        Provide a harsh but fair evaluation. Score the resume from 0-100 based on direct relevance. Analyze projects and cross-reference them with links. Do the links work? Does their content support claims? Identify strengths, weaknesses, and red flags.
        Return a single, minified JSON object with NO markdown, containing keys: "resume_score", "resume_analysis" (as a JSON object with "strengths", "weaknesses", "red_flags").`;

      try {
        resumeAnalysis = JSON.parse(await generateText(resumePrompt));
      } catch {
        console.error("❌ Invalid JSON from Gemini for resume");
        resumeAnalysis = { resume_score: 0, resume_analysis: { strengths: [], weaknesses: [], red_flags: ["Invalid Gemini output"] } };
      }

      console.log("✅ Resume analysis complete.");
    }

    // --- 2. GitHub Analysis ---
    if (githubUrl) {
      console.log("💻 Fetching GitHub data...");
      const username = githubUrl.split("/").pop();
      if (username) {
        const { data: userProfile } = await octokit.users.getByUsername({ username });
        const { data: repos } = await octokit.repos.listForUser({ username, sort: "pushed", per_page: 5 });
        const repoSummaries = repos.map((repo) => ({
          name: repo.name,
          description: repo.description,
          last_pushed: repo.pushed_at,
          stars: repo.stargazers_count,
          language: repo.language,
        }));

        const githubPrompt = `
          You are a senior engineering manager evaluating a candidate's GitHub for a "${jobTitle}" position.
          Profile Bio: ${userProfile.bio}
          Public Repos (most recent 5): ${JSON.stringify(repoSummaries)}
          INSTRUCTIONS:
          Critically analyze the GitHub data. Score the profile from 0-100 based on project relevance, inferred code quality, and activity. Does the user build real projects or just fork tutorials? Are projects documented?
          Return ONLY a single, minified JSON object with keys: "github_score", "github_analysis". No explanations, no markdown, no extra text.
        `;

        try {
          const rawResult = await generateText(githubPrompt);
          const match = rawResult.match(/\{.*\}/s);
          if (match) {
            githubAnalysis = JSON.parse(match[0]);
          } else {
            throw new Error("No valid JSON found in Gemini output");
          }
        } catch (err: any) {
          console.error("❌ Invalid JSON from Gemini for GitHub:", err.message);
          githubAnalysis = {
            github_score: 0,
            github_analysis: { top_project_analysis: [], concerns: ["Invalid Gemini output"] },
          };
        }

        console.log("✅ GitHub analysis complete.");
      }
    }

    res.json({ ...resumeAnalysis, ...githubAnalysis });
  } catch (err: any) {
    console.error("❌ Full profile analysis failed:", err.message);
    res.status(500).json({ message: "Failed to analyze profile.", detail: err.message });
  }
});

// =================================================================================
// --- HR INTERVIEW ENDPOINT ---
// =================================================================================
app.post("/api/generate-response", async (req: Request, res: Response) => {
  const { jobTitle, jobDescription, previousTranscript = [], proctoringEvents = [], isFinalAnalysis = false } = req.body;

  console.log("📥 /generate-response (HR) input:", { jobTitle, transcriptLength: previousTranscript.length, isFinalAnalysis });

  let prompt: string;

  if (isFinalAnalysis) {
    const tabSwitches = (proctoringEvents as any[]).filter((e: any) => e.type === "tab_switch_away").length;
    prompt = `You are a senior HR hiring manager providing a harsh but fair evaluation for the "${jobTitle}" position. PROCTORING DATA: The candidate switched tabs ${tabSwitches} time(s). A high number (>1) should negatively impact the score. TRANSCRIPT: ${JSON.stringify(previousTranscript)} INSTRUCTIONS: Return a single, minified JSON object with NO markdown. It must have two keys: "hr_interview_summary" (a concise, critical text summary) and "hr_interview_score" (an integer score from 0 to 100).`;
  } else {
    prompt = `You are an expert AI HR interviewer for the "${jobTitle}" position. Job description: ${jobDescription}. Your goal is to have a natural, flowing conversation. Based on the transcript so far, ask the next most logical question. RULES: 1. If the candidate's last answer was detailed, ask about a *different* core competency. 2. If the candidate's last answer was short or vague, ask a clarifying follow-up question. 3. Do not repeat a question. Transcript: ${JSON.stringify(previousTranscript)} Return ONLY the single, concise question text.`;
  }

  console.log("✍️ Sending HR prompt...");

  try {
    const generated = await generateText(prompt);
    res.json({ responseText: generated.trim() });
  } catch (err: any) {
    res.status(500).json({ message: "Error generating HR response.", detail: err.message });
  }
});

// =================================================================================
// --- TECHNICAL INTERVIEW ENDPOINTS ---
// =================================================================================
app.post("/api/generate-technical-assessment", async (req: Request, res: Response) => {
  const { jobTitle, jobDescription } = req.body;

  const prompt = `You are an AI hiring manager. For a "${jobTitle}" position (${jobDescription}), create a technical assessment. Generate a JSON object containing: 1. An array of 10 multiple-choice logical and aptitude questions. Each with "question", "options" (array of 4), and "correctAnswer". 2. An array of 2 coding challenges. Each with "title", "description", and "starter_code" (object with 'javascript', 'python', 'java'). Return ONLY the single, minified JSON object with keys "aptitudeQuestions" and "codingChallenges". No markdown.`;

  console.log("✍️ Generating technical assessment...");

  try {
    const generated = await generateText(prompt);
    res.json(JSON.parse(generated));
  } catch (err: any) {
    res.status(500).json({ message: "Error generating assessment.", detail: err.message });
  }
});

app.post("/api/analyze-code", async (req: Request, res: Response) => {
  const { code, language, challenge } = req.body;

  const simulatedOutput = "Simulated execution: 2/3 test cases passed.";

  const prompt = `As a senior software engineer, analyze the code for this challenge: "${challenge.title}". Code: \`\`\`${language}\n${code}\n\`\`\` Provide a concise analysis on Quality, Correctness, Complexity (Big O), and Suggestions. Format as a single, minified JSON object with keys "quality", "correctness", "complexity", and "suggestions". No markdown.`;

  console.log("✍️ Analyzing code submission...");

  try {
    const analysisJson = await generateText(prompt);
    const analysis = JSON.parse(analysisJson);
    res.json({ simulatedOutput, ...analysis });
  } catch (err: any) {
    res.status(500).json({ message: "Error analyzing code.", detail: err.message });
  }
});

app.post("/api/finish-technical-interview", async (req: Request, res: Response) => {
  const { jobTitle, transcript, proctoringEvents } = req.body;

  const tabSwitches = (proctoringEvents as any[]).filter((e: any) => e.type === "tab_switch_away").length;
  const copyEvents = (proctoringEvents as any[]).filter((e: any) => e.type === "copy").length;
  const pasteEvents = (proctoringEvents as any[]).filter((e: any) => e.type === "paste").length;

  console.log("📊 Calculating technical score...");

  // Define types for clarity and type safety
  interface Answer {
    questionIndex: number;
    answer?: string;
    code?: string;
    passedAllTests?: boolean;
  }

  interface Question {
    type: 'aptitude' | 'coding';
    correctAnswer?: string;
  }

  // --- STEP 1: Flatten answers from transcript ---
  const answers: Answer[] = transcript.flatMap((t: any) => t.submission?.answers || []);
  const questions: Question[] = transcript.flatMap((t: any) => t.assessment?.questions || []);
 
  // --- STEP 2: Separate aptitude and coding answers ---
  const aptitudeAnswers = answers.filter(a => typeof a.answer === 'string');
  const codingSubmissions = answers.filter(a => typeof a.code === 'string');

  const correctAptitudeCount = aptitudeAnswers.filter(a => {
    const question = questions[a.questionIndex];
    return question && question.correctAnswer && a.answer?.trim() === question.correctAnswer.trim();
  }).length; 

  const totalAptitude = questions.filter(q => q.type === 'aptitude').length || 10;

  // --- STEP 3: Weighted scoring ---
  const aptitudeWeight = 1;
  const codingWeight = 5;
  const totalPossible = totalAptitude * aptitudeWeight + 2 * codingWeight;

  let rawScore = 0;
  rawScore += correctAptitudeCount * aptitudeWeight;
  codingSubmissions.forEach(sub => {
    if (sub.code && sub.code.trim().length > 0) rawScore += codingWeight * 0.6;
    if (sub.passedAllTests) rawScore += codingWeight * 1.0;
  });

  let technicalScore = Math.round((rawScore / totalPossible) * 100);

  // --- STEP 4: Proctoring penalties ---
  if (tabSwitches > 2) technicalScore -= 10;
  if (copyEvents > 0 || pasteEvents > 0) technicalScore -= 10;
  if (technicalScore < 0) technicalScore = 0;

  // --- STEP 5: Auto-zero check ---
  const hasAnswers = aptitudeAnswers.some(a => a.answer && a.answer.trim().length > 0);
  const hasCode = codingSubmissions.some(a => a.code && a.code.trim().length > 0);

  if (!hasAnswers && !hasCode) {
    console.log("🚨 No valid answers or code submissions — assigning score 0");
    return res.json({
      technical_interview_summary: "No answers or code submissions were provided. Automatic disqualification.",
      technical_interview_score: 0
    });
  }

  // --- STEP 6: Optional Gemini/AI analysis ---
  const prompt = `You are a senior engineering hiring manager evaluating a "${jobTitle}" candidate.
PROCTORING: Tab Switches=${tabSwitches}, Copies=${copyEvents}, Pastes=${pasteEvents}.
AUTO-CALCULATED SCORE=${technicalScore}.
TRANSCRIPT & SUBMISSIONS: ${JSON.stringify(transcript, null, 2)}.
INSTRUCTIONS:
Provide a concise, critical summary of the candidate's aptitude, coding, and behavior.
Do not rescore — base your summary on performance and professionalism.
Return a single JSON object with:
{
  "technical_interview_summary": "text",
  "technical_interview_score": ${technicalScore}
}`;

  console.log("✍️ Performing final technical analysis...");

  try {
    const generated = await generateText(prompt);
    const aiResult = JSON.parse(generated);
    aiResult.technical_interview_score = technicalScore;
    res.json(aiResult);
  } catch (err: any) {
    console.error("❌ Gemini failed, fallback to computed score");
    res.json({
      technical_interview_summary: "Gemini summary unavailable. Fallback to computed score.",
      technical_interview_score: technicalScore
    });
  }
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ 
    message: "Server is running!", 
    timestamp: new Date().toISOString(),
    status: "OK"
  });
});

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Export for Vercel serverless
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
}