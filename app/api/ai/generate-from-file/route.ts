import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import officeParser from "officeparser";

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
    const formData = await request.formData();

    const file = formData.get("file");
    const numberOfQuestions = Number(
      formData.get("numberOfQuestions") || 10
    );

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload a file.",
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

    const fileName = file.name.toLowerCase();

    const allowedTypes = [
      ".pdf",
      ".docx",
      ".pptx",
      ".txt",
    ];

    const extension = allowedTypes.find((type) =>
      fileName.endsWith(type)
    );

    if (!extension) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload PDF, DOCX, or TXT.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Read file
    // --------------------------------

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    let extractedText = "";

    // TXT
    if (extension === ".txt") {
      extractedText = buffer.toString("utf-8");
    }

    // PDF
    if (extension === ".pdf") {
        const parser = new PDFParse({
            data: buffer,
        });

        const result = await parser.getText();

        extractedText = result.text;

        await parser.destroy();
    }

    // DOCX
    if (extension === ".docx") {
      const result =
        await mammoth.extractRawText({
          buffer,
        });

      extractedText = result.value;
    }

    // PPTX
    // TXT
if (extension === ".txt") {
  extractedText = buffer.toString("utf-8");
}

// PDF
if (extension === ".pdf") {
  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  extractedText = result.text;

  await parser.destroy();
}

// DOCX
if (extension === ".docx") {
  const result =
    await mammoth.extractRawText({
      buffer,
    });

  extractedText = result.value;
}

// PPTX
if (extension === ".pptx") {
  const result = await officeParser.parseOffice(
    buffer
  );

  extractedText = result.toText();
}

    // --------------------------------
    // Validate extracted text
    // --------------------------------

    extractedText = extractedText.trim();

    if (!extractedText) {
      return NextResponse.json(
        {
          error:
            "No readable text was found in the uploaded file.",
        },
        { status: 400 }
      );
    }

    // Prevent extremely large requests
    const maxCharacters = 100000;

    if (extractedText.length > maxCharacters) {
      extractedText =
        extractedText.substring(
          0,
          maxCharacters
        );
    }

    // --------------------------------
    // Generate quiz
    // --------------------------------

    const prompt = `
You are an educational quiz generator.

Use the study material below to create a quiz.

STUDY MATERIAL:

"""
${extractedText}
"""

Generate exactly ${numberOfQuestions} questions.

Use a mixture of:

1. Multiple-choice questions
2. True-or-false questions

For multiple-choice questions:

- Provide exactly 4 choices.
- Only ONE choice is correct.

For true-or-false questions:

- Provide exactly these choices:
  "True"
  "False"

The correctAnswer field must be the ZERO-BASED
index of the correct choice.

Example:

Multiple choice:

choices:
["Choice A", "Choice B", "Choice C", "Choice D"]

correctAnswer:
2

True or false:

choices:
["True", "False"]

correctAnswer:
0

Rules:

- Questions must be based ONLY on the uploaded material.
- Do not invent information that is not supported by the material.
- Avoid duplicate questions.
- Use clear language.
- Make questions appropriate for students.
- Do not include explanations.
- Do not include markdown.

Return only valid JSON.
`;

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

    if (!response.text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    const quiz: GeneratedQuiz =
      JSON.parse(response.text);

    // --------------------------------
    // Validate AI response
    // --------------------------------

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
        `Expected ${numberOfQuestions} questions but received ${quiz.questions.length}.`
      );
    }

    for (const question of quiz.questions) {
      if (!question.question?.trim()) {
        throw new Error(
          "AI generated an empty question."
        );
      }

      if (
        question.questionType !==
          "multiple_choice" &&
        question.questionType !==
          "true_false"
      ) {
        throw new Error(
          "Invalid question type."
        );
      }

      if (
        question.questionType ===
        "multiple_choice"
      ) {
        if (
          question.choices.length !== 4
        ) {
          throw new Error(
            "Multiple-choice questions must contain 4 choices."
          );
        }
      }

      if (
        question.questionType ===
        "true_false"
      ) {
        if (
          question.choices.length !== 2 ||
          question.choices[0] !==
            "True" ||
          question.choices[1] !==
            "False"
        ) {
          throw new Error(
            "True/False choices are invalid."
          );
        }
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >=
          question.choices.length
      ) {
        throw new Error(
          "Invalid correct answer."
        );
      }
    }

    // --------------------------------
    // Return quiz
    // --------------------------------

    return NextResponse.json({
      success: true,
      fileName: file.name,
      quiz,
    });
  } catch (error) {
    console.error(
      "File quiz generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate quiz from file.",
      },
      { status: 500 }
    );
  }
}