import { z } from 'zod';

/**
 * Schema for incoming user request payload.
 */
export const studyInputSchema = z.object({
  input: z
    .string({
      required_error: 'Study topic or notes are required.',
      invalid_type_error: 'Input must be a text string.',
    })
    .trim()
    .min(2, { message: 'Input must be at least 2 characters long.' })
    .max(5000, { message: 'Input cannot exceed 5000 characters.' }),
  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced'], {
      invalid_type_error: 'Difficulty must be beginner, intermediate, or advanced.',
    })
    .default('intermediate'),
  flashcardCount: z
    .number({ invalid_type_error: 'Flashcard count must be a number.' })
    .int('Flashcard count must be an integer.')
    .min(1, 'Flashcard count must be at least 1.')
    .max(10, 'Flashcard count must be at most 10.')
    .default(5),
  quizCount: z
    .number({ invalid_type_error: 'Quiz count must be a number.' })
    .int('Quiz count must be an integer.')
    .min(1, 'Quiz count must be at least 1.')
    .max(10, 'Quiz count must be at most 10.')
    .default(5),
  testScenario: z
    .enum(['normal', 'malformed-json', 'invalid-schema', 'empty', 'slow', 'server-error'])
    .optional(),
});

/**
 * Schema for an individual flashcard.
 */
export const flashcardSchema = z.object({
  id: z.string().min(1, 'Flashcard ID is required.'),
  question: z.string().min(1, 'Flashcard question cannot be empty.'),
  answer: z.string().min(1, 'Flashcard answer cannot be empty.'),
});

/**
 * Schema for an individual quiz question.
 * Requires exactly 4 options and a zero-indexed integer correctAnswer (0-3).
 */
export const quizQuestionSchema = z.object({
  id: z.string().min(1, 'Quiz question ID is required.'),
  question: z.string().min(1, 'Quiz question cannot be empty.'),
  options: z
    .array(z.string().min(1, 'Option text cannot be empty.'))
    .length(4, 'Quiz question must have exactly 4 options.'),
  correctAnswer: z
    .number({ invalid_type_error: 'Correct answer index must be a number.' })
    .int('Correct answer index must be an integer.')
    .min(0, 'Correct answer index must be at least 0.')
    .max(3, 'Correct answer index must be at most 3.'),
  explanation: z.string().min(1, 'Quiz explanation cannot be empty.'),
});

/**
 * Complete schema for validated AI-generated study material.
 */
export const studyMaterialSchema = z.object({
  topic: z.string().min(1, 'Topic title cannot be empty.'),
  summary: z.string().min(1, 'Summary cannot be empty.'),
  flashcards: z
    .array(flashcardSchema)
    .min(1, 'At least one flashcard must be generated.')
    .max(10),
  quiz: z
    .array(quizQuestionSchema)
    .min(1, 'At least one quiz question must be generated.')
    .max(10),
});

/**
 * Validates untrusted AI output against the study material schema.
 * @param {unknown} data
 * @returns {{ success: boolean, data?: z.infer<typeof studyMaterialSchema>, error?: z.ZodError }}
 */
export const validateStudyMaterial = (data) => {
  return studyMaterialSchema.safeParse(data);
};
