import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero */}

      <section className="flex min-h-screen items-center px-6 py-16">

        <div className="mx-auto w-full max-w-6xl">

          {/* Branding */}

          <div className="text-center">

            <p className="text-sm font-semibold tracking-widest text-gray-500">
              QUIZZZER
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Learn. Practice. Create.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              An AI-powered quiz platform for students
              and teachers. Practice with mock exams
              or create and manage your own quizzes.
            </p>

          </div>

          {/* Choose Experience */}

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">

            {/* Student */}

            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                👤
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {/* I'm a Student */}
                Self Practice
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Practice your knowledge with AI-generated
                mock exams based on the topics you want
                to study.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-600">

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

            {/* Teacher */}

            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                🔗
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {/* I'm a Teacher */}
                Create Shareable Quiz
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Create, manage, and share quizzes with
                your students using AI-powered quiz
                generation.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-600">

                <li className="flex gap-3">
                  <span>✓</span>
                  Generate quizzes from topics, files, or photos
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
                Create Shareable Quiz
              </Link>

            </div>

          </div>

          {/* Footer */}

          <p className="mt-12 text-center text-sm text-gray-400">
            Powered by AI · Built for learning
          </p>

        </div>

      </section>

    </main>
  );
}