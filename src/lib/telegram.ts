const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
}

let cachedChatId: string | null = null;

async function getChatId(): Promise<string | null> {
  if (cachedChatId) return cachedChatId;

  // Try to get chat ID from recent updates
  try {
    const res = await fetch(`${TELEGRAM_API}/getUpdates?limit=10`);
    const data = await res.json();
    if (data.ok && data.result.length > 0) {
      // Find the first group/supergroup chat
      for (const update of data.result) {
        const chat = update.message?.chat || update.my_chat_member?.chat;
        if (chat && (chat.type === 'group' || chat.type === 'supergroup')) {
          cachedChatId = String(chat.id);
          return cachedChatId;
        }
      }
      // Fallback to first chat
      const firstChat = data.result[0].message?.chat;
      if (firstChat) {
        cachedChatId = String(firstChat.id);
        return cachedChatId;
      }
    }
  } catch (err) {
    console.error('Telegram getChatId error:', err);
  }
  return process.env.TELEGRAM_CHAT_ID || null;
}

export async function sendToTelegram(message: TelegramMessage, chatId?: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured');
    return false;
  }

  const targetChatId = chatId || await getChatId();
  if (!targetChatId) {
    console.warn('No Telegram chat ID found. Add bot to a group first.');
    return false;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message.text,
        parse_mode: message.parse_mode || 'HTML',
        disable_web_page_preview: message.disable_web_page_preview ?? true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram send error:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram send error:', err);
    return false;
  }
}

// ═══════════ Pre-built message templates ═══════════

export async function notifyNewQuestion(title: string, category: string, username: string, questionId?: string): Promise<boolean> {
  const voteUrl = questionId
    ? `https://wisery.live/questions/${questionId}`
    : 'https://wisery.live';
  return sendToTelegram({
    text: `🗳️ <b>New Question on Wisery</b>\n\n"${title}"\n\n📂 ${category} | 👤 @${username}\n\n👉 <a href="${voteUrl}">Vote Now</a>`,
  });
}

export async function notifyNewVote(questionTitle: string, optionLabel: string, totalVotes: number, questionId?: string): Promise<boolean> {
  const voteUrl = questionId
    ? `https://wisery.live/questions/${questionId}`
    : 'https://wisery.live';
  return sendToTelegram({
    text: `📊 <b>Vote Update</b>\n\n"${questionTitle}"\n✅ ${optionLabel}\n📈 Total: ${totalVotes} votes\n\n👉 <a href="${voteUrl}">Join the vote</a>`,
  });
}

export async function notifyPredictionResolved(title: string, outcome: string, winners: number, predictionId?: string): Promise<boolean> {
  const resultUrl = predictionId
    ? `https://wisery.live/predictions/${predictionId}`
    : 'https://wisery.live/predictions';
  return sendToTelegram({
    text: `🏆 <b>Prediction Resolved!</b>\n\n"${title}"\n\n✅ Outcome: ${outcome}\n🎉 ${winners} winners earned WSR tokens!\n\n👉 <a href="${resultUrl}">See Results</a>`,
  });
}

export async function sendDailyReport(stats: {
  totalVotes: number;
  newQuestions: number;
  activeUsers: number;
  topQuestion: string;
  aiInsight: string;
}): Promise<boolean> {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return sendToTelegram({
    text: `📰 <b>Wisery Daily Report</b>\n📅 ${date}\n\n` +
      `📊 Votes Today: <b>${stats.totalVotes}</b>\n` +
      `❓ New Questions: <b>${stats.newQuestions}</b>\n` +
      `👥 Active Users: <b>${stats.activeUsers}</b>\n\n` +
      `🔥 <b>Top Question:</b>\n"${stats.topQuestion}"\n\n` +
      `🤖 <b>MIA Insight:</b>\n${stats.aiInsight}\n\n` +
      `👉 <a href="https://wisery.live">wisery.live</a>`,
  });
}

export async function sendWelcomeMessage(): Promise<boolean> {
  return sendToTelegram({
    text: `✨ <b>Wisery Bot Active!</b>\n\n` +
      `I'll send you:\n` +
      `📊 New votes & questions\n` +
      `🏆 Prediction results\n` +
      `📰 Daily analytics report (08:00)\n` +
      `🤖 MIA AI insights\n\n` +
      `👉 <a href="https://wisery.live">wisery.live</a> — Ask. Vote. Earn.`,
  });
}
