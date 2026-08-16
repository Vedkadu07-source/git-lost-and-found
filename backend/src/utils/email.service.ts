import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure the connection to Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// The function that formats and sends the alert
export const sendMatchAlert = async (toEmail: string, foundItemTitle: string, category: string) => {
  const mailOptions = {
    from: `"GIT Lost & Found" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔍 Possible Match for Your Lost Item!",
    html: `
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
            <a href="http://localhost:5173" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Campus Feed</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          This is an automated message from the GIT Lost & Found network.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Automated match alert sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};