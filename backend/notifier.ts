import axios from 'axios';

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
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;

  // Determine dark-slate side color bar based on category
  const color = category === '[Corporate/Business]' ? 16753920 : (category === '[Macro-Trend]' ? 3066993 : 5814783);
  
  // --- DISCORD RICH EMBED ---
  if (webhookUrl) {
    try {
      await axios.post(webhookUrl, {
        embeds: [{
          title: `${category} ${articleTitle}`,
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
          footer: { text: "Omni-Channel Tech Radar | Verified by Groq (Llama 3.3)" },
          timestamp: new Date().toISOString()
        }]
      });
      console.log("Discord rich alert sent!");
    } catch (e: any) { 
      console.error("Failed to send Discord alert:", e.message); 
    }
  }

  // --- TELEGRAM HTML PARSED MESSAGE ---
  if (tgToken && tgChatId) {
    try {
      const textMessage = `
<b>🚀 ${category} <a href="${articleUrl}">${articleTitle}</a></b>

⭐ <b>Trust Score:</b> ${trustScore}/100
🔥 <b>Hype Score:</b> ${hypeScore}/100
💬 <b>Sentiment:</b> ${sentiment}

<b>Impact:</b> 
${impactSummary}

<i>Verified by Groq (Llama 3.3)</i>
      `.trim();
      
      await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        chat_id: tgChatId, 
        text: textMessage, 
        parse_mode: "HTML",
        disable_web_page_preview: false
      });
      console.log("Telegram rich HTML alert sent!");
    } catch (e: any) { 
      console.error("Failed to send Telegram alert:", e.message); 
    }
  }
}
