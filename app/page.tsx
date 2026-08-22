import Link from "next/link";
import { FeatureCard } from "@/components/FeatureCard";

const features = [
  {
    label: "Practice",
    icon: "📚",
    title: "Self Practice",
    description:
      "Practice with AI-generated mock exams from a topic, files, or photos of your notes.",
    features: [
      "Choose a topic, files, or photos",
      "Generate a mock exam with AI",
      "Take the exam and see your score",
    ],
    href: "/practice",
    buttonText: "Start Practicing",
    accent: "#6366f1",
    variant: "solid" as const,
  },
  {
    label: "AI Powered",
    icon: "✨",
    title: "Create with AI",
    description:
      "Generate a shareable quiz from a topic, study files, or photos, then edit and send it out.",
    features: [
      "Generate from topics, files, or photos",
      "Edit and manage questions",
      "Share quizzes and view results",
    ],
    href: "/create-quiz",
    buttonText: "Generate Quiz",
    accent: "#ec4899",
    variant: "outline" as const,
  },
  {
    label: "Manual",
    icon: "✍️",
    title: "Write Manually",
    description:
      "Build every question yourself when you already know exactly what you want to ask.",
    features: [
      "Write multiple choice or true / false",
      "Set the correct answers",
      "Save and share the link",
    ],
    href: "/create",
    buttonText: "Write Questions",
    accent: "#0ea5e9",
    variant: "outline" as const,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-indigo-50/70 via-white to-white" />
        <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-28 pb-20 text-center sm:pt-36">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-gray-600 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            AI Quiz Generator
          </span>

          <h1 className="mt-8 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Learn.{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-pink-500 to-sky-500 bg-clip-text text-transparent">
              Practice.
            </span>{" "}
            Create.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-500">
            Practice with AI mock exams, generate a shareable
            quiz, or write every question yourself.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/practice"
              className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
            >
              Start Practicing
            </Link>
            <Link
              href="/create-quiz"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Generate Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-28">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <p className="mt-14 text-center text-sm text-gray-400">
          Powered by AI · Built for learning
        </p>
      </section>
    </main>
  );
}
