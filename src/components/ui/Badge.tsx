type Tone = "neutral" | "accent" | "success" | "destructive";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2 border-line",
  accent: "bg-accent-subtle text-accent border-transparent",
  success: "bg-surface-2 text-success border-line",
  destructive: "bg-surface-2 text-destructive border-line",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: "owner" | "viewer" | "editor" }) {
  if (role === "owner") return <Badge tone="neutral">Owned</Badge>;
  if (role === "editor") return <Badge tone="accent">Can edit</Badge>;
  return <Badge tone="neutral">Viewer</Badge>;
}
