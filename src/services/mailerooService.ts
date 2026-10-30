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
  subject?: string;
}

const DEFAULT_FROM = 'AduBible <info@adubible.org>';
const DEFAULT_REPLY_TO = 'info@adubible.org';

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

  const currencySymbol = currencyClean === 'USD' ? '$' : currencyClean === 'EUR' ? '€' : currencyClean === 'GBP' ? '£' : `${currencyClean} `;

  // Updates Tab Route (Path B): Explicit Receipt and formatted amount triggers Gmail's transactional parser
  const subject = opts.subject || `Receipt (${currencySymbol}${amountFormatted}) - Stand with the Word of God`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Donation Receipt (${currencySymbol}${amountFormatted}) — AduBible Stewardship Record</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c241b; line-height: 1.65;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f6f8f5; padding: 28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #dfe5dc; border-top: 4px solid #8EA486; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 6px rgba(23, 29, 23, 0.04);">
          <!-- Header with Logo Mark and Brand Colors -->
          <tr>
            <td style="padding: 22px 28px 18px; border-bottom: 1px solid #edf2eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="https://adubible.org/brand/icon-128.png" alt="AduBible Logo" width="34" height="34" style="display: inline-block; vertical-align: middle; border-radius: 6px; margin-right: 10px;" />
                    <span style="font-size: 20px; font-weight: 700; font-family: Georgia, serif; vertical-align: middle;">
                      <span style="color: #8EA486;">Adu</span><span style="color: #B8AC94;">Bible</span><span style="color: #8E968D; font-size: 14px; font-weight: 600;">.org</span>
                    </span>
                  </td>
                  <td style="text-align: right; vertical-align: middle; font-size: 12px; font-weight: 600; color: #677953; letter-spacing: 0.04em;">
                    Official Stewardship Receipt
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Letter Body -->
          <tr>
            <td style="padding: 28px 28px 24px;">
              <p style="font-size: 16px; margin: 0 0 16px; color: #171d17;">
                Grace, peace, and manifold blessings to you, <strong>${donorNameClean}</strong>,
              </p>

              <p style="font-size: 15px; color: #2d3729; margin: 0 0 16px; line-height: 1.7;">
                Thank you for your generous seed offering of <strong>${currencySymbol}${amountFormatted}</strong>. Please find your official electronic donation receipt and stewardship summary below for your personal and tax records.
              </p>

              <p style="font-size: 15px; color: #2d3729; margin: 0 0 16px; line-height: 1.7;">
                Because of your sacrificial support, the Holy Scriptures remain <strong>100% free, unmonetized, and completely unhindered by commercial advertisements</strong> for millions of souls worldwide across 35+ languages.
              </p>

              <p style="font-size: 15px; color: #2d3729; margin: 0 0 20px; line-height: 1.7;">
                Your partnership directly supports the ongoing gospel translation work and rural Scripture distribution planted in Nsuhia, Ghana, bringing God's Word to students, rural villages, and believers seeking truth.
              </p>

              <!-- Official Offering Record in AduBible Brand Palette -->
              <table role="presentation" width="100%" style="background-color: #fbfcfb; border: 1px solid #e1e7de; border-radius: 8px; margin: 22px 0; font-size: 14px; border-collapse: collapse;">
                <tr style="background-color: #f1f5ef;">
                  <td colspan="2" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #677953; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e1e7de;">
                    Offering Record &amp; Stewardship Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966; border-bottom: 1px solid #edf2eb;">Amount Contributed</td>
                  <td style="padding: 10px 14px; font-weight: 700; color: #677953; text-align: right; border-bottom: 1px solid #edf2eb;">${currencyClean} ${amountFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966; border-bottom: 1px solid #edf2eb;">Gift Frequency</td>
                  <td style="padding: 10px 14px; color: #171d17; text-align: right; border-bottom: 1px solid #edf2eb;">${frequencyLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966; border-bottom: 1px solid #edf2eb;">Mission Focus</td>
                  <td style="padding: 10px 14px; color: #171d17; text-align: right; border-bottom: 1px solid #edf2eb;">${designationClean}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966; border-bottom: 1px solid #edf2eb;">Reference Code</td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #2d3729; text-align: right; border-bottom: 1px solid #edf2eb;">${txIdClean}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966;">Record Date</td>
                  <td style="padding: 10px 14px; color: #171d17; text-align: right;">${currentDate}</td>
                </tr>
              </table>

              ${opts.prayerRequest ? `
                <div style="background-color: #fbfcfb; border: 1px solid #e1e7de; border-left: 4px solid #8EA486; padding: 12px 16px; border-radius: 6px; margin: 18px 0; font-size: 13px; color: #20271f;">
                  <strong style="color: #677953;">Prayer Request Received:</strong> "${opts.prayerRequest}"<br>
                  <em style="color: #6a7966; font-size: 12px;">Our intercessory pastoral team has laid this petition before the Lord on our prayer altar.</em>
                </div>
              ` : ''}

              <!-- Scripture Blessing in Brand Tone -->
              <blockquote style="margin: 22px 0; padding: 14px 18px; background-color: #f8faf7; border-left: 4px solid #8EA486; color: #20271f; font-size: 14px; font-style: italic; line-height: 1.65;">
                &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. And God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work.&rdquo;
                <div style="margin-top: 6px; font-size: 12px; font-weight: 700; color: #8EA486; font-style: normal;">
                  &mdash; 2 Corinthians 9:7&ndash;8
                </div>
              </blockquote>

              <p style="font-size: 15px; color: #2d3729; margin: 20px 0 16px; line-height: 1.7;">
                If you ever have a personal prayer request, a biblical question, or simply need spiritual encouragement, <strong>please hit reply directly to this message</strong>. I read and hold our partners in prayer personally.
              </p>

              <!-- Personal Sign-Off -->
              <div style="margin-top: 28px; font-size: 15px; color: #171d17; line-height: 1.6;">
                With deep pastoral gratitude and prayers,<br>
                <strong style="color: #171d17; font-size: 16px;">Apostle Kwame Adu</strong><br>
                <span style="font-size: 13px; color: #6a7966;">AduBible Scripture Sanctuary &middot; Nsuhia, Ghana</span><br>
                <a href="https://adubible.org" style="color: #677953; text-decoration: none; font-size: 13px; font-weight: 600;">adubible.org &rarr;</a>
              </div>
            </td>
          </tr>

          <!-- Minimal Footer with Brand Colors -->
          <tr>
            <td style="padding: 16px 28px; background-color: #f6f8f5; border-top: 1px solid #edf2eb; text-align: center; font-size: 11px; color: #8E968D; line-height: 1.5;">
              Official Electronic Donation Record &middot; AduBible Scripture Mission<br>
              Dedicated to Humanity &middot; 100% Ads-Free Covenant &middot; <a href="https://adubible.org" style="color: #8EA486;">adubible.org</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `Grace, peace, and manifold blessings to you, ${donorNameClean},

I am writing to you with a heart full of thanksgiving. Because of your sacrificial seed of ${currencyClean} ${amountFormatted}, the Holy Scriptures remain 100% free, unmonetized, and completely unhindered by commercial advertisements for millions of souls worldwide across 35+ languages.

OFFERING RECORD & STEWARDSHIP SUMMARY:
- Amount Contributed: ${currencyClean} ${amountFormatted}
- Gift Frequency: ${frequencyLabel}
- Mission Focus: ${designationClean}
- Reference Code: ${txIdClean}
- Record Date: ${currentDate}
${opts.prayerRequest ? `\nPrayer Request: "${opts.prayerRequest}" (Placed on our prayer altar)\n` : ''}
"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. And God is able to bless you abundantly..." — 2 Corinthians 9:7-8

If you ever have a personal prayer request or simply need spiritual encouragement, please reply directly to this message. I read and hold our partners in prayer personally.

With deep pastoral gratitude and prayers,
Apostle Kwame Adu
AduBible Scripture Sanctuary · Nsuhia, Ghana
https://adubible.org`;

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
                © ${new Date().getFullYear()} <a href="https://adubible.org" style="color: #fbbf24; text-decoration: underline; font-weight: 700;">AduBible.org</a> · Dedicated to Humanity; A Global Ministry of Apostle Kwame Adu · <a href="https://nsuhia.com" target="_blank" rel="noopener noreferrer" style="color: #a8a29e; text-decoration: underline;">Nsuhia, Ghana ↗</a> · 100% Ads-Free Reading Experience.
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
