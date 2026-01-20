import { TicketPriority } from "@/src/db/schema/enums";

export const SLA_HOURS: Record<TicketPriority, number> = {
  [TicketPriority.LOW]: 48,
  [TicketPriority.MEDIUM]: 24,
  [TicketPriority.HIGH]: 8,
  [TicketPriority.URGENT]: 2,
};

export const WORK_HOURS = {
  START: 19,
  END: 23,
};

export const HOURS_PER_DAY = WORK_HOURS.END - WORK_HOURS.START;

export function getSLAHours(priority: TicketPriority): number {
  return SLA_HOURS[priority];
}

function isWithinWorkingHours(date: Date): boolean {
  const hour = date.getHours();
  return hour >= WORK_HOURS.START && hour < WORK_HOURS.END;
}

function getNextWorkingHour(date: Date): Date {
  const next = new Date(date);
  const hour = next.getHours();

  if (hour < WORK_HOURS.START) {
    next.setHours(WORK_HOURS.START, 0, 0, 0);
  } else if (hour >= WORK_HOURS.END) {
    next.setDate(next.getDate() + 1);
    next.setHours(WORK_HOURS.START, 0, 0, 0);
  }

  return next;
}

function calculateWorkingHoursBetween(start: Date, end: Date): number {
  let workingHours = 0;
  let current = new Date(start);

  while (current < end) {
    if (isWithinWorkingHours(current)) {
      const dayEnd = new Date(current);
      dayEnd.setHours(WORK_HOURS.END, 0, 0, 0);

      if (dayEnd > end) {
        workingHours += (end.getTime() - current.getTime()) / (1000 * 60 * 60);
        break;
      } else {
        workingHours += (dayEnd.getTime() - current.getTime()) / (1000 * 60 * 60);
        current = new Date(current);
        current.setDate(current.getDate() + 1);
        current.setHours(WORK_HOURS.START, 0, 0, 0);
      }
    } else {
      current = getNextWorkingHour(current);
    }
  }

  return Math.max(0, workingHours);
}

function calculateDeadline(startDate: Date, slaHours: number): Date {
  let remainingHours = slaHours;
  let current = new Date(startDate);

  if (!isWithinWorkingHours(current)) {
    current = getNextWorkingHour(current);
  }

  while (remainingHours > 0) {
    if (isWithinWorkingHours(current)) {
      const dayEnd = new Date(current);
      dayEnd.setHours(WORK_HOURS.END, 0, 0, 0);

      const hoursUntilEndOfDay = (dayEnd.getTime() - current.getTime()) / (1000 * 60 * 60);
      const hoursToUse = Math.min(remainingHours, hoursUntilEndOfDay);

      current = new Date(current.getTime() + hoursToUse * 60 * 60 * 1000);
      remainingHours -= hoursToUse;

      if (remainingHours > 0) {
        current.setDate(current.getDate() + 1);
        current.setHours(WORK_HOURS.START, 0, 0, 0);
      }
    } else {
      current = getNextWorkingHour(current);
    }
  }

  return current;
}

export function calculateSLAStatus(
  createdAt: Date,
  slaHours: number,
  firstResponseAt?: Date | null,
  resolvedAt?: Date | null
): {
  firstResponseStatus: "within" | "overdue" | "pending";
  resolutionStatus: "within" | "overdue" | "pending";
  firstResponseHoursRemaining: number | null;
  resolutionHoursRemaining: number | null;
  firstResponseDeadline: Date;
  resolutionDeadline: Date;
} {
  const now = new Date();
  const firstResponseDeadline = calculateDeadline(createdAt, slaHours);
  const resolutionDeadline = calculateDeadline(createdAt, slaHours);

  let firstResponseStatus: "within" | "overdue" | "pending" = "pending";
  let resolutionStatus: "within" | "overdue" | "pending" = "pending";
  let firstResponseHoursRemaining: number | null = null;
  let resolutionHoursRemaining: number | null = null;

  if (firstResponseAt) {
    const responseDate = new Date(firstResponseAt);
    const workingHoursUsed = calculateWorkingHoursBetween(createdAt, responseDate);
    firstResponseStatus = workingHoursUsed <= slaHours ? "within" : "overdue";
  } else {
    const workingHoursRemaining = calculateWorkingHoursBetween(now, firstResponseDeadline);
    firstResponseHoursRemaining = workingHoursRemaining > 0 ? Math.ceil(workingHoursRemaining) : null;
    firstResponseStatus = now >= firstResponseDeadline ? "overdue" : "pending";
  }

  if (resolvedAt) {
    const resolutionDate = new Date(resolvedAt);
    const workingHoursUsed = calculateWorkingHoursBetween(createdAt, resolutionDate);
    resolutionStatus = workingHoursUsed <= slaHours ? "within" : "overdue";
  } else {
    const workingHoursRemaining = calculateWorkingHoursBetween(now, resolutionDeadline);
    resolutionHoursRemaining = workingHoursRemaining > 0 ? Math.ceil(workingHoursRemaining) : null;
    resolutionStatus = now >= resolutionDeadline ? "overdue" : "pending";
  }

  return {
    firstResponseStatus,
    resolutionStatus,
    firstResponseHoursRemaining,
    resolutionHoursRemaining,
    firstResponseDeadline,
    resolutionDeadline,
  };
}

export function formatSLAStatus(status: "within" | "overdue" | "pending"): {
  label: string;
  color: string;
} {
  switch (status) {
    case "within":
      return {
        label: "Dentro do SLA",
        color: "bg-green-100 text-green-800",
      };
    case "overdue":
      return {
        label: "SLA estourado",
        color: "bg-red-100 text-red-800",
      };
    case "pending":
      return {
        label: "Aguardando",
        color: "bg-yellow-100 text-yellow-800",
      };
  }
}