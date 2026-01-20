import { sendEmail } from "./client";
import {
  getTicketCreatedEmail,
  getAdminResponseEmail,
  getTicketResolvedEmail,
  getNewTicketEmail,
} from "./templates";
import { getAllAdmins } from "@/src/db/queries/users";
import { TicketPriority } from "@/src/db/schema/enums";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function notifyTicketCreated({
  userEmail,
  userName,
  ticketNumber,
  ticketTitle,
  ticketPriority,
  ticketId,
}: {
  userEmail: string;
  userName: string;
  ticketNumber: string;
  ticketTitle: string;
  ticketPriority: string;
  ticketId: string;
}): Promise<void> {
  const { subject, html } = getTicketCreatedEmail({
    userName,
    ticketNumber,
    ticketTitle,
    ticketPriority,
    ticketUrl: `${BASE_URL}/tickets/${ticketId}`,
  });

  await sendEmail({
    to: userEmail,
    subject,
    html,
  });
}

export async function notifyAdminNewTicket({
  ticketNumber,
  ticketTitle,
  userName,
  ticketPriority,
  ticketId,
  isUrgent,
}: {
  ticketNumber: string;
  ticketTitle: string;
  userName: string;
  ticketPriority: string;
  ticketId: string;
  isUrgent: boolean;
}): Promise<void> {
  const admins = await getAllAdmins();

  for (const admin of admins) {
    const { subject, html } = getNewTicketEmail({
      adminName: admin.name,
      ticketNumber,
      ticketTitle,
      userName,
      ticketPriority,
      ticketUrl: `${BASE_URL}/tickets/${ticketId}`,
      isUrgent,
    });

    await sendEmail({
      to: admin.email,
      subject,
      html,
    });
  }
}

export async function notifyUserAdminResponse({
  userEmail,
  userName,
  ticketNumber,
  ticketTitle,
  adminName,
  message,
  ticketId,
}: {
  userEmail: string;
  userName: string;
  ticketNumber: string;
  ticketTitle: string;
  adminName: string;
  message: string;
  ticketId: string;
}): Promise<void> {
  const { subject, html } = getAdminResponseEmail({
    userName,
    ticketNumber,
    ticketTitle,
    adminName,
    message,
    ticketUrl: `${BASE_URL}/tickets/${ticketId}`,
  });

  await sendEmail({
    to: userEmail,
    subject,
    html,
  });
}

export async function notifyTicketResolved({
  userEmail,
  userName,
  ticketNumber,
  ticketTitle,
  ticketId,
}: {
  userEmail: string;
  userName: string;
  ticketNumber: string;
  ticketTitle: string;
  ticketId: string;
}): Promise<void> {
  const { subject, html } = getTicketResolvedEmail({
    userName,
    ticketNumber,
    ticketTitle,
    ticketUrl: `${BASE_URL}/tickets/${ticketId}`,
  });

  await sendEmail({
    to: userEmail,
    subject,
    html,
  });
}
