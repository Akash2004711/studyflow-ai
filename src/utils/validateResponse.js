import { z } from 'zod';

/**
 * Zod schema for client-side defense-in-depth response validation.
 * Even if the backend validated it, client-side validation guarantees
 * the React state will never receive malformed data that could crash UI components.
 */
const clientFlashcardSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
});

const clientQuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

export const clientStudyMaterialSchema = z.object({
  topic: z.string().min(1),
  summary: z.string().min(1),
  flashcards: z.array(clientFlashcardSchema).min(1),
  quiz: z.array(clientQuizQuestionSchema).min(1),
});

/**
 * Validates the study material object on the frontend.
 * @param {unknown} data
 * @returns {{ isValid: boolean, validatedData?: z.infer<typeof clientStudyMaterialSchema>, error?: string }}
 */
export function validateStudyResponse(data) {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Invalid response format: data must be a valid JSON object.',
    };
  }

  const result = clientStudyMaterialSchema.safeParse(data);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('; ');

    return {
      isValid: false,
      error: `Study material validation failed (${errorDetails})`,
    };
  }

  return {
    isValid: true,
    validatedData: result.data,
  };
}
