import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

// Use a verified SendGrid sender
const FROM_EMAIL = 'hello@constructivo.sendgrid.net'; // Using SendGrid's verified domain

interface EmailContent {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailContent): Promise<boolean> {
  try {
    await mailService.send({
      to,
      from: FROM_EMAIL,
      subject,
      html,
    });
    return true;
  } catch (error) {
    // Enhanced error logging
    console.error('SendGrid email error:', error);
    if (error.response) {
      console.error('SendGrid API response:', error.response.body);
    }
    return false;
  }
}

type UserActionType = 'created' | 'deleted';

export function generateUserActionEmail(
  actionType: UserActionType,
  userData: { name: string; email: string },
  adminName?: string
): { subject: string; html: string } {
  const subject = actionType === 'created' 
    ? 'Welcome to Constructivo - Account Created'
    : 'Constructivo Account Deleted';

  const userEmailContent = actionType === 'created'
    ? `
      <h2>Welcome to Constructivo!</h2>
      <p>Hello ${userData.name},</p>
      <p>Your account has been successfully created by ${adminName || 'an administrator'}.</p>
      <p>You can now log in using your Google account with this email address: ${userData.email}</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Constructivo Team</p>
    `
    : `
      <h2>Account Deletion Confirmation</h2>
      <p>Hello ${userData.name},</p>
      <p>This email confirms that your Constructivo account has been deleted by ${adminName || 'an administrator'}.</p>
      <p>If you believe this was done in error, please contact our support team immediately.</p>
      <p>Best regards,<br>The Constructivo Team</p>
    `;

  const adminEmailContent = actionType === 'created'
    ? `
      <h2>New User Account Created</h2>
      <p>Hello ${adminName},</p>
      <p>This email confirms that you have successfully created a new user account:</p>
      <ul>
        <li>Name: ${userData.name}</li>
        <li>Email: ${userData.email}</li>
      </ul>
      <p>The user has been notified via email.</p>
    `
    : `
      <h2>User Account Deleted</h2>
      <p>Hello ${adminName},</p>
      <p>This email confirms that you have deleted the following user account:</p>
      <ul>
        <li>Name: ${userData.name}</li>
        <li>Email: ${userData.email}</li>
      </ul>
      <p>The user has been notified via email.</p>
    `;

  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${userData.email === adminName ? userEmailContent : adminEmailContent}
      </div>
    `,
  };
}