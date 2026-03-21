import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || '');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wisery.live';

// ═══════════ Mail Addresses ═══════════
// info@wisery.live  — General notifications, welcome, verification
// vote@wisery.live   — Vote notifications
// earn@wisery.live   — Earnings, rewards, achievements
// ask@wisery.live    — Question & poll notifications
// admin@wisery.live  — Only address that accepts incoming mail
// All others are no-reply (incoming discarded)

const MAIL_FROM = {
  info: '"Wisery" <info@wisery.live>',
  vote: '"Wisery Vote" <vote@wisery.live>',
  earn: '"Wisery Earn" <earn@wisery.live>',
  ask:  '"Wisery Ask" <ask@wisery.live>',
};

// ═══════════ Base Template ═══════════

function baseTemplate(content: string, accentColor: string, footerText: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 24px;">
  <!-- Header -->
  <div style="text-align:center;margin-bottom:28px;">
    <div style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);width:48px;height:48px;border-radius:12px;line-height:48px;font-size:24px;color:#fff;font-weight:bold;">W</div>
    <h1 style="color:#f59e0b;font-size:24px;margin:8px 0 0;letter-spacing:-0.5px;">Wisery</h1>
    <p style="color:#6b6560;font-size:12px;margin:2px 0 0;">Ask. Vote. Earn.</p>
  </div>

  <!-- Content Card -->
  <div style="background:#12121e;border:1px solid #1e1e30;border-radius:16px;padding:28px;margin-bottom:24px;">
    ${content}
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:16px 0;">
    <p style="color:#4a4540;font-size:11px;margin:0 0 8px;">${footerText}</p>
    <p style="color:#3a3530;font-size:10px;margin:0;">
      <a href="${APP_URL}" style="color:#f59e0b;text-decoration:none;">wisery.live</a> — The Wisdom of the Crowd
    </p>
    <p style="color:#2a2520;font-size:9px;margin:8px 0 0;">
      This is an automated message. Please do not reply to this email.
    </p>
  </div>
</div>
</body>
</html>`;
}

// ═══════════ Utility ═══════════

export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ═══════════ INFO@wisery.live — General ═══════════

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🔐</div>
      <h2 style="color:#fff;font-size:20px;margin:0 0 8px;">Verify Your Email</h2>
      <p style="color:#9a958f;font-size:13px;margin:0 0 20px;line-height:1.5;">
        Enter this 6-digit code to verify your account and unlock all Wisery features.
      </p>
      <div style="background:#0a0a14;border:2px solid #f59e0b;border-radius:12px;padding:20px;margin:0 auto;max-width:280px;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#f59e0b;">${code}</span>
      </div>
      <p style="color:#4a4540;font-size:11px;margin:16px 0 0;">
        ⏱ This code expires in 15 minutes
      </p>
    </div>`;

  return send(MAIL_FROM.info, email, `Your Wisery Verification Code: ${code}`, content, 'Verify your email to start using Wisery');
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🎉</div>
      <h2 style="color:#fff;font-size:20px;margin:0 0 8px;">Welcome to Wisery, ${name}!</h2>
      <p style="color:#9a958f;font-size:13px;margin:0 0 24px;line-height:1.5;">
        Your email is verified. You're now part of the crowd wisdom community.
        Connect your wallet to start voting, predicting, and earning WSR tokens.
      </p>
      <div style="margin-bottom:16px;">
        <a href="${APP_URL}/wallet" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">
          Connect Wallet
        </a>
      </div>
      <div style="display:flex;justify-content:center;gap:24px;margin-top:20px;">
        <div style="text-align:center;">
          <div style="font-size:22px;">🗳️</div>
          <p style="color:#6b6560;font-size:11px;margin:4px 0 0;">Vote</p>
        </div>
        <div style="text-align:center;">
          <div style="font-size:22px;">📊</div>
          <p style="color:#6b6560;font-size:11px;margin:4px 0 0;">Predict</p>
        </div>
        <div style="text-align:center;">
          <div style="font-size:22px;">💰</div>
          <p style="color:#6b6560;font-size:11px;margin:4px 0 0;">Earn WSR</p>
        </div>
      </div>
    </div>`;

  return send(MAIL_FROM.info, email, `Welcome to Wisery, ${name}!`, content, 'You successfully joined Wisery');
}

// ═══════════ VOTE@wisery.live — Vote Notifications ═══════════

export async function sendVoteConfirmation(email: string, questionTitle: string, optionText: string, xpEarned: number, questionId: string): Promise<boolean> {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🗳️</div>
      <h2 style="color:#fff;font-size:18px;margin:0 0 12px;">Vote Recorded!</h2>
      <div style="background:#0a0a14;border-radius:10px;padding:16px;margin:0 0 16px;text-align:left;">
        <p style="color:#6b6560;font-size:11px;margin:0 0 4px;">QUESTION</p>
        <p style="color:#fff;font-size:14px;margin:0 0 12px;font-weight:600;">${questionTitle}</p>
        <p style="color:#6b6560;font-size:11px;margin:0 0 4px;">YOUR VOTE</p>
        <p style="color:#f59e0b;font-size:14px;margin:0;font-weight:600;">✓ ${optionText}</p>
      </div>
      <div style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.05));border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px;">
        <p style="color:#10b981;font-size:14px;font-weight:bold;margin:0;">+${xpEarned} XP earned!</p>
      </div>
      <div style="margin-top:16px;">
        <a href="${APP_URL}/questions/${questionId}" style="color:#f59e0b;font-size:13px;text-decoration:none;font-weight:600;">
          View Results →
        </a>
      </div>
    </div>`;

  return send(MAIL_FROM.vote, email, `Vote Recorded: "${questionTitle}"`, content, 'Your vote has been recorded on Wisery');
}

