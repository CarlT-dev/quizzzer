import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type QuestionType =
  | "multiple_choice"
  | "true_false";

type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard";

type GeneratedQuestion = {
  question: string;
  questionType: QuestionType;
  difficulty: Difficulty;
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

    const difficulties: Difficulty[] =
      Array.isArray(body.difficulties)
        ? body.difficulties
        : ["Medium"];

    const questionTypes: QuestionType[] =
      Array.isArray(body.questionTypes)
        ? body.questionTypes
        : ["multiple_choice"];

    // -----------------------------
    // Validate topic
    // -----------------------------

    if (!topic) {
      return NextResponse.json(
        {
          error: "Topic is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Validate number of questions
    // -----------------------------

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
    // Validate difficulties
    // -----------------------------

    const allowedDifficulties = [
      "Easy",
      "Medium",
      "Hard",
    ];

    if (
      difficulties.length === 0 ||
      difficulties.some(
        (difficulty) =>
          !allowedDifficulties.includes(
            difficulty
          )
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid difficulty level.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Validate question types
    // -----------------------------

    const allowedQuestionTypes = [
      "multiple_choice",
      "true_false",
    ];

    if (
      questionTypes.length === 0 ||
      questionTypes.some(
        (type) =>
          !allowedQuestionTypes.includes(
            type
          )
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid question type.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Difficulty instruction
    // -----------------------------

    const difficultyInstruction =
      difficulties.length === 1
        ? `All questions must be ${difficulties[0]} difficulty.`
        : `
Use a mixture of the selected difficulty levels:
${difficulties.join(", ")}.

Distribute the questions reasonably across
the selected difficulty levels.
`;

    // -----------------------------
    // Question type instruction
    // -----------------------------

    const questionTypeInstruction =
      questionTypes.length === 1
        ? `
All questions must use the question type:
${questionTypes[0]}.
`
        : `
Use a mixture of the selected question types:
${questionTypes
  .map((type) =>
    type === "multiple_choice"
      ? "Multiple Choice"
      : "True / False"
  )
  .join(", ")}.

Distribute the question types reasonably
across the generated questions.
`;

    // -----------------------------
    // Prompt
    // -----------------------------

    const prompt = `
You are an educational quiz generator.

Create a quiz about:

"${topic}"

Generate exactly ${numberOfQuestions} questions.

DIFFICULTY REQUIREMENTS

${difficultyInstruction}

QUESTION TYPE REQUIREMENTS

${questionTypeInstruction}

QUESTION TYPES

MULTIPLE CHOICE:

- questionType must be "multiple_choice"
- Exactly 4 choices
- Only ONE correct answer
- correctAnswer must be the zero-based index
- difficulty must be "Easy", "Medium", or "Hard"

Example:

{
  "questionType": "multiple_choice",
  "difficulty": "Medium",
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
- difficulty must be "Easy", "Medium", or "Hard"

Example:

{
  "questionType": "true_false",
  "difficulty": "Easy",
  "choices": [
    "True",
    "False"
  ],
  "correctAnswer": 0
}

GENERAL RULES:

- Generate exactly ${numberOfQuestions} questions.
- Follow the selected difficulty levels.
- Follow the selected question types.
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

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: prompt,

        config: {
          responseMimeType:
            "application/json",

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

                    difficulty: {
                      type: "string",
                      enum: [
                        "Easy",
                        "Medium",
                        "Hard",
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
                    "difficulty",
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
    // Validate quiz structure
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
        !allowedQuestionTypes.includes(
          question.questionType
        )
      ) {
        throw new Error(
          "AI generated an invalid question type."
        );
      }

      // Difficulty

      if (
        !allowedDifficulties.includes(
          question.difficulty
        )
      ) {
        throw new Error(
          "AI generated an invalid difficulty."
        );
      }

      // Make sure AI follows selected
      // difficulty levels

      if (
        !difficulties.includes(
          question.difficulty
        )
      ) {
        throw new Error(
          `AI generated a ${question.difficulty} question even though that difficulty was not selected.`
        );
      }

      // Make sure AI follows selected
      // question types

      if (
        !questionTypes.includes(
          question.questionType
        )
      ) {
        throw new Error(
          "AI generated a question type that was not selected."
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
    console.error("AI generation error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    // Gemini quota exceeded
    if (
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("Quota exceeded")
    ) {
      return NextResponse.json(
        {
          error:
            "AI generation is temporarily unavailable because the Gemini API quota has been reached. Please try again later.",
          code: "AI_QUOTA_EXCEEDED",
        },
        { status: 429 }
      );
    }

    // Other Gemini/API errors
    return NextResponse.json(
      {
        error:
          errorMessage ||
          "Failed to generate quiz.",
      },
      { status: 500 }
    );
  }
}