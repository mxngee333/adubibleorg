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

  // 3. Dispatch reverent welcome email via Maileroo (fire-and-forget)
  try {
    sendMailerooEmail({
      to: cleanEmail,
      subject: `Welcome to AduBible Daily Scripture, ${cleanName}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to AduBible</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f5f5f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0a09; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1c1917; border: 1px solid #292524; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 32px 28px; text-align: center; border-bottom: 1px solid #44403c;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #fef08a; letter-spacing: 0.08em; text-transform: uppercase;">✦ AduBible ✦</h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #a8a29e;">The Living Word · Multilingual Scripture Sanctuary</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #fafaf9; line-height: 1.6;">
                Grace and peace to you, <strong>${cleanName}</strong>!
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #d6d3d1; line-height: 1.6;">
                Welcome to AduBible Daily Scripture. You will receive a reverent daily passage with parallel language study, Strong's Greek &amp; Hebrew concordance insights, and historical exegesis — 100% free and ads-free.
              </p>
              <div style="background-color: #292524; border-left: 3px solid #f59e0b; padding: 18px 20px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-style: italic; font-size: 15px; color: #fafaf9; line-height: 1.6;">
                  &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
                </p>
                <div style="font-size: 12px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em;">
                  Psalm 119:105 · Dwom 119:105
                </div>
              </div>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #a8a29e; line-height: 1.6;">
                Read, listen, and compare Scripture in parallel anytime across 35+ languages &amp; Asante Twi at <a href="https://adubible.org/" style="color: #f59e0b; text-decoration: underline;">adubible.org</a>.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: #f59e0b;">
                    <a href="https://adubible.org/" target="_blank" style="font-size: 13px; font-weight: 700; color: #0c0a09; text-decoration: none; padding: 12px 26px; display: inline-block; border-radius: 8px; letter-spacing: 0.04em;">
                      Open Scripture Sanctuary →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 28px; background-color: #141210; border-top: 1px solid #292524; text-align: center; font-size: 11px; color: #78716c;">
              © AduBible.org · Dedicated to Humanity in support of Apostle Kwame Adu · Nsuhia, Ghana.
              <br>Zero Ads · Zero Commercial Tracking · 100% Free
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `Grace and peace to you, ${cleanName}!\n\nWelcome to AduBible Daily Scripture. You will receive a reverent daily passage with parallel language study, Strong's Greek & Hebrew insights, and historical exegesis.\n\n"Your word is a lamp to my feet and a light to my path." — Psalm 119:105\n\nStudy anytime at https://adubible.org/`,
    }).catch(() => {});
  } catch {}

  return { success: true };
}
