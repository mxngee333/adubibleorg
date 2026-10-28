/**
 * ADUBIBLE / ELOHIM BIBLE HUB — MAILEROO TRANSACTIONAL EMAIL ENGINE
 * Scale Target: 4 Billion Readers Worldwide
 * High-deliverability transactional email for verse sharing, prayer requests & study sync
 */

export interface SendScriptureEmailOptions {
  to: string;
  subject: string;
  verseReference: string;
  verseText: string;
  versionName: string;
  recipientName?: string;
  senderName?: string;
  personalNote?: string;
}

export interface MailerooDirectOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

const DEFAULT_FROM = 'AduBible <no-reply@adubible.org>';

/**
 * Direct Maileroo HTTP API sender using application/x-www-form-urlencoded
 * strictly complying with Maileroo v2 API specification
 */
export async function sendMailerooEmail(opts: MailerooDirectOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = (
    (typeof import.meta !== 'undefined' && import.meta.env?.MAILEROO_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAILEROO_API_KEY) ||
    '0f0b8b60d11196da2729fe59361df5b137cc9ff901987bfae92ce6dc6fa904df'
  ).trim();

  if (!apiKey) {
    return { success: false, error: 'MAILEROO_API_KEY is not configured' };
  }

  const fromFormatted = (opts.from || (typeof import.meta !== 'undefined' && import.meta.env?.SMTP_FROM) || DEFAULT_FROM).trim();

  try {
    const payload = new URLSearchParams({
      from: fromFormatted,
      to: opts.to.trim(),
      subject: opts.subject.trim(),
      html: opts.html,
      plain: opts.text,
    });

    const res = await fetch('https://smtp.maileroo.com/send', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.success) {
      return { success: true, messageId: data?.data?.message_id || 'maileroo_ok' };
    }

    return {
      success: false,
      error: data?.message || `HTTP ${res.status}: Failed to send email via Maileroo`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error reaching Maileroo' };
  }
}

/**
 * High-converting luxury scripture verse sharing email template
 */
export async function sendScriptureShareEmail(opts: SendScriptureEmailOptions): Promise<{ success: boolean; error?: string }> {
  const senderDisplay = opts.senderName ? `${opts.senderName} via AduBible` : 'AduBible Scripture Study';
  const subject = opts.subject || `Scripture for You: ${opts.verseReference} (${opts.versionName})`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${opts.verseReference}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f5f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0a09; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1c1917; border: 1px solid #292524; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #451a03 0%, #1c1917 100%); padding: 32px 28px; text-align: center; border-bottom: 1px solid #78350f;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #fef3c7; letter-spacing: 0.05em; text-transform: uppercase;">AduBible</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #d97706; letter-spacing: 0.1em; text-transform: uppercase;">Honoring the Legacy of Apostle Kwame Adu</p>
            </td>
          </tr>

          <!-- Verse Card Body -->
          <tr>
            <td style="padding: 36px 32px;">
              ${opts.personalNote ? `
                <div style="background-color: #292524; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px; font-style: italic; color: #d6d3d1; font-size: 14px;">
                  "${opts.personalNote}"
                  <div style="margin-top: 4px; font-size: 12px; color: #a8a29e; font-style: normal; font-weight: 600;">— ${opts.senderName || 'A friend'}</div>
                </div>
              ` : ''}

              <div style="font-size: 13px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px;">
                ${opts.versionName} • SCRIPTURE
              </div>

              <blockquote style="margin: 0; padding: 0; font-size: 21px; line-height: 1.65; color: #fafaf9; font-serif; font-style: normal; border: none;">
                “${opts.verseText}”
              </blockquote>

              <div style="margin-top: 20px; font-size: 16px; font-weight: 700; color: #fbbf24;">
                — ${opts.verseReference}
              </div>

              <!-- CTA Button -->
              <div style="margin-top: 36px; text-align: center;">
                <a href="https://adubible.org" target="_blank" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 9999px; letter-spacing: 0.03em; box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.3);">
                  Read Parallel Scriptures on AduBible.org
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #141210; border-top: 1px solid #292524; text-align: center; font-size: 12px; color: #78716c; line-height: 1.5;">
              <p style="margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} AduBible (<a href="https://adubible.org" style="color: #fbbf24; text-decoration: underline;">adubible.org</a>) · Dedicated to Humanity; A Global Ministry of Apostle Kwame Adu · <a href="https://nsuhia.com" target="_blank" rel="noopener noreferrer" style="color: #a8a29e; text-decoration: underline;">Nsuhia, Ghana ↗</a> · 100% Ads-Free Reading Experience.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `${opts.verseReference} (${opts.versionName})\n\n"${opts.verseText}"\n\n${opts.personalNote ? `Note: ${opts.personalNote}\n\n` : ''}Read parallel scriptures on AduBible: https://adubible.org`;

  return sendMailerooEmail({
    to: opts.to,
    subject,
    html,
    text,
    from: `AduBible <no-reply@adubible.org>`,
  });
}
