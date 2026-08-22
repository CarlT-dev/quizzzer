import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { notifyAdmins } from "@/lib/notify-admins";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    const body = await request.json();

    const studentName = body.studentName?.trim();
    const answers = body.answers;

    // -----------------------------
    // Validate student
    // -----------------------------

    if (!studentName) {
      return NextResponse.json(
        {
          error: "Student name is required.",
        },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        {
          error: "Answers are required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Find quiz
    // -----------------------------

    const { data: quiz, error: quizError } =
      await supabaseAdmin
        .from("quizzes")
        .select("id, title")
        .eq("share_code", shareCode)
        .single();

    if (quizError || !quiz) {
      console.error("Quiz lookup error:", quizError);

      return NextResponse.json(
        {
          error: "Quiz not found.",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Get questions
    // -----------------------------

    const { data: questions, error: questionsError } =
      await supabaseAdmin
        .from("questions")
        .select(`
          id,
          question_text,
          choices (
            id,
            choice_text,
            is_correct
          )
        `)
        .eq("quiz_id", quiz.id)
        .order("question_order", {
          ascending: true,
        });

    if (questionsError || !questions) {
      console.error(
        "Questions lookup error:",
        questionsError
      );

      return NextResponse.json(
        {
          error: "Failed to load quiz questions.",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Calculate score
    // -----------------------------

    let score = 0;

    for (const question of questions) {
      const selectedChoiceId =
        answers[question.id];

      if (!selectedChoiceId) {
        continue;
      }

      const selectedChoice =
        question.choices.find(
          (choice) =>
            choice.id === selectedChoiceId
        );

      if (
        selectedChoice &&
        selectedChoice.is_correct
      ) {
        score++;
      }
    }

    const total = questions.length;

    // -----------------------------
    // Save submission
    // -----------------------------

    const { data: submission, error: submissionError } =
      await supabaseAdmin
        .from("submissions")
        .insert({
          quiz_id: quiz.id,
          student_name: studentName,
          score,
          total,
        })
        .select("id")
        .single();

    if (submissionError || !submission) {
      console.error(
        "Submission creation error:",
        submissionError
      );

      return NextResponse.json(
        {
          error: "Failed to save quiz submission.",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Save answers
    // -----------------------------

    const answerRows = Object.entries(
      answers
    ).map(([questionId, choiceId]) => ({
      submission_id: submission.id,
      question_id: questionId,
      choice_id: choiceId,
    }));

    if (answerRows.length > 0) {
      const { error: answersError } =
        await supabaseAdmin
          .from("answers")
          .insert(answerRows);

      if (answersError) {
        console.error(
          "Answers creation error:",
          answersError
        );

        return NextResponse.json(
          {
            error: "Failed to save student answers.",
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
      `Quiz submitted: ${quiz.title}`,
      `
        <p><strong>${studentName}</strong> submitted
        "<strong>${quiz.title}</strong>".</p>
        <p><strong>Score:</strong> ${score} / ${total}</p>
      `
    );

    // -----------------------------
    // Return result
    // -----------------------------

    return NextResponse.json({
      success: true,
      score,
      total,
      submissionId: submission.id,
    });

  } catch (error) {
    console.error(
      "Submit quiz error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting the quiz.",
      },
      { status: 500 }
    );
  }
}