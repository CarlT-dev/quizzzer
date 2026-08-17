"use client";

import { useState } from "react";
import Link from "next/link";

type Question = {
  question: string;
  questionType: "multiple_choice" | "true_false";
  choices: string[];
  correctAnswer: number;
};

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");

  const [questions, setQuestions] = useState<Question[]>([
    {
    question: "",
    questionType: "multiple_choice",
    choices: ["", "", "", ""],
    correctAnswer: 0,
  }
  ]);

  function updateQuestion(
    questionIndex: number,
    value: string
  ) {
    const updatedQuestions = [...questions];

    updatedQuestions[questionIndex].question = value;

    setQuestions(updatedQuestions);
  }

  function updateQuestionType(
    questionIndex: number,
    type: "multiple_choice" | "true_false"
  ) {
    const updatedQuestions = [...questions];

    if (type === "true_false") {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        questionType: type,
        choices: ["True", "False"],
        correctAnswer: 0,
      };
    } else {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        questionType: type,
        choices: ["", "", "", ""],
        correctAnswer: 0,
      };
    }

    setQuestions(updatedQuestions);
  }

  function updateChoice(
    questionIndex: number,
    choiceIndex: number,
    value: string
  ) {
    const updatedQuestions = [...questions];

    updatedQuestions[questionIndex].choices[choiceIndex] =
      value;

    setQuestions(updatedQuestions);
  }

  function updateCorrectAnswer(
    questionIndex: number,
    choiceIndex: number
  ) {
    const updatedQuestions = [...questions];

    updatedQuestions[questionIndex].correctAnswer =
      choiceIndex;

    setQuestions(updatedQuestions);
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        question: "",
        questionType: "multiple_choice",
        choices: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  }

  function deleteQuestion(questionIndex: number) {
    if (questions.length === 1) {
      return;
    }

    const updatedQuestions = questions.filter(
      (_, index) => index !== questionIndex
    );

    setQuestions(updatedQuestions);
  }

  async function saveQuiz() {
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          questions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to save quiz.");
        return;
      }

      console.log(`Student link:\n${window.location.origin}${data.shareUrl}`);

      alert(
        `Quiz created!\n\nStudent link:\n${window.location.origin}${data.shareUrl}`
      );

      console.log("Quiz created:", data);
    } catch (error) {
      console.error(error);

      alert("Something went wrong while saving the quiz.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Home
          </Link>

          <p className="mt-8 text-sm font-medium text-gray-500">
            QUIZZZER · WRITE QUIZ
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Write Your Own Quiz
          </h1>

          <p className="mt-2 text-gray-600">
            Build your quiz by adding questions and choices.
          </p>
        </div>

        {/* Quiz Title */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <label className="text-sm font-medium text-gray-700">
            Quiz Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Taxation Fundamentals"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

        </div>

        {/* Questions */}
        <div className="mt-6 space-y-6">

          {questions.map((question, questionIndex) => (

            <div
              key={questionIndex}
              className="rounded-xl bg-white p-6 shadow-sm"
            >

              {/* Question Header */}
              <div className="flex items-center justify-between">

                <h2 className="text-lg font-semibold">
                  Question {questionIndex + 1}
                </h2>

                {questions.length > 1 && (
                  <button
                    onClick={() =>
                      deleteQuestion(questionIndex)
                    }
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}

              </div>

              {/* Question Type */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Question Type
                </label>

                <select
                  value={question.questionType}
                  onChange={(e) =>
                    updateQuestionType(
                      questionIndex,
                      e.target.value as
                        | "multiple_choice"
                        | "true_false"
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="multiple_choice">
                    Multiple Choice
                  </option>

                  <option value="true_false">
                    True / False
                  </option>
                </select>
              </div>

              {/* Question Input */}
              <textarea
                value={question.question}
                onChange={(e) =>
                  updateQuestion(
                    questionIndex,
                    e.target.value
                  )
                }
                placeholder="Enter your question..."
                rows={3}
                className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

              {/* Choices */}
              <div className="mt-6">

                <p className="text-sm font-medium text-gray-700">
                  {question.questionType === "true_false"
                    ? "Answer"
                    : "Choices"}
                </p>

                <div className="mt-3 space-y-3">

                  {question.choices.map(
                    (choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className="flex items-center gap-3"
                      >

                        {/* Correct Answer */}
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          checked={
                            question.correctAnswer ===
                            choiceIndex
                          }
                          onChange={() =>
                            updateCorrectAnswer(
                              questionIndex,
                              choiceIndex
                            )
                          }
                          className="h-4 w-4"
                        />

                        {question.questionType ===
                        "true_false" ? (
                          <span className="font-medium text-gray-700">
                            {choice}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={choice}
                            onChange={(e) =>
                              updateChoice(
                                questionIndex,
                                choiceIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Choice ${String.fromCharCode(
                              65 + choiceIndex
                            )}`}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                          />
                        )}

                      </div>
                    )
                  )}

                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Select the radio button beside the correct answer.
                </p>

              </div>

            </div>

          ))}

        </div>

        {/* Add Question */}
        <button
          onClick={addQuestion}
          className="mt-6 w-full rounded-lg border border-dashed border-gray-400 bg-white px-6 py-4 font-medium text-gray-700 transition hover:bg-gray-100"
        >
          + Add Question
        </button>

        {/* Save Quiz */}
        <button
          onClick={saveQuiz}
          className="mt-4 w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          Save Quiz
        </button>

      </div>
    </main>
  );
}