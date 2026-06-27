import { Resend } from 'resend'
import {
  EMAIL_THEME,
  EMAIL_VERIFICATION,
  PASSWORD_RESET,
} from '@/lib/constants'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export class EmailDeliveryError extends Error {
  publicMessage: string

  constructor(message: string, publicMessage = 'Email could not be sent') {
    super(message)
    this.name = 'EmailDeliveryError'
    this.publicMessage = publicMessage
  }
}

function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Vigil <onboarding@resend.dev>'
  )
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && resend)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailVerificationExpiryMinutes(): number {
  return Math.round(EMAIL_VERIFICATION.EXPIRY_MS / 60000)
}

function passwordResetExpiryMinutes(): number {
  return Math.round(PASSWORD_RESET.EXPIRY_MS / 60000)
}

function getPublicEmailErrorMessage(message: string): string {
  if (message.includes('You can only send testing emails')) {
    return process.env.NODE_ENV === 'production'
      ? 'Email service is not configured for this recipient.'
      : `${message} Set RESEND_FROM_EMAIL to a verified domain sender after verifying a domain in Resend.`
  }

  return process.env.NODE_ENV === 'production'
    ? 'Email could not be sent'
    : message
}

function throwEmailDeliveryError(message: string): never {
  throw new EmailDeliveryError(message, getPublicEmailErrorMessage(message))
}

function formatCode(code: string): string {
  return code.split('').join(' ')
}

function renderCodeEmail({
  name,
  code,
  title,
  eyebrow,
  intro,
  expiryMinutes,
}: {
  name: string
  code: string
  title: string
  eyebrow: string
  intro: string
  expiryMinutes: number
}) {
  const theme = EMAIL_THEME
  const escapedName = escapeHtml(name)
  const escapedCode = escapeHtml(formatCode(code))
  const escapedTitle = escapeHtml(title)
  const escapedEyebrow = escapeHtml(eyebrow)
  const escapedIntro = escapeHtml(intro)

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${escapedTitle}</title>
      </head>
      <body style="margin:0; padding:0; background:${theme.background}; font-family:Arial, Helvetica, sans-serif; color:${theme.foreground};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; background:${theme.background}; padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; max-width:560px; background:${theme.surface}; border:1px solid ${theme.border}; border-radius:18px; overflow:hidden; box-shadow:0 18px 48px ${theme.shadow};">
                <tr>
                  <td style="height:8px; background:${theme.primary}; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 18px 32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <div style="display:inline-block; padding:7px 11px; border-radius:999px; background:${theme.secondary}; color:${theme.primaryActive}; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">
                            ${escapedEyebrow}
                          </div>
                          <h1 style="margin:18px 0 8px 0; color:${theme.foreground}; font-size:28px; line-height:1.2; font-weight:800;">
                            ${escapedTitle}
                          </h1>
                          <p style="margin:0; color:${theme.bodyText}; font-size:15px; line-height:1.6;">
                            Hi ${escapedName}, ${escapedIntro}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 28px 32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${theme.accent}; border:1px solid ${theme.borderStrong}; border-radius:14px;">
                      <tr>
                        <td align="center" style="padding:28px 18px;">
                          <div style="color:${theme.mutedText}; font-size:12px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:12px;">
                            Verification code
                          </div>
                          <div style="font-family:'Courier New', Courier, monospace; color:${theme.primaryActive}; font-size:34px; line-height:1; font-weight:800; letter-spacing:0.18em;">
                            ${escapedCode}
                          </div>
                          <div style="display:inline-block; margin-top:18px; padding:8px 12px; border-radius:999px; background:${theme.secondary}; color:${theme.primaryActive}; font-size:13px; font-weight:700;">
                            Expires in ${expiryMinutes} minutes
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 32px 32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${theme.muted}; border:1px solid ${theme.border}; border-radius:12px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0; color:${theme.bodyText}; font-size:13px; line-height:1.6;">
                            If you did not request this, you can safely ignore this email. For your security, do not share this code with anyone.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 32px 30px 32px; border-top:1px solid ${theme.border};">
                    <p style="margin:0; color:${theme.mutedText}; font-size:12px; line-height:1.5; text-align:center;">
                      Vigil Civic Platform<br/>
                      Made with ❤️ by Sahil Maurya (also known as kairos)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export async function sendEmailVerificationCodeEmail(
  to: string,
  name: string,
  code: string
): Promise<void> {
  if (!resend) {
    throw new Error('Email service not configured')
  }

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: 'Verify your Vigil email',
    html: renderCodeEmail({
      name,
      code,
      title: 'Verify your email',
      eyebrow: 'Account security',
      intro: 'use this code to finish creating your Vigil account.',
      expiryMinutes: emailVerificationExpiryMinutes(),
    }),
  })

  if (error) {
    throwEmailDeliveryError(error.message)
  }
}

export async function sendPasswordResetCodeEmail(
  to: string,
  name: string,
  code: string
): Promise<void> {
  if (!resend) {
    throw new Error('Email service not configured')
  }

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: 'Your Vigil password reset code',
    html: renderCodeEmail({
      name,
      code,
      title: 'Reset your password',
      eyebrow: 'Password reset',
      intro:
        'we received a request to reset your password. Use this code to choose a new one.',
      expiryMinutes: passwordResetExpiryMinutes(),
    }),
  })

  if (error) {
    throwEmailDeliveryError(error.message)
  }
}
