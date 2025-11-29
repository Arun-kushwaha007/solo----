const nodemailer = require('nodemailer');

/**
 * Email service for sending password reset emails
 * Supports multiple email providers via configuration
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment configuration
   */
  initializeTransporter() {
    const emailService = process.env.EMAIL_SERVICE || 'console';

    if (emailService === 'console') {
      // Development mode - log emails to console
      this.transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n=== EMAIL SENT (CONSOLE MODE) ===');
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('HTML:', mailOptions.html);
          console.log('Text:', mailOptions.text);
          console.log('================================\n');
          return { messageId: 'console-' + Date.now() };
        },
      };
    } else if (emailService === 'smtp') {
      // SMTP configuration (Gmail, Outlook, etc.)
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else if (emailService === 'sendgrid') {
      // SendGrid configuration
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      console.warn('No valid email service configured. Emails will be logged to console.');
      this.transporter = this.getConsoleTransporter();
    }
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email address
   * @param {string} resetToken - Password reset token
   * @param {string} userName - User's name
   */
  async sendPasswordResetEmail(to, resetToken, userName) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Solo Leveling <noreply@solo-leveling.com>',
      to,
      subject: 'Password Reset Request - Solo Leveling',
      html: this.getPasswordResetTemplate(userName, resetUrl),
      text: this.getPasswordResetTextTemplate(userName, resetUrl),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * HTML template for password reset email
   */
  getPasswordResetTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #000000;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 2px solid #00a3ff;
          }
          .header h1 {
            color: #00a3ff;
            font-size: 32px;
            margin: 0;
            letter-spacing: 2px;
          }
          .content {
            padding: 40px 20px;
            background-color: #0a0a0a;
            border: 1px solid #00a3ff33;
            margin-top: 20px;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background-color: #00a3ff;
            color: #000000;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background-color: #ffffff;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 12px;
          }
          .warning {
            background-color: #ff000022;
            border-left: 4px solid #ff0000;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SOLO LEVELING</h1>
            <p style="color: #888; margin-top: 10px;">PLAYER SYSTEM</p>
          </div>
          <div class="content">
            <h2 style="color: #00a3ff;">Password Reset Request</h2>
            <p>Hello ${userName},</p>
            <p>You have requested to reset your password for your Solo Leveling account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">RESET PASSWORD</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #00a3ff;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from Solo Leveling - Life RPG</p>
            <p>© ${new Date().getFullYear()} Solo Leveling. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Plain text template for password reset email
   */
  getPasswordResetTextTemplate(userName, resetUrl) {
    return `
SOLO LEVELING - Password Reset Request

Hello ${userName},

You have requested to reset your password for your Solo Leveling account.

Click the link below to reset your password:
${resetUrl}

SECURITY NOTICE:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

---
This is an automated message from Solo Leveling - Life RPG
© ${new Date().getFullYear()} Solo Leveling. All rights reserved.
    `;
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(to, userName) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Solo Leveling <noreply@solo-leveling.com>',
      to,
      subject: 'Welcome to Solo Leveling!',
      html: `
        <h1>Welcome, ${userName}!</h1>
        <p>Your journey as a Hunter begins now.</p>
        <p>Start completing quests and level up your real-world stats!</p>
      `,
      text: `Welcome, ${userName}! Your journey as a Hunter begins now.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome emails - it's not critical
    }
  }
}

module.exports = new EmailService();
