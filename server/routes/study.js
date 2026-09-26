import { Router } from 'express';
import { studyInputSchema } from '../schemas/studySchema.js';
import { generateStudyMaterialFromAI } from '../services/aiService.js';
import { AppError, ErrorCodes, formatErrorResponse } from '../utils/errors.js';

const router = Router();

/**
 * POST /api/study/generate
 * Accepts a user study input/topic, queries the AI provider, and returns validated structured data.
 */
router.post('/generate', async (req, res) => {
  try {
    // 1. Validate request payload using Zod
    const inputValidation = studyInputSchema.safeParse(req.body);

    if (!inputValidation.success) {
      const errorMsg = inputValidation.error.errors.map((e) => e.message).join(', ');
      throw new AppError(errorMsg, 400, ErrorCodes.INVALID_INPUT);
    }

    const { input, difficulty, flashcardCount, quizCount, testScenario } = inputValidation.data;

    // 2. Call AI service which performs LLM query, sanitization, and schema validation
    const studyMaterial = await generateStudyMaterialFromAI(input, {
      difficulty,
      flashcardCount,
      quizCount,
      testScenario,
    });

    // 3. Return validated response
    return res.status(200).json({
      success: true,
      data: studyMaterial,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const formattedError = formatErrorResponse(error);

    return res.status(statusCode).json(formattedError);
  }
});

export default router;
