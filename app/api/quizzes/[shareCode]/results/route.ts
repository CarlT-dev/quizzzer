import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    // -----------------------------
    // Find quiz
    // -----------------------------

    const { data: quiz, error: quizError } =
      await supabaseAdmin
        .from("quizzes")
        .select("id, title, share_code")
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
    // Get submissions
    // -----------------------------

    const {
      data: submissions,
      error: submissionsError,
    } = await supabaseAdmin
      .from("submissions")
      .select(`
        id,
        student_name,
        score,
        total
      `)
      .eq("quiz_id", quiz.id)
      .order("id", {
        ascending: false,
      });

    if (submissionsError) {
      console.error(
        "Submissions lookup error:",
        submissionsError
      );

      return NextResponse.json(
        {
          error: "Failed to load quiz results.",
          details: submissionsError.message,
        },
        { status: 500 }
      );
    }

    const submissionList = submissions || [];

    // -----------------------------
    // Calculate statistics
    // -----------------------------

    const submissionCount =
      submissionList.length;

    let totalScore = 0;
    let highestScore = 0;
    let totalPoints = 0;

    for (const submission of submissionList) {
      totalScore += Number(submission.score) || 0;

      if (
        Number(submission.score) >
        highestScore
      ) {
        highestScore =
          Number(submission.score);
      }

      if (
        Number(submission.total) >
        totalPoints
      ) {
        totalPoints =
          Number(submission.total);
      }
    }

    const averageScore =
      submissionCount > 0
        ? totalScore / submissionCount
        : 0;

    const averagePercentage =
      submissionCount > 0 && totalPoints > 0
        ? (averageScore / totalPoints) * 100
        : 0;

    // -----------------------------
    // Return results
    // -----------------------------

    return NextResponse.json({
      success: true,

      quiz,

      submissions: submissionList,

      statistics: {
        submissionCount,

        averageScore:
          Number(averageScore.toFixed(2)),

        highestScore,

        totalPoints,

        averagePercentage:
          Number(
            averagePercentage.toFixed(2)
          ),
      },
    });
  } catch (error) {
    console.error(
      "Results API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading results.",
      },
      { status: 500 }
    );
  }
}