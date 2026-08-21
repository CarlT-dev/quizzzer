"use client";

import Link from "next/link";

type Choice = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type AnswerDetail = {
  questionId: string;
  question: string;
  selectedChoiceId: string | null;
  isCorrect: boolean;
  choices: Choice[];
};

type Quiz = {
  title: string;
  shareCode: string;
};

type Submission = {
  studentName: string;
  score: number;
  total: number;
};

type Props = {
  quiz: Quiz;
  submission: Submission;
  answers: AnswerDetail[];
};

export default function ResultClient({
  quiz,
  submission,
  answers,
}: Props) {
  const percentage =
    submission.total > 0
      ? Math.round(
          (submission.score / submission.total) * 100
        )
      : 0;

  const correctCount = answers.filter(
    (answer) => answer.isCorrect
  ).length;

  const incorrectCount = answers.length - correctCount;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header / Score summary */}

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold tracking-widest text-gray-500">
            QUIZ RESULT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {quiz.title}
          </h1>

          <p className="mt-2 text-gray-600">
            {submission.studentName}
          </p>

          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Your Score
            </p>

            <p className="mt-2 text-5xl font-bold text-gray-900">
              {submission.score} / {submission.total}
            </p>

            <p className="mt-2 text-lg text-gray-600">
              {percentage}%
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <span className="flex items-center gap-2 font-medium text-green-600">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              {correctCount} Correct
            </span>

            <span className="flex items-center gap-2 font-medium text-red-500">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              {incorrectCount} Incorrect
            </span>
          </div>
        </div>

        {/* Per-question breakdown */}

        <div className="mt-8 space-y-6">
          {answers.map((answer, index) => (
            <div
              key={answer.questionId}
              className={`rounded-xl border-2 bg-white p-6 shadow-sm ${
                answer.isCorrect
                  ? "border-green-400"
                  : "border-red-400"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {index + 1}. {answer.question}
                </h2>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    answer.isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {answer.isCorrect
                    ? "Correct"
                    : "Incorrect"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {answer.choices.map(
                  (choice, choiceIndex) => {
                    const isSelected =
                      choice.id ===
                      answer.selectedChoiceId;

                    let style =
                      "border-gray-200";

                    if (choice.isCorrect) {
                      style =
                        "border-green-400 bg-green-50";
                    } else if (
                      isSelected &&
                      !choice.isCorrect
                    ) {
                      style =
                        "border-red-400 bg-red-50";
                    }

                    return (
                      <div
                        key={choice.id}
                        className={`flex items-center justify-between gap-3 rounded-lg border p-4 ${style}`}
                      >
                        <span>
                          {String.fromCharCode(
                            65 + choiceIndex
                          )}
                          . {choice.text}
                        </span>

                        <div className="flex shrink-0 items-center gap-2 text-xs font-medium">
                          {isSelected && (
                            <span className="text-gray-500">
                              Your answer
                            </span>
                          )}

                          {choice.isCorrect && (
                            <span className="text-green-600">
                              Correct answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}

                {!answer.selectedChoiceId && (
                  <p className="text-sm text-gray-500">
                    No answer selected.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}

        <div className="mt-8 flex justify-center">
          <Link
            href={`/quiz/${quiz.shareCode}`}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Back to Quiz
          </Link>
        </div>
      </div>
    </main>
  );
}