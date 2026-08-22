import Link from "next/link";

type FeatureCardProps = {
  label: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  href: string;
  buttonText: string;
  accent: string;
  variant: "solid" | "outline";
};

export function FeatureCard({
  label,
  icon,
  title,
  description,
  features,
  href,
  buttonText,
  accent,
  variant,
}: FeatureCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-gray-200/80 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-gray-300">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: accent }}
      />

      <span
        className="inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        {label}
      </span>

      <div
        className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
        style={{ backgroundColor: `${accent}1a` }}
      >
        {icon}
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-gray-900">
        {title}
      </h2>

      <p className="mt-2.5 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={
          variant === "solid"
            ? "mt-7 block rounded-xl bg-gray-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-black"
            : "mt-7 block rounded-xl border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
        }
      >
        {buttonText}
      </Link>
    </div>
  );
}
