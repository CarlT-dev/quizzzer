import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      <section className="px-6 py-16 sm:py-20">

        <div className="mx-auto w-full max-w-6xl">

          <div className="text-center">

            <div className="flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="Quizzzer"
                width={40}
                height={40}
                className="rounded-lg"
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  QUIZZZER AI
                </p>

                <p className="text-xs text-gray-500">
                  AI Quiz Generator
                </p>
              </div>
            </div>

            <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Learn. Practice. Create.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Practice with AI mock exams, generate a shareable
              quiz, or write every question yourself.
            </p>

          </div>

          <div className="mx-auto mt-14 grid gap-6 lg:grid-cols-3">

            <div className="flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                📚
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Self Practice
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Practice with AI-generated mock exams from a
                topic, files, or photos of your notes.
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">

                <li className="flex gap-3">
                  <span>✓</span>
                  Choose a topic, files, or photos
                </li>

                <li className="flex gap-3">
                  <span>✓</span>
                  Generate a mock exam with AI
                </li>

                <li className="flex gap-3">
                  <span>✓</span>
                  Take the exam and see your score
                </li>

              </ul>

              <Link
                href="/practice"
                className="mt-8 block rounded-xl bg-black px-5 py-3 text-center font-medium text-white transition hover:bg-gray-800"
              >
                Start Practicing
              </Link>

            </div>

            <div className="flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                ✨
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Create with AI
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Generate a shareable quiz from a topic, study
                files, or photos, then edit and send it out.
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">

                <li className="flex gap-3">
                  <span>✓</span>
                  Generate from topics, files, or photos
                </li>

                <li className="flex gap-3">
                  <span>✓</span>
                  Edit and manage questions
                </li>

                <li className="flex gap-3">
                  <span>✓</span>
                  Share quizzes and view results
                </li>

              </ul>

              <Link
                href="/create-quiz"
                className="mt-8 block rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-medium text-gray-900 transition hover:bg-gray-50"
              >
                Generate Quiz
              </Link>

            </div>

            <div className="flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                ✍️
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Write Manually
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Build every question yourself when you already
                know exactly what you want to ask.
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">

                <li className="flex gap-3">
                  <span>✓</span>
                  Write multiple choice or true / false
                </li>

                <li className="flex gap-3">
                  <span>✓</span>
                  Set the correct answers
                </li>

                <li className="flex gap-3">
                  <span>✓</span>
                  Save and share the link
                </li>

              </ul>

              <Link
                href="/create"
                className="mt-8 block rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-medium text-gray-900 transition hover:bg-gray-50"
              >
                Write Questions
              </Link>

            </div>

          </div>

          <p className="mt-12 text-center text-sm text-gray-400">
            Powered by AI · Built for learning
          </p>

        </div>

      </section>

    </main>
  );
}
