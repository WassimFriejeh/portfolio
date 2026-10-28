import type { DevelopmentStatus } from "@/lib/types";

export function DevelopmentLabel({
  status,
  note,
}: {
  status: DevelopmentStatus;
  note?: string;
}) {
  if (status === "CONTRIBUTION") {
    return (
      <p className="text-small text-[var(--muted)]">
        Contribution{note ? ` — ${note}` : " to an existing project"}
      </p>
    );
  }
  return (
    <p className="text-small text-[var(--muted)]">Independently developed</p>
  );
}
