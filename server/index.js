import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'child_process';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from '@google/genai';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);

const FFMPEG_PATH = ffmpegInstaller.path;
const FFPROBE_PATH = ffprobeInstaller.path;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'data', 'analyses.json');
const SCREENING_FILE = path.join(__dirname, 'data', 'screening.json');
const CHILDREN_FILE = path.join(__dirname, 'data', 'children.json');
const MAX_SIZE_MB = 20;
const PORT = process.env.PORT || 3001;

// M-CHAT-R questions (compact, for AI prompt context)
const MCHAT_QUESTIONS_SHORT = [
  { id: 1, text: 'Points at something — does child look at it?', riskOnYes: false },
  { id: 2, text: 'Ever wondered if child might be deaf?', riskOnYes: true },
  { id: 3, text: 'Does child play pretend / make-believe?', riskOnYes: false },
  { id: 4, text: 'Does child like climbing on things?', riskOnYes: false },
  { id: 5, text: 'Unusual finger movements near eyes?', riskOnYes: true },
  { id: 6, text: 'Points with one finger to ask for something?', riskOnYes: false },
  { id: 7, text: 'Points with one finger to show something interesting?', riskOnYes: false },
  { id: 8, text: 'Interested in other children?', riskOnYes: false },
  { id: 9, text: 'Shows things by bringing/holding them up to share?', riskOnYes: false },
  { id: 10, text: 'Responds when you call their name?', riskOnYes: false },
  { id: 11, text: 'Smiles back when you smile?', riskOnYes: false },
  { id: 12, text: 'Gets upset by everyday noises?', riskOnYes: true },
  { id: 13, text: 'Does child walk?', riskOnYes: false },
  { id: 14, text: 'Makes eye contact during interaction?', riskOnYes: false },
  { id: 15, text: 'Tries to copy what you do?', riskOnYes: false },
  { id: 16, text: 'Looks where you look when you turn your head?', riskOnYes: false },
  { id: 17, text: 'Tries to get you to watch them?', riskOnYes: false },
  { id: 18, text: 'Understands when told to do something?', riskOnYes: false },
  { id: 19, text: 'Looks at your face when something new happens?', riskOnYes: false },
  { id: 20, text: 'Likes movement activities (swinging, bouncing)?', riskOnYes: false },
];

// Ensure directories exist
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

// ─── Gemini AI Setup ───────────────────────────────────────────────
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('✓ Gemini API configured');
} else {
  console.warn('⚠ GEMINI_API_KEY not set — video analysis will fail. Add it to .env');
}

