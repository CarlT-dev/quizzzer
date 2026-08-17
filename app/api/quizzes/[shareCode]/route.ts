import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      shareCode: string;
    }>;
  }
) {
  try {
    const { shareCode } = await params;

    // -----------------------------
    // Find quiz
    // -----------------------------

    const { data: quiz, error: quizError } =
      await supabaseAdmin
        .from("quizzes")
        .select("id")
        .eq("share_code", shareCode)
        .single();

    if (quizError || !quiz) {
      console.error(
        "Quiz lookup error:",
        quizError
      );

      return NextResponse.json(
        {
          error: "Quiz not found.",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Find submissions
    // -----------------------------

    const {
      data: submissions,
      error: submissionsError,
    } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("quiz_id", quiz.id);

    if (submissionsError) {
      console.error(
        "Submission lookup error:",
        submissionsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to find quiz submissions.",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Delete answers
    // -----------------------------

    const submissionIds =
      submissions?.map(
        (submission) => submission.id
      ) || [];

    if (submissionIds.length > 0) {
      const { error: answersError } =
        await supabaseAdmin
          .from("answers")
          .delete()
          .in(
            "submission_id",
            submissionIds
          );

      if (answersError) {
        console.error(
          "Answers deletion error:",
          answersError
        );

        return NextResponse.json(
          {
            error:
              "Failed to delete quiz answers.",
          },
          { status: 500 }
        );
      }
    }

    // -----------------------------
    // Delete submissions
    // -----------------------------

    const {
      error: deleteSubmissionsError,
    } = await supabaseAdmin
      .from("submissions")
      .delete()
      .eq("quiz_id", quiz.id);

    if (deleteSubmissionsError) {
      console.error(
        "Submission deletion error:",
        deleteSubmissionsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete quiz submissions.",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Find questions
    // -----------------------------

    const {
      data: questions,
      error: questionsError,
    } = await supabaseAdmin
      .from("questions")
      .select("id")
      .eq("quiz_id", quiz.id);

    if (questionsError) {
      console.error(
        "Question lookup error:",
        questionsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to find quiz questions.",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Delete choices
    // -----------------------------

    const questionIds =
      questions?.map(
        (question) => question.id
      ) || [];

    if (questionIds.length > 0) {
      const { error: choicesError } =
        await supabaseAdmin
          .from("choices")
          .delete()
          .in(
            "question_id",
            questionIds
          );

      if (choicesError) {
        console.error(
          "Choices deletion error:",
          choicesError
        );

        return NextResponse.json(
          {
            error:
              "Failed to delete quiz choices.",
          },
          { status: 500 }
        );
      }
    }

    // -----------------------------
    // Delete questions
    // -----------------------------

    const {
      error: deleteQuestionsError,
    } = await supabaseAdmin
      .from("questions")
      .delete()
      .eq("quiz_id", quiz.id);

    if (deleteQuestionsError) {
      console.error(
        "Question deletion error:",
        deleteQuestionsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete quiz questions.",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Delete quiz
    // -----------------------------

    const { error: deleteQuizError } =
      await supabaseAdmin
        .from("quizzes")
        .delete()
        .eq("id", quiz.id);

    if (deleteQuizError) {
      console.error(
        "Quiz deletion error:",
        deleteQuizError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete quiz.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete quiz error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while deleting the quiz.",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      shareCode: string;
    }>;
  }
) {
  try {
    const { shareCode } = await params;

    // Find quiz
    const { data: quiz, error: quizError } =
      await supabaseAdmin
        .from("quizzes")
        .select("id, title, share_code")
        .eq("share_code", shareCode)
        .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        {
          error: "Quiz not found.",
        },
        { status: 404 }
      );
    }

    // Get questions and choices
    const {
      data: questions,
      error: questionsError,
    } = await supabaseAdmin
      .from("questions")
      .select(`
        id,
        question_text,
        question_type,
        question_order,
        choices (
          id,
          choice_text,
          choice_order,
          is_correct
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
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz,
      questions: questions || [],
    });
  } catch (error) {
    console.error(
      "Get quiz error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading the quiz.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      shareCode: string;
    }>;
  }
) {
  try {
    const { shareCode } = await params;

    const body = await request.json();

    const {
      title,
      questions,
    } = body;

    // Validate title
    if (!title?.trim()) {
      return NextResponse.json(
        {
          error: "Quiz title is required.",
        },
        { status: 400 }
      );
    }

    // Validate questions
    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one question is required.",
        },
        { status: 400 }
      );
    }

    // Find quiz
    const { data: quiz, error: quizError } =
      await supabaseAdmin
        .from("quizzes")
        .select("id")
        .eq("share_code", shareCode)
        .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        {
          error: "Quiz not found.",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Check existing submissions
    // -----------------------------

    const {
      data: submissions,
      error: submissionsError,
    } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("quiz_id", quiz.id)
      .limit(1);

    if (submissionsError) {
      console.error(
        "Submission check error:",
        submissionsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to check quiz submissions.",
        },
        { status: 500 }
      );
    }

    if (submissions && submissions.length > 0) {
      return NextResponse.json(
        {
          error:
            "This quiz cannot be edited because students have already submitted it.",
        },
        { status: 409 }
      );
    }

    // Update title
    const {
      error: updateQuizError,
    } = await supabaseAdmin
      .from("quizzes")
      .update({
        title: title.trim(),
      })
      .eq("id", quiz.id);

    if (updateQuizError) {
      console.error(
        "Quiz update error:",
        updateQuizError
      );

      return NextResponse.json(
        {
          error: "Failed to update quiz.",
        },
        { status: 500 }
      );
    }

    // Get existing questions
    const {
      data: existingQuestions,
      error: existingQuestionsError,
    } = await supabaseAdmin
      .from("questions")
      .select("id")
      .eq("quiz_id", quiz.id);

    if (existingQuestionsError) {
      return NextResponse.json(
        {
          error:
            "Failed to load existing questions.",
        },
        { status: 500 }
      );
    }

    const questionIds =
      existingQuestions?.map(
        (question) => question.id
      ) || [];

    // Delete existing choices
    if (questionIds.length > 0) {
      const {
        error: deleteChoicesError,
      } = await supabaseAdmin
        .from("choices")
        .delete()
        .in(
          "question_id",
          questionIds
        );

      if (deleteChoicesError) {
        console.error(
          "Delete choices error:",
          deleteChoicesError
        );

        return NextResponse.json(
          {
            error:
              "Failed to update quiz choices.",
          },
          { status: 500 }
        );
      }
    }

    // Delete existing questions
    const {
      error: deleteQuestionsError,
    } = await supabaseAdmin
      .from("questions")
      .delete()
      .eq("quiz_id", quiz.id);

    if (deleteQuestionsError) {
      console.error(
        "Delete questions error:",
        deleteQuestionsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to update quiz questions.",
        },
        { status: 500 }
      );
    }

    // Recreate questions
    for (
      const [
        questionIndex,
        question,
      ] of questions.entries()
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
          question_type:
            question.questionType,
          points: 1,
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
              "Failed to update questions.",
          },
          { status: 500 }
        );
      }

      const choices =
        question.choices.map(
          (
            choice: string,
            choiceIndex: number
          ) => ({
            question_id:
              createdQuestion.id,
            choice_text:
              choice.trim(),
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
          "Choices update error:",
          choicesError
        );

        return NextResponse.json(
          {
            error:
              "Failed to update choices.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Quiz updated successfully.",
    });
  } catch (error) {
    console.error(
      "Update quiz error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the quiz.",
      },
      { status: 500 }
    );
  }
}