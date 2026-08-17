import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      shareCode: string;
      submissionId: string;
    }>;
  }
) {
  try {
    const { shareCode, submissionId } = await params;

    // -----------------------------
    // Find quiz
    // -----------------------------

    const {
      data: quiz,
      error: quizError,
    } = await supabaseAdmin
      .from("quizzes")
      .select("id, title, share_code")
      .eq("share_code", shareCode)
      .maybeSingle();

    if (quizError) {
      console.error("Quiz lookup error:", quizError);

      return NextResponse.json(
        {
          error: "Failed to find quiz.",
          details: quizError.message,
        },
        { status: 500 }
      );
    }

    if (!quiz) {
      return NextResponse.json(
        {
          error: "Quiz not found.",
        },
        { status: 404 }
      );
    }

    console.log("Quiz found:", {
      quizId: quiz.id,
      shareCode: quiz.share_code,
    });

    // -----------------------------
    // Find submission
    // -----------------------------

    const {
      data: submission,
      error: submissionError,
    } = await supabaseAdmin
      .from("submissions")
      .select(
        "id, quiz_id, student_name, score, total, submitted_at"
      )
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError) {
      console.error(
        "Submission lookup error:",
        submissionError
      );

      return NextResponse.json(
        {
          error: "Failed to find submission.",
          details: submissionError.message,
        },
        { status: 500 }
      );
    }

    if (!submission) {
      console.error(
        "No submission found with ID:",
        submissionId
      );

      return NextResponse.json(
        {
          error: "Submission not found.",
          details:
            "The submission ID does not exist in the submissions table.",
        },
        { status: 404 }
      );
    }

    console.log("Submission found:", {
      submissionId: submission.id,
      submissionQuizId: submission.quiz_id,
      requestedQuizId: quiz.id,
    });

    // -----------------------------
    // Make sure submission belongs
    // to this quiz
    // -----------------------------

    if (submission.quiz_id !== quiz.id) {
      console.error(
        "Submission belongs to a different quiz."
      );

      return NextResponse.json(
        {
          error:
            "This submission does not belong to this quiz.",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Get answers
    // -----------------------------

    const {
      data: answers,
      error: answersError,
    } = await supabaseAdmin
      .from("answers")
      .select(`
        question_id,
        choice_id
      `)
      .eq("submission_id", submission.id);

    if (answersError) {
      console.error(
        "Answers lookup error:",
        answersError
      );

      return NextResponse.json(
        {
          error: "Failed to load student answers.",
          details: answersError.message,
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Get questions
    // -----------------------------

    const {
      data: questions,
      error: questionsError,
    } = await supabaseAdmin
      .from("questions")
      .select(`
        id,
        question_text,
        question_order,
        choices (
          id,
          choice_text,
          is_correct,
          choice_order
        )
      `)
      .eq("quiz_id", quiz.id)
      .order("question_order", {
        ascending: true,
      });

    if (questionsError) {
      console.error(
        "Questions lookup error:",
        questionsError
      );

      return NextResponse.json(
        {
          error: "Failed to load quiz questions.",
          details: questionsError.message,
        },
        { status: 500 }
      );
    }

    if (!questions) {
      return NextResponse.json(
        {
          error: "No questions found.",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Build detailed results
    // -----------------------------

    const detailedAnswers = questions.map(
      (question) => {
        const studentAnswer =
          answers?.find(
            (answer) =>
              answer.question_id === question.id
          );

        const selectedChoice =
          question.choices.find(
            (choice) =>
              choice.id ===
              studentAnswer?.choice_id
          );

        const correctChoice =
          question.choices.find(
            (choice) => choice.is_correct === true
          );

        return {
          questionId: question.id,

          question:
            question.question_text,

          selectedChoice: selectedChoice
            ? {
                id: selectedChoice.id,
                text: selectedChoice.choice_text,
              }
            : null,

          correctChoice: correctChoice
            ? {
                id: correctChoice.id,
                text: correctChoice.choice_text,
              }
            : null,

          isCorrect:
            selectedChoice?.is_correct === true,

          choices: [...question.choices]
            .sort(
              (a, b) =>
                a.choice_order -
                b.choice_order
            )
            .map((choice) => ({
              id: choice.id,
              text: choice.choice_text,
              isCorrect: choice.is_correct,
            })),
        };
      }
    );

    // -----------------------------
    // Success
    // -----------------------------

    return NextResponse.json({
      success: true,

      quiz,

      submission: {
        id: submission.id,
        student_name:
          submission.student_name,
        score: submission.score,
        total: submission.total,
        submitted_at:
          submission.submitted_at,
      },

      answers: detailedAnswers,
    });
  } catch (error) {
    console.error(
      "Submission details error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading submission details.",
      },
      { status: 500 }
    );
  }
}