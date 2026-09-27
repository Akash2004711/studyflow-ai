import { Router } from 'express';
import { studyInputSchema } from '../schemas/studySchema.js';
import { generateStudyMaterialFromAI } from '../services/aiService.js';
import { AppError, ErrorCodes, formatErrorResponse } from '../utils/errors.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const inputValidation = studyInputSchema.safeParse(req.body);

    if (!inputValidation.success) {
      const errorMsg = inputValidation.error.errors.map((e) => e.message).join(', ');
      throw new AppError(errorMsg, 400, ErrorCodes.INVALID_INPUT);
    }

    const { input } = inputValidation.data;

    const studyMaterial = await generateStudyMaterialFromAI(input);

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
