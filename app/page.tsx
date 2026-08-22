import Link from "next/link";
import Image from "next/image";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { LiquidParticles } from "@/components/ui/LiquidParticles";

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
    <main className="relative min-h-screen bg-white">
      <LiquidParticles />

      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Quizzzer AI"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-slate-900">
                QUIZZZER AI
              </p>
              <p className="text-xs font-medium text-slate-500">
                AI Quiz Generator
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        {/* FIX: Changed 'to-white' to 'to-transparent' so particles show through */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-130 bg-linear-to-b from-indigo-50/40 via-white/70 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 -top-40 h-120 w-120 -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-28 pb-20 text-center sm:pt-36">
          <h1 className="mt-8 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Learn.{" "}
            <span className="bg-linear-to-r from-indigo-600 via-pink-500 to-sky-500 bg-clip-text text-transparent">
              Practice.
            </span>{" "}
            Create.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-500">
            Practice with AI mock exams, generate a shareable quiz, or write
            every question yourself.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            {/* Primary Dark Glass Button */}
            <Link
              href="/practice"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-black hover:shadow-xl hover:shadow-slate-900/30"
            >
              Start Practicing
            </Link>

            {/* Secondary Light Glass Button */}
            <Link
              href="/create-quiz"
              className="inline-flex items-center justify-center rounded-2xl border border-white/80 bg-white/40 px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-md shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/70 hover:shadow-lg"
            >
              Generate Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 pb-28">
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