import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { notifyAdmins } from "@/lib/notify-admins";

type QuestionInput = {
  question: string;
  questionType: "multiple_choice" | "true_false";
  choices: string[];
  correctAnswer: number;
};

type CreateQuizBody = {
  title: string;
  questions: QuestionInput[];
};

function generateShareCode(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return result;
}

export async function GET() {
  try {
    const { data, error } =
      await supabaseAdmin
        .from("quizzes")
        .select("id, title, share_code, created_at")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error("Quiz fetch error:", error);

      return NextResponse.json(
        {
          error: "Failed to load quizzes.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quizzes: data || [],
    });
  } catch (error) {
    console.error("Quiz GET error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while loading quizzes.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateQuizBody = await request.json();

    const { title, questions } = body;

    // -----------------------------
    // Validate quiz
    // -----------------------------

    if (!title?.trim()) {
      return NextResponse.json(
        {
          error: "Quiz title is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return NextResponse.json(
        {
          error: "At least one question is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Validate questions
    // -----------------------------

    for (const question of questions) {
      // Question text
      if (!question.question?.trim()) {
        return NextResponse.json(
          {
            error: "Every question must have text.",
          },
          { status: 400 }
        );
      }

      // Question type
      if (
        question.questionType !== "multiple_choice" &&
        question.questionType !== "true_false"
      ) {
        return NextResponse.json(
          {
            error: "Invalid question type.",
          },
          { status: 400 }
        );
      }

      // -----------------------------
      // Multiple Choice validation
      // -----------------------------

      if (
        question.questionType === "multiple_choice"
      ) {
        if (
          !Array.isArray(question.choices) ||
          question.choices.length !== 4
        ) {
          return NextResponse.json(
            {
              error:
                "Multiple choice questions must have exactly 4 choices.",
            },
            { status: 400 }
          );
        }
      }

      // -----------------------------
      // True / False validation
      // -----------------------------

      if (
        question.questionType === "true_false"
      ) {
        if (
          !Array.isArray(question.choices) ||
          question.choices.length !== 2
        ) {
          return NextResponse.json(
            {
              error:
                "True/False questions must have exactly 2 choices.",
            },
            { status: 400 }
          );
        }
      }

      // -----------------------------
      // Validate choice text
      // -----------------------------

      if (
        question.choices.some(
          (choice) => !choice?.trim()
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Every choice must have text.",
          },
          { status: 400 }
        );
      }

      // -----------------------------
      // Validate correct answer
      // -----------------------------

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >=
          question.choices.length
      ) {
        return NextResponse.json(
          {
            error:
              "Each question must have a valid correct answer.",
          },
          { status: 400 }
        );
      }
    }

    // -----------------------------
    // Generate unique share code
    // -----------------------------

    let shareCode = "";
    let existingQuiz = null;

    do {
      shareCode = generateShareCode();

      const { data } = await supabaseAdmin
        .from("quizzes")
        .select("id")
        .eq("share_code", shareCode)
        .maybeSingle();

      existingQuiz = data;
    } while (existingQuiz);

    // -----------------------------
    // Create quiz
    // -----------------------------

    const {
      data: quiz,
      error: quizError,
    } = await supabaseAdmin
      .from("quizzes")
      .insert({
        title: title.trim(),
        share_code: shareCode,
      })
      .select("id, share_code")
      .single();

    if (quizError || !quiz) {
      console.error(
        "Quiz creation error:",
        quizError
      );

      return NextResponse.json(
        {
          error: "Failed to create quiz.",
          details: quizError?.message,
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Create questions
    // -----------------------------

    for (
      const [questionIndex, question]
      of questions.entries()
    ) {
      const {
        data: createdQuestion,
        error: questionError,
      } = await supabaseAdmin
        .from("questions")
        .insert({
          quiz_id: quiz.id,
          question_text:
            question.question.trim(),

          // IMPORTANT:
          // Save the question type
          question_type:
            question.questionType,

          points: 1,

          // Start question order at 1
          question_order:
            questionIndex + 1,
        })
        .select("id")
        .single();

      if (
        questionError ||
        !createdQuestion
      ) {
        console.error(
          "Question creation error:",
          questionError
        );

        return NextResponse.json(
          {
            error:
              "Failed to create a question.",
            details:
              questionError?.message,
          },
          { status: 500 }
        );
      }

      // -----------------------------
      // Create choices
      // -----------------------------

      const choices =
        question.choices.map(
          (choice, choiceIndex) => ({
            question_id:
              createdQuestion.id,

            choice_text:
              choice.trim(),

            // Start choice order at 1
            choice_order:
              choiceIndex + 1,

            is_correct:
              choiceIndex ===
              question.correctAnswer,
          })
        );

      const {
        error: choicesError,
      } = await supabaseAdmin
        .from("choices")
        .insert(choices);

      if (choicesError) {
        console.error(
          "Choices creation error:",
          choicesError
        );

        return NextResponse.json(
          {
            error:
              "Failed to create choices.",
            details:
              choicesError.message,
          },
          { status: 500 }
        );
      }
    }

    // -----------------------------
    // Notify admins (does not block
    // or fail the response if it
    // errors)
    // -----------------------------

    await notifyAdmins(
      `New quiz created: ${title.trim()}`,
      `
        <p>A new quiz was created.</p>
        <p><strong>Title:</strong> ${title.trim()}</p>
        <p><strong>Questions:</strong> ${questions.length}</p>
        <p><strong>Share code:</strong> ${quiz.share_code}</p>
      `
    );

    // -----------------------------
    // Success
    // -----------------------------

    return NextResponse.json({
      success: true,

      quizId: quiz.id,

      shareCode:
        quiz.share_code,

      shareUrl:
        `/quiz/${quiz.share_code}`,
    });
  } catch (error) {
    console.error(
      "Create quiz error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the quiz.",
      },
      { status: 500 }
    );
  }
}