import { z } from 'zod';

export const studyInputSchema = z.object({
  input: z
    .string({
      required_error: 'Study topic or notes are required.',
      invalid_type_error: 'Input must be a text string.',
    })
    .trim()
    .min(2, { message: 'Input must be at least 2 characters long.' })
    .max(5000, { message: 'Input cannot exceed 5000 characters.' }),
});

export const flashcardSchema = z.object({
  id: z.string().min(1, 'Flashcard ID is required.'),
  question: z.string().min(1, 'Flashcard question cannot be empty.'),
  answer: z.string().min(1, 'Flashcard answer cannot be empty.'),
});

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

export const validateStudyMaterial = (data) => {
  return studyMaterialSchema.safeParse(data);
};
