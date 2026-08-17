"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Answer = {
  questionId: string;
  question: string;

  selectedChoice: {
    id: string;
    text: string;
  } | null;

  correctChoice: {
    id: string;
    text: string;
  } | null;

  isCorrect: boolean;
};

type ResultsData = {
  quiz: {
    id: string;
    title: string;
    share_code: string;
  };

  submission: {
    id: string;
    student_name: string;
    score: number;
    total: number;
    submitted_at: string;
  };

  answers: Answer[];
};

export default function SubmissionDetailsPage() {
  const params = useParams();

  const shareCode = params.shareCode as string;
  const submissionId = params.submissionId as string;
  const [data, setData] =
    useState<ResultsData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/quizzes/${shareCode}/results/${submissionId}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setError(
            result.error ||
              "Failed to load submission."
          );
          return;
        }

        setData(result);
      } catch (error) {
        console.error(error);

        setError(
          "Something went wrong while loading the submission."
        );
      } finally {
        setLoading(false);
      }
    }

    if (shareCode && submissionId) {
      loadResults();
    }
  }, [shareCode, submissionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Loading student result...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-red-50 p-5 text-red-600">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const percentage =
    data.submission.total > 0
      ? Math.round(
          (data.submission.score /
            data.submission.total) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-gray-500">
              QUIZZZER
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {data.submission.student_name}
            </h1>

            <p className="mt-2 text-gray-600">
              {data.quiz.title}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Submitted{" "}
              {new Date(
                data.submission.submitted_at
              ).toLocaleString()}
            </p>
          </div>

          <a
            href={`/dashboard/quiz/${data.quiz.share_code}/results`}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back to Results
          </a>

        </div>

        {/* Score */}

        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">

          <p className="text-sm text-gray-500">
            Final Score
          </p>

          <p className="mt-2 text-5xl font-bold text-gray-900">
            {data.submission.score} /{" "}
            {data.submission.total}
          </p>

          <p className="mt-2 text-xl text-gray-600">
            {percentage}%
          </p>

        </div>

        {/* Answers */}

        <div className="mt-8 space-y-6">

          {data.answers.map(
            (answer, index) => (
              <div
                key={answer.questionId}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <h2 className="text-lg font-semibold text-gray-900">
                    {index + 1}.{" "}
                    {answer.question}
                  </h2>

                  {answer.isCorrect ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      ✓ Correct
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      ✗ Incorrect
                    </span>
                  )}

                </div>

                {/* Student Answer */}

                <div className="mt-5 rounded-lg bg-gray-50 p-4">

                  <p className="text-sm font-medium text-gray-500">
                    Student Answer
                  </p>

                  <p className="mt-1 text-gray-900">
                    {answer.selectedChoice
                      ? answer.selectedChoice.text
                      : "No answer"}
                  </p>

                </div>

                {/* Correct Answer */}

                <div className="mt-3 rounded-lg bg-gray-50 p-4">

                  <p className="text-sm font-medium text-gray-500">
                    Correct Answer
                  </p>

                  <p className="mt-1 text-gray-900">
                    {answer.correctChoice
                      ? answer.correctChoice.text
                      : "No correct answer"}
                  </p>

                </div>

              </div>
            )
          )}

        </div>

      </div>
    </main>
  );
}