import { CLIENT_URL, EMAIL_FROM_NAME } from "../../config/env.js";


const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${EMAIL_FROM_NAME}<titel>
    <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .header { background:#111827; padding:28px 40px; }
    .header h1 { margin:0; color:#fff; font-size:22px; font-weight:700; }
    .body { padding:36px 40px; color:#374151; line-height:1.7; font-size:15px; }
    .body h2 { margin:0 0 16px; font-size:20px; color:#111827; }
    .body p { margin:0 0 16px; }
    .btn { display:inline-block; margin:8px 0 24px; padding:13px 28px; background:#111827; color:#fff!important; text-decoration:none; border-radius:6px; font-weight:600; font-size:15px; }
    .divider { border:none; border-top:1px solid #e5e7eb; margin:24px 0; }
    .footer { padding:20px 40px; background:#f9fafb; text-align:center; font-size:12px; color:#9ca3af; }
  </style>
</head>
<body>
    <div class="wrapper">
    <div class="header">
    <h1>${EMAIL_FROM_NAME}</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">© ${new Date().getFullYear()} ${EMAIL_FROM_NAME}. All rights reserved.</div>
    </div>
</body>
</html>
`;

export const welcomeTemplate = ({ name }) => baseTemplate(`  <h2>Welcome aboard, ${name}! 🎉</h2>

    <p>Your account has been created successfully. We're excited to have you with us.</p>

    <a href="${CLIENT_URL}/login" class="btn">Go to Dashboard</a>

    <hr class="divider"/>

    <p style="font-size:13px;color:#6b7280;">If you didn't create this account, please ignore this email.</p>
  `);

export const passwordResetTemplate = ({ name, resetUrl, expiresInMinutes }) => baseTemplate(`
    <h2>Reset your password</h2>

    <p>Hi ${name}, we received a request to reset your password.</p>

    <p>This link expires in <strong>${expiresInMinutes} minutes</strong>.</p>

    <a href="${resetUrl}" class="btn">Reset Password</a>
    <hr class="divider"/>

    <p style="font-size:13px;color:#6b7280;">If you didn't request this, you can safely ignore this email.</p>

    <p style="font-size:13px;color:#6b7280;">Or copy this URL:<br/><span style="color:#111827;">${resetUrl}</span></p>
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