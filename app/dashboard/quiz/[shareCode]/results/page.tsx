"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Submission = {
  id: string;
  student_name: string;
  score: number;
  total: number;
};

type ResultsData = {
  quiz: {
    id: string;
    title: string;
    share_code: string;
  };

  statistics: {
    submissionCount: number;
    averageScore: number;
    highestScore: number;
    totalPoints: number;
    averagePercentage: number;
  };

  submissions: Submission[];
};

type Props = {
  params: Promise<{
    shareCode: string;
  }>;
};

export default function ResultsPage({
  params,
}: Props) {
  const [shareCode, setShareCode] =
    useState("");

  const [data, setData] =
    useState<ResultsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const resolvedParams =
          await params;

        setShareCode(
          resolvedParams.shareCode
        );

        const response = await fetch(
          `/api/quizzes/${resolvedParams.shareCode}/results`
        );

        const result =
          await response.json();

        if (!response.ok) {
          setError(
            result.error ||
              "Failed to load results."
          );
          return;
        }

        setData(result);
      } catch (error) {
        console.error(error);

        setError(
          "Something went wrong while loading results."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Loading results...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-gray-500">
              QUIZZZER
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {data.quiz.title}
            </h1>

            <p className="mt-2 text-gray-500">
              Quiz Results
            </p>

            <div className="mt-3 inline-flex rounded-lg bg-gray-100 px-3 py-1">
              <span className="text-xs font-medium text-gray-600">
                Code: {data.quiz.share_code}
              </span>
            </div>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back to Dashboard
          </a>

        </div>

        {/* Statistics */}

        <div className="mt-8 grid gap-4 sm:grid-cols-4">

          {/* Submissions */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Submissions
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.statistics.submissionCount}
            </p>
          </div>

          {/* Average */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Average Score
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.statistics.averagePercentage}%
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Average student score
            </p>
          </div>

          {/* Highest */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Highest Score
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.statistics.highestScore} /{" "}
              {data.statistics.totalPoints}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Highest score achieved
            </p>
          </div>

          {/* Percentage */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Average Percentage
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.statistics.averagePercentage}%
            </p>
          </div>

        </div>

        {/* Results */}

        <div className="mt-8 rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Student Results
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Students who have submitted this quiz.
            </p>
          </div>

          {data.submissions.length === 0 ? (

            <div className="p-10 text-center">

              <div className="text-4xl">
                📊
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No submissions yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Student results will appear here
                after someone completes the quiz.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full table-fixed">

                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                    <th className="w-[40%] px-6 py-4 font-medium">
                      Student
                    </th>

                    <th className="w-[20%] px-6 py-4 font-medium">
                      Score
                    </th>

                    <th className="w-[20%] px-6 py-4 font-medium">
                      Percentage
                    </th>

                    <th className="w-[20%] px-6 py-4 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {data.submissions.map(
                    (submission) => {

                      const percentage =
                        submission.total > 0
                          ? Math.round(
                              (submission.score /
                                submission.total) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={submission.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            {submission.student_name}
                          </td>

                          <td className="px-6 py-4 text-gray-700">
                            {submission.score} /{" "}
                            {submission.total}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                              {percentage}%
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/quiz/${shareCode}/results/${submission.id}`}
                              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                              View Result
                            </Link>
                          </td>
                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </main>
  );
}