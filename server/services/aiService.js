import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateStudyMaterial } from '../schemas/studySchema.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const SYSTEM_PROMPT = `You are an expert pedagogical AI specializing in creating concise, interactive study materials.
Your task is to analyze the user's study topic or notes and generate a complete, high-quality study set.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid, single JSON object.
2. Do NOT include any markdown code blocks, backticks (\`\`\` or \`\`\`json), or conversational filler.
3. Follow this EXACT JSON structure:
{
  "topic": "Topic Name (clean, formatted title)",
  "summary": "A clear, concise, beginner-friendly explanation (2-4 sentences).",
  "flashcards": [
    {
      "id": "card-1",
      "question": "Clear, direct concept question",
      "answer": "Concise, accurate concept answer"
    }
  ],
  "quiz": [
    {
      "id": "question-1",
      "question": "Multiple choice question testing understanding",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}

SPECIFIC RULES:
- Generate EXACTLY 5 flashcards (id: "card-1" through "card-5").
- Generate EXACTLY 5 quiz questions (id: "question-1" through "question-5").
- Every quiz question MUST contain an "options" array with EXACTLY 4 distinct string choices.
- "correctAnswer" MUST be an integer between 0 and 3 corresponding to the zero-based index of the correct option.
- Explanations must be educational, concise, and explain why the correct choice is right.
- Ensure all questions are unique, accurate, and directly relevant to the user's provided input.`;

const sanitizeJsonResponse = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';
  let cleaned = rawText.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateStudyMaterialFromAI(userInput) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new AppError(
      'Gemini API key is not configured. Please set GEMINI_API_KEY in server/.env (get a free key at https://aistudio.google.com/).',
      503,
      ErrorCodes.AI_SERVICE_UNAVAILABLE
    );
  }

  const cleanKey = apiKey.trim();
  const genAI = new GoogleGenerativeAI(cleanKey);
  const prompt = `${SYSTEM_PROMPT}\n\nUSER STUDY INPUT / TOPIC:\n${userInput}`;

  const models = [
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
  ];

  let rawResponseText = '';
  let lastError = null;

  for (const modelName of models) {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const result = await model.generateContent(prompt);
        rawResponseText = result.response.text();
        if (rawResponseText) break;
      } catch (err) {
        lastError = err;
        const msg = err?.message || '';
        const isAuthError =
          err.status === 401 ||
          err.status === 403 ||
          msg.includes('API_KEY_INVALID') ||
          msg.includes('API key not valid') ||
          msg.includes('invalid API key');

        if (isAuthError) {
          break;
        }

        const isRateLimit =
          err.status === 429 ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('Quota exceeded') ||
          msg.includes('rate limit');

        if (isRateLimit && attempt < maxRetries) {
          console.warn(`[aiService] Rate limit hit on ${modelName} (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in 2.5s...`);
          await delay(2500);
          continue;
        }

        break;
      }
    }
    if (rawResponseText) break;
  }

  if (!rawResponseText) {
    const msg = lastError?.message || '';
    const isAuthError =
      lastError?.status === 401 ||
      lastError?.status === 403 ||
      msg.includes('API_KEY_INVALID') ||
      msg.includes('API key not valid') ||
      msg.includes('invalid API key');

    if (isAuthError) {
      throw new AppError(
        'Invalid or unauthorized Gemini API key. Please check your GEMINI_API_KEY in server/.env (get a free key at https://aistudio.google.com/).',
        401,
        ErrorCodes.AI_SERVICE_UNAVAILABLE
      );
    }

    const isRateLimit =
      lastError?.status === 429 ||
      msg.includes('429') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('Quota exceeded') ||
      msg.includes('rate limit');

    if (isRateLimit) {
      throw new AppError(
        'Gemini API rate limit reached (free tier quota). Please wait a few seconds and click "Try Again", or use a fresh free key from https://aistudio.google.com/.',
        429,
        ErrorCodes.RATE_LIMIT_EXCEEDED
      );
    }
    throw new AppError(
      `Failed to communicate with AI service: ${lastError?.message || 'No response from model'}`,
      502,
      ErrorCodes.AI_SERVICE_UNAVAILABLE
    );
  }

  const cleanedJson = sanitizeJsonResponse(rawResponseText);
  let parsedData;

  try {
    parsedData = JSON.parse(cleanedJson);
  } catch (parseErr) {
    console.error('[aiService] JSON parsing failed. Raw response:', rawResponseText);
    throw new AppError(
      'The AI returned an unparseable response. Please try again.',
      502,
      ErrorCodes.AI_RESPONSE_MALFORMED,
      { rawSnippet: rawResponseText.slice(0, 200) }
    );
  }

  const validation = validateStudyMaterial(parsedData);

  if (!validation.success) {
    console.error('[aiService] Validation failed for AI response:', validation.error.format());
    throw new AppError(
      'The AI response did not match the required structured study format.',
      502,
      ErrorCodes.AI_RESPONSE_INVALID,
      validation.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  return validation.data;
}
