import Link from "next/link";
import Image from "next/image";
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
    variant: "outline" as const,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="flex flex-col items-center px-6 py-24 sm:py-32">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt="Quizzzer"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-sm font-semibold text-gray-900">
            QUIZZZER AI
          </span>
        </div>

        <h1 className="mt-10 text-5xl font-bold tracking-tight text-black sm:text-6xl">
          Learn. Practice. Create.
        </h1>

        <p className="mt-8 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Practice with AI mock exams, generate a shareable
          quiz, or write every question yourself.
        </p>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-gray-400">
          Powered by AI · Built for learning
        </p>
      </section>
    </main>
  );
}
