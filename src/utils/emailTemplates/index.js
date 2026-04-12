import { CLIENT_URL, EMAIL_FROM_NAME } from "../../config/env.js";


const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${EMAIL_FROM_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:20px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:20px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:20px;">
                ${EMAIL_FROM_NAME}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;color:#374151;font-size:15px;line-height:1.6;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} ${EMAIL_FROM_NAME}
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

export const welcomeTemplate = ({ name }) => baseTemplate(`
  <h2 style="margin-top:0;color:#111827;">
    Welcome, ${name}! 🎉
  </h2>

  <p>
    Your account has been successfully created. We're excited to have you on board.
  </p>

  <p style="text-align:center;">
    <a href="${CLIENT_URL}/login"
       style="display:inline-block;padding:12px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
       Go to Dashboard
    </a>
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

  <p style="font-size:13px;color:#6b7280;">
    If you didn’t create this account, you can safely ignore this email.
  </p>
`);

export const passwordResetTemplate = ({ name, resetUrl, expiresInMinutes }) => baseTemplate(`
  <h2 style="margin-top:0;color:#111827;">Reset your password</h2>

  <p>Hi ${name},</p>

  <p>
    We received a request to reset your password. This link will expire in 
    <strong>${expiresInMinutes} minutes</strong>.
  </p>

  <p style="text-align:center;">
    <a href="${resetUrl}"
       style="display:inline-block;padding:12px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
       Reset Password
    </a>
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

  <p style="font-size:13px;color:#6b7280;">
    If you didn’t request this, you can ignore this email.
  </p>

  <p style="font-size:13px;color:#6b7280;">
    Or copy this link:<br/>
    ${resetUrl}
  </p>
`);

export const passwordResetConfirmationTemplate = ({ name }) => baseTemplate(`
    <h2>Password reset confirmed</h2>

    <p>Hi ${name}, your password was successfully updated.</p>

    <p>If you did <strong>not</strong> make this change, reset your password immediately.</p>

    <a href="${CLIENT_URL}/login" class="btn">Go to Login</a>
  `);

export const contactTemplate = ({ name, subject, message }) => baseTemplate(`
    <h2>${subject}</h2>
    <p>Hi ${name},</p>
    <p>${message}</p>
    <hr class="divider"/>
    <p style="font-size:13px;color:#6b7280;">This is an automated message from ${EMAIL_FROM_NAME}.</p>
  `);

  export const consultationAcceptedTemplate = ({ name, partnerName, consultationId }) =>
  baseTemplate(`
    <h2>Your consultation has been accepted</h2>
    <p>Hi ${name}, good news! <strong>${partnerName}</strong> has accepted your consultation request and is ready to assist you.</p>
    <a href="${CLIENT_URL}/consultations/${consultationId}" class="btn">Open Consultation</a>
    <hr class="divider"/>
    <p style="font-size:13px;color:#6b7280;">Please respond within 24 hours to keep the consultation active.</p>
  `);

export const consultationMessageTemplate = ({ name, senderName, consultationId }) =>
  baseTemplate(`
    <h2>New message in your consultation</h2>
    <p>Hi ${name}, <strong>${senderName}</strong> has sent you a message.</p>
    <a href="${CLIENT_URL}/consultations/${consultationId}" class="btn">View Message</a>
  `);

export const otpTemplate = ({ name, code }) =>
  baseTemplate(`
    <h2>Verify your account</h2>
    <p>Hi ${name || "there"}, here is your Lafieplus verification code:</p>
    <div class="otp">${code}</div>
    <p style="font-size:13px;color:#6b7280;">This code expires in 10 minutes. Do not share it with anyone.</p>
    <hr class="divider"/>
    <p style="font-size:13px;color:#6b7280;">If you didn't request this, you can safely ignore this email.</p>
  `);
