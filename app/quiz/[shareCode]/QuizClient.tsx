"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Choice = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  question: string;
  choices: Choice[];
};

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  shareCode: string;
};

type Props = {
  quiz: Quiz;
  questions: Question[];
};

export default function QuizClient({
  quiz,
  questions,
}: Props) {
  const [studentName, setStudentName] =
    useState("");

  const [started, setStarted] =
    useState(false);

  const [answers, setAnswers] = useState<
    Record<string, string>
  >({});

  const [submitted, setSubmitted] =
    useState(false);

  const [score, setScore] =
    useState<number | null>(null);

  const [total, setTotal] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // Track the question currently visible
  const [activeQuestion, setActiveQuestion] =
    useState(0);

  // Whether submit has been attempted
  const [submitAttempted, setSubmitAttempted] =
    useState(false);

  // Store references to each question
  const questionRefs = useRef<
    Array<HTMLDivElement | null>
  >([]);

  // --------------------------------
  // Track active question
  // --------------------------------

  useEffect(() => {
    if (!started || submitted) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visibleEntries =
            entries.filter(
              (entry) => entry.isIntersecting
            );

          if (visibleEntries.length === 0) {
            return;
          }

          const mostVisible =
            visibleEntries.reduce(
              (previous, current) =>
                current.intersectionRatio >
                previous.intersectionRatio
                  ? current
                  : previous
            );

          const index =
            questionRefs.current.findIndex(
              (element) =>
                element === mostVisible.target
            );

          if (index !== -1) {
            setActiveQuestion(index);
          }
        },
        {
          threshold: [
            0.25,
            0.5,
            0.75,
          ],
          rootMargin:
            "-10% 0px -50% 0px",
        }
      );

    questionRefs.current.forEach(
      (element) => {
        if (element) {
          observer.observe(element);
        }
      }
    );

    return () => {
      observer.disconnect();
    };
  }, [started, submitted, questions.length]);

  // --------------------------------
  // Start quiz
  // --------------------------------

  function startQuiz() {
    if (!studentName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setError("");
    setStarted(true);
  }

  // --------------------------------
  // Select answer
  // --------------------------------

  function selectAnswer(
    questionId: string,
    choiceId: string
  ) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: choiceId,
    }));

    setError("");
  }

  // --------------------------------
  // Check unanswered questions
  // --------------------------------

  function getUnansweredQuestions() {
    return questions
      .map((question, index) => ({
        question,
        index,
      }))
      .filter(
        ({ question }) =>
          !answers[question.id]
      );
  }

  // --------------------------------
  // Scroll to question
  // --------------------------------

  function scrollToQuestion(
    questionIndex: number
  ) {
    const element =
      questionRefs.current[
        questionIndex
      ];

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setActiveQuestion(
      questionIndex
    );
  }

  // --------------------------------
  // Submit quiz
  // --------------------------------

  async function submitQuiz() {
    if (loading) {
      return;
    }

    setSubmitAttempted(true);

    const unanswered =
      getUnansweredQuestions();

    // Prevent submission if questions
    // are unanswered
    if (unanswered.length > 0) {
      setError(
        `Please answer all questions before submitting. ${unanswered.length} ${
          unanswered.length === 1
            ? "question is"
            : "questions are"
        } unanswered.`
      );

      // Automatically go to the
      // first unanswered question
      scrollToQuestion(
        unanswered[0].index
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/quizzes/${quiz.shareCode}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            studentName,
            answers,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to submit quiz."
        );
        return;
      }

      setScore(data.score);
      setTotal(data.total);
      setSubmitted(true);
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while submitting."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------
  // Result screen
  // --------------------------------

  if (submitted) {
    const percentage =
      total && total > 0
        ? Math.round(
            ((score ?? 0) / total) *
              100
          )
        : 0;

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">

          <h1 className="text-3xl font-bold text-gray-900">
            Quiz Completed
          </h1>

          <p className="mt-3 text-gray-600">
            Great job, {studentName}!
          </p>

          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Your Score
            </p>

            <p className="mt-2 text-5xl font-bold text-gray-900">
              {score} / {total}
            </p>

            <p className="mt-2 text-lg text-gray-600">
              {percentage}%
            </p>
          </div>

        </div>
      </main>
    );
  }

  // --------------------------------
  // Start screen
  // --------------------------------

  if (!started) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm">

          <h1 className="text-3xl font-bold text-gray-900">
            {quiz.title}
          </h1>

          {quiz.description && (
            <p className="mt-2 text-gray-600">
              {quiz.description}
            </p>
          )}

          <p className="mt-2 text-gray-500">
            {questions.length} questions
          </p>

          <div className="mt-8">

            <label className="text-sm font-medium text-gray-700">
              Your Name
            </label>

            <input
              type="text"
              value={studentName}
              onChange={(event) =>
                setStudentName(
                  event.target.value
                )
              }
              placeholder="Enter your name"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            onClick={startQuiz}
            className="mt-6 w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            Start Quiz
          </button>

        </div>

      </main>
    );
  }

  // --------------------------------
  // Quiz screen
  // --------------------------------

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-3xl">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {quiz.title}
          </h1>

          <p className="mt-2 text-gray-600">
            Student: {studentName}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {questions.length} questions
          </p>
        </div>

        {/* Questions */}

        <div className="mt-8 space-y-6">

          {questions.map(
            (
              question,
              questionIndex
            ) => {
              const unanswered =
                !answers[question.id];

              const showRed =
                submitAttempted &&
                unanswered;

              const isActive =
                activeQuestion ===
                questionIndex;

              return (
                <div
                  key={question.id}
                  ref={(element) => {
                    questionRefs.current[
                      questionIndex
                    ] = element;
                  }}
                  className={`rounded-xl bg-white p-6 shadow-sm transition-all ${
                    showRed
                      ? "border-2 border-red-400"
                      : isActive
                      ? "border-2 border-gray-900"
                      : "border-2 border-transparent"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <h2 className="text-lg font-semibold text-gray-900">
                      {questionIndex +
                        1}
                      .{" "}
                      {question.question}
                    </h2>

                    {showRed && (
                      <span className="shrink-0 text-xs font-medium text-red-500">
                        Unanswered
                      </span>
                    )}

                  </div>

                  <div className="mt-5 space-y-3">

                    {question.choices.map(
                      (
                        choice,
                        choiceIndex
                      ) => (
                        <label
                          key={choice.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                            answers[
                              question.id
                            ] ===
                            choice.id
                              ? "border-black bg-gray-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >

                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={
                              answers[
                                question.id
                              ] ===
                              choice.id
                            }
                            onChange={() =>
                              selectAnswer(
                                question.id,
                                choice.id
                              )
                            }
                            className="h-4 w-4"
                          />

                          <span>
                            {String.fromCharCode(
                              65 +
                                choiceIndex
                            )}
                            .{" "}
                            {choice.text}
                          </span>

                        </label>
                      )
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* Error */}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}

        <button
          onClick={submitQuiz}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Submitting..."
            : "Submit Quiz"}
        </button>

      </div>

      {/* -------------------------------- */}
      {/* Vertical Question Navigator */}
      {/* -------------------------------- */}

      <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 md:block">

        <div className="flex flex-col items-center gap-2 rounded-full bg-white px-2 py-3 shadow-md">

          {questions.map(
            (
              question,
              questionIndex
            ) => {
              const unanswered =
                !answers[question.id];

              const showRed =
                submitAttempted &&
                unanswered;

              const isActive =
                activeQuestion ===
                questionIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() =>
                    scrollToQuestion(
                      questionIndex
                    )
                  }
                  aria-label={`Go to question ${
                    questionIndex + 1
                  }`}
                  title={`Question ${
                    questionIndex + 1
                  }`}
                  className={`transition-all duration-200 ${
                    showRed
                      ? "h-5 w-2 rounded-full bg-red-500"
                      : isActive
                      ? "h-8 w-2 rounded-full bg-black"
                      : unanswered
                      ? "h-5 w-2 rounded-full bg-gray-300"
                      : "h-5 w-2 rounded-full bg-gray-700"
                  }`}
                />
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}