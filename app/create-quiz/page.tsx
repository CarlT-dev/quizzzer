"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import { StudyMaterialsPicker } from "@/components/StudyMaterialsPicker";
import { ShareSectionSkeleton, CreateQuizSkeleton } from "@/components/ui/SkeletonLoader";

type Question = {
  question: string;
  questionType: "multiple_choice" | "true_false";
  choices: string[];
  correctAnswer: number;
};

type Quiz = {
  title: string;
  questions: Question[];
};

type GenerationMode = "topic" | "file";

export default function CreateShareableQuizPage() {
  const [mode, setMode] = useState<GenerationMode>("topic");
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (!loading) {
      setGenerationStep(0);
      return;
    }

    const step1Timer = setTimeout(() => {
      setGenerationStep(1);
    }, 2000);

    const step2Timer = setTimeout(() => {
      setGenerationStep(2);
    }, 4500);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
    };
  }, [loading]);

  // Refs used to scroll to the generated quiz section and the
  // share-link section once they appear.
  const quizSectionRef = useRef<HTMLDivElement | null>(null);
  const shareSectionRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the generated quiz as soon as it's set.
  useEffect(() => {
    if (quiz) {
      quizSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [quiz]);

  // Scroll to the share link section as soon as it's created.
  useEffect(() => {
    if (shareUrl) {
      shareSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [shareUrl]);

  async function generateQuiz() {
    setError("");
    setQuiz(null);
    setShareUrl("");

    if (
      !Number.isInteger(numberOfQuestions) ||
      numberOfQuestions < 1 ||
      numberOfQuestions > 50
    ) {
      setError("Number of questions must be between 1 and 50.");
      return;
    }

    if (mode === "topic") {
      if (!topic.trim()) {
        setError("Please enter a topic.");
        return;
      }

      setGenerationStep(0);
      setLoading(true);

      try {
        const response = await fetch("/api/ai/generate-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            numberOfQuestions,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to generate quiz.");
          return;
        }

        setQuiz(data.quiz);
      } catch (error) {
        console.error(error);
        setError(
          "Something went wrong while generating the quiz."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    if (files.length === 0) {
      setError("Please add at least one file or photo.");
      return;
    }

    setGenerationStep(0);
    setLoading(true);

    try {
      const formData = new FormData();

      // Options to compress photos and keep payload under Vercel's 4.5 MB limit
      const compressionOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      // Compress photos before appending to FormData
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          try {
            const compressedFile = await imageCompression(
              file,
              compressionOptions
            );
            formData.append("files", compressedFile, compressedFile.name);
          } catch (err) {
            console.warn("Compression failed, using original file:", err);
            formData.append("files", file);
          }
        } else {
          // Keep PDFs, DOCX, etc. as-is
          formData.append("files", file);
        }
      }

      formData.append(
        "numberOfQuestions",
        String(numberOfQuestions)
      );

      const response = await fetch("/api/ai/generate-from-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to generate quiz from materials."
        );
        return;
      }

      setQuiz(data.quiz);
    } catch (error) {
      console.error(error);
      setError(
        "Something went wrong while processing your files or photos."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateQuestion(questionIndex: number, value: string) {
    if (!quiz) return;

    const updatedQuestions = [...quiz.questions];

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      question: value,
    };

    setQuiz({
      ...quiz,
      questions: updatedQuestions,
    });
  }

  function updateChoice(
    questionIndex: number,
    choiceIndex: number,
    value: string
  ) {
    if (!quiz) return;

    const updatedQuestions = [...quiz.questions];
    const updatedChoices = [
      ...updatedQuestions[questionIndex].choices,
    ];

    updatedChoices[choiceIndex] = value;

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      choices: updatedChoices,
    };

    setQuiz({
      ...quiz,
      questions: updatedQuestions,
    });
  }

  function updateCorrectAnswer(
    questionIndex: number,
    choiceIndex: number
  ) {
    if (!quiz) return;

    const updatedQuestions = [...quiz.questions];

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correctAnswer: choiceIndex,
    };

    setQuiz({
      ...quiz,
      questions: updatedQuestions,
    });
  }

  async function saveQuiz() {
    if (!quiz) return;

    setError("");

    if (!quiz.title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    if (quiz.questions.length === 0) {
      setError("The quiz must contain at least one question.");
      return;
    }

    for (const [index, question] of quiz.questions.entries()) {
      if (!question.question.trim()) {
        setError(`Question ${index + 1} is empty.`);
        return;
      }

      if (question.questionType === "multiple_choice") {
        if (question.choices.length !== 4) {
          setError(
            `Question ${index + 1} must have 4 choices.`
          );
          return;
        }
      }

      if (question.questionType === "true_false") {
        if (
          question.choices.length !== 2 ||
          question.choices[0] !== "True" ||
          question.choices[1] !== "False"
        ) {
          setError(
            `Question ${index + 1} has invalid True/False choices.`
          );
          return;
        }
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.choices.length
      ) {
        setError(
          `Question ${index + 1} has an invalid correct answer.`
        );
        return;
      }

      for (const choice of question.choices) {
        if (!choice.trim()) {
          setError(
            `Question ${index + 1} contains an empty choice.`
          );
          return;
        }
      }
    }

    setSaving(true);

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quiz.title,
          questions: quiz.questions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save quiz.");
        return;
      }

      const fullShareUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullShareUrl);
    } catch (error) {
      console.error(error);
      setError("Something went wrong while saving the quiz.");
    } finally {
      setSaving(false);
    }
  }

  async function copyShareLink() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Student link copied!");
    } catch (error) {
      console.error(error);
      alert("Unable to copy the link.");
    }
  }

  if (loading) {
    return <CreateQuizSkeleton currentStep={generationStep} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Home
          </Link>

          <p className="mt-8 text-sm font-medium text-gray-500">
            QUIZZZER · CREATE QUIZ
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Create a Shareable Quiz
          </h1>

          <p className="mt-2 text-gray-600">
            Generate quizzes from a topic, study files, or photos
            taken on your phone.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("topic");
                setError("");
              }}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                mode === "topic"
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="text-lg">✨</div>
              <div className="mt-1 font-semibold">
                Generate from Topic
              </div>
              <div
                className={`mt-1 text-xs ${
                  mode === "topic"
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                Let AI create questions
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("file");
                setError("");
              }}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                mode === "file"
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="text-lg">📷</div>
              <div className="mt-1 font-semibold">
                Generate from Files & Photos
              </div>
              <div
                className={`mt-1 text-xs ${
                  mode === "file" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Upload files or take photos
              </div>
            </button>
          </div>

          {mode === "topic" && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700">
                What should the quiz be about?
              </label>

              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: Philippine Taxation"
                rows={3}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>
          )}

          {mode === "file" && (
            <div className="mt-6">
              <StudyMaterialsPicker
                files={files}
                onError={setError}
                onFilesChange={setFiles}
              />
            </div>
          )}

          <div className="mt-5">
            <label className="text-sm font-medium text-gray-700">
              Number of questions
            </label>

            <input
              type="number"
              min={1}
              max={50}
              value={numberOfQuestions}
              onChange={(e) =>
                setNumberOfQuestions(Number(e.target.value))
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <p className="mt-1 text-xs text-gray-500">
              Choose between 1 and 50 questions.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={generateQuiz}
            disabled={loading || saving}
            className="mt-6 w-full rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating Quiz..." : "✨ Generate Quiz"}
          </button>
        </div>

        {quiz && (
          <div ref={quizSectionRef} className="mt-8 scroll-mt-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                GENERATED QUIZ
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {quiz.title}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {quiz.questions.length} questions
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {quiz.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Question {questionIndex + 1}
                    </h3>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {question.questionType === "true_false"
                        ? "True / False"
                        : "Multiple Choice"}
                    </span>
                  </div>

                  <textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(questionIndex, e.target.value)
                    }
                    rows={3}
                    className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />

                  <div className="mt-5 space-y-3">
                    {question.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          checked={
                            question.correctAnswer === choiceIndex
                          }
                          onChange={() =>
                            updateCorrectAnswer(
                              questionIndex,
                              choiceIndex
                            )
                          }
                          className="h-4 w-4"
                        />

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
                          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                        />
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Select the radio button to change the correct
                    answer.
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={saveQuiz}
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Quiz..."
                : "🚀 Save Quiz & Create Link"}
            </button>
          </div>
        )}

        {saving ? (
          <ShareSectionSkeleton />
        ) : shareUrl ? (
          <div
            ref={shareSectionRef}
            className="mt-6 scroll-mt-6 rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="rounded-xl bg-green-50 p-5">
              <p className="font-semibold text-green-700">
                🎉 Quiz created successfully!
              </p>

              <p className="mt-2 text-sm text-green-700">
                Everyone can now use this link to take the quiz.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={shareUrl}
                  readOnly
                  className="flex-1 rounded-lg border border-green-200 bg-white px-4 py-3 text-sm"
                />

                <button
                  onClick={copyShareLink}
                  className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Copy Link
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Open Quiz
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}