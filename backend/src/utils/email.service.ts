import { google } from "googleapis";
import { env } from "../config/env.js";

// Configure OAuth2 client for Gmail API
const oauth2Client = new google.auth.OAuth2(
  env.GMAIL_CLIENT_ID,
  env.GMAIL_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

/**
 * Build an RFC 2822 compliant MIME message and encode it as base64url
 * for the Gmail API `raw` field.
 */
function buildRawEmail(from: string, to: string, subject: string, html: string): string {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ];
  const message = messageParts.join("\r\n");
  // base64url encode: standard base64 with + → -, / → _, no padding
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// The function that formats and sends the alert
export const sendMatchAlert = async (toEmail: string, foundItemTitle: string, category: string) => {
  try {
    const subject = "Possible Match for Your Lost Item!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #059669; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Good News!</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #334155;">
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">Someone at the GIT campus just reported finding an item in the <strong>${category}</strong> category that might belong to you.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #0f172a;">Item Found:</p>
            <p style="margin: 5px 0 0 0;">${foundItemTitle}</p>
          </div>
          
          <p style="font-size: 16px;">Please log in to the Campus Portal to view the photo and map coordinates to verify if this is your missing item.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${env.FRONTEND_URL}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Campus Feed</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          This is an automated message from the GIT Lost & Found network.
        </div>
      </div>
    `;

    const from = `"GIT Lost & Found" <${env.GMAIL_SENDER_EMAIL}>`;
    const raw = buildRawEmail(from, toEmail, subject, html);

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log(`✅ Automated match alert sent to ${toEmail}`);
  } catch (err: any) {
    console.error("❌ Email sending failed:", err.message || "Unknown error");
  }
};