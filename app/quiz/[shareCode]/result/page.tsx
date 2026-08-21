import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ResultClient from "./ResultClient";

type PageProps = {
  params: Promise<{
    shareCode: string;
  }>;
  searchParams: Promise<{
    submissionId?: string;
  }>;
};

export default async function QuizResultPage({
  params,
  searchParams,
}: PageProps) {
  const { shareCode } = await params;
  const { submissionId } = await searchParams;

  if (!submissionId) {
    notFound();
  }

  // -----------------------------
  // Find quiz
  // -----------------------------

  const { data: quiz, error: quizError } =
    await supabaseAdmin
      .from("quizzes")
      .select("id, title, share_code")
      .eq("share_code", shareCode.toUpperCase())
      .single();

  if (quizError || !quiz) {
    notFound();
  }

  // -----------------------------
  // Find submission
  // -----------------------------

  const { data: submission, error: submissionError } =
    await supabaseAdmin
      .from("submissions")
      .select(
        "id, quiz_id, student_name, score, total, submitted_at"
      )
      .eq("id", submissionId)
      .maybeSingle();

  if (submissionError || !submission) {
    notFound();
  }

  // Make sure the submission actually belongs to this quiz
  if (submission.quiz_id !== quiz.id) {
    notFound();
  }

  // -----------------------------
  // Get the student's answers
  // -----------------------------

  const { data: answers, error: answersError } =
    await supabaseAdmin
      .from("answers")
      .select("question_id, choice_id")
      .eq("submission_id", submission.id);

  if (answersError) {
    console.error(answersError);
    notFound();
  }

  // -----------------------------
  // Get questions + choices
  // -----------------------------

  const { data: questions, error: questionsError } =
    await supabaseAdmin
      .from("questions")
      .select(
        `
        id,
        question_text,
        question_order,
        choices (
          id,
          choice_text,
          is_correct,
          choice_order
        )
      `
      )
      .eq("quiz_id", quiz.id)
      .order("question_order", {
        ascending: true,
      });

  if (questionsError || !questions) {
    console.error(questionsError);
    notFound();
  }

  // -----------------------------
  // Build detailed, per-question
  // correct/incorrect breakdown
  // -----------------------------

  const detailedAnswers = questions.map((question) => {
    const studentAnswer = answers?.find(
      (answer) => answer.question_id === question.id
    );

    const selectedChoice = question.choices.find(
      (choice) => choice.id === studentAnswer?.choice_id
    );

    return {
      questionId: question.id,
      question: question.question_text,
      selectedChoiceId: selectedChoice?.id ?? null,
      isCorrect: selectedChoice?.is_correct === true,
      choices: [...question.choices]
        .sort((a, b) => a.choice_order - b.choice_order)
        .map((choice) => ({
          id: choice.id,
          text: choice.choice_text,
          isCorrect: choice.is_correct,
        })),
    };
  });

  return (
    <ResultClient
      quiz={{
        title: quiz.title,
        shareCode: quiz.share_code,
      }}
      submission={{
        studentName: submission.student_name,
        score: submission.score,
        total: submission.total,
      }}
      answers={detailedAnswers}
    />
  );
}