"use client";

import { useState } from "react";
import Link from "next/link";
import { StudyMaterialsPicker } from "@/components/StudyMaterialsPicker";

const difficulties = ["Easy", "Medium", "Hard"];

const questionTypes = [
  {
    value: "multiple_choice",
    label: "Multiple Choice",
  },
  {
    value: "true_false",
    label: "True / False",
  },
];

type GenerationMode = "topic" | "file" | "topic_file";

type GeneratedQuestion = {
  question: string;
  questionType: "multiple_choice" | "true_false";
  choices: string[];
  correctAnswer: number;
};

type GeneratedQuiz = {
  title: string;
  questions: GeneratedQuestion[];
};

export default function PracticePage() {
  const [mode, setMode] = useState<GenerationMode>("topic");
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] =
    useState<string[]>(["Medium"]);
  const [selectedQuestionTypes, setSelectedQuestionTypes] =
    useState<string[]>(["multiple_choice"]);
  const [questionCount, setQuestionCount] = useState("10");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedQuiz, setGeneratedQuiz] =
    useState<GeneratedQuiz | null>(null);

  function toggleDifficulty(difficulty: string) {
    setSelectedDifficulties((current) =>
      current.includes(difficulty)
        ? current.filter((item) => item !== difficulty)
        : [...current, difficulty]
    );
  }

  function toggleQuestionType(type: string) {
    setSelectedQuestionTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    );
  }

  const hasTopic = topic.trim().length > 0;
  const hasFiles = files.length > 0;

  const hasValidSource =
    mode === "topic"
      ? hasTopic
      : mode === "file"
        ? hasFiles
        : hasTopic && hasFiles;

  const canGenerate =
    hasValidSource &&
    selectedDifficulties.length > 0 &&
    selectedQuestionTypes.length > 0 &&
    !generating;

  async function generateMockExam() {
    setError("");

    if (selectedDifficulties.length === 0) {
      setError("Please select at least one difficulty level.");
      return;
    }

    if (selectedQuestionTypes.length === 0) {
      setError("Please select at least one question type.");
      return;
    }

    if (mode === "topic" && !hasTopic) {
      setError("Please enter a topic.");
      return;
    }

    if (mode === "file" && !hasFiles) {
      setError("Please add at least one file or photo.");
      return;
    }

    if (mode === "topic_file" && (!hasTopic || !hasFiles)) {
      setError(
        "Please enter a topic and add at least one file or photo."
      );
      return;
    }

    try {
      setGenerating(true);
      setGeneratedQuiz(null);

      let response: Response;

      if (mode === "topic") {
        response = await fetch("/api/ai/generate-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            numberOfQuestions: Number(questionCount),
            difficulties: selectedDifficulties,
            questionTypes: selectedQuestionTypes,
          }),
        });
      } else {
        const formData = new FormData();

        files.forEach((file) => {
          formData.append("files", file);
        });

        if (hasTopic) {
          formData.append("topic", topic);
        }

        formData.append(
          "numberOfQuestions",
          String(Number(questionCount))
        );
        formData.append(
          "difficulties",
          JSON.stringify(selectedDifficulties)
        );
        formData.append(
          "questionTypes",
          JSON.stringify(selectedQuestionTypes)
        );

        response = await fetch("/api/ai/generate-from-file", {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate mock exam.");
        return;
      }

      if (!data.quiz) {
        setError("AI did not return a valid quiz.");
        return;
      }

      setGeneratedQuiz(data.quiz);
    } catch (error) {
      console.error("Generate mock exam error:", error);
      setError(
        "Something went wrong while generating the mock exam."
      );
    } finally {
      setGenerating(false);
    }
  }

  const photoCount = files.filter((file) =>
    file.type.startsWith("image/")
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Home
          </Link>

          <p className="mt-8 text-sm font-semibold tracking-widest text-gray-500">
            QUIZZZER · PRACTICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            What do you want to practice?
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Give AI a topic, your study files, photos of your
            notes, or a mix. Your mock exam will be generated
            from your selections.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
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
                  mode === "file"
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                Upload files or take photos
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("topic_file");
                setError("");
              }}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                mode === "topic_file"
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="text-lg">🧠</div>
              <div className="mt-1 font-semibold">
                Topic + Materials
              </div>
              <div
                className={`mt-1 text-xs ${
                  mode === "topic_file"
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                Combine both sources
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
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />

              <p className="mt-1 text-xs text-gray-500">
                You can type a topic, paste notes, or describe
                what you want to study.
              </p>
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

          {mode === "topic_file" && (
            <div className="mt-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  What should the quiz focus on?
                </label>

                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Example: Focus on income tax, deductions, and tax exemptions."
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
              </div>

              <StudyMaterialsPicker
                files={files}
                onError={setError}
                onFilesChange={setFiles}
              />
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Difficulty
            </label>

            <p className="mt-1 text-xs text-gray-500">
              Select one or more difficulty levels.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {difficulties.map((item) => {
                const selected =
                  selectedDifficulties.includes(item);

                return (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                      selected
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleDifficulty(item)}
                      className="h-4 w-4 accent-black"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Question Type
            </label>

            <p className="mt-1 text-xs text-gray-500">
              Select one or more question types.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {questionTypes.map((item) => {
                const selected = selectedQuestionTypes.includes(
                  item.value
                );

                return (
                  <label
                    key={item.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                      selected
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleQuestionType(item.value)
                      }
                      className="h-4 w-4 accent-black"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="questionCount"
              className="block text-sm font-medium text-gray-700"
            >
              Number of Questions
            </label>

            <select
              id="questionCount"
              value={questionCount}
              onChange={(event) =>
                setQuestionCount(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-black"
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
            </select>
          </div>

          <div className="mt-8 rounded-2xl bg-gray-50 p-5">
            <p className="text-sm font-medium text-gray-500">
              Your Mock Exam
            </p>

            <div className="mt-3 space-y-2">
              <p className="font-semibold text-gray-900">
                {hasTopic
                  ? topic
                  : hasFiles
                    ? `${files.length} material${
                        files.length !== 1 ? "s" : ""
                      }${
                        photoCount > 0
                          ? ` · ${photoCount} photo${
                              photoCount !== 1 ? "s" : ""
                            }`
                          : ""
                      }`
                    : "Choose your source"}
              </p>

              <p className="text-sm text-gray-600">
                {selectedDifficulties.length > 0
                  ? selectedDifficulties.join(" + ")
                  : "No difficulty selected"}
              </p>

              <p className="text-sm text-gray-600">
                {selectedQuestionTypes
                  .map((type) =>
                    type === "multiple_choice"
                      ? "Multiple Choice"
                      : "True / False"
                  )
                  .join(" + ") || "No question type selected"}
              </p>

              <p className="text-sm text-gray-600">
                {questionCount} questions
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={!canGenerate}
            onClick={generateMockExam}
            className="mt-6 w-full rounded-xl bg-black px-6 py-3.5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating
              ? "Generating Mock Exam..."
              : "Generate Mock Exam with AI"}
          </button>
        </div>

        {generatedQuiz && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-green-600">
                  AI Generation Successful
                </p>
                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {generatedQuiz.title}
                </h2>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                {generatedQuiz.questions.length} questions
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              The AI successfully generated your mock exam. We
              will build the actual exam-taking interface next.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <p className="text-xl">🤖</p>
            <h2 className="mt-3 font-semibold text-gray-900">
              AI Generated
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Questions are generated from your topic, files, or
              photos of notes.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <p className="text-xl">📝</p>
            <h2 className="mt-3 font-semibold text-gray-900">
              Practice
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Test your knowledge with a customized mock exam.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <p className="text-xl">📊</p>
            <h2 className="mt-3 font-semibold text-gray-900">
              See Your Results
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review your score and identify areas where you can
              improve.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