export async function sendVoteMilestone(email: string, totalVotes: number, questionTitle: string): Promise<boolean> {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">📊</div>
      <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Vote Milestone!</h2>
      <p style="color:#9a958f;font-size:13px;margin:0 0 16px;">
        Your question hit <span style="color:#f59e0b;font-weight:bold;">${totalVotes} votes</span>!
      </p>
      <div style="background:#0a0a14;border-radius:10px;padding:16px;margin:0 0 16px;">
        <p style="color:#fff;font-size:14px;margin:0;font-weight:600;">"${questionTitle}"</p>
      </div>
      <a href="${APP_URL}" style="color:#f59e0b;font-size:13px;text-decoration:none;">See full breakdown →</a>
    </div>`;

  return send(MAIL_FROM.vote, email, `Your question hit ${totalVotes} votes!`, content, 'Your Wisery question is getting traction');
}

// ═══════════ EARN@wisery.live — Rewards & Earnings ═══════════

export async function sendEarnNotification(email: string, amount: number, reason: string, totalXp: number, level: number): Promise<boolean> {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">💰</div>
      <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">You Earned Rewards!</h2>
      <div style="background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(234,88,12,0.1));border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:20px;margin:0 0 16px;">
        <p style="color:#f59e0b;font-size:32px;font-weight:bold;margin:0;">+${amount} XP</p>
        <p style="color:#9a958f;font-size:12px;margin:4px 0 0;">${reason}</p>
      </div>
      <div style="display:flex;justify-content:center;gap:32px;">
        <div>
          <p style="color:#6b6560;font-size:11px;margin:0;">Total XP</p>
          <p style="color:#fff;font-size:16px;font-weight:bold;margin:2px 0 0;">${totalXp.toLocaleString()}</p>
        </div>
        <div>
          <p style="color:#6b6560;font-size:11px;margin:0;">Level</p>
          <p style="color:#f59e0b;font-size:16px;font-weight:bold;margin:2px 0 0;">${level}</p>
        </div>
      </div>
    </div>`;

  return send(MAIL_FROM.earn, email, `You earned +${amount} XP on Wisery!`, content, 'Your Wisery earnings update');
}

export async function sendPredictionWin(email: string, questionTitle: string, wsrAmount: number, outcome: string): Promise<boolean> {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🏆</div>
      <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Prediction Won!</h2>
      <p style="color:#9a958f;font-size:13px;margin:0 0 16px;">Your prediction was correct!</p>
      <div style="background:#0a0a14;border-radius:10px;padding:16px;margin:0 0 12px;text-align:left;">
        <p style="color:#6b6560;font-size:11px;margin:0 0 4px;">QUESTION</p>
        <p style="color:#fff;font-size:13px;margin:0 0 10px;">${questionTitle}</p>
        <p style="color:#6b6560;font-size:11px;margin:0 0 4px;">OUTCOME</p>
        <p style="color:#10b981;font-size:13px;margin:0;font-weight:600;">✓ ${outcome}</p>
      </div>
      <div style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05));border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:20px;">
        <p style="color:#10b981;font-size:28px;font-weight:bold;margin:0;">+${wsrAmount} WSR</p>
        <p style="color:#6b6560;font-size:11px;margin:4px 0 0;">Added to your wallet</p>
      </div>
    </div>`;

  return send(MAIL_FROM.earn, email, `You won ${wsrAmount} WSR!`, content, 'Congratulations on your correct prediction');
}

export async function sendPredictionLoss(email: string, questionTitle: string, outcome: string): Promise<boolean> {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">📉</div>
      <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Prediction Result</h2>
      <p style="color:#9a958f;font-size:13px;margin:0 0 16px;">This one didn't go your way, but there's always next time!</p>
      <div style="background:#0a0a14;border-radius:10px;padding:16px;margin:0 0 12px;text-align:left;">
        <p style="color:#6b6560;font-size:11px;margin:0 0 4px;">QUESTION</p>
        <p style="color:#fff;font-size:13px;margin:0 0 10px;">${questionTitle}</p>
        <p style="color:#6b6560;font-size:11px;margin:0 0 4px;">CORRECT OUTCOME</p>
        <p style="color:#ef4444;font-size:13px;margin:0;font-weight:600;">${outcome}</p>
      </div>
      <a href="${APP_URL}/predictions" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;margin-top:8px;">
        Try Again
      </a>
    </div>`;

  return send(MAIL_FROM.earn, email, `Prediction Result: "${questionTitle}"`, content, 'Your prediction result on Wisery');
}

