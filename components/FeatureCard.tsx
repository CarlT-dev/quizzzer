import Link from "next/link";

type FeatureCardProps = {
  label: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  href: string;
  buttonText: string;
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
  variant,
}: FeatureCardProps) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-6 ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>

      <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
        {icon}
      </div>

      <h2 className="mt-5 text-xl font-bold text-gray-900">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>

      <ul className="mt-5 flex-1 space-y-2.5 text-sm text-gray-600">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <span>✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={
          variant === "solid"
            ? "mt-6 block rounded-xl bg-black px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-gray-800"
            : "mt-6 block rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-900 transition hover:bg-gray-50"
        }
      >
        {buttonText}
      </Link>
    </div>
  );
}
