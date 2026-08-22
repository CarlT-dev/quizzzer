import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getAdminEmails(): string[] {
  return (process.env.ADMIN_NOTIFICATION_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function notifyAdmins(
  subject: string,
  html: string
) {
  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    console.warn(
      "notifyAdmins: no ADMIN_NOTIFICATION_EMAILS configured, skipping."
    );
    return;
  }

  try {
    await resend.emails.send({
      from: "Quizzzer <onboarding@resend.dev>",
      to: adminEmails,
      subject,
      html,
    });
  } catch (error) {
    // A failed notification should never break the actual
    // request (quiz creation / submission still succeeds).
    console.error(
      "Failed to send admin notification:",
      error
    );
  }
}