"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Quiz = {
  id: string;
  title: string;
  share_code: string;
  created_at: string;
};

export default function DashboardPage() {
  const [quizzes, setQuizzes] =
    useState<Quiz[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/quizzes",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to load quizzes."
        );
        return;
      }

      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while loading quizzes."
      );
    } finally {
      setLoading(false);
    }
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
              My Quizzes
            </h1>

            <p className="mt-2 text-gray-600">
              Create, manage, and share your quizzes.
            </p>
          </div>

          <Link
            href="/create-quiz"
            className="rounded-xl bg-black px-5 py-3 text-center font-medium text-white transition hover:bg-gray-800"
          >
            + Create Quiz
          </Link>

        </div>

        {/* Loading */}

        {loading && (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Loading quizzes...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="mt-10 rounded-xl bg-red-50 p-5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          quizzes.length === 0 && (
            <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">

              <div className="text-5xl">
                📝
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                No quizzes yet
              </h2>

              <p className="mt-2 text-gray-500">
                Create your first quiz using AI
                or build one manually.
              </p>

              <Link
                href="/ai-test"
                className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
              >
                Create Your First Quiz
              </Link>

            </div>
          )}

        {/* Quiz List */}

        {!loading &&
          !error &&
          quizzes.length > 0 && (
            <div className="mt-8 space-y-4">

              {quizzes.map((quiz) => (

                <div
                  key={quiz.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    {/* Quiz information */}

                    <div>

                      <h2 className="text-xl font-semibold text-gray-900">
                        {quiz.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Created{" "}
                        {new Date(
                          quiz.created_at
                        ).toLocaleDateString()}
                      </p>

                      <div className="mt-3 inline-flex rounded-lg bg-gray-100 px-3 py-1">
                        <span className="text-xs font-medium text-gray-600">
                          Code:{" "}
                          {quiz.share_code}
                        </span>
                      </div>

                    </div>

                    {/* Actions */}

                    <div className="flex flex-wrap gap-2">

                    {/* Open Student Quiz */}
                    <Link
                      href={`/quiz/${quiz.share_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Open
                    </Link>

                    {/* Edit  */}
                    <Link
                      href={`/dashboard/quiz/${quiz.share_code}/edit`}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </Link>

                    {/* View Results */}
                    <Link
                      href={`/dashboard/quiz/${quiz.share_code}/results`}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Results
                    </Link>

                    {/* Share */}
                    <button
                        onClick={async () => {
                        const url =
                            `${window.location.origin}/quiz/${quiz.share_code}`;

                        await navigator.clipboard.writeText(url);

                        alert("Student link copied!");
                        }}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Share
                    </button>
                    
                    {/* Delete */}
                    <button
                      onClick={async () => {
                        const confirmed = window.confirm(
                          `Are you sure you want to delete "${quiz.title}"?\n\nThis will permanently delete the quiz and its student results.`
                        );

                        if (!confirmed) {
                          return;
                        }

                        try {
                          const response = await fetch(
                            `/api/quizzes/${quiz.share_code}`,
                            {
                              method: "DELETE",
                            }
                          );

                          const result = await response.json();

                          if (!response.ok) {
                            alert(
                              result.error ||
                                "Failed to delete quiz."
                            );
                            return;
                          }

                          setQuizzes((currentQuizzes) =>
                            currentQuizzes.filter(
                              (item) => item.id !== quiz.id
                            )
                          );

                          alert("Quiz deleted successfully.");

                        } catch (error) {
                          console.error(error);

                          alert(
                            "Something went wrong while deleting the quiz."
                          );
                        }
                      }}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

      </div>

    </main>
  );
}