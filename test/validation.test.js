import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateStudyMaterial, studyInputSchema } from '../server/schemas/studySchema.js';
import { validateStudyResponse } from '../src/utils/validateResponse.js';

describe('Study Schema & AI Output Validation Suite', () => {
  const validStudyPayload = {
    topic: 'JavaScript Closures',
    summary: 'A closure is the combination of a function bundled together with references to its surrounding state.',
    flashcards: [
      {
        id: 'card-1',
        question: 'What is a lexical scope in JavaScript?',
        answer: 'Lexical scope means variable accessibility is determined by the physical placement of code.',
      },
      {
        id: 'card-2',
        question: 'What happens to variables referenced by an inner function when the outer function returns?',
        answer: 'They remain preserved in memory through closure references.',
      },
    ],
    quiz: [
      {
        id: 'question-1',
        question: 'Which of the following describes a JavaScript closure?',
        options: [
          'A function retaining access to outer lexical scope variables',
          'A CSS preprocessor',
          'A synchronous database lock',
          'A built-in DOM node',
        ],
        correctAnswer: 0,
        explanation: 'Closures allow inner functions to retain scope references even after the outer function finishes.',
      },
    ],
  };

  it('Case: Valid study response passes backend schema validation', () => {
    const result = validateStudyMaterial(validStudyPayload);
    assert.equal(result.success, true);
    assert.equal(result.data.topic, 'JavaScript Closures');
  });

  it('Case: Valid study response passes frontend validation', () => {
    const result = validateStudyResponse(validStudyPayload);
    assert.equal(result.isValid, true);
    assert.equal(result.validatedData.topic, 'JavaScript Closures');
  });

  it('Case 1 & 3: Empty response ({}) is rejected safely', () => {
    const backendResult = validateStudyMaterial({});
    assert.equal(backendResult.success, false);

    const frontendResult = validateStudyResponse({});
    assert.equal(frontendResult.isValid, false);
  });

  it('Case 2: Wrong shape (flashcards is a string instead of array) is rejected', () => {
    const invalidPayload = {
      ...validStudyPayload,
      flashcards: 'hello world',
    };
    const result = validateStudyMaterial(invalidPayload);
    assert.equal(result.success, false);
  });

  it('Case 4: Empty arrays (empty flashcards or quiz) are rejected', () => {
    const invalidPayload = {
      ...validStudyPayload,
      flashcards: [],
    };
    const result = validateStudyMaterial(invalidPayload);
    assert.equal(result.success, false);
  });

  it('Case 5: Missing fields (missing summary or question) are rejected', () => {
    const invalidPayload = {
      topic: 'React Hooks',
      flashcards: validStudyPayload.flashcards,
      quiz: validStudyPayload.quiz,
    };
    const result = validateStudyMaterial(invalidPayload);
    assert.equal(result.success, false);
  });

  it('Case 6: Invalid quiz options (less or more than 4 options) are rejected', () => {
    const invalidPayload = {
      ...validStudyPayload,
      quiz: [
        {
          id: 'q-1',
          question: 'What is JSX?',
          options: ['Option 1', 'Option 2', 'Option 3'], // Only 3 options
          correctAnswer: 0,
          explanation: 'JSX requires 4 choices.',
        },
      ],
    };
    const result = validateStudyMaterial(invalidPayload);
    assert.equal(result.success, false);
  });

  it('Case 7: Invalid correctAnswer (index 8 or out of 0-3 range) is rejected', () => {
    const invalidPayload = {
      ...validStudyPayload,
      quiz: [
        {
          id: 'q-1',
          question: 'What is JSX?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 8, // Invalid index
          explanation: 'Index 8 is out of range.',
        },
      ],
    };
    const result = validateStudyMaterial(invalidPayload);
    assert.equal(result.success, false);
  });

  it('Input validation: Empty or whitespace input is rejected', () => {
    const emptyTest = studyInputSchema.safeParse({ input: '   ' });
    assert.equal(emptyTest.success, false);

    const validTest = studyInputSchema.safeParse({ input: 'Explain React state' });
    assert.equal(validTest.success, true);
  });
});
