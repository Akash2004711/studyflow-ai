# 🎓 StudyFlow AI

**StudyFlow AI** is an interactive, AI-powered study assistant built with **React**, **Vite**, **Node.js**, **Express**, **Google Gemini**, and **Zod**.

It transforms raw lecture notes, free-form text, or study topics into structured study sets featuring:
- 📖 **Concise Topic Summaries**
- 🎴 **3D Interactive Flip Flashcards** (with keyboard arrow navigation)
- 🧪 **5-Question Knowledge Quizzes** (with instant educational rationales)
- 🎯 **Targeted Re-Test Mode** (isolates missed questions until 100% mastery)

---

## 🏗️ Architecture & Data Flow

```text
               ┌────────────────────────┐
               │    User Study Input    │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │   React Frontend Client│  ← Client input validation (Zod)
               └───────────┬────────────┘  ← AbortController race-condition guard
                           │ POST /api/study/generate
                           ▼
               ┌────────────────────────┐
               │     Express Server     │  ← Zod request payload parsing
               └───────────┬────────────┘
                           │ System Prompt + JSON Schema
                           ▼
               ┌────────────────────────┐
               │    Google Gemini AI    │  ← Model Fallback: gemini-3.8-flash, gemini-2.5-flash
               └───────────┬────────────┘
                           │ Raw JSON response string
                           ▼
               ┌────────────────────────┐
               │    Backend Service     │  ← JSON Sanitization & Backend Zod Schema Validation
               └───────────┬────────────┘
                           │ Validated Payload
                           ▼
               ┌────────────────────────┐
               │   React Frontend Client│  ← Client-side Zod validation defense & state render
               └────────────────────────┘
```

---

## ✨ Key Features

- **Free-Form Study Material Generation**: Turn custom topics, broad concepts, or lecture notes into clean, structured study decks.
- **Dual-Layer Schema Validation (Defense-in-Depth)**: Uses Zod on both the backend service and frontend client to guarantee zero raw text corruption or broken UI states.
- **Interactive 3D Flip Flashcards**: Animated flip cards with progress bars and left/right keyboard arrow navigation.
- **Multiple-Choice Knowledge Check**: 5 multiple-choice questions with instant correct/incorrect visual feedback and detailed educational explanations.
- **Targeted Re-Test Mode for Missed Questions**: Automatically isolates incorrectly answered questions for focused review until 100% mastery is achieved.
- **Stale Request & Race-Condition Guarding**: Uses `useRef` and `AbortController` to cancel in-flight requests when a user starts a new generation.
- **Multi-Model Fallback & High Availability**: Cycles through available Gemini model endpoints (`gemini-3.8-flash`, `gemini-2.5-flash`, etc.) to bypass rate limits and endpoint deprecations.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Akash2004711/studyflow-ai.git
cd studyflow-ai
npm install
```

### 3. Configure Environment Variables
Create or edit `server/.env`:
```bash
cp server/.env.example server/.env
```

Add your Google Gemini API key:
```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
```
> 💡 **Tip**: Get a free API key at [Google AI Studio](https://aistudio.google.com/).

### 4. Run Application
Start both Express backend and Vite frontend concurrently with `npm start` (or `npm run dev`):
```bash
npm install && npm start
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`
- **Health Check**: `http://localhost:5001/api/health`

### 5. Run Automated Tests
Execute the automated validation and error-handling test suite:
```bash
npm test
```

---

## 📖 Usage Guide

1. **Generate a Study Set**:
   - Enter a topic or paste study notes (e.g., *"Photosynthesis process in plants"* or *"JavaScript Async/Await"*).
   - Alternatively, click one of the quick suggestion pills below the input box.
   - Click **Generate Study Set**.
2. **Review Topic Summary**:
   - Read the synthesized 2–4 sentence core concept summary.
3. **Practice Flashcards**:
   - Click any card (or press **Space**) to flip between question and answer.
   - Click **Previous** / **Next** or use keyboard **Left Arrow (`←`)** / **Right Arrow (`→`)** to navigate.
4. **Take Knowledge Quiz**:
   - Select an answer for each of the 5 multiple-choice questions.
   - Click **Submit Answer** to reveal immediate visual feedback and detailed explanations.
   - Progress through all questions to reach the **Quiz Score Dashboard**.
