import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateStudyMaterial } from '../schemas/studySchema.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

/**
 * System prompt instructing the LLM to return strictly formatted study JSON.
 */
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

/**
 * Cleans potential markdown fences or surrounding noise from raw LLM text.
 * @param {string} rawText
 * @returns {string}
 */
const sanitizeJsonResponse = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';
  let cleaned = rawText.trim();

  // Strip ```json or ``` fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // Find first { and last } to isolate the JSON object if any preamble exists
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
};

/**
 * Generates structured study material from the LLM provider.
 * @param {string} userInput
 * @returns {Promise<import('../schemas/studySchema.js').StudyMaterial>}
 */
export async function generateStudyMaterialFromAI(userInput) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new AppError(
      'Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment.',
      503,
      ErrorCodes.AI_SERVICE_UNAVAILABLE
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());

  // Attempt using gemini-1.5-flash with structured JSON response config
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const prompt = `${SYSTEM_PROMPT}\n\nUSER STUDY INPUT / TOPIC:\n${userInput}`;

  let rawResponseText = '';

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    rawResponseText = response.text();
  } catch (apiErr) {
    console.error('[aiService] Gemini API call failed:', apiErr.message);

    if (apiErr.status === 429 || apiErr.message?.includes('429') || apiErr.message?.includes('quota')) {
      throw new AppError(
        'AI rate limit or quota exceeded. Please wait a moment and try again.',
        429,
        ErrorCodes.RATE_LIMIT_EXCEEDED
      );
    }

    if (apiErr.status === 401 || apiErr.status === 403 || apiErr.message?.includes('API key')) {
      throw new AppError(
        'Invalid or unauthorized Gemini API key.',
        401,
        ErrorCodes.AI_SERVICE_UNAVAILABLE
      );
    }

    throw new AppError(
      `Failed to communicate with AI service: ${apiErr.message}`,
      502,
      ErrorCodes.AI_SERVICE_UNAVAILABLE
    );
  }

  // 1. Sanitize & parse JSON
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

  // 2. Validate against Zod schema (Treat all AI output as untrusted)
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
