export function initialsOf(nameOrEmail: string): string {
  const s = nameOrEmail.trim();
  if (!s) return "?";
  const handle = s.includes("@") ? s.split("@")[0] : s;
  const parts = handle.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const dims = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-subtle font-semibold text-accent ${dims} ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