export async function sendAchievementUnlocked(email: string, achievementName: string, achievementIcon: string, rarity: string): Promise<boolean> {
  const rarityColors: Record<string, string> = {
    common: '#9a958f',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };
  const color = rarityColors[rarity] || '#9a958f';

  const content = `
    <div style="text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">${achievementIcon}</div>
      <h2 style="color:#fff;font-size:18px;margin:0 0 4px;">Achievement Unlocked!</h2>
      <p style="color:${color};font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">${rarity}</p>
      <div style="background:#0a0a14;border:2px solid ${color};border-radius:12px;padding:20px;margin:0 auto;max-width:280px;">
        <p style="color:#fff;font-size:16px;font-weight:bold;margin:0;">${achievementName}</p>
      </div>
      <a href="${APP_URL}/earn" style="display:block;color:#f59e0b;font-size:13px;text-decoration:none;margin-top:16px;">View all achievements →</a>
    </div>`;

  return send(MAIL_FROM.earn, email, `Achievement Unlocked: ${achievementName}!`, content, 'You earned a new achievement on Wisery');
}

// ═══════════ ASK@wisery.live — Question & Poll Notifications ═══════════

export async function sendQuestionCreated(email: string, title: string, category: string, questionId: string): Promise<boolean> {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">❓</div>
      <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Question Published!</h2>
      <p style="color:#9a958f;font-size:13px;margin:0 0 16px;">Your question is now live and ready for votes.</p>
      <div style="background:#0a0a14;border-radius:10px;padding:16px;margin:0 0 16px;text-align:left;">
        <p style="color:#6b6560;font-size:11px;margin:0 0 4px;">YOUR QUESTION</p>
        <p style="color:#fff;font-size:14px;margin:0 0 10px;font-weight:600;">${title}</p>
        <span style="display:inline-block;background:rgba(245,158,11,0.1);color:#f59e0b;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;">${category}</span>
      </div>
      <div style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.05));border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:12px;margin-bottom:12px;">
        <p style="color:#818cf8;font-size:12px;margin:0;">🤖 MIA is analyzing your question...</p>
      </div>
      <a href="${APP_URL}/questions/${questionId}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">
        View Question
      </a>
    </div>`;

  return send(MAIL_FROM.ask, email, `Question Published: "${title}"`, content, 'Your question is now live on Wisery');
}

export async function sendNewCommentOnQuestion(email: string, questionTitle: string, commenterName: string, commentText: string, questionId: string): Promise<boolean> {
  const content = `
    <div>
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:40px;">💬</div>
        <h2 style="color:#fff;font-size:18px;margin:8px 0;">New Comment</h2>
      </div>
      <div style="background:#0a0a14;border-radius:10px;padding:16px;margin:0 0 12px;">
        <p style="color:#6b6560;font-size:11px;margin:0 0 4px;">ON YOUR QUESTION</p>
        <p style="color:#fff;font-size:13px;margin:0;font-weight:600;">"${questionTitle}"</p>
      </div>
      <div style="border-left:3px solid #f59e0b;padding:12px 16px;margin:0 0 16px;">
        <p style="color:#f59e0b;font-size:12px;font-weight:600;margin:0 0 4px;">${commenterName}</p>
        <p style="color:#d4d0cc;font-size:13px;margin:0;line-height:1.5;">${commentText}</p>
      </div>
      <div style="text-align:center;">
        <a href="${APP_URL}/questions/${questionId}" style="color:#f59e0b;font-size:13px;text-decoration:none;font-weight:600;">
          Reply →
        </a>
      </div>
    </div>`;

  return send(MAIL_FROM.ask, email, `New comment on "${questionTitle}"`, content, 'Someone commented on your Wisery question');
}

// ═══════════ Send Helper ═══════════

async function send(from: string, to: string, subject: string, htmlContent: string, footerText: string): Promise<boolean> {
  try {
    // Use onboarding@resend.dev until wisery.live domain is verified in Resend
    const senderEmail = process.env.RESEND_DOMAIN_VERIFIED === 'true' ? from : 'Wisery <onboarding@resend.dev>';

    const { error } = await resend.emails.send({
      from: senderEmail,
      to: [to],
      subject,
      html: baseTemplate(htmlContent, '#f59e0b', footerText),
    });

    if (error) {
      console.error(`Email send error [${from}]:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Email send error [${from}]:`, err);
    return false;
  }
}
