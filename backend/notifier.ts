import axios from 'axios';

export interface ArticleAlert {
  title: string;
  url: string;
  category: string;
  hypeScore: number;
  sentiment: string;
}

export let telegramBatch: ArticleAlert[] = [];

export async function sendRichNotifications(
  articleTitle: string, 
  articleUrl: string, 
  heroImage: string | null,
  category: string, 
  trustScore: number, 
  hypeScore: number, 
  sentiment: string, 
  impactSummary: string, 
  facts: string[]
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  // Add to Telegram batch automatically
  telegramBatch.push({
    title: articleTitle,
    url: articleUrl,
    category,
    hypeScore,
    sentiment
  });

  // Only send High-value Article Alerts (>85 score) to Discord
  if (webhookUrl && hypeScore > 85) {
    const color = category === '[Corporate/Business]' ? 16753920 : (category === '[Macro-Trend]' ? 3066993 : 5814783);
    try {
      await axios.post(webhookUrl, {
        embeds: [{
          title: `🔥 HIGH HYPE ALERT: ${category} ${articleTitle}`,
          url: articleUrl,
          color: color,
          description: `**Impact Analysis:**\n${impactSummary}\n\n[Read Article on Source](${articleUrl})`,
          thumbnail: heroImage ? { url: heroImage } : undefined,
          fields: [
            { name: "Trust Score", value: `⭐ ${trustScore}/100`, inline: true },
            { name: "Hype Score", value: `🔥 ${hypeScore}/100`, inline: true },
            { name: "Sentiment", value: `💬 ${sentiment}`, inline: true },
            { name: "Key Facts", value: facts.map((f: string) => `• ${f}`).join('\n').substring(0, 1024) }
          ],
          footer: { text: "Omni-Channel Tech Radar | Verified by Groq" },
          timestamp: new Date().toISOString()
        }]
      });
      console.log("Discord high-value alert sent!");
    } catch (e: any) { 
      console.error("Failed to send Discord alert:", e.message); 
    }
  }
}

export async function sendAuditLog(visited: number, blocked: number, tokens: number) {
  const logsWebhook = process.env.DISCORD_LOGS_WEBHOOK_URL;
  if (!logsWebhook) return;

  try {
    await axios.post(logsWebhook, {
      embeds: [{
        title: `📊 Run Audit Summary`,
        color: 10181046,
        fields: [
          { name: "Websites Visited", value: `${visited}`, inline: true },
          { name: "Blocked Sites (Firecrawl/Jina)", value: `${blocked}`, inline: true },
          { name: "LLM Tokens Used", value: `${tokens}`, inline: true }
        ],
        timestamp: new Date().toISOString()
      }]
    });
    console.log("Discord audit log sent!");
  } catch (e: any) {
    console.error("Failed to send Discord audit log:", e.message);
  }
}

export async function sendBatchTelegram() {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;

  if (!tgToken || !tgChatId || telegramBatch.length === 0) return;

  const techAlerts = telegramBatch.filter(a => a.category.includes('Technical'));
  const corpAlerts = telegramBatch.filter(a => a.category.includes('Corporate'));
  const otherAlerts = telegramBatch.filter(a => !a.category.includes('Technical') && !a.category.includes('Corporate'));

  let html = `<b>🚀 Radar Executive Summary</b>\n\n`;

  if (techAlerts.length > 0) {
    html += `<b>📰 Tech Updates:</b>\n`;
    techAlerts.forEach(a => html += `• <a href="${a.url}">${a.title}</a> (🔥 ${a.hypeScore})\n`);
    html += `\n`;
  }

  if (corpAlerts.length > 0) {
    html += `<b>💼 Corporate News:</b>\n`;
    corpAlerts.forEach(a => html += `• <a href="${a.url}">${a.title}</a> (🔥 ${a.hypeScore})\n`);
    html += `\n`;
  }

  if (otherAlerts.length > 0) {
    html += `<b>🌍 Macro Trends:</b>\n`;
    otherAlerts.forEach(a => html += `• <a href="${a.url}">${a.title}</a> (🔥 ${a.hypeScore})\n`);
    html += `\n`;
  }

  // Chunking to avoid 4096 character limit
  const chunkSize = 3500;
  const chunks = [];
  for (let i = 0; i < html.length; i += chunkSize) {
    chunks.push(html.substring(i, i + chunkSize));
  }

  for (let i = 0; i < chunks.length; i++) {
    try {
      await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        chat_id: tgChatId,
        text: chunks[i],
        parse_mode: "HTML",
        disable_web_page_preview: true
      });
      console.log(`Telegram batch message part ${i + 1} sent!`);
      
      if (i < chunks.length - 1) {
        console.log("Waiting 10 seconds before sending next chunk...");
        await new Promise(r => setTimeout(r, 10000));
      }
    } catch (e: any) {
      console.error("Failed to send Telegram batch alert:", e.message);
    }
  }
}
