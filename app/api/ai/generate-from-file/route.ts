import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as pdfParseModule from "pdf-parse";
import mammoth from "mammoth";
import officeParser from "officeparser";

export const runtime = "nodejs";
export const maxDuration = 60;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type QuestionType = "multiple_choice" | "true_false";
type Difficulty = "Easy" | "Medium" | "Hard";

type GeneratedQuestion = {
  question: string;
  questionType: QuestionType;
  difficulty?: Difficulty;
  choices: string[];
  correctAnswer: number;
};

type GeneratedQuiz = {
  title: string;
  questions: GeneratedQuestion[];
};

const DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".pptx",
  ".txt",
] as const;

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".gif",
] as const;

const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;

function getExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  const match = [
    ...DOCUMENT_EXTENSIONS,
    ...IMAGE_EXTENSIONS,
  ].find((extension) => lower.endsWith(extension));

  return match ?? null;
}

function isImageExtension(
  extension: string
): extension is (typeof IMAGE_EXTENSIONS)[number] {
  return IMAGE_EXTENSIONS.includes(
    extension as (typeof IMAGE_EXTENSIONS)[number]
  );
}

function getImageMimeType(
  file: File,
  extension: string
) {
  if (file.type === "image/jpg") {
    return "image/jpeg";
  }

  if (file.type.startsWith("image/")) {
    return file.type;
  }

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    case ".gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

function parseJsonField<T>(
  value: FormDataEntryValue | null,
  fallback: T
): T {
  if (typeof value !== "string" || !value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function extractDocumentText(
  buffer: Buffer,
  extension: string
) {
  if (extension === ".txt") {
    return buffer.toString("utf-8");
  }

  if (extension === ".pdf") {
    // Handles different module export structures across pdf-parse versions
    const parse =
      (pdfParseModule as any).default ||
      (pdfParseModule as any).pdfParse ||
      pdfParseModule;

    const result = await parse(buffer);
    return result.text;
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      buffer,
    });

    return result.value;
  }

  if (extension === ".pptx") {
    const result = await officeParser.parseOffice(
      buffer
    );

    if (typeof result === "string") {
      return result;
    }

    if (
      result &&
      typeof result === "object" &&
      "toText" in result &&
      typeof result.toText === "function"
    ) {
      return result.toText();
    }

    return String(result ?? "");
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const uploadedFiles = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((entry): entry is File => entry instanceof File);

    const topic =
      typeof formData.get("topic") === "string"
        ? formData.get("topic")?.toString().trim()
        : "";

    const numberOfQuestions = Number(
      formData.get("numberOfQuestions") || 10
    );

    const difficulties: Difficulty[] = parseJsonField(
      formData.get("difficulties"),
      ["Medium"]
    );

    const questionTypes: QuestionType[] = parseJsonField(
      formData.get("questionTypes"),
      ["multiple_choice", "true_false"]
    );

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        {
          error:
            "Please upload at least one file or photo.",
        },
        { status: 400 }
      );
    }

    const totalSize = uploadedFiles.reduce(
      (total, file) => total + file.size,
      0
    );

    if (totalSize > MAX_TOTAL_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "The total size of your files and photos cannot exceed 20 MB.",
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

    const allowedDifficulties = ["Easy", "Medium", "Hard"];
    const allowedQuestionTypes = [
      "multiple_choice",
      "true_false",
    ];

    if (
      difficulties.length === 0 ||
      difficulties.some(
        (difficulty) =>
          !allowedDifficulties.includes(difficulty)
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

    if (
      questionTypes.length === 0 ||
      questionTypes.some(
        (type) => !allowedQuestionTypes.includes(type)
      )
    ) {
      return NextResponse.json(
        {
          error: "Please select a valid question type.",
        },
        { status: 400 }
      );
    }

    const documentTexts: string[] = [];
    const imageParts: Array<{
      inlineData: {
        mimeType: string;
        data: string;
      };
    }> = [];

    for (const file of uploadedFiles) {
      const extension = getExtension(file.name);
      const isPhoto =
        file.type.startsWith("image/") ||
        (extension !== null && isImageExtension(extension));

      if (!extension && !isPhoto) {
        return NextResponse.json(
          {
            error: `"${file.name || "Untitled"}" is not supported. Please upload PDF, DOCX, PPTX, TXT, or photos.`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (isPhoto) {
        imageParts.push({
          inlineData: {
            mimeType: getImageMimeType(file, extension ?? ".jpg"),
            data: buffer.toString("base64"),
          },
        });
        continue;
      }

      if (!extension) {
        continue;
      }

      const extractedText = (
        await extractDocumentText(buffer, extension)
      ).trim();

      if (extractedText) {
        documentTexts.push(
          `FILE: ${file.name}\n${extractedText}`
        );
      }
    }

    let combinedText = documentTexts.join("\n\n").trim();
    const maxCharacters = 100000;

    if (combinedText.length > maxCharacters) {
      combinedText = combinedText.substring(0, maxCharacters);
    }

    if (!combinedText && imageParts.length === 0) {
      return NextResponse.json(
        {
          error:
            "No readable text or photos were found in the upload.",
        },
        { status: 400 }
      );
    }

    const difficultyInstruction =
      difficulties.length === 1
        ? `All questions must be ${difficulties[0]} difficulty.`
        : `
Use a mixture of the selected difficulty levels:
${difficulties.join(", ")}.

Distribute the questions reasonably across
the selected difficulty levels.
`;

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

    const topicInstruction = topic
      ? `
FOCUS TOPIC:

"${topic}"

Use the uploaded materials as the source, but
focus the questions on this topic when possible.
`
      : "";

    const documentInstruction = combinedText
      ? `
STUDY MATERIAL FROM FILES:

"""
${combinedText}
"""
`
      : "";

    const photoInstruction =
      imageParts.length > 0
        ? `
The user also uploaded ${imageParts.length} photo${
            imageParts.length === 1 ? "" : "s"
          } of study material. Read all photos carefully, including printed text, slides, whiteboard notes, and handwriting.
`
        : "";

    const prompt = `
You are an educational quiz generator.

Use the uploaded study materials to create a quiz.
The materials may include documents and/or photos taken on a phone.

${topicInstruction}
${photoInstruction}
${documentInstruction}

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

TRUE OR FALSE:

- questionType must be "true_false"
- Exactly 2 choices
- The choices MUST be exactly:
  ["True", "False"]
- correctAnswer must be:
  0 if True is correct
  1 if False is correct
- difficulty must be "Easy", "Medium", or "Hard"

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, ...imageParts],
        },
      ],

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
                    enum: ["multiple_choice", "true_false"],
                  },

                  difficulty: {
                    type: "string",
                    enum: ["Easy", "Medium", "Hard"],
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

          required: ["title", "questions"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const quiz: GeneratedQuiz = JSON.parse(response.text);

    if (!quiz.title || !Array.isArray(quiz.questions)) {
      throw new Error("Invalid quiz structure.");
    }

    if (quiz.questions.length !== numberOfQuestions) {
      throw new Error(
        `Expected ${numberOfQuestions} questions but received ${quiz.questions.length}.`
      );
    }

    for (const question of quiz.questions) {
      if (!question.question?.trim()) {
        throw new Error("AI generated an empty question.");
      }

      if (
        question.questionType !== "multiple_choice" &&
        question.questionType !== "true_false"
      ) {
        throw new Error("Invalid question type.");
      }

      if (!questionTypes.includes(question.questionType)) {
        throw new Error(
          "AI generated a question type that was not selected."
        );
      }

      if (
        question.difficulty &&
        !difficulties.includes(question.difficulty)
      ) {
        throw new Error(
          `AI generated a ${question.difficulty} question even though that difficulty was not selected.`
        );
      }

      if (question.questionType === "multiple_choice") {
        if (question.choices.length !== 4) {
          throw new Error(
            "Multiple-choice questions must contain 4 choices."
          );
        }
      }

      if (question.questionType === "true_false") {
        if (
          question.choices.length !== 2 ||
          question.choices[0] !== "True" ||
          question.choices[1] !== "False"
        ) {
          throw new Error("True/False choices are invalid.");
        }
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.choices.length
      ) {
        throw new Error("Invalid correct answer.");
      }
    }

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("File quiz generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate quiz from the uploaded materials.",
      },
      { status: 500 }
    );
  }
}