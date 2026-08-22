import Link from "next/link";

interface FeatureCardProps {
  label: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  href: string;
  buttonText: string;
  accent: string;
  variant: "solid" | "outline";
}

export function FeatureCard({
  label,
  icon,
  title,
  description,
  features,
  href,
  buttonText,
  accent,
}: FeatureCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white/80 hover:bg-white/55 hover:shadow-2xl hover:shadow-indigo-500/10">
      {/* Ambient background glow inside card */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: accent }}
      />

      <div>
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <span className="text-2xl">{icon}</span>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
            style={{
              backgroundColor: `${accent}15`,
              color: accent,
            }}
          >
            {label}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>

        {/* Feature List */}
        <ul className="mt-6 space-y-2.5">
          {features.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                style={{ backgroundColor: accent }}
              >
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Glass Action Button */}
      <div className="mt-8 pt-4">
        <Link
          href={href}
          className="block w-full rounded-2xl border border-white/60 bg-white/50 py-3 text-center text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-white hover:bg-white/80 hover:shadow-md"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}