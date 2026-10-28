/**
 * ADUBIBLE / ELOHIM BIBLE HUB — NEWSLETTER & DAILY SCRIPTURE SUBSCRIPTION SERVICE
 * Manages minimalist email signup at footer with Firestore persistence, LocalStorage state, and Maileroo welcome email.
 */

import { doc, setDoc } from 'firebase/firestore';
import { initFirebaseIfConfigured } from './firebaseSyncService';
import { sendMailerooEmail } from './mailerooService';

const LS_NEWSLETTER_KEY = 'adubible_newsletter_subscriber_v1';

export interface NewsletterSubscriber {
  firstName: string;
  email: string;
  subscribedAt: string;
  source?: string;
}

export function getLocalNewsletterSubscription(): NewsletterSubscriber | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_NEWSLETTER_KEY);
    return raw ? (JSON.parse(raw) as NewsletterSubscriber) : null;
  } catch {
    return null;
  }
}

export async function subscribeToNewsletter(
  firstName: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const cleanName = firstName.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    return { success: false, error: 'Please enter your first name.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const record: NewsletterSubscriber = {
    firstName: cleanName,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    source: 'footer_signup',
  };

  // 1. Save to LocalStorage immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LS_NEWSLETTER_KEY, JSON.stringify(record));
    } catch {}
  }

  // 2. Persist to Firestore (if configured)
  try {
    const { db } = initFirebaseIfConfigured();
    if (db) {
      const emailDocId = cleanEmail.replace(/[^a-z0-9_.-]/g, '_');
      await setDoc(
        doc(db, 'newsletter_subscribers', emailDocId),
        {
          firstName: cleanName,
          email: cleanEmail,
          source: 'footer_signup',
          createdAt: new Date().toISOString(),
          active: true,
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('[Newsletter] Cloud sync notice:', err);
  }

  // 3. Dispatch reverent personal welcome email via Maileroo (Primary Inbox Optimized)
  try {
    const welcomeSubject = `Grace and peace to you, ${cleanName} — Welcome to AduBible`;
    const welcomeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to AduBible</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; line-height: 1.65;">
  <div style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Grace and peace to you, ${cleanName}. I am honored to welcome you into our Scripture sanctuary family.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f4; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <!-- Pastoral Header -->
          <tr>
            <td style="padding: 28px 24px 16px; border-bottom: 1px solid #f5f5f4;">
              <div style="font-size: 13px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                AduBible Scripture Sanctuary
              </div>
              <div style="font-size: 12px; color: #78716c;">
                The Living Word · A Ministry in Honor of Apostle Kwame Adu · Nsuhia, Ghana
              </div>
            </td>
          </tr>

          <!-- Letter Body -->
          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 16px; margin: 0 0 16px; color: #1c1917;">
                Grace and peace to you, <strong>${cleanName}</strong>,
              </p>

              <p style="font-size: 15px; color: #292524; margin: 0 0 16px;">
                I am so glad to welcome you into the AduBible family. God&apos;s Word is a living fountain, and our sacred covenant is to provide it <strong>100% free, unmonetized, and without commercial advertisement</strong> to every searching soul across 35+ languages and dialects.
              </p>

              <p style="font-size: 15px; color: #292524; margin: 0 0 16px;">
                As part of our fellowship, you will receive reverent scripture passages, parallel language study (including Asante Twi, Akuapem, Ewe, Greek Textus Receptus, and Hebrew Masoretic codices), and historical commentaries to enrich your walk with God.
              </p>

              <!-- Scripture Anchor -->
              <blockquote style="margin: 22px 0; padding: 14px 18px; background-color: #fafaf9; border-left: 3px solid #b45309; color: #1c1917; font-size: 14px; font-style: italic; line-height: 1.6;">
                &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
                <div style="margin-top: 6px; font-size: 12px; font-weight: 700; color: #b45309; font-style: normal;">
                  &mdash; Psalm 119:105 · Dwom 119:105
                </div>
              </blockquote>

              <p style="font-size: 15px; color: #292524; margin: 0 0 16px;">
                Most importantly: if you ever have a personal prayer request, a spiritual question, or need encouragement in your walk, <strong>simply hit reply directly to this email</strong>. I read and answer every message from our readers personally.
              </p>

              <!-- Personal Sign-Off -->
              <div style="margin-top: 24px; font-size: 14px; color: #1c1917; line-height: 1.5;">
                With pastoral love and blessings in Christ,<br>
                <strong style="font-size: 15px; color: #1c1917;">Apostle Kwame Adu</strong><br>
                <span style="font-size: 13px; color: #78716c;">AduBible Scripture Sanctuary · Nsuhia, Ghana</span><br>
                <a href="https://adubible.org" style="color: #b45309; text-decoration: none; font-size: 13px;">adubible.org</a>
              </div>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 16px 24px; background-color: #fafaf9; border-top: 1px solid #f5f5f4; text-align: center; font-size: 11px; color: #a8a29e; line-height: 1.5;">
              © ${new Date().getFullYear()} AduBible (<a href="https://adubible.org" style="color: #b45309; text-decoration: none;">adubible.org</a>) · Dedicated to Humanity · 100% Ads-Free Covenant.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const welcomeText = `Grace and peace to you, ${cleanName}!

I am so glad to welcome you into the AduBible family.

God's Word is a living fountain, and our sacred covenant is to provide it 100% free, unmonetized, and without commercial advertisement to every searching soul across 35+ languages.

"Your word is a lamp to my feet and a light to my path." — Psalm 119:105 (Dwom 119:105)

Most importantly: if you ever have a personal prayer request, a spiritual burden, or need encouragement in your walk, simply reply directly to this email. I read and hold our readers in prayer personally.

With pastoral love and blessings in Christ,
Apostle Kwame Adu
AduBible Scripture Sanctuary · Nsuhia, Ghana
https://adubible.org`;

    await sendMailerooEmail({
      to: cleanEmail,
      subject: welcomeSubject,
      html: welcomeHtml,
      text: welcomeText,
      from: 'Apostle Kwame Adu <pastor@adubible.org>',
      replyTo: 'pastor@adubible.org',
    });
  } catch (mailErr) {
    console.warn('[Newsletter] Welcome email dispatch notice:', mailErr);
  }

  return { success: true };
}