5. **Targeted Review / Retry Missed Questions**:
   - On the results screen, review detailed explanations for missed items.
   - Click **Retry Wrong Answers** to launch a focused quiz containing only the questions you got wrong.

---

## 📡 API Specification

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "geminiConfigured": true,
  "timestamp": "2026-09-28T05:00:00.000Z"
}
```

### 2. Generate Study Material
- **Endpoint**: `POST /api/study/generate`
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "input": "Explain JavaScript closures for a beginner"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "topic": "JavaScript Closures",
    "summary": "A closure is the combination of a function bundled together with references to its surrounding state...",
    "flashcards": [
      {
        "id": "card-1",
        "question": "What is a lexical scope in JavaScript?",
        "answer": "Lexical scope means variable accessibility is determined by the physical placement of code."
      }
    ],
    "quiz": [
      {
        "id": "question-1",
        "question": "Which of the following describes a JavaScript closure?",
        "options": [
          "A function retaining access to outer lexical scope variables",
          "A CSS preprocessor",
          "A synchronous database lock",
          "A built-in DOM node"
        ],
        "correctAnswer": 0,
        "explanation": "Closures allow inner functions to retain scope references even after the outer function finishes."
      }
    ]
  }
}
```

#### Error Response (`400 / 429 / 502 / 503`)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "AI rate limit reached. Please wait a moment and try again."
  }
}
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Left Arrow (←)` | Navigate to previous flashcard | Flashcard Deck |
| `Right Arrow (→)` | Navigate to next flashcard | Flashcard Deck |
| `Click / Space` | Flip active flashcard | Active Flashcard |

---

## 🧪 Error Handling & Standardized Codes

| Error Code | HTTP Status | Description |
| :--- | :---: | :--- |
| `INVALID_INPUT` | `400` | Input is empty, missing, or exceeds maximum character length. |
| `RATE_LIMIT_EXCEEDED` | `429` | Gemini API rate quota reached. User prompted with retry button. |
| `AI_SERVICE_UNAVAILABLE` | `503` / `401` | Missing or unconfigured API key environment variable. |
| `AI_RESPONSE_MALFORMED` | `502` | AI returned unparseable JSON output. |
| `AI_RESPONSE_INVALID` | `502` | AI output failed Zod schema structural validation. |

---

## 🤖 AI Usage Note

AI coding tools and LLMs were utilized during the development of StudyFlow AI for:
- **Architectural Brainstorming**: Designing the dual-layer Zod validation pattern and request cancellation workflow.
- **Boilerplate Generation**: Accelerating initial Zod schema definitions and component structure.
- **Refinement & Testing**: Drafting automated unit test suites for schema validation and edge-case error scenarios.

All generated code, state management flow, CSS design tokens, error handling rules, and system prompts were manually reviewed, refined, and validated for security, correctness, and adherence to production standards.

---

## ⚠️ Known Limitations

- **Free-Tier LLM Rate Quotas**: Free-tier Google Gemini API keys are subject to Rate Per Minute (RPM) limits. The application handles `HTTP 429` status codes gracefully with a user-friendly retry notice.
- **In-Memory Session Lifecycle**: Generated study sets reside in local React component state. Refreshing the browser page resets the active session.
- **Single-Prompt Set Generation**: Generates 5 flashcards and 5 quiz questions per topic request to maintain fast response times and strict schema adherence.

---

## ⏱️ Time Spent

| Phase | Description | Time Spent |
| :--- | :--- | :---: |
| **Architecture & Schema Design** | Data flow design, Zod schemas, error taxonomy | ~0.75 hrs |
| **Backend & Gemini Service** | Express proxy server, Gemini SDK, prompt engineering, fallback logic | ~1.25 hrs |
| **Frontend UI & Components** | React components, 3D flip card animations, quiz retry flow | ~1.75 hrs |
| **Validation & State Protection** | Dual Zod validation, `AbortController` stale request handling | ~1.00 hr |
| **Testing & Documentation** | Automated unit test suite, README overhaul, git setup | ~0.75 hrs |
| **Total Estimated Time** | | **~5.50 hours** |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.
