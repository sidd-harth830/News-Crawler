import Parser from 'rss-parser';
import axios from 'axios';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const parser = new Parser();

// Initialize AI and DB clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

const RSS_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://hnrss.org/frontpage',
  'https://www.theverge.com/rss/index.xml',
  'https://aws.amazon.com/about-aws/whats-new/recent/feed/'
];

async function runTest() {
  console.log("Starting Omni-Channel Tech Radar Backend Pipeline...");
  
  for (const feedUrl of RSS_FEEDS) {
    console.log(`\n========================================`);
    console.log(`Processing Feed: ${feedUrl}`);
    
    try {
      // 1. Discovery
      const feed = await parser.parseURL(feedUrl);
      const latestItem = feed.items[0];
      
      if (!latestItem || !latestItem.link) {
        console.log("No articles found in this feed.");
        continue;
      }
      
      console.log(`Found article: ${latestItem.title}`);
      
      // Check if it already exists in Supabase
      const { data: existing } = await supabase
        .from('curated_news')
        .select('id')
        .eq('url', latestItem.link)
        .single();
        
      if (existing) {
        console.log("Article already exists in Supabase. Skipping extraction.");
        continue;
      }
      
      // 2. Extraction
      console.log("Extracting content with Jina AI...");
      const jinaUrl = `https://r.jina.ai/${latestItem.link}`;
      const response = await axios.get(jinaUrl);
      const markdownContent = response.data;
      
      // 3. Fact Extraction
      console.log("Extracting facts with Groq (Llama 3.3)...");
      const extractionPrompt = `
        Analyze the following article markdown and extract the 3 to 5 most important factual claims.
        Output ONLY a JSON array of strings, where each string is a fact.
        
        Article:
        ${markdownContent.substring(0, 10000)}
      `;
      
      const extractionResponse = await groq.chat.completions.create({
        messages: [{ role: 'user', content: extractionPrompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });
      
      let facts = [];
      try {
          const rawJson = JSON.parse(extractionResponse.choices[0]?.message?.content || "{}");
          facts = Array.isArray(rawJson) ? rawJson : (rawJson.facts || Object.values(rawJson)[0] || []);
      } catch(e) {
          console.log("Could not parse facts.");
      }
      
      if (facts.length === 0) {
        console.log("No facts extracted, aborting scoring for this article.");
        continue;
      }
      
      // 4. Verification & Scoring
      console.log("Verifying facts and scoring with Groq...");
      const groqPrompt = `
        You are an expert fact-checker. Review the following facts extracted from a tech news article.
        Assign a "trust_score" from 0 to 100 based on how plausible, verifiable, and objective these facts are.
        Provide a brief "reasoning".
        
        Facts:
        ${JSON.stringify(facts, null, 2)}
        
        Output ONLY a JSON object with this exact structure:
        {
          "trust_score": number,
          "reasoning": "string"
        }
      `;
      
      const groqResponse = await groq.chat.completions.create({
        messages: [{ role: 'user', content: groqPrompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });
      
      const verification = JSON.parse(groqResponse.choices[0]?.message?.content || "{}");
      const trustScore = verification.trust_score || 0;
      
      // 5. Storage
      console.log("Saving results to Supabase...");
      const { error } = await supabase.from('curated_news').insert({
        title: latestItem.title,
        url: latestItem.link,
        content_markdown: markdownContent,
        extracted_facts: facts,
        trust_score: trustScore
      });
      
      if (error) {
        console.error("Error saving to Supabase:", error);
      } else {
        console.log("Successfully saved to Supabase!");
      }

      // 6. Discord & Telegram Alerts
      if (trustScore > 85) {
        console.log("Trust score is > 85! Sending alerts...");
        
        // Discord
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            await axios.post(webhookUrl, {
              embeds: [{
                title: `🚀 High Trust News: ${latestItem.title}`,
                url: latestItem.link,
                color: 5814783, // Indigo color
                description: "This article just scored highly on the Omni-Channel Tech Radar!",
                fields: [
                  { name: "Trust Score", value: `⭐ ${trustScore}/100`, inline: true },
                  { name: "Key Facts", value: facts.map((f: string) => `• ${f}`).join('\n').substring(0, 1024) }
                ],
                footer: { text: "Verified by Groq (Llama 3.3)" },
                timestamp: new Date().toISOString()
              }]
            });
            console.log("Discord alert sent successfully!");
          } catch (e: any) {
            console.error("Failed to send Discord alert:", e.message);
          }
        }

        // Telegram
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChatId = process.env.TELEGRAM_CHAT_ID;
        if (tgToken && tgChatId) {
          try {
            const textMessage = `*🚀 High Trust News: [${latestItem.title}](${latestItem.link})*\n\n⭐ *Trust Score:* ${trustScore}/100\n\n*Key Facts:*\n${facts.map((f: string) => `• ${f}`).join('\n').substring(0, 3000)}\n\n_Verified by Groq (Llama 3.3)_`;
            
            await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
              chat_id: tgChatId,
              text: textMessage,
              parse_mode: "Markdown"
            });
            console.log("Telegram alert sent successfully!");
          } catch (e: any) {
            console.error("Failed to send Telegram alert:", e.message);
          }
        }
      } else {
        console.log(`Trust score is ${trustScore}, no alerts sent (must be > 85).`);
      }
      
    } catch (error) {
      console.error(`Error processing feed ${feedUrl}:`, error);
    }
  }
  
  console.log("\n========================================");
  console.log("Backend pipeline complete!");
}

runTest();
