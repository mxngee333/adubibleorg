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
  replyTo?: string;
}

export interface SendDonationReceiptOptions {
  to: string;
  donorName?: string;
  amount: number;
  currency?: string;
  frequency?: 'once' | 'monthly';
  designation?: string;
  transactionId?: string;
  prayerRequest?: string;
}

const DEFAULT_FROM = 'Apostle Kwame Adu <pastor@adubible.org>';
const DEFAULT_REPLY_TO = 'pastor@adubible.org';

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

  const fromFormatted = (
    opts.from ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SMTP_FROM) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.SMTP_FROM) ||
    DEFAULT_FROM
  ).trim();

  const replyToFormatted = (
    opts.replyTo ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REPLY_TO) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.REPLY_TO) ||
    DEFAULT_REPLY_TO
  ).trim();

  try {
    const payload = new URLSearchParams({
      from: fromFormatted,
      to: opts.to.trim(),
      subject: opts.subject.trim(),
      html: opts.html,
      plain: opts.text,
      reply_to: replyToFormatted,
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
      return { success: true, messageId: data?.data?.reference_id || data?.data?.message_id || 'maileroo_ok' };
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
 * High-deliverability Primary-Inbox Offering Receipt & Pastoral Blessing Email
 * Formatted as a personal pastoral letter from Apostle Kwame Adu (Primary Tab optimized).
 */
export async function sendDonationReceiptEmail(opts: SendDonationReceiptOptions): Promise<{ success: boolean; error?: string }> {
  const donorNameClean = (opts.donorName || 'Beloved Scripture Partner').trim();
  const currencyClean = (opts.currency || 'USD').toUpperCase();
  const amountFormatted = opts.amount.toFixed(2);
  const frequencyLabel = opts.frequency === 'monthly' ? 'Monthly Sustaining Covenant Partner' : 'One-Time Seed Offering';
  const designationClean = opts.designation || 'General Scripture Distribution Mission';
  const txIdClean = opts.transactionId || `ADU-${Date.now().toString(36).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const subject = `Your AduBible Offering Receipt & Blessing (${currencyClean} ${amountFormatted})`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Offering Receipt - AduBible</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; line-height: 1.65;">
  <div style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Grace and peace to you, ${donorNameClean}. Thank you for your faithful offering of ${currencyClean} ${amountFormatted} supporting 100% ad-free Scripture across 35+ languages.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f4; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <!-- Header Note -->
          <tr>
            <td style="padding: 28px 24px 16px; border-bottom: 1px solid #f5f5f4;">
              <div style="font-size: 13px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                AduBible Scripture Sanctuary
              </div>
              <div style="font-size: 12px; color: #78716c;">
                A Global Scripture Mission in Honor of Apostle Kwame Adu · Nsuhia, Ghana
              </div>
            </td>
          </tr>

          <!-- Letter Body -->
          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 16px; margin: 0 0 16px; color: #1c1917;">
                Grace and peace to you in Christ Jesus, <strong>${donorNameClean}</strong>,
              </p>

              <p style="font-size: 15px; color: #292524; margin: 0 0 16px;">
                I am writing to personally thank you for your generous offering of <strong>${currencyClean} ${amountFormatted}</strong>. Because of your sacrificial seed, the Holy Scriptures remain <strong>100% free, unmonetized, and without commercial advertisement</strong> for over 4 billion souls worldwide across 35+ languages and dialects.
              </p>

              <!-- Transaction Summary Box -->
              <table role="presentation" width="100%" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; margin: 20px 0; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 14px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Offering Amount</td>
                  <td style="padding: 10px 14px; font-weight: 700; color: #b45309; text-align: right; border-bottom: 1px solid #e7e5e4;">${currencyClean} ${amountFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Gift Frequency</td>
                  <td style="padding: 10px 14px; color: #1c1917; text-align: right; border-bottom: 1px solid #e7e5e4;">${frequencyLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Mission Allocation</td>
                  <td style="padding: 10px 14px; color: #1c1917; text-align: right; border-bottom: 1px solid #e7e5e4;">${designationClean}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Reference Number</td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #44403c; text-align: right; border-bottom: 1px solid #e7e5e4;">${txIdClean}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #78716c;">Receipt Date</td>
                  <td style="padding: 10px 14px; color: #1c1917; text-align: right;">${currentDate}</td>
                </tr>
              </table>

              ${opts.prayerRequest ? `
                <div style="background-color: #fef3c7; border-left: 3px solid #b45309; padding: 12px 14px; border-radius: 6px; margin: 18px 0; font-size: 13px; color: #78350f;">
                  <strong>Prayer Request Received:</strong> "${opts.prayerRequest}"<br>
                  <em>Our intercessory pastoral team has laid this petition before the Lord on our prayer wall.</em>
                </div>
              ` : ''}

              <!-- Scripture Blessing -->
              <blockquote style="margin: 22px 0; padding: 14px 18px; background-color: #fafaf9; border-left: 3px solid #b45309; color: #1c1917; font-size: 14px; font-style: italic; line-height: 1.6;">
                &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. And God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work.&rdquo;
                <div style="margin-top: 6px; font-size: 12px; font-weight: 700; color: #b45309; font-style: normal;">
                  &mdash; 2 Corinthians 9:7&ndash;8
                </div>
              </blockquote>

              <p style="font-size: 14px; color: #44403c; margin: 16px 0;">
                If you ever need prayer, biblical counsel, or have questions regarding our ongoing translation and rural distribution efforts in Ghana and worldwide, simply <strong>hit reply to this email</strong>. I read and answer every message personally.
              </p>

              <!-- Personal Sign-Off -->
              <div style="margin-top: 24px; font-size: 14px; color: #1c1917; line-height: 1.5;">
                Yours in Christ Jesus,<br>
                <strong style="font-size: 15px; color: #1c1917;">Apostle Kwame Adu</strong><br>
                <span style="font-size: 13px; color: #78716c;">AduBible Scripture Sanctuary · Nsuhia, Ghana</span><br>
                <a href="https://adubible.org" style="color: #b45309; text-decoration: none; font-size: 13px;">adubible.org</a>
              </div>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 16px 24px; background-color: #fafaf9; border-top: 1px solid #f5f5f4; text-align: center; font-size: 11px; color: #a8a29e; line-height: 1.5;">
              This email serves as your official electronic donation receipt.<br>
              AduBible Gospel Mission · Dedicated to Humanity · 100% Ads-Free Covenant.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `AduBible Offering Receipt & Blessing

Dear ${donorNameClean},

Grace and peace to you in Christ Jesus.

I am writing to personally thank you for your generous offering of ${currencyClean} ${amountFormatted}. Because of your sacrificial seed, God's Word remains 100% free, unmonetized, and without commercial advertisement for over 4 billion souls worldwide across 35+ languages.

RECEIPT SUMMARY:
- Amount: ${currencyClean} ${amountFormatted}
- Frequency: ${frequencyLabel}
- Designation: ${designationClean}
- Reference No: ${txIdClean}
- Date: ${currentDate}
${opts.prayerRequest ? `\nPrayer Request: "${opts.prayerRequest}" (Placed on our intercessory altar)\n` : ''}
"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. And God is able to bless you abundantly..." — 2 Corinthians 9:7-8

If you ever need prayer or biblical counsel, simply reply directly to this email.

Yours in Christ Jesus,
Apostle Kwame Adu
AduBible Scripture Sanctuary · Nsuhia, Ghana
https://adubible.org

(This message serves as your official electronic donation receipt)`;

  return sendMailerooEmail({
    to: opts.to,
    subject,
    html,
    text,
    from: DEFAULT_FROM,
    replyTo: DEFAULT_REPLY_TO,
  });
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
    from: DEFAULT_FROM,
    replyTo: DEFAULT_REPLY_TO,
  });
}
