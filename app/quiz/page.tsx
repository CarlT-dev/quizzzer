"use client";

import { useState } from "react";

type Question = {
  question: string;
  choices: string[];
  correctAnswer: number;
};

const quizTitle = "Taxation Fundamentals";

const questions: Question[] = [
  {
    question: "What is taxation?",
    choices: [
      "A compulsory contribution imposed by the government",
      "A voluntary donation",
      "A private investment",
      "A bank loan",
    ],
    correctAnswer: 0,
  },
  {
    question: "Which institution generally imposes taxes?",
    choices: [
      "The government",
      "A private company",
      "A school",
      "A bank",
    ],
    correctAnswer: 0,
  },
  {
    question: "Which of the following is commonly considered a tax?",
    choices: [
      "Income tax",
      "Personal loan",
      "Bank deposit",
      "Insurance claim",
    ],
    correctAnswer: 0,
  },
];

export default function QuizPage() {
  const [studentName, setStudentName] = useState("");
  const [started, setStarted] = useState(false);

  const [answers, setAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );

  const [submitted, setSubmitted] = useState(false);

  const [score, setScore] = useState(0);

  function startQuiz() {
    if (!studentName.trim()) {
      alert("Please enter your name.");
      return;
    }

    setStarted(true);
  }

  function selectAnswer(
    questionIndex: number,
    choiceIndex: number
  ) {
    const updatedAnswers = [...answers];

    updatedAnswers[questionIndex] = choiceIndex;

    setAnswers(updatedAnswers);
  }

  function submitQuiz() {
    let totalScore = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        totalScore++;
      }
    });

    setScore(totalScore);
    setSubmitted(true);
  }

  // Result screen
  if (submitted) {
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
              {score} / {questions.length}
            </p>

            <p className="mt-2 text-lg text-gray-600">
              {Math.round(
                (score / questions.length) * 100
              )}
              %
            </p>
          </div>

        </div>

      </main>
    );
  }

  // Start screen
  if (!started) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm">

          <h1 className="text-3xl font-bold text-gray-900">
            {quizTitle}
          </h1>

          <p className="mt-2 text-gray-600">
            Answer all questions carefully.
          </p>

          <div className="mt-8">

            <label className="text-sm font-medium text-gray-700">
              Your Name
            </label>

            <input
              type="text"
              value={studentName}
              onChange={(e) =>
                setStudentName(e.target.value)
              }
              placeholder="Enter your name"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

          </div>

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

  // Quiz screen
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-3xl">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {quizTitle}
          </h1>

          <p className="mt-2 text-gray-600">
            Student: {studentName}
          </p>
        </div>

        <div className="mt-8 space-y-6">

          {questions.map((question, questionIndex) => (

            <div
              key={questionIndex}
              className="rounded-xl bg-white p-6 shadow-sm"
            >

              <h2 className="text-lg font-semibold text-gray-900">
                {questionIndex + 1}.{" "}
                {question.question}
              </h2>

              <div className="mt-5 space-y-3">

                {question.choices.map(
                  (choice, choiceIndex) => (

                    <label
                      key={choiceIndex}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                    >

                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={
                          answers[questionIndex] ===
                          choiceIndex
                        }
                        onChange={() =>
                          selectAnswer(
                            questionIndex,
                            choiceIndex
                          )
                        }
                        className="h-4 w-4"
                      />

                      <span>
                        {choice}
                      </span>

                    </label>

                  )
                )}

              </div>

            </div>

          ))}

        </div>

        <button
          onClick={submitQuiz}
          className="mt-6 w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          Submit Quiz
        </button>

      </div>

    </main>
  );
}