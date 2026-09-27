import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateStudyMaterial } from '../schemas/studySchema.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const SYSTEM_PROMPT = `You are an AI study assistant. Your goal is to create high-quality study materials based on the user's input topic or notes.

Return ONLY a single valid JSON object (no markdown, no backticks, no explanations) using this exact format:
{
  "topic": "Clean Topic Title",
  "summary": "A simple and clear explanation of the topic in 2 to 4 sentences.",
  "flashcards": [
    {
      "id": "card-1",
      "question": "Question testing a key concept",
      "answer": "Clear and direct answer"
    }
  ],
  "quiz": [
    {
      "id": "question-1",
      "question": "Multiple choice question testing understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct."
    }
  ]
}

Rules:
- Generate 5 flashcards (id: card-1 to card-5).
- Generate 5 quiz questions (id: question-1 to question-5).
- Each quiz question must have 4 options and a correctAnswer index (0 to 3).`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkRateLimit = (error) => {
  if (!error) return false;
  if (error.status === 429 || error.statusCode === 429) return true;
  const message = String(error.message || '').toLowerCase();
  return (
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('resource_exhausted') ||
    message.includes('too many requests')
  );
};

const cleanJsonResponse = (text) => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return cleaned.trim();
};

export function generateFallbackStudyMaterial(topicInput) {
  const cleanTopic = topicInput.trim().replace(/^['"\s]+|['"\s]+$/g, '');
  const topicName = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

  return {
    topic: topicName,
    summary: `${topicName} is an important subject to learn. This generated guide breaks down fundamental principles, definitions, and key concepts so you can master ${topicName} easily.`,
    flashcards: [
      {
        id: 'card-1',
        question: `What is the main definition of ${topicName}?`,
        answer: `${topicName} represents the core concepts and fundamental rules of this topic.`,
      },
      {
        id: 'card-2',
        question: `Why is learning ${topicName} useful?`,
        answer: `Understanding ${topicName} helps build a strong foundation for practical applications and problem solving.`,
      },
      {
        id: 'card-3',
        question: `What is a core component of ${topicName}?`,
        answer: `It involves understanding key inputs, main processes, and expected results.`,
      },
      {
        id: 'card-4',
        question: `How can you apply ${topicName} in practice?`,
        answer: `By breaking down complex ideas into smaller parts and practicing regularly with questions.`,
      },
      {
        id: 'card-5',
        question: `What is a common myth about ${topicName}?`,
        answer: `Thinking it requires pure memorization instead of logical understanding of the core ideas.`,
      },
    ],
    quiz: [
      {
        id: 'question-1',
        question: `Which choice best defines ${topicName}?`,
        options: [
          `A structured area of knowledge covering key principles of ${topicName}.`,
          `An outdated topic with no practical usage.`,
          `A set of unrelated random facts.`,
          `A purely theoretical concept that cannot be applied in practice.`,
        ],
        correctAnswer: 0,
        explanation: `${topicName} focuses on fundamental principles and clear practical applications.`,
      },
      {
        id: 'question-2',
        question: `What is a primary benefit of studying ${topicName}?`,
        options: [
          `It replaces the need for any additional study skills.`,
          `It improves problem-solving abilities and concept clarity.`,
          `It guarantees instant mastery without practice.`,
          `It only applies to one specific exam question.`,
        ],
        correctAnswer: 1,
        explanation: `Studying core concepts like ${topicName} boosts critical thinking and knowledge retention.`,
      },
      {
        id: 'question-3',
        question: `What is the best approach to master ${topicName}?`,
        options: [
          `Reading only headings quickly.`,
          `Memorizing answers without understanding definitions.`,
          `Reviewing key terms, using flashcards, and taking practice quizzes.`,
          `Avoiding interactive practice exercises.`,
        ],
        correctAnswer: 2,
        explanation: `Interactive learning using flashcards and quizzes is proven to strengthen long-term memory.`,
      },
      {
        id: 'question-4',
        question: `How does active recall help when studying ${topicName}?`,
        options: [
          `It weakens memory retention.`,
          `It strengthens memory connections and recall speed.`,
          `It is less effective than reading passively.`,
          `It has no benefit for learning.`,
        ],
        correctAnswer: 1,
        explanation: `Testing your knowledge actively with flashcards accelerates learning and retention.`,
      },
      {
        id: 'question-5',
        question: `What study strategy works best for reviewing ${topicName}?`,
        options: [
          `Cramming everything at the last minute.`,
          `Spaced repetition combined with self-testing.`,
          `Reading a text once and never looking back.`,
          `Ignoring missed quiz questions.`,
        ],
        correctAnswer: 1,
        explanation: `Spaced repetition and checking quiz explanations ensures complete mastery over time.`,
      },
    ],
  };
}

export async function generateStudyMaterialFromAI(userInput) {
  const envKeys = process.env.GEMINI_API_KEY || '';
  const apiKeys = envKeys
    .split(/[,;]/)
    .map((key) => key.trim())
    .filter((key) => key && key !== 'your_gemini_api_key_here');

  if (apiKeys.length === 0) {
    console.warn('[AI Service] No Gemini API key provided. Using fallback study material generator.');
    return generateFallbackStudyMaterial(userInput);
  }

  const userPrompt = `${SYSTEM_PROMPT}\n\nUser Topic:\n${userInput}`;
  const models = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro',
    'gemini-flash-latest',
    'gemini-pro-latest',
  ];

  let rawResponseText = '';
  let lastError = null;
  let isRateLimited = false;

  for (const apiKey of apiKeys) {
    if (rawResponseText) break;
    const aiClient = new GoogleGenerativeAI(apiKey);

    for (const modelName of models) {
      if (rawResponseText) break;

      let retriesLeft = 2;
      let delayMs = 1000;

      while (retriesLeft >= 0) {
        try {
          const model = aiClient.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const result = await model.generateContent(userPrompt);
          rawResponseText = result.response.text();

          if (rawResponseText) break;
        } catch (err) {
          lastError = err;

          if (err.status === 401 || err.status === 403) {
            break;
          }

          if (checkRateLimit(err)) {
            isRateLimited = true;
            if (retriesLeft > 0) {
              console.warn(`[AI Service] Rate limit reached for ${modelName}. Retrying in ${delayMs}ms...`);
              await sleep(delayMs);
              delayMs *= 2;
              retriesLeft--;
              continue;
            }
          }

          break;
        }
      }
    }
  }

  if (!rawResponseText) {
    if (lastError?.status === 401 || lastError?.status === 403) {
      throw new AppError('Invalid Gemini API key. Please check your .env configuration.', 401, ErrorCodes.AI_SERVICE_UNAVAILABLE);
    }

    if (isRateLimited) {
      console.warn('[AI Service] Rate limit reached. Using fallback generator to keep the app working.');
      return generateFallbackStudyMaterial(userInput);
    }

    return generateFallbackStudyMaterial(userInput);
  }

  const jsonString = cleanJsonResponse(rawResponseText);
  let parsedData;

  try {
    parsedData = JSON.parse(jsonString);
  } catch (error) {
    console.error('[AI Service] Failed to parse AI JSON response:', rawResponseText);
    return generateFallbackStudyMaterial(userInput);
  }

  const validationResult = validateStudyMaterial(parsedData);
  if (!validationResult.success) {
    console.error('[AI Service] AI response schema validation failed:', validationResult.error.format());
    return generateFallbackStudyMaterial(userInput);
  }

  return validationResult.data;
}
