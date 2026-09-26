# StudyFlow AI

An AI-powered interactive study assistant built with React, Vite, Node.js, Express, Gemini, and Zod. StudyFlow AI turns free-form topics, notes, or questions into structured study materials—featuring concise summaries, interactive flip flashcards, multiple-choice quizzes, and targeted review for incorrect questions.

---

## Architecture & Data Flow

```text
User Input (Topic / Notes)
          │
          ▼
┌──────────────────┐
│   React Client   │  ← Client-side input validation & AbortController protection
└─────────┬────────┘
          │ POST /api/study/generate
          ▼
┌──────────────────┐
│  Express Server  │  ← Zod request payload validation
└─────────┬────────┘
          │ Structured Prompt & JSON enforcement
          ▼
┌──────────────────┐
│    Gemini LLM    │  ← Generates structured JSON (No conversational markdown)
└─────────┬────────┘
          │ Raw JSON response
          ▼
┌──────────────────┐
│ Backend Service  │  ← JSON sanitization & Zod Schema Validation
└─────────┬────────┘
          │ Validated Payload
          ▼
┌──────────────────┐
│   React Client   │  ← Defense-in-depth Zod validation & UI state rendering
└──────────────────┘
```

---

## Key Features

- **Free-Form Study Input**: Accepts custom topics, questions, paragraphs, or lecture notes with character counting, validation feedback, and quick suggestions.
- **Structured AI Output**: Strictly enforces JSON schema output from Gemini (no raw AI text or unparsed markdown dumped into UI).
- **Dual-Layer Schema Validation**: Treats all AI outputs as untrusted data. Validates using Zod on both the backend service and the client before state updates.
- **Interactive Flashcards**:
  - Flip / reveal answer mechanism
  - Card-by-card navigation with boundary protection (Previous / Next)
  - Animated progress bar and card counters
- **Knowledge Check Quiz**:
  - 5 multiple-choice questions (4 options each)
  - Single selection validation (cannot submit without selection)
  - Immediate visual feedback (correct/incorrect) with educational explanations
- **Comprehensive Score Screen**:
  - Score circle displaying score fraction and percentage
  - Categorized feedback based on performance
  - Question-by-question review showing user choice, correct choice, and rationale
- **Retry Wrong Answers**:
  - Automatically isolates questions answered incorrectly
  - Launches a focused quiz session containing only the missed questions
  - Displays a perfect-score message when all questions are mastered
- **Robust Failure & State Handling**:
  - Loading skeleton state with progress indicators
  - Empty onboarding state
  - Dedicated error boundary state with clean retry action
  - Handles malformed JSON, schema mismatch, missing fields, rate limits, and network drops
- **Stale Request & Race-Condition Prevention**: Uses React `useRef` with native `AbortController` to cancel in-flight requests when a new generation is initiated.
- **Secure Backend Proxy**: The Gemini API key is isolated strictly in server-side environment variables and never exposed to browser client code.
- **Responsive & Accessible**: Responsive layout optimized for 320px to 1440px+ displays with semantic HTML and ARIA attributes.

---

## Tech Stack

- **Frontend**: React 18, Vite 6, Vanilla CSS (Custom Design System with CSS variables), Lucide Icons, Zod
- **Backend**: Node.js, Express 4, CORS, Dotenv, Zod, `@google/generative-ai`
- **Testing**: Node.js native test runner (`node:test`, `node:assert`)

---

## Project Structure

