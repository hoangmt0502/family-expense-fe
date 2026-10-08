import Link from "next/link";

export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(124,92,255,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/30 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      {action}
    </div>
  );
}

export function SeeAll({ href = '#' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-300"
    >
      Xem tất cả →
    </Link>
  );
}
