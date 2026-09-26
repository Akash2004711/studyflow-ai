# StudyFlow AI

An AI-powered interactive study assistant built with React, Vite, Node.js, Express, Gemini, and Zod. StudyFlow AI turns free-form topics, notes, or questions into structured study materials—featuring customizable session configurations, concise summaries, interactive flip flashcards, multiple-choice quizzes, targeted review for incorrect questions, and a developer reliability test mode.

---

## Reliability & Error Handling

Handling unpredictable AI responses and network failures reliably is a core design principle of StudyFlow AI:

1. **Structured AI Responses**: Enforces strict JSON generation from Gemini without Markdown blocks, conversational filler, or unparsed text.
2. **Dual-Layer Zod Validation**: All AI responses are treated as untrusted data and validated against strict Zod schemas on both the backend service and the client before updating state.
3. **Malformed JSON Handling**: Intercepts unparseable or truncated LLM output, preventing JSON parse crashes and giving users a clean error alert with Retry capability.
4. **Schema Validation**: Catches response shape mismatches (e.g. string instead of array, missing fields, option counts other than 4, invalid index) and returns actionable `SCHEMA_ERROR` notices.
5. **Empty Response Handling**: Guards against blank or null AI outputs, cleanly rendering a friendly message without showing `undefined` or broken UI components.
6. **Timeout Handling**: Uses native `AbortController` timeouts (15 seconds) to abort stalled backend requests and clear loading spinners cleanly.
7. **Request Cancellation**: Automatically aborts active in-flight requests when a user starts a new session generation.
8. **Stale Response Protection**: Uses request sequence checking (`requestIdRef`) to guarantee older network responses can never overwrite newer user results.
9. **Controlled Retry Behavior**: Allows explicit, 1-click manual retries using identical topic and configuration inputs without endless automated retry loops.
10. **Development Failure Simulation**: Provides a DEV-only Reliability Test panel (`import.meta.env.DEV`) to simulate failure modes (`malformed-json`, `invalid-schema`, `empty`, `slow`, `server-error`).
11. **Server-Side API Key Security**: Isolates the `GEMINI_API_KEY` on the backend proxy server to prevent secret leaks in browser client bundles.

---

## Architecture & Data Flow

```text
User Input & Config (Topic, Difficulty, Card Count, Quiz Count)
 │
 ▼
React UI (Client-Side Validation & AbortController Protection)
 │
 │ POST /api/study/generate
 ▼
Express Backend (Request Validation via Zod)
 │
 │ Dynamic Structured Prompt
 ▼
AI Provider (Gemini LLM)
 │
 │ Structured JSON Output
 ▼
JSON Parsing & Sanitization
 │
 │ Zod Response Validation
 ├── Invalid → Error State + Friendly Alert
 │
 ▼
React State ('idle' | 'loading' | 'success' | 'error')
 │
 ├── Summary (Copyable)
 ├── Flashcards (Difficulty-aware)
 └── Quiz (Interactive + Retry Wrong Answers)
```

```text
State Transitions:
idle ──► loading ──► success
            │
            └──► error ──► retry
```

---

## Interview Demo

To demonstrate StudyFlow AI's reliability during an interview:

1. **Generate a Normal Study Session**: Enter a topic (e.g. "JavaScript Closures"), choose a difficulty level (e.g. "Intermediate"), choose card/quiz counts (e.g. 5), and click **Generate Study Session**.
2. **Open Developer Test Mode**: Notice the **Developer AI Reliability Test Mode** box at the top (visible in development mode).
3. **Trigger Malformed JSON**: Select `Malformed JSON` from the dropdown and click `Test Scenario`.
4. **Show Error State**: Observe that the app does not crash, displays a friendly "The AI returned an unparseable response" message, and presents a **Try Again** (Retry) button.
5. **Click Retry**: Click **Try Again** to recover and re-run generation.
6. **Trigger Slow Response & Timeout**: Select `Slow Response` or simulate network delay; verify that the loading state is displayed clearly with feedback and timeouts abort cleanly after 15 seconds.
7. **Demonstrate Stale Response Protection**: Fire a request for "JavaScript", then immediately fire a request for "Python". Verify that only the final "Python" request updates the UI.
8. **Test Session Regeneration & Data Preservation**: Click **Regenerate Session**. Trigger a simulated error during regeneration and show that the original successful study session remains visible alongside the error notice.

---

## Key Features

- **Study Configuration**: Configurable Difficulty (`Beginner`, `Intermediate`, `Advanced`), Flashcard Count (`3`, `5`, `7`, `10`), and Quiz Question Count (`3`, `5`, `7`, `10`).
- **Difficulty-Aware Generation**: Tailors AI explanation depth, example complexity, and quiz distractor difficulty based on selected difficulty.
- **Copy Summary**: One-click **Copy Summary** button with instant feedback (`Copied!`).
- **Interactive Flashcards & Progress**: Card counter (`Card 2 of 5`), progress bar, answer reveal, and keyboard shortcuts (`Enter`/`Space`, `ArrowLeft`/`ArrowRight`).
- **Knowledge Check Quiz**: Interactive 4-option questions with immediate feedback, score computation, and targeted **Retry Wrong Answers** mode.
- **Regenerate & New Session**: Re-run active configurations seamlessly or reset cleanly to start a fresh topic.
- **Accessible & Responsive**: Standard `<button>` elements, `role="alert"`, `aria-live`, and responsive flex/grid layouts.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit `server/.env` or root `.env`:

```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 3. Run Application

```bash
npm start
# or
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### 4. Run Automated Tests

```bash
npm test
```

### 5. Build for Production

```bash
npm run build
```
