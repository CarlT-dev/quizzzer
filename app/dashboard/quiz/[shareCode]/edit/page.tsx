"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  question_order: number;
  choices: {
    id: string;
    choice_text: string;
    choice_order: number;
    is_correct: boolean;
  }[];
};

type EditQuestion = {
  question: string;
  questionType: "multiple_choice" | "true_false";
  choices: string[];
  correctAnswer: number;
};

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();

  const shareCode = params.shareCode as string;

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<
    EditQuestion[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // Load quiz
  // -----------------------------

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/quizzes/${shareCode}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ||
              "Failed to load quiz."
          );
          return;
        }

        setTitle(data.quiz.title);

        const formattedQuestions: EditQuestion[] =
          data.questions.map(
            (question: Question) => ({
              question:
                question.question_text,

              questionType:
                question.question_type,

              choices:
                question.choices
                  .sort(
                    (a, b) =>
                      a.choice_order -
                      b.choice_order
                  )
                  .map(
                    (choice) =>
                      choice.choice_text
                  ),

              correctAnswer:
                question.choices.findIndex(
                  (choice) =>
                    choice.is_correct
                ),
            })
          );

        setQuestions(
          formattedQuestions
        );
      } catch (error) {
        console.error(error);

        setError(
          "Something went wrong while loading the quiz."
        );
      } finally {
        setLoading(false);
      }
    }

    if (shareCode) {
      loadQuiz();
    }
  }, [shareCode]);

  // -----------------------------
  // Update question
  // -----------------------------

  function updateQuestion(
    questionIndex: number,
    field: keyof EditQuestion,
    value: string
  ) {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          [field]: value,
        };
      })
    );
  }

  // -----------------------------
  // Update choice
  // -----------------------------

  function updateChoice(
    questionIndex: number,
    choiceIndex: number,
    value: string
  ) {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const choices = [
          ...question.choices,
        ];

        choices[choiceIndex] = value;

        return {
          ...question,
          choices,
        };
      })
    );
  }

  // -----------------------------
  // Correct answer
  // -----------------------------

  function setCorrectAnswer(
    questionIndex: number,
    choiceIndex: number
  ) {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              correctAnswer:
                choiceIndex,
            }
          : question
      )
    );
  }

  // -----------------------------
  // Add question
  // -----------------------------

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      {
        question: "",
        questionType:
          "multiple_choice",
        choices: [
          "",
          "",
          "",
          "",
        ],
        correctAnswer: 0,
      },
    ]);
  }

  // -----------------------------
  // Delete question
  // -----------------------------

  function deleteQuestion(
    questionIndex: number
  ) {
    if (questions.length === 1) {
      alert(
        "A quiz must have at least one question."
      );
      return;
    }

    const confirmed = window.confirm(
      "Delete this question?"
    );

    if (!confirmed) {
      return;
    }

    setQuestions((current) =>
      current.filter(
        (_, index) =>
          index !== questionIndex
      )
    );
  }

  // -----------------------------
  // Change question type
  // -----------------------------

  function changeQuestionType(
    questionIndex: number,
    type:
      | "multiple_choice"
      | "true_false"
  ) {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        if (type === "true_false") {
          return {
            ...question,
            questionType: type,
            choices: [
              "True",
              "False",
            ],
            correctAnswer:
              question.correctAnswer >
              1
                ? 0
                : question.correctAnswer,
          };
        }

        return {
          ...question,
          questionType: type,
          choices: [
            "",
            "",
            "",
            "",
          ],
          correctAnswer: 0,
        };
      })
    );
  }

  // -----------------------------
  // Save quiz
  // -----------------------------

  async function saveQuiz() {
    setError("");

    if (!title.trim()) {
      setError(
        "Quiz title is required."
      );
      return;
    }

    if (questions.length === 0) {
      setError(
        "The quiz must have at least one question."
      );
      return;
    }

    for (const question of questions) {
      if (!question.question.trim()) {
        setError(
          "Every question must have text."
        );
        return;
      }

      if (
        question.choices.some(
          (choice) =>
            !choice.trim()
        )
      ) {
        setError(
          "Every choice must have text."
        );
        return;
      }

      if (
        question.correctAnswer <
          0 ||
        question.correctAnswer >=
          question.choices.length
      ) {
        setError(
          "Every question must have a valid correct answer."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/quizzes/${shareCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            questions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to save quiz."
        );
        return;
      }

      alert(
        "Quiz updated successfully!"
      );

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while saving the quiz."
      );
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Loading quiz...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------
  // Page
  // -----------------------------

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            QUIZZZER
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Edit Quiz
          </h1>

          <p className="mt-2 text-gray-500">
            Update your quiz questions and
            answers.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Title */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
            Quiz Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Quiz title"
          />
        </div>

        {/* Questions */}

        <div className="mt-6 space-y-6">

          {questions.map(
            (question, questionIndex) => (

              <div
                key={questionIndex}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                {/* Question header */}

                <div className="flex items-center justify-between">

                  <h2 className="text-lg font-semibold text-gray-900">
                    Question{" "}
                    {questionIndex + 1}
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      deleteQuestion(
                        questionIndex
                      )
                    }
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>

                </div>

                {/* Question text */}

                <textarea
                  value={
                    question.question
                  }
                  onChange={(event) =>
                    updateQuestion(
                      questionIndex,
                      "question",
                      event.target.value
                    )
                  }
                  className="mt-4 min-h-24 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  placeholder="Enter your question..."
                />

                {/* Question type */}

                <div className="mt-4">

                  <label className="block text-sm font-medium text-gray-700">
                    Question Type
                  </label>

                  <select
                    value={
                      question.questionType
                    }
                    onChange={(event) =>
                      changeQuestionType(
                        questionIndex,
                        event.target
                          .value as
                          | "multiple_choice"
                          | "true_false"
                      )
                    }
                    className="mt-2 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="multiple_choice">
                      Multiple Choice
                    </option>

                    <option value="true_false">
                      True / False
                    </option>
                  </select>

                </div>

                {/* Choices */}

                <div className="mt-5">

                  <p className="text-sm font-medium text-gray-700">
                    Choices
                  </p>

                  <div className="mt-3 space-y-3">

                    {question.choices.map(
                      (
                        choice,
                        choiceIndex
                      ) => (

                        <div
                          key={choiceIndex}
                          className="flex items-center gap-3"
                        >

                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={
                              question.correctAnswer ===
                              choiceIndex
                            }
                            onChange={() =>
                              setCorrectAnswer(
                                questionIndex,
                                choiceIndex
                              )
                            }
                          />

                          <input
                            type="text"
                            value={choice}
                            disabled={
                              question.questionType ===
                              "true_false"
                            }
                            onChange={(
                              event
                            ) =>
                              updateChoice(
                                questionIndex,
                                choiceIndex,
                                event.target
                                  .value
                              )
                            }
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black disabled:bg-gray-100"
                            placeholder={`Choice ${
                              choiceIndex + 1
                            }`}
                          />

                        </div>

                      )
                    )}

                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Select the radio button beside
                    the correct answer.
                  </p>

                </div>

              </div>
            )
          )}

        </div>

        {/* Add question */}

        <button
          type="button"
          onClick={addQuestion}
          className="mt-6 w-full rounded-xl border border-dashed border-gray-400 bg-white px-5 py-4 font-medium text-gray-700 hover:bg-gray-50"
        >
          + Add Question
        </button>

        {/* Actions */}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={saveQuiz}
            className="rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>
    </main>
  );
}