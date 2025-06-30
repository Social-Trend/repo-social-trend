import { MailService } from '@sendgrid/mail';
import { logger } from './middleware/logger';

let mailService: MailService | null = null;

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  logger.info('SendGrid email service initialized');
} else {
  logger.warn('SENDGRID_API_KEY not provided - email functionality disabled');
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!mailService) {
    logger.warn('Email service not available - skipping email send', { to: params.to, subject: params.subject });
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: 'noreply@socialtend.com', // You'll need to verify this domain in SendGrid
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });
    
    logger.info('Email sent successfully', { to: params.to, subject: params.subject });
    return true;
  } catch (error) {
    logger.error('Failed to send email', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      to: params.to, 
      subject: params.subject 
    });
    return false;
  }
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { color: #64748b; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to SocialTend!</h1>
      </div>
      <div class="content">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for joining SocialTend, the premier platform connecting event organizers with hospitality professionals.</p>
        <p>To complete your registration and start connecting with professionals or organizers, please verify your email address:</p>
        <p style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
        <div class="footer">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with SocialTend, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your SocialTend account',
    html,
    text: `Welcome to SocialTend! Please verify your email by visiting: ${verificationUrl}`
  });
}

export async function sendPasswordResetEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { color: #64748b; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your SocialTend account password.</p>
        <p>Click the button below to create a new password:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
        <div class="footer">
          <p>This reset link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your SocialTend password',
    html,
    text: `Reset your SocialTend password by visiting: ${resetUrl}`
  });
}