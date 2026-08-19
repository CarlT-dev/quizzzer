"use client";

import { useEffect, useRef, useState } from "react";

type MockExamQuestion = {
  question: string;
  questionType: "multiple_choice" | "true_false";
  choices: string[];
  correctAnswer: number;
};

export type MockExam = {
  title: string;
  questions: MockExamQuestion[];
};

type Props = {
  quiz: MockExam;
  onExit: () => void;
};

export default function MockExamClient({ quiz, onExit }: Props) {
  const [started, setStarted] = useState(false);

  // questionIndex -> selected choice index
  const [answers, setAnswers] = useState<Record<number, number>>(
    {}
  );

  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");

  const [activeQuestion, setActiveQuestion] = useState(0);

  const questionRefs = useRef<Array<HTMLDivElement | null>>([]);

  // --------------------------------
  // Track active question
  // --------------------------------

  useEffect(() => {
    if (!started || submitted) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(
          (entry) => entry.isIntersecting
        );

        if (visibleEntries.length === 0) {
          return;
        }

        const mostVisible = visibleEntries.reduce(
          (previous, current) =>
            current.intersectionRatio >
            previous.intersectionRatio
              ? current
              : previous
        );

        const index = questionRefs.current.findIndex(
          (element) => element === mostVisible.target
        );

        if (index !== -1) {
          setActiveQuestion(index);
        }
      },
      {
        threshold: [0.25, 0.5, 0.75],
        rootMargin: "-10% 0px -50% 0px",
      }
    );

    questionRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [started, submitted, quiz.questions.length]);

  // --------------------------------
  // Select answer
  // --------------------------------

  function selectAnswer(
    questionIndex: number,
    choiceIndex: number
  ) {
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: choiceIndex,
    }));

    setError("");
  }

  // --------------------------------
  // Check unanswered questions
  // --------------------------------

  function getUnansweredQuestions() {
    return quiz.questions
      .map((_, index) => index)
      .filter((index) => answers[index] === undefined);
  }

  // --------------------------------
  // Scroll to question
  // --------------------------------

  function scrollToQuestion(questionIndex: number) {
    const element = questionRefs.current[questionIndex];

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setActiveQuestion(questionIndex);
  }

  // --------------------------------
  // Submit quiz (graded locally, nothing is saved)
  // --------------------------------

  function submitQuiz() {
    setSubmitAttempted(true);

    const unanswered = getUnansweredQuestions();

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions before submitting. ${unanswered.length} ${
          unanswered.length === 1
            ? "question is"
            : "questions are"
        } unanswered.`
      );

      scrollToQuestion(unanswered[0]);
      return;
    }

    setError("");
    setSubmitted(true);
  }

  const score = quiz.questions.reduce((total, question, index) => {
    return answers[index] === question.correctAnswer
      ? total + 1
      : total;
  }, 0);

  const total = quiz.questions.length;

  // --------------------------------
  // Result screen
  // --------------------------------

  if (submitted) {
    const percentage =
      total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">
              Mock Exam Completed
            </h1>

            <p className="mt-3 text-gray-600">Nice work!</p>

            <div className="mt-8">
              <p className="text-sm text-gray-500">Your Score</p>

              <p className="mt-2 text-5xl font-bold text-gray-900">
                {score} / {total}
              </p>

              <p className="mt-2 text-lg text-gray-600">
                {percentage}%
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {quiz.questions.map((question, index) => {
              const selected = answers[index];
              const isCorrect = selected === question.correctAnswer;

              return (
                <div
                  key={index}
                  className={`rounded-xl bg-white p-5 shadow-sm ring-1 ${
                    isCorrect
                      ? "ring-green-200"
                      : "ring-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium text-gray-900">
                      {index + 1}. {question.question}
                    </p>

                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isCorrect
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    {question.choices.map((choice, choiceIndex) => {
                      const isSelected = selected === choiceIndex;
                      const isAnswer =
                        choiceIndex === question.correctAnswer;

                      return (
                        <p
                          key={choiceIndex}
                          className={`rounded-lg px-3 py-2 ${
                            isAnswer
                              ? "bg-green-50 text-green-700"
                              : isSelected
                                ? "bg-red-50 text-red-700"
                                : "text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + choiceIndex)}.{" "}
                          {choice}
                          {isAnswer ? "  ✓" : ""}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onExit}
            className="mt-8 w-full rounded-xl bg-black px-6 py-3.5 font-medium text-white transition hover:bg-gray-800"
          >
            Generate Another Mock Exam
          </button>
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
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            {quiz.title}
          </h1>

          <p className="mt-2 text-gray-500">
            {quiz.questions.length} questions
          </p>

          <p className="mt-4 text-sm text-gray-500">
            This mock exam is just for you. Your answers and
            score are not saved anywhere.
          </p>

          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-6 w-full rounded-xl bg-black px-6 py-3.5 font-medium text-white transition hover:bg-gray-800"
          >
            Start Mock Exam
          </button>

          <button
            type="button"
            onClick={onExit}
            className="mt-3 w-full rounded-xl border border-gray-200 px-6 py-3.5 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Back
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {quiz.title}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {quiz.questions.length} questions
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {quiz.questions.map((question, questionIndex) => {
            const unanswered = answers[questionIndex] === undefined;
            const showRed = submitAttempted && unanswered;
            const isActive = activeQuestion === questionIndex;

            return (
              <div
                key={questionIndex}
                ref={(element) => {
                  questionRefs.current[questionIndex] = element;
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
                    {questionIndex + 1}. {question.question}
                  </h2>

                  {showRed && (
                    <span className="shrink-0 text-xs font-medium text-red-500">
                      Unanswered
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  {question.choices.map((choice, choiceIndex) => (
                    <label
                      key={choiceIndex}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-gray-900 transition ${
                        answers[questionIndex] === choiceIndex
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={
                          answers[questionIndex] === choiceIndex
                        }
                        onChange={() =>
                          selectAnswer(questionIndex, choiceIndex)
                        }
                        className="h-4 w-4"
                      />

                      <span className="text-gray-900">
                        {String.fromCharCode(65 + choiceIndex)}.{" "}
                        {choice}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submitQuiz}
          className="mt-6 w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          Submit Mock Exam
        </button>
      </div>

      <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 md:block">
        <div className="flex flex-col items-center gap-2 rounded-full bg-white px-2 py-3 shadow-md">
          {quiz.questions.map((_, questionIndex) => {
            const unanswered = answers[questionIndex] === undefined;
            const showRed = submitAttempted && unanswered;
            const isActive = activeQuestion === questionIndex;

            return (
              <button
                key={questionIndex}
                type="button"
                onClick={() => scrollToQuestion(questionIndex)}
                aria-label={`Go to question ${questionIndex + 1}`}
                title={`Question ${questionIndex + 1}`}
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
          })}
        </div>
      </div>
    </main>
  );
}
