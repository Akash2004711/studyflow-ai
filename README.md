# 🎓 StudyFlow AI

**StudyFlow AI** is a state-of-the-art, interactive AI-powered study assistant built with **React**, **Vite**, **Node.js**, **Express**, **Google Gemini**, and **Zod**.

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

### 🧠 Free-Form Input & Smart Topic Generation
- Accepts custom topics, broad concepts, lecture notes, or specific questions.
- Includes quick-start topic suggestions, real-time character counter, and instant client-side validation.

### 🎴 Interactive 3D Flip Flashcards
- Smooth 3D flip animation revealing concept answers.
- Progress tracking bar with active card indicators.
- **Keyboard Shortcut Support**: Navigate cards effortlessly using `Left Arrow (←)` and `Right Arrow (→)` keys.

### 🧪 Multiple-Choice Knowledge Check
- Generates 5 unique multiple-choice questions with 4 distinct options per question.
- Instant visual feedback on submission (green highlight for correct, red for incorrect).
- In-depth educational explanations provided for every question.

### 🎯 Targeted Retry Mode for Missed Questions
- Automatically isolates questions answered incorrectly.
- Allows students to re-attempt only missed items without regenerating the entire study set.
- Celebrates with a completion badge once 100% accuracy is reached.

### 🛡️ Dual-Layer Schema Validation (Defense-in-Depth)
- Uses **Zod** to validate AI outputs on **both the backend service and frontend client**.
- Guarantees zero raw AI text corruption or invalid UI states.

### ⚡ Stale Request & Race-Condition Guarding
- Utilizes React `useRef` and native `AbortController` to automatically cancel pending network requests when a user initiates a new generation.

### 🔄 Multi-Model Resilience & Automatic Fallback
- Dynamically cycles through available Gemini model endpoints (`gemini-3.8-flash`, `gemini-2.5-flash`, etc.) to guarantee high availability and bypass model deprecations.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Vanilla CSS (Design Tokens & CSS Variables), Lucide Icons, Zod
- **Backend**: Node.js (ES Modules), Express 4, Dotenv, CORS, Zod, `@google/generative-ai`
- **Testing**: Node.js Native Test Runner (`node --test`)

---

## 📂 Project Structure

```text
studyflow-ai/
│
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Application header & AI status badge
│   │   ├── TopicInput.jsx       # Input form, validation & quick suggestion pills
│   │   ├── EmptyState.jsx       # Welcome & onboarding screen
│   │   ├── LoadingState.jsx     # Generation progress & skeleton loader
│   │   ├── ErrorState.jsx       # Error card with retry trigger
│   │   ├── StudySummary.jsx     # Topic summary card
│   │   ├── FlashcardSection.jsx # Flashcard section container & pagination
│   │   ├── Flashcard.jsx        # Interactive 3D flip card component
│   │   ├── Quiz.jsx             # Quiz state management & retry workflow
│   │   ├── QuizQuestion.jsx     # Multiple choice question component
│   │   ├── QuizResult.jsx       # Quiz score dashboard & detailed breakdown
│   │   └── ProgressBar.jsx      # Accessible progress bar component
│   │
│   ├── services/
│   │   └── api.js               # Frontend API client with AbortSignal support
│   │
│   ├── utils/
│   │   └── validateResponse.js  # Client-side Zod validation defense
│   │
│   ├── App.jsx                  # Root state orchestration & request abort logic
│   ├── App.css                  # Responsive styles & design system tokens
│   ├── index.css                # Base resets & typography imports
│   └── main.jsx                 # React DOM entry point
│
├── server/
│   ├── routes/
│   │   └── study.js             # POST /api/study/generate endpoint
│   ├── services/
│   │   └── aiService.js         # Gemini SDK client, prompt engineering, sanitization
│   ├── schemas/
│   │   └── studySchema.js       # Zod schemas for input and study material output
│   ├── utils/
│   │   └── errors.js            # Custom AppError class & standardized error handler
│   ├── server.js                # Express app configuration & middleware
│   └── .env                     # Server environment variables
│
├── test/
│   └── validation.test.js       # Automated test suite (10 unit tests)
│
├── index.html                   # Entry HTML file
├── vite.config.js               # Vite build config with backend proxy setup
├── package.json                 # Project dependencies & scripts
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Akash2004711/studyflow-ai.git
cd studyflow-ai
npm install
```

### 3. Environment Configuration
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

### 4. Run Development Server
Start both backend (Express) and frontend (Vite) concurrently with a single command:
```bash
npm run dev
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
  "input": "Photosynthesis process in plants"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "topic": "Photosynthesis",
    "summary": "Photosynthesis is the biological process by which green plants convert light energy into chemical energy stored in glucose...",
    "flashcards": [
      {
        "id": "card-1",
        "question": "What are the primary reactants required for photosynthesis?",
        "answer": "Carbon dioxide, water, and sunlight."
      }
    ],
    "quiz": [
      {
        "id": "question-1",
        "question": "Where specifically inside the chloroplast do light reactions occur?",
        "options": [
          "Thylakoid membranes",
          "Stroma",
          "Outer membrane",
          "Matrix"
        ],
        "correctAnswer": 0,
        "explanation": "Light-dependent reactions take place within the thylakoid membranes where chlorophyll is housed."
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
| `Left Arrow (←)` | Navigate to previous flashcard | Flashcards Section |
| `Right Arrow (→)` | Navigate to next flashcard | Flashcards Section |
| `Click / Space` | Flip active flashcard | Active Flashcard |

---

## 🧪 Error Handling & Standardized Codes

| Error Code | HTTP Status | Description |
| :--- | :---: | :--- |
| `INVALID_INPUT` | `400` | Input is empty, missing, or exceeds maximum length. |
| `RATE_LIMIT_EXCEEDED` | `429` | Gemini API rate quota reached. User prompted to retry. |
| `AI_SERVICE_UNAVAILABLE` | `503` / `401` | Missing or unauthorized API key configuration. |
| `AI_RESPONSE_MALFORMED` | `502` | AI returned unparseable JSON string. |
| `AI_RESPONSE_INVALID` | `502` | AI output failed Zod schema structural validation. |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more details.
