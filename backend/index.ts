import Parser from 'rss-parser';
import axios from 'axios';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import Exa from 'exa-js';
import 'dotenv/config';

const parser = new Parser();

// Initialize AI and DB clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);
const exa = new Exa(process.env.EXA_API_KEY);

const RSS_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://hnrss.org/frontpage',
  'https://www.theverge.com/rss/index.xml',
  'https://aws.amazon.com/about-aws/whats-new/recent/feed/'
];

async function runTest() {
  console.log("Starting Phase 3 Omni-Channel Tech Radar Pipeline...");
  let articlesToProcess: { title: string, link: string }[] = [];

  // --- 1A. AGENTIC SEARCH (Exa AI) ---
  console.log("\n[1A] Running Exa AI Agentic Search...");
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const exaResponse = await exa.search("breaking tech news, major framework releases, and trending AI developments", {
      type: "neural",
      useAutoprompt: true,
      numResults: 3,
      startPublishedDate: fourHoursAgo
    });
    
    exaResponse.results.forEach(result => {
      articlesToProcess.push({
        title: result.title || "Exa Discovered Article",
        link: result.url
      });
    });
    console.log(`Exa AI found ${exaResponse.results.length} recent articles!`);
  } catch (error) {
    console.error("Exa AI Search failed:", error);
  }

  // --- 1B. STATIC RSS FEEDS ---
  console.log("\n[1B] Fetching static RSS Feeds...");
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const latestItem = feed.items[0];
      if (latestItem && latestItem.link) {
        articlesToProcess.push({
          title: latestItem.title || "Unknown Title",
          link: latestItem.link
        });
      }
    } catch (error) {
      console.error(`Failed to parse RSS feed ${feedUrl}`);
    }
  }

  console.log(`\nTotal Articles Queued for Processing: ${articlesToProcess.length}`);

  // --- PIPELINE PROCESSING ---
  for (const article of articlesToProcess) {
    console.log(`\n========================================`);
    console.log(`Processing: ${article.title}`);
    console.log(`URL: ${article.link}`);
    
    try {
      // Check if it already exists in Supabase
      const { data: existing } = await supabase
        .from('curated_news')
        .select('id')
        .eq('url', article.link)
        .single();
        
      if (existing) {
        console.log("Article already exists in Supabase. Skipping.");
        continue;
      }
      
            // 2. Extraction (Jina AI with Firecrawl Fallback)
      let markdownContent = "";
      try {
        console.log("Extracting content with Jina AI...");
        const jinaUrl = `https://r.jina.ai/${article.link}`;
        const response = await axios.get(jinaUrl, { timeout: 10000 });
        markdownContent = response.data;
        
        // Jina often returns generic strings or error text if blocked by Cloudflare/JS
        if (
          markdownContent.includes("Enable JavaScript") || 
          markdownContent.includes("Cloudflare") || 
          markdownContent.includes("Access denied") ||
          markdownContent.length < 200
        ) {
           throw new Error("Jina blocked or returned invalid content.");
        }
      } catch (jinaError: any) {
        console.log(`Jina extraction failed or was blocked. Falling back to Firecrawl deep scrape...`);
        
        try {
          const firecrawlUrl = 'https://api.firecrawl.dev/v1/scrape';
          const firecrawlResponse = await axios.post(
            firecrawlUrl,
            { url: article.link, formats: ['markdown'] },
            {
              headers: {
                'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (firecrawlResponse.data && firecrawlResponse.data.success) {
            markdownContent = firecrawlResponse.data.data.markdown;
            console.log("Firecrawl deep scrape successful! 🚀");
          } else {
            throw new Error("Firecrawl returned unsuccessful response.");
          }
        } catch (firecrawlError: any) {
          console.log(`Firecrawl fallback failed too. Skipping this article.`);
          continue; // Skip processing this article and move to the next one
        }
      }
      
      // 3. Fact Extraction
      console.log("Extracting facts with Groq (Llama 3.3)...");
      const extractionPrompt = `
        Analyze the following article markdown and extract the 3 to 5 most important factual claims.
        Output ONLY a JSON array of strings, where each string is a fact.
        Article: ${markdownContent.substring(0, 10000)}
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
        console.log("No facts extracted, aborting scoring.");
        continue;
      }
      
      // 4. Verification & Scoring
      console.log("Verifying facts and scoring with Groq...");
      const groqPrompt = `
        You are an expert fact-checker. Review the following facts.
        Assign a "trust_score" from 0 to 100 based on how plausible, verifiable, and objective these facts are.
        Provide a brief "reasoning".
        Facts: ${JSON.stringify(facts, null, 2)}
        Output ONLY a JSON object: { "trust_score": number, "reasoning": "string" }
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
        title: article.title,
        url: article.link,
        content_markdown: markdownContent,
        extracted_facts: facts,
        trust_score: trustScore
      });
      
      if (error) {
        console.error("Error saving to Supabase:", error);
      } else {
        console.log("Successfully saved to Supabase!");
      }

      // 6. Alerts
      if (trustScore > 85) {
        console.log("Trust score is > 85! Sending alerts...");
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            await axios.post(webhookUrl, {
              embeds: [{
                title: `🚀 High Trust News: ${article.title}`,
                url: article.link,
                color: 5814783,
                description: "This article just scored highly on the Omni-Channel Tech Radar!",
                fields: [
                  { name: "Trust Score", value: `⭐ ${trustScore}/100`, inline: true },
                  { name: "Key Facts", value: facts.map((f: string) => `• ${f}`).join('\n').substring(0, 1024) }
                ],
                footer: { text: "Verified by Groq (Llama 3.3)" },
                timestamp: new Date().toISOString()
              }]
            });
            console.log("Discord alert sent!");
          } catch (e) { console.error("Failed to send Discord alert."); }
        }

        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChatId = process.env.TELEGRAM_CHAT_ID;
        if (tgToken && tgChatId) {
          try {
            const textMessage = `*🚀 High Trust News: [${article.title}](${article.link})*\n\n⭐ *Trust Score:* ${trustScore}/100\n\n*Key Facts:*\n${facts.map((f: string) => `• ${f}`).join('\n').substring(0, 3000)}\n\n_Verified by Groq (Llama 3.3)_`;
            await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
              chat_id: tgChatId, text: textMessage, parse_mode: "Markdown"
            });
            console.log("Telegram alert sent!");
          } catch (e) { console.error("Failed to send Telegram alert."); }
        }
      }
      
    } catch (error) {
      console.error(`Error processing article:`, error);
    }
  }
  
  console.log("\n========================================");
  console.log("Backend pipeline complete!");
}

runTest();
