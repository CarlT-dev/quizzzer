import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type GeneratedQuestion = {
  question: string;
  questionType: "multiple_choice" | "true_false";
  choices: string[];
  correctAnswer: number;
};

type GeneratedQuiz = {
  title: string;
  questions: GeneratedQuestion[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const topic = body.topic?.trim();

    const numberOfQuestions = Number(
      body.numberOfQuestions || 10
    );

    // -----------------------------
    // Validate input
    // -----------------------------

    if (!topic) {
      return NextResponse.json(
        {
          error: "Topic is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(numberOfQuestions) ||
      numberOfQuestions < 1 ||
      numberOfQuestions > 50
    ) {
      return NextResponse.json(
        {
          error:
            "Number of questions must be between 1 and 50.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Prompt
    // -----------------------------

    const prompt = `
You are an educational quiz generator.

Create a quiz about:

"${topic}"

Generate exactly ${numberOfQuestions} questions.

Use a mixture of:

- Multiple-choice questions
- True-or-false questions

QUESTION TYPES

MULTIPLE CHOICE:
- questionType must be "multiple_choice"
- Exactly 4 choices
- Only ONE correct answer
- correctAnswer must be the zero-based index

Example:

{
  "questionType": "multiple_choice",
  "choices": [
    "Choice A",
    "Choice B",
    "Choice C",
    "Choice D"
  ],
  "correctAnswer": 2
}

TRUE OR FALSE:
- questionType must be "true_false"
- Exactly 2 choices
- The choices MUST be exactly:
  ["True", "False"]
- correctAnswer must be:
  0 if True is correct
  1 if False is correct

Example:

{
  "questionType": "true_false",
  "choices": ["True", "False"],
  "correctAnswer": 0
}

RULES:

- Generate exactly ${numberOfQuestions} questions.
- Make questions educational.
- Make questions factually accurate.
- Avoid duplicate questions.
- Use clear language.
- Make questions appropriate for students.
- Do not include explanations.
- Do not include markdown.
- Do not add extra fields.
`;

    // -----------------------------
    // Generate quiz
    // -----------------------------

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            title: {
              type: "string",
            },

            questions: {
              type: "array",

              items: {
                type: "object",

                properties: {
                  question: {
                    type: "string",
                  },

                  questionType: {
                    type: "string",
                    enum: [
                      "multiple_choice",
                      "true_false",
                    ],
                  },

                  choices: {
                    type: "array",

                    items: {
                      type: "string",
                    },
                  },

                  correctAnswer: {
                    type: "integer",
                  },
                },

                required: [
                  "question",
                  "questionType",
                  "choices",
                  "correctAnswer",
                ],
              },
            },
          },

          required: [
            "title",
            "questions",
          ],
        },
      },
    });

    // -----------------------------
    // Check Gemini response
    // -----------------------------

    if (!response.text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    let quiz: GeneratedQuiz;

    try {
      quiz = JSON.parse(response.text);
    } catch {
      throw new Error(
        "Gemini returned invalid JSON."
      );
    }

    // -----------------------------
    // Validate quiz
    // -----------------------------

    if (
      !quiz.title ||
      !Array.isArray(quiz.questions)
    ) {
      throw new Error(
        "Invalid quiz structure."
      );
    }

    if (
      quiz.questions.length !==
      numberOfQuestions
    ) {
      throw new Error(
        `Expected ${numberOfQuestions} questions but Gemini returned ${quiz.questions.length}.`
      );
    }

    // -----------------------------
    // Validate every question
    // -----------------------------

    for (
      const question of quiz.questions
    ) {
      // Question text
      if (
        !question.question ||
        !question.question.trim()
      ) {
        throw new Error(
          "AI generated an empty question."
        );
      }

      // Question type
      if (
        question.questionType !==
          "multiple_choice" &&
        question.questionType !==
          "true_false"
      ) {
        throw new Error(
          "AI generated an invalid question type."
        );
      }

      // Choices must exist
      if (
        !Array.isArray(question.choices)
      ) {
        throw new Error(
          "AI generated invalid choices."
        );
      }

      // -----------------------------
      // Multiple Choice
      // -----------------------------

      if (
        question.questionType ===
        "multiple_choice"
      ) {
        if (
          question.choices.length !== 4
        ) {
          throw new Error(
            "Multiple-choice questions must have exactly 4 choices."
          );
        }

        if (
          question.choices.some(
            (choice) =>
              !choice ||
              !choice.trim()
          )
        ) {
          throw new Error(
            "Multiple-choice questions cannot contain empty choices."
          );
        }
      }

      // -----------------------------
      // True / False
      // -----------------------------

      if (
        question.questionType ===
        "true_false"
      ) {
        if (
          question.choices.length !== 2
        ) {
          throw new Error(
            "True/False questions must have exactly 2 choices."
          );
        }

        if (
          question.choices[0] !== "True" ||
          question.choices[1] !== "False"
        ) {
          throw new Error(
            'True/False choices must be exactly ["True", "False"].'
          );
        }
      }

      // -----------------------------
      // Correct answer
      // -----------------------------

      if (
        !Number.isInteger(
          question.correctAnswer
        )
      ) {
        throw new Error(
          "Correct answer must be an integer."
        );
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >=
          question.choices.length
      ) {
        throw new Error(
          "AI generated an invalid correct answer."
        );
      }
    }

    // -----------------------------
    // Success
    // -----------------------------

    return NextResponse.json({
      success: true,
      quiz,
    });

  } catch (error) {
    console.error(
      "AI generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate quiz.",
      },
      { status: 500 }
    );
  }
}