```text
studyflow-ai/
│
├── src/
│   ├── components/
│   │   ├── Header.jsx           # App branding & AI status badge
│   │   ├── TopicInput.jsx       # Textarea input, validation & quick ideas
│   │   ├── EmptyState.jsx       # Initial onboarding screen
│   │   ├── LoadingState.jsx     # Animated generation progress state
│   │   ├── ErrorState.jsx       # Error card with retry action
│   │   ├── StudySummary.jsx     # Verified topic & summary card
│   │   ├── FlashcardSection.jsx # Flashcard pagination & container
│   │   ├── Flashcard.jsx        # Individual interactive flashcard
│   │   ├── Quiz.jsx             # Quiz container, state & retry flow
│   │   ├── QuizQuestion.jsx     # 4-option question & instant feedback
│   │   ├── QuizResult.jsx       # Score card, review list & retry triggers
│   │   └── ProgressBar.jsx      # ARIA-accessible progress bar
│   │
│   ├── services/
│   │   └── api.js               # API service with AbortSignal & error parsing
│   │
│   ├── utils/
│   │   └── validateResponse.js  # Client-side Zod validation defense
│   │
│   ├── App.jsx                  # Main application state & race condition guard
│   ├── App.css                  # Responsive component stylesheet
│   ├── index.css                # Base design tokens & resets
│   └── main.jsx                 # Vite React entry point
│
├── server/
│   ├── routes/
│   │   └── study.js             # POST /api/study/generate route
│   ├── services/
│   │   └── aiService.js         # Gemini client, prompt engineering, sanitization
│   ├── schemas/
│   │   └── studySchema.js       # Zod schema definitions
│   ├── utils/
│   │   └── errors.js            # Custom AppError & standardized error formatter
│   ├── server.js                # Express app entry & middleware
│   └── .env.example             # Backend environment template
│
├── test/
│   └── validation.test.js       # Automated validation test suite
│
├── index.html                   # HTML entry point with Google Fonts
├── vite.config.js               # Vite config with API proxy
├── package.json                 # Project scripts & dependencies
└── README.md
```

---

## Getting Started

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/Akash2004711/studyflow-ai.git
cd studyflow-ai
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root or `server/` directory:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your Google Gemini API key:

```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key
```

> **Note**: Get a free API key at [Google AI Studio](https://aistudio.google.com/).

### 3. Run Application

To run both the Express backend and Vite frontend concurrently:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

Alternatively, you can run services separately:

```bash
# Terminal 1 - Backend Server
npm run server

# Terminal 2 - Frontend Client
npm run client
```

### 4. Run Automated Tests

To execute the test suite verifying schema validation and AI edge-case handling:

```bash
npm test
```

---

## API Specification

### Generate Study Material

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
        "question": "What is a closure?",
        "answer": "A closure is a function that remembers variables from its lexical scope even when executed outside that scope."
      }
    ],
    "quiz": [
      {
        "id": "question-1",
        "question": "What does a closure allow a function to retain access to?",
        "options": [
          "Its outer lexical environment",
          "A SQL database connection",
          "Browser cookies",
          "Hardware CPU registers"
        ],
        "correctAnswer": 0,
        "explanation": "Closures preserve references to outer scope variables across executions."
      }
    ]
  }
}
```

#### Error Response (`400 / 502 / 503`)
```json
{
  "success": false,
  "error": {
    "code": "AI_RESPONSE_INVALID",
    "message": "The AI response did not match the required structured study format."
  }
}
```

---

## AI Usage Note

AI coding assistants were used for architectural brainstorming, drafting boilerplate schemas, reviewing edge cases, and accelerating CSS styling. The final implementation, component state flow, race-condition mitigation, and validation rules were reviewed and verified for correctness.

---

## Known Limitations

- **LLM Rate Limits**: Free tier Gemini API keys are subject to standard RPM (requests per minute) quotas. The app detects HTTP 429 status codes and displays a clear retry prompt.
- **Session Persistence**: Currently, study sets exist in memory within the React lifecycle. Reloading the page resets the session.

---

## Time Spent

- **Architecture & Schema Planning**: ~45 mins
- **Backend API & Gemini Service**: ~1 hr
- **Frontend Components & React State**: ~1.5 hrs
- **Validation, Error & Stale Request Handling**: ~1 hr
- **Styling, Polish & Testing**: ~1 hr
- **Total Time**: ~5.25 hours

---

## Future Improvements

- Save sessions to browser `localStorage` or export to PDF / Anki decks
- Streaming chunked responses for faster perceived TTFB
- Difficulty toggles (Beginner / Intermediate / Advanced)
- Keyboard shortcut overlays (`←` / `→` for cards, `1-4` for quiz choices)
- Study streaks and mastery tracking across multiple study topics
