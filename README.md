# Kidooo

AI-powered autism screening app for parents. Upload videos or evaluation reports, get developmental insights from Google Gemini, track progress with charts.


## How to Run

```bash
npm install
```

Create `.env` in the project root:

```env
GEMINI_API_KEY=your_key_here
```

Start dev:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Production build:

```bash
npm run build && npm run preview
```

Requires Node.js 18+.

## Features

1. **Scenario-based video upload** — 8 guided screening scenarios (Response to Name, Joint Attention, Pretend Play, etc.) with parent scripts and tailored AI prompts per age group
2. **In-browser camera recording** — record directly from the app using MediaRecorder API, review and re-record before uploading
3. **Auto video compression** — FFmpeg compresses videos to <20MB before sending to Gemini
4. **AI video analysis via Gemini 3 Flash** — structured developmental observations across communication, social interaction, behavior, motor skills, sensory responses, and emotional regulation
5. **Evaluation report upload** — upload PDFs, images, or text documents of clinical evaluations; Gemini analyzes them and extracts developmental scores
6. **M-CHAT-R questionnaire** — 20-question standardized screening integrated into the Add Child flow; results fed as context to all AI analyses
7. **Developmental charts** — radar chart, bar chart, and progress bars showing scores across 6 dimensions, averaged across all assessments
8. **Multi-child support** — add multiple children with date of birth, switch between them, each with their own screening data
9. **Real-time progress tracking** — upload percentage, compression status, and AI analysis logs streamed live
10. **PDF report export** — download a full report with child info, M-CHAT-R results, all analyses and score tables via jsPDF
11. **Share with specialist** — email or copy a text summary of all analyses to share with a doctor
12. **Resources & support links** — Autism Speaks, CDC milestones, parent tips, Autism Response Team contact

## Tech Stack

React 19 + TypeScript + Vite 7 | Tailwind CSS v4 | Chart.js | jsPDF | Node.js + Express | Google Gemini | FFmpeg | Multer | File-based JSON storage

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/videos/upload | Upload video for analysis |
| POST | /api/reports/upload | Upload evaluation report for analysis |
| GET | /api/videos | List all analyses |
| GET | /api/videos/:id | Get single analysis |
| POST | /api/children | Add a child |
| GET | /api/children | List children |
| POST | /api/screening | Save M-CHAT-R results |
| GET | /api/screening/:childId | Get screening results |

## License

MIT — Jay Patil
