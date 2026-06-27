import axios from 'axios';

export interface ArticleAlert {
  title: string;
  url: string;
  category: string;
  hypeScore: number;
  sentiment: string;
  impactSummary: string;
  facts: string[];
}

export let telegramBatch: ArticleAlert[] = [];
export let notificationHealth = { discord: true, telegram: true };

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

  // Add to Telegram batch automatically with full content
  telegramBatch.push({
    title: articleTitle,
    url: articleUrl,
    category,
    hypeScore,
    sentiment,
    impactSummary,
    facts
  });

  // Send Article Alerts to Discord
  if (webhookUrl) {
    // Dynamic Colors based on Category
    let color = 5814783; // default
    if (category.includes('Corporate')) color = 0x1E40AF; // Deep Blue
    else if (category.includes('Technical')) color = 0x10B981; // Emerald
    else if (category.includes('Macro-Trend') || category.includes('Social')) color = 0xF59E0B; // Amber

    try {
      await axios.post(webhookUrl, {
        embeds: [{
          title: `🔥 HIGH HYPE ALERT: ${category} ${articleTitle}`,
          url: articleUrl,
          color: color,
          description: `**AI Summary:**\n${impactSummary}\n\n[Read Full Article](${articleUrl})`,
          thumbnail: heroImage ? { url: heroImage } : undefined,
          fields: [
            { name: "Category", value: category, inline: true },
            { name: "Trust Score", value: `⭐ ${trustScore}/100`, inline: true },
            { name: "Hype Score", value: `🔥 ${hypeScore}/100`, inline: true },
            { name: "AI Verified Facts", value: facts.map((f: string) => `• ${f}`).join('\n').substring(0, 1024) }
          ],
          footer: { text: "Omni-Channel Tech Radar | Verified by Groq" },
          timestamp: new Date().toISOString()
        }]
      });
      console.log("Discord premium high-value alert sent!");
    } catch (e: any) { 
      console.error("Failed to send Discord alert:", e.message); 
      notificationHealth.discord = false;
    }
  }
}

export async function sendApiExhaustedAlert(serviceName: string, errorMsg: string) {
  const logsWebhook = process.env.DISCORD_LOGS_WEBHOOK_URL;
  if (!logsWebhook) return;
  try {
    await axios.post(logsWebhook, {
      embeds: [{
        title: `🚨 API EXHAUSTED: ${serviceName}`,
        color: 0xDC2626,
        description: `**Critical Failure:** The ${serviceName} API has returned a Rate Limit (429) or Quota Exhausted (402/403) response.\n\n**Action Required:** Generate a new API key, update the GitHub Repository Secrets, and re-run the workflow.\n\n**Error Details:**\n\`${errorMsg}\``,
        timestamp: new Date().toISOString()
      }]
    });
  } catch(e) {}
}

export async function sendAuditLog(
  ingests: string[], 
  exaQueries: number, 
  tavilyQueries: number, 
  firecrawlCredits: number, 
  llmTokens: number, 
  errorLogs: string[]
) {
  const logsWebhook = process.env.DISCORD_LOGS_WEBHOOK_URL;
  if (!logsWebhook) return;

  const ingestsText = ingests.length > 0 ? ingests.map(i => `• ${i}`).join('\n').substring(0, 1024) : "None";
  const errorsText = errorLogs.length > 0 ? errorLogs.map(e => `• ${e}`).join('\n').substring(0, 1024) : "No errors detected.";

  try {
    await axios.post(logsWebhook, {
      embeds: [{
        title: `📊 Master Telemetry & Audit Summary`,
        color: 10181046,
        description: `Autonomous Pipeline Run Complete`,
        fields: [
          { name: "📥 Database Ingests", value: ingestsText, inline: false },
          { name: "🔑 API Token Tracking", value: `• Exa Queries: ${exaQueries}\n• Tavily Queries: ${tavilyQueries}\n• Firecrawl Credits: ${firecrawlCredits}\n• LLM Tokens: ${llmTokens}`, inline: false },
          { name: "🟢 Subsystem Health", value: `• Discord Routing: ${notificationHealth.discord ? "✅ Online" : "❌ Degraded"}\n• Telegram Batching: ${notificationHealth.telegram ? "✅ Online" : "❌ Degraded"}`, inline: false },
          { name: "⚠️ Error Logs", value: errorsText, inline: false }
        ],
        timestamp: new Date().toISOString()
      }]
    });
    console.log("Discord master telemetry log sent!");
  } catch (e: any) {
    console.error("Failed to send Discord audit log:", e.message);
  }
}

export async function sendBatchTelegram() {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;

  if (!tgToken || !tgChatId || telegramBatch.length === 0) return;

  for (const a of telegramBatch) {
    try {
      let html = `<b>🚀 ${a.category} <a href="${a.url}">${a.title}</a></b>\n`;
      html += `🔥 <i>Hype: ${a.hypeScore} | Sentiment: ${a.sentiment}</i>\n\n`;
      html += `<blockquote>${a.impactSummary}</blockquote>\n\n`;
      html += `<b>Key Facts:</b>\n`;
      a.facts.forEach(f => {
        html += `• ${f}\n`;
      });
      
      await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        chat_id: tgChatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true
      });
      console.log(`Telegram message sent for: ${a.title}`);
      
      // 2-second delay for Telegram rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (e: any) {
      console.error("Failed to send Telegram alert:", e.message);
      notificationHealth.telegram = false;
    }
  }
}
