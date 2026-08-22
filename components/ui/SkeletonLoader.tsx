export const ShareSectionSkeleton = () => {
  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm animate-pulse">
        <div className="rounded-xl border-gray-100 p-5">
            <div className="h-5 w-48 rounded animate-pulse bg-gray-200" />
            <div className="mt-3 h-4 w-72 rounded animate-pulse bg-gray-200" />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="h-11 flex-1 rounded-lg animate-pulse bg-gray-200" />
                <div className="h-11 w-full rounded-lg animate-pulse bg-gray-200 sm:w-28" />
                <div className="h-11 w-full rounded-lg animate-pulse bg-gray-200 sm:w-28" />
            </div>
        </div>
    </div>
  );
}

export const CreateQuizSkeleton = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const steps = [
    "Reading your materials",
    "Planning question mix",
    "Writing answer choices",
  ];

  return (
    <main
      className="min-h-screen bg-gray-50 px-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-4xl">

        {/* Page heading skeleton */}
        <div>
          <div className="h-4 w-28 animate-pulse rounded-full bg-gray-200" />

          <div className="mt-4 h-9 w-80 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-3 space-y-2">
            <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 max-w-xl animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Main loading card */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">

          {/* Progress bar */}
          <div className="h-1 w-full bg-gray-100">
            <div
              className="h-full bg-black transition-all duration-700"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          <div className="p-6">

            {/* Header */}
            <div className="flex items-center justify-between">

              <div>
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />

                <div className="mt-3 h-7 w-64 animate-pulse rounded bg-gray-200" />

                <div className="mt-3 h-4 w-48 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
              </div>

            </div>

            {/* Generation steps */}
            <div className="mt-8 rounded-2xl bg-gray-50 p-5">

              <p className="text-sm font-semibold text-gray-900">
                Building your shareable quiz
              </p>

              <div className="mt-4 space-y-3">

                {steps.map((step, index) => {
                  const completed = index < currentStep;
                  const active = index === currentStep;

                  return (
                    <div
                      key={step}
                      className="flex items-center gap-3 text-sm"
                    >
                      {/* Step indicator */}
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                          completed
                            ? "bg-black text-white"
                            : active
                              ? "border-2 border-black bg-white text-black"
                              : "border border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {completed ? "✓" : index + 1}
                      </span>

                      {/* Step text */}
                      <span
                        className={`transition-colors duration-300 ${
                          active
                            ? "font-medium text-gray-900"
                            : completed
                              ? "text-gray-500"
                              : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>

                      {/* Status */}
                      {completed && (
                        <span className="ml-auto text-xs text-gray-400">
                          Done
                        </span>
                      )}

                      {active && (
                        <span className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
                          Working...
                        </span>
                      )}
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Generated quiz skeleton */}
            <div className="mt-8">

              {/* Quiz header */}
              <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">

                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />

                <div className="mt-3 h-7 w-72 animate-pulse rounded bg-gray-200" />

                <div className="mt-2 h-4 w-28 animate-pulse rounded bg-gray-100" />

              </div>

              {/* Questions */}
              <div className="mt-6 space-y-6">

                {[1, 2, 3].map((question) => (
                  <div
                    key={question}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >

                    {/* Question header */}
                    <div className="flex items-center justify-between">

                      <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />

                      <div className="h-6 w-28 animate-pulse rounded-full bg-gray-100" />

                    </div>

                    {/* Question */}
                    <div className="mt-4 space-y-2">
                      <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
                      <div className="h-5 w-4/5 animate-pulse rounded bg-gray-100" />
                    </div>

                    {/* Choices */}
                    <div className="mt-5 space-y-3">

                      {[1, 2, 3, 4].map((choice) => (
                        <div
                          key={choice}
                          className="flex items-center gap-3"
                        >
                          <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />

                          <div className="h-11 flex-1 animate-pulse rounded-xl bg-gray-100" />
                        </div>
                      ))}

                    </div>

                  </div>
                ))}

              </div>

            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              {steps[currentStep]}...
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

export const MockExamSkeleton = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const steps = [
    "Reading your materials",
    "Planning question mix",
    "Writing answer choices",
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-10" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded-full bg-gray-200" />
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-black" /> Generating
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="h-1 w-full bg-gray-100">
            <div
              className="h-full bg-black transition-all duration-700"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="h-7 w-64 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-gray-100" />
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100" aria-hidden="true">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-900">Building your personalized exam</p>
              <div className="mt-4 space-y-3">
                {steps.map((step, index) => {
                  const completed = index < currentStep;
                  const active = index === currentStep;

                  return (
                    <div
                      key={step}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                          completed
                            ? "bg-black text-white"
                            : active
                              ? "border-2 border-black bg-white text-black"
                              : "border border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {completed ? "✓" : index + 1}
                      </span>

                      <span
                        className={`transition-colors duration-300 ${
                          active
                            ? "font-medium text-gray-900"
                            : completed
                              ? "text-gray-500"
                              : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>

                      {completed && (
                        <span className="ml-auto text-xs text-gray-400">
                          Done
                        </span>
                      )}

                      {active && (
                        <span className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
                          Working...
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 space-y-5" aria-label="Loading exam questions">
              {[1, 2, 3].map((question) => (
                <div key={question} className="rounded-2xl border border-gray-200 p-5">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200" />
                  <div className="mt-4 space-y-2"><div className="h-5 w-full animate-pulse rounded bg-gray-100" /><div className="h-5 w-4/5 animate-pulse rounded bg-gray-100" /></div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((choice) => <div key={choice} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4"><div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" /><div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" /></div>)}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-gray-500">This usually takes a few seconds. Please keep this tab open.</p>
          </div>
        </section>
      </div>
    </main>
  );
}