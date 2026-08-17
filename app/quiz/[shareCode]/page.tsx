import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import QuizClient from "./QuizClient";

type PageProps = {
  params: Promise<{
    shareCode: string;
  }>;
};

export default async function QuizPage({
  params,
}: PageProps) {
  const { shareCode } = await params;

  const { data: quiz, error: quizError } =
    await supabaseAdmin
      .from("quizzes")
      .select("id, title, description, share_code")
      .eq("share_code", shareCode.toUpperCase())
      .single();

  if (quizError || !quiz) {
    notFound();
  }

  const { data: questions, error: questionsError } =
    await supabaseAdmin
      .from("questions")
      .select(
        "id, question_text, question_type, points, question_order"
      )
      .eq("quiz_id", quiz.id)
      .order("question_order", {
        ascending: true,
      });

  if (questionsError) {
    console.error(questionsError);
    notFound();
  }

  const questionIds =
    questions?.map((question) => question.id) ?? [];

  const { data: choices, error: choicesError } =
    await supabaseAdmin
      .from("choices")
      .select(
        "id, question_id, choice_text, choice_order"
      )
      .in("question_id", questionIds)
      .order("choice_order", {
        ascending: true,
      });

  if (choicesError) {
    console.error(choicesError);
    notFound();
  }

  const formattedQuestions =
    questions?.map((question) => ({
      id: question.id,
      question: question.question_text,
      choices:
        choices
          ?.filter(
            (choice) =>
              choice.question_id === question.id
          )
          .map((choice) => ({
            id: choice.id,
            text: choice.choice_text,
          })) ?? [],
    })) ?? [];

  return (
    <QuizClient
      quiz={{
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        shareCode: quiz.share_code,
      }}
      questions={formattedQuestions}
    />
  );
}