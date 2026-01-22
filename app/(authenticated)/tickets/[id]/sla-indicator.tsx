"use client";

import { formatSLAStatus, calculateSLAStatus } from "@/src/lib/sla/helpers";

interface SLAIndicatorProps {
  createdAt: Date;
  slaHours: number;
  firstResponseAt?: Date | null;
  resolvedAt?: Date | null;
  type: "response" | "resolution";
}

export function SLAIndicator({
  createdAt,
  slaHours,
  firstResponseAt,
  resolvedAt,
  type,
}: SLAIndicatorProps) {
  const slaStatus = calculateSLAStatus(
    new Date(createdAt),
    slaHours,
    firstResponseAt ? new Date(firstResponseAt) : null,
    resolvedAt ? new Date(resolvedAt) : null
  );

  const status = type === "response" ? slaStatus.firstResponseStatus : slaStatus.resolutionStatus;
  const hoursRemaining =
    type === "response"
      ? slaStatus.firstResponseHoursRemaining
      : slaStatus.resolutionHoursRemaining;

  const formatted = formatSLAStatus(status);

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${formatted.color}`}>
        {formatted.label}
      </span>
      {hoursRemaining !== null && status === "pending" && (
        <span className="text-xs text-muted-foreground">
          {hoursRemaining > 0
            ? `${hoursRemaining}h restantes`
            : "SLA estourado"}
        </span>
      )}
    </div>
  );
}