// ─── Data Persistence ──────────────────────────────────────────────
function loadAnalyses() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveAnalyses(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function loadScreening() {
  try {
    return JSON.parse(fs.readFileSync(SCREENING_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveScreening(data) {
  fs.writeFileSync(SCREENING_FILE, JSON.stringify(data, null, 2));
}

function loadChildren() {
  try {
    return JSON.parse(fs.readFileSync(CHILDREN_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveChildren(data) {
  fs.writeFileSync(CHILDREN_FILE, JSON.stringify(data, null, 2));
}

function getNextId(analyses) {
  if (analyses.length === 0) return 1;
  return Math.max(...analyses.map((a) => a.id)) + 1;
}

function addLog(analysis, message) {
  if (!analysis.logs) analysis.logs = [];
  analysis.logs.push({ time: new Date().toISOString(), message });
}

// ─── Video Compression ─────────────────────────────────────────────
async function getVideoInfo(filePath) {
  const { stdout } = await execFileAsync(FFPROBE_PATH, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'format=duration:stream=height',
    '-of', 'json',
    filePath,
  ]);
  const info = JSON.parse(stdout);
  return {
    duration: parseFloat(info.format?.duration || '0'),
    height: parseInt(info.streams?.[0]?.height || '0', 10),
  };
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG_PATH, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
    });
    proc.on('error', reject);
  });
}

async function compressVideo(inputPath, outputPath) {
  const stats = fs.statSync(inputPath);
  const fileSizeMB = stats.size / (1024 * 1024);

  if (fileSizeMB <= MAX_SIZE_MB) {
    // No compression needed — just copy
    fs.copyFileSync(inputPath, outputPath);
    return { compressed: false, originalMB: fileSizeMB, finalMB: fileSizeMB };
  }

  console.log(`  Compressing ${fileSizeMB.toFixed(1)}MB → target <${MAX_SIZE_MB}MB`);

  const { duration, height } = await getVideoInfo(inputPath);
  // Target 18MB to leave margin
  const targetBits = 18 * 8 * 1024 * 1024;
  const audioBitrate = 128 * 1024; // 128kbps in bits
  const videoBitrate = Math.floor((targetBits / duration - audioBitrate) / 1024); // kbps
  const safeBitrate = Math.max(videoBitrate, 200); // floor at 200kbps

  const scaleFilter = height > 720 ? ['-vf', 'scale=-2:720'] : [];

  await runFfmpeg([
    '-i', inputPath,
    ...scaleFilter,
    '-c:v', 'libx264',
    '-b:v', `${safeBitrate}k`,
    '-c:a', 'aac',
    '-b:a', '128k',
    '-preset', 'fast',
    '-movflags', '+faststart',
    '-y',
    outputPath,
  ]);

  const compressedStats = fs.statSync(outputPath);
  const compressedMB = compressedStats.size / (1024 * 1024);
  console.log(`  Compressed: ${fileSizeMB.toFixed(1)}MB → ${compressedMB.toFixed(1)}MB`);

  return { compressed: true, originalMB: fileSizeMB, finalMB: compressedMB };
}

// ─── Gemini Analysis ────────────────────────────────────────────────
const ANALYSIS_PROMPT = `You are an expert child development specialist and behavioral analyst.
Analyze this video carefully and provide your observations in the following structured format.
Use markdown formatting.

## Brief Summary
Provide a 2-3 sentence overview of the key observations from this video.

## Detailed Observations

### Communication & Language
Describe any verbal and non-verbal communication patterns observed.

### Social Interaction
Note any social engagement, eye contact, joint attention, or interaction patterns.

### Behavior Patterns
Describe any repetitive behaviors, transitions, responses to stimuli, or notable behavioral patterns.

### Motor Skills
Observe and note both fine motor (hand movements, grasping) and gross motor (walking, jumping, balance) skills.

### Sensory Responses
Note any reactions to sensory input (sounds, lights, textures, etc.).

### Emotional Regulation
Describe emotional expressions, self-regulation attempts, and mood patterns observed.

## Key Strengths
List the child's observable strengths and positive behaviors.

## Areas for Support
Identify areas where additional support or intervention might be beneficial.

## Recommendations
Provide specific, actionable suggestions for caregivers and therapists.

Please be thorough but concise. Focus on observable behaviors rather than making diagnoses.

## Scores
At the very end of your response, provide a JSON block with developmental scores (1-10 scale, where 10 is typical development for age). Use EXACTLY this format:
\`\`\`json
{"communication": X, "eyeContact": X, "socialEngagement": X, "gestures": X, "speechClarity": X, "emotionalResponse": X}
\`\`\`
Replace X with your score based on observations. If a dimension cannot be assessed from this video, use 0.`;

async function analyzeVideoWithGeminiWithLogs(videoPath, prompt, log) {
  if (!ai) throw new Error('Gemini API key not configured');

  const mimeType = 'video/mp4';
  const uploaded = await ai.files.upload({
    file: videoPath,
    config: { mimeType },
  });
  log('File uploaded to Gemini — waiting for processing...');

  // Poll until file is processed
  let fileInfo = uploaded;
  let pollCount = 0;
  while (fileInfo.state === 'PROCESSING') {
    await new Promise((r) => setTimeout(r, 5000));
    fileInfo = await ai.files.get({ name: uploaded.name });
    pollCount++;
    if (pollCount % 2 === 0) {
      log('Still processing on Gemini...');
    }
  }

  if (fileInfo.state === 'FAILED') {
    throw new Error('Gemini failed to process the video file');
  }

  log('Gemini processing complete — generating analysis...');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: createUserContent([
      createPartFromUri(fileInfo.uri, fileInfo.mimeType),
      prompt,
    ]),
  });

  // Clean up uploaded file from Gemini
  try {
    await ai.files.delete({ name: uploaded.name });
  } catch {
    // Ignore cleanup errors
  }

  log('AI analysis received');
  return response.text;
}

function extractSummary(fullAnalysis) {
  // Try to extract the "Brief Summary" section
  const match = fullAnalysis.match(/## Brief Summary\s*\n([\s\S]*?)(?=\n## |$)/);
  if (match) {
    return match[1].trim();
  }
  // Fallback: first 200 chars
  return fullAnalysis.substring(0, 200).trim() + '...';
}

function extractScores(fullAnalysis) {
  try {
    const match = fullAnalysis.match(/```json\s*\n?\s*(\{[^}]+\})\s*\n?\s*```/);
    if (match) {
      const parsed = JSON.parse(match[1]);
      const keys = ['communication', 'eyeContact', 'socialEngagement', 'gestures', 'speechClarity', 'emotionalResponse'];
      const scores = {};
      for (const k of keys) {
        const v = Number(parsed[k]);
        scores[k] = (v >= 0 && v <= 10) ? v : 0;
      }
      return scores;
    }
  } catch { /* ignore parse errors */ }
  return null;
}

function stripScoresBlock(fullAnalysis) {
  return fullAnalysis
    .replace(/#+\s*Scores?\s*\n?\s*```json\s*\n?\s*\{[^}]+\}\s*\n?\s*```/gi, '')
    .replace(/```json\s*\n?\s*\{[^}]+\}\s*\n?\s*```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Background Processing ──────────────────────────────────────────
async function processVideoInBackground(analysisId, originalPath, originalName, scenarioPrompt) {
  const analyses = loadAnalyses();
  const analysis = analyses.find((a) => a.id === analysisId);
  if (!analysis) return;

  const compressedPath = originalPath + '_compressed.mp4';

  // Build prompt with screening context if available
  let prompt = scenarioPrompt || ANALYSIS_PROMPT;
  try {
    const screeningData = loadScreening();
    const screening = Object.values(screeningData)[0];
    if (screening && screening.score !== undefined) {
      const lines = [`Risk score: ${screening.score}/20 (${screening.riskLevel} risk).`];
      if (screening.answers) {
        lines.push('');
        lines.push('Individual responses:');
        for (const q of MCHAT_QUESTIONS_SHORT) {
          const ans = screening.answers[q.id];
          if (ans !== undefined) {
            const flag = q.riskOnYes ? (ans ? ' [RISK]' : '') : (!ans ? ' [RISK]' : '');
            lines.push(`  Q${q.id}. ${q.text} → ${ans ? 'Yes' : 'No'}${flag}`);
          }
        }
      }
      const ctx = `\n\n--- M-CHAT-R SCREENING CONTEXT ---\nThe parent completed the M-CHAT-R (Modified Checklist for Autism in Toddlers, Revised) questionnaire.\n${lines.join('\n')}\n\nItems marked [RISK] indicate answers associated with developmental concern.\nUse this screening data as important context when assessing the child's behavior in the video.\n--- END SCREENING CONTEXT ---\n\n`;
      prompt = ctx + prompt;
    }
  } catch { /* ignore */ }

  // Helper to log + save in one call
  const log = (msg) => {
    addLog(analysis, msg);
    saveAnalyses(analyses);
    console.log(`  [#${analysisId}] ${msg}`);
  };

  try {
    // Step 1: Compress
    const stats = fs.statSync(originalPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB > MAX_SIZE_MB) {
      analysis.status = 'compressing';
      log(`Video is ${fileSizeMB.toFixed(1)}MB — compressing to <${MAX_SIZE_MB}MB...`);
    } else {
      analysis.status = 'compressing';
      log(`Video is ${fileSizeMB.toFixed(1)}MB — no compression needed`);
    }

    const compressionResult = await compressVideo(originalPath, compressedPath);
    analysis.originalSizeMB = parseFloat(compressionResult.originalMB.toFixed(1));
    analysis.compressedSizeMB = parseFloat(compressionResult.finalMB.toFixed(1));

    if (compressionResult.compressed) {
      log(`Compressed: ${compressionResult.originalMB.toFixed(1)}MB → ${compressionResult.finalMB.toFixed(1)}MB`);
    }

    // Step 2: Upload to Gemini
    analysis.status = 'analyzing';
    log(`Uploading video to Gemini (scenario: ${analysis.scenarioTitle || 'general'})...`);
    saveAnalyses(analyses);

    const videoToAnalyze = compressedPath;
    const fullAnalysis = await analyzeVideoWithGeminiWithLogs(videoToAnalyze, prompt, log);

    // Step 3: Save results
    analysis.status = 'completed';
    analysis.scores = extractScores(fullAnalysis);
    analysis.fullAnalysis = stripScoresBlock(fullAnalysis);
    analysis.summary = extractSummary(analysis.fullAnalysis);
    analysis.completedAt = new Date().toISOString();
    log('Analysis complete!');

    console.log(`✓ Analysis #${analysisId} completed for "${originalName}"`);
  } catch (err) {
    console.error(`✗ Analysis #${analysisId} failed:`, err.message);
    analysis.status = 'error';
    analysis.error = err.message;
    log(`Error: ${err.message}`);
  } finally {
    // Cleanup temp files
    try { fs.unlinkSync(originalPath); } catch { /* ignore */ }
    try { fs.unlinkSync(compressedPath); } catch { /* ignore */ }
  }
}

// ─── Express Server ─────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/ogg', 'video/3gpp', 'video/3gpp2',
  'video/mpeg', 'video/x-m4v', 'application/octet-stream',
]);
const ALLOWED_VIDEO_EXTS = /\.(mp4|webm|mov|avi|mkv|ogg|3gp|m4v|mpeg|mpg)$/i;

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max upload
  fileFilter: (_req, file, cb) => {
    const mimeOk = file.mimetype.startsWith('video/') || ALLOWED_VIDEO_MIMES.has(file.mimetype);
    const extOk = ALLOWED_VIDEO_EXTS.test(file.originalname);
    if (mimeOk || extOk) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

// ─── Scenario Lookup ────────────────────────────────────────────
import { SCENARIO_MAP } from './scenarios.js';
console.log(`✓ Loaded ${SCENARIO_MAP.size} scenarios`);

// Upload a video for analysis
app.post('/api/videos/upload', (req, res, next) => {
  req.setTimeout(600_000);
  res.setTimeout(600_000);
  next();
}, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }
  if (!ai) {
    try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
    return res.status(500).json({ error: 'Gemini API key not configured. Set GEMINI_API_KEY in .env' });
  }

  // Read scenario from form data
  const scenarioId = req.body?.scenarioId || null;
  const scenario = scenarioId ? SCENARIO_MAP.get(scenarioId) : null;
  const scenarioTitle = scenario?.title || null;
  const scenarioPrompt = scenario?.aiPrompt || null;

  // Read child info from form data
  const childId = req.body?.childId || null;
  const childName = req.body?.childName || null;

  const analyses = loadAnalyses();
  const id = getNextId(analyses);

  const record = {
    id,
    fileName: req.file.originalname,
    uploadedAt: new Date().toISOString(),
    status: 'compressing',
    summary: null,
    fullAnalysis: null,
    originalSizeMB: parseFloat((req.file.size / (1024 * 1024)).toFixed(1)),
    compressedSizeMB: null,
    completedAt: null,
    error: null,
    logs: [{ time: new Date().toISOString(), message: `Video received${childName ? ` for ${childName}` : ''}${scenarioTitle ? ` — "${scenarioTitle}" scenario` : ''} — starting processing...` }],
    scenarioId,
    scenarioTitle,
    scores: null,
    childId,
    childName,
  };

  analyses.push(record);
  saveAnalyses(analyses);

  // Start background processing (don't await)
  processVideoInBackground(id, req.file.path, req.file.originalname, scenarioPrompt);

  res.status(201).json(record);
});

// Get all analyses
app.get('/api/videos', (_req, res) => {
  const analyses = loadAnalyses();
  res.json(analyses);
});

// Get a single analysis by ID
app.get('/api/videos/:id', (req, res) => {
  const analyses = loadAnalyses();
  const analysis = analyses.find((a) => a.id === parseInt(req.params.id, 10));
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found' });
  }
  res.json(analysis);
});

// ─── Children Endpoints ──────────────────────────────────────────
app.get('/api/children', (_req, res) => {
  const children = loadChildren();
  res.json(children);
});

app.post('/api/children', (req, res) => {
  const { id, name, dateOfBirth } = req.body;
  if (!name || !dateOfBirth) return res.status(400).json({ error: 'name and dateOfBirth are required' });
  const children = loadChildren();
  const child = { id: id || `child_${Date.now()}`, name, dateOfBirth };
  children.push(child);
  saveChildren(children);
  res.status(201).json(child);
});

// ─── Screening Endpoints ──────────────────────────────────────────
app.post('/api/screening', (req, res) => {
  const data = loadScreening();
  const { childId, answers, score, riskLevel, completedAt } = req.body;
  if (!childId) return res.status(400).json({ error: 'childId is required' });
  data[childId] = { childId, answers, score, riskLevel, completedAt };
  saveScreening(data);
  res.status(201).json(data[childId]);
});

app.get('/api/screening/:childId', (req, res) => {
  const data = loadScreening();
  const result = data[req.params.childId];
  if (!result) return res.status(404).json({ error: 'No screening found' });
  res.json(result);
});

// ─── Evaluation Report Upload ──────────────────────────────────────
const REPORT_PROMPT = `You are an expert child development specialist reviewing a clinical/educational evaluation report for a child.
Analyze this document carefully and provide your observations in the following structured format.
Use markdown formatting.

## Brief Summary
Provide a 2-3 sentence overview of the key findings from this evaluation report.

## Key Findings
Summarize the main diagnostic findings, test results, and clinical observations from the report.

## Developmental Profile
Based on the evaluation, describe the child's current developmental profile across these areas:
- Communication & Language
- Social Interaction
- Behavior Patterns
- Motor Skills
- Cognitive/Academic Skills
- Adaptive Behavior

## Strengths Identified
List the strengths noted in the evaluation.

## Areas of Concern
List the areas of concern or diagnosed conditions.

## Recommended Interventions
Summarize any therapy, intervention, or support recommendations from the report.

## Parent Guidance
Based on this evaluation, what should parents focus on? Provide practical suggestions.

## Scores
At the very end of your response, provide a JSON block with developmental scores (1-10 scale, where 10 is typical development for age). Use EXACTLY this format:
\`\`\`json
{"communication": X, "eyeContact": X, "socialEngagement": X, "gestures": X, "speechClarity": X, "emotionalResponse": X}
\`\`\`
Replace X with your best estimate based on the evaluation report. If a dimension is not addressed, use 5 as a neutral baseline.`;

const reportUpload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.post('/api/reports/upload', (req, res, next) => {
  req.setTimeout(600_000);
  res.setTimeout(600_000);
  next();
}, reportUpload.single('report'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  if (!ai) {
    try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const childId = req.body?.childId || null;
  const childName = req.body?.childName || null;

  const analyses = loadAnalyses();
  const id = getNextId(analyses);

  const record = {
    id,
    fileName: req.file.originalname,
    uploadedAt: new Date().toISOString(),
    status: 'analyzing',
    summary: null,
    fullAnalysis: null,
    originalSizeMB: parseFloat((req.file.size / (1024 * 1024)).toFixed(1)),
    compressedSizeMB: null,
    completedAt: null,
    error: null,
    logs: [{ time: new Date().toISOString(), message: `Evaluation report received${childName ? ` for ${childName}` : ''} — analyzing with AI...` }],
    scenarioId: 'evaluation-report',
    scenarioTitle: 'Evaluation Report',
    scores: null,
    childId,
    childName,
  };

  analyses.push(record);
  saveAnalyses(analyses);

  processReportInBackground(id, req.file.path, req.file.originalname);
  res.status(201).json(record);
});

async function processReportInBackground(analysisId, filePath, originalName) {
  const analyses = loadAnalyses();
  const analysis = analyses.find((a) => a.id === analysisId);
  if (!analysis) return;

  const log = (msg) => {
    addLog(analysis, msg);
    saveAnalyses(analyses);
    console.log(`  [#${analysisId}] ${msg}`);
  };

  try {
    log('Uploading document to Gemini...');

    const ext = path.extname(originalName).toLowerCase();
    const mimeMap = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const mimeType = mimeMap[ext] || 'application/octet-stream';

    const uploaded = await ai.files.upload({
      file: filePath,
      config: { mimeType },
    });
    log('File uploaded to Gemini — waiting for processing...');

    let fileInfo = uploaded;
    let pollCount = 0;
    while (fileInfo.state === 'PROCESSING') {
      await new Promise((r) => setTimeout(r, 3000));
      fileInfo = await ai.files.get({ name: uploaded.name });
      pollCount++;
      if (pollCount % 2 === 0) log('Still processing on Gemini...');
    }

    if (fileInfo.state === 'FAILED') {
      throw new Error('Gemini failed to process the document');
    }

    // Build prompt with screening context
    let prompt = REPORT_PROMPT;
    try {
      const screeningData = loadScreening();
      const screening = Object.values(screeningData)[0];
      if (screening && screening.score !== undefined) {
        const lines = [`M-CHAT-R Risk score: ${screening.score}/20 (${screening.riskLevel} risk).`];
        if (screening.answers) {
          lines.push('');
          for (const q of MCHAT_QUESTIONS_SHORT) {
            const ans = screening.answers[q.id];
            if (ans !== undefined) {
              const flag = q.riskOnYes ? (ans ? ' [RISK]' : '') : (!ans ? ' [RISK]' : '');
              lines.push(`  Q${q.id}. ${q.text} → ${ans ? 'Yes' : 'No'}${flag}`);
            }
          }
        }
        prompt = `\n--- SCREENING CONTEXT ---\n${lines.join('\n')}\n--- END ---\n\n` + prompt;
      }
    } catch { /* ignore */ }

    log('Gemini processing complete — generating analysis...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createUserContent([
        createPartFromUri(fileInfo.uri, fileInfo.mimeType),
        prompt,
      ]),
    });

    try { await ai.files.delete({ name: uploaded.name }); } catch { /* ignore */ }

    const fullAnalysis = response.text;
    log('AI analysis received');

    analysis.status = 'completed';
    analysis.scores = extractScores(fullAnalysis);
    analysis.fullAnalysis = stripScoresBlock(fullAnalysis);
    analysis.summary = extractSummary(analysis.fullAnalysis);
    analysis.completedAt = new Date().toISOString();
    log('Analysis complete!');
    saveAnalyses(analyses);

    console.log(`✓ Report #${analysisId} completed for "${originalName}"`);
  } catch (err) {
    console.error(`✗ Report #${analysisId} failed:`, err.message);
    analysis.status = 'error';
    analysis.error = err.message;
    log(`Error: ${err.message}`);
    saveAnalyses(analyses);
  } finally {
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
  }
}

// Error handler for multer
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large (max 500MB)' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Kidooo API server running on http://localhost:${PORT}\n`);
});
