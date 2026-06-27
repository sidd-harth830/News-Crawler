import Parser from 'rss-parser';
import axios from 'axios';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import Exa from 'exa-js';
import { tavily } from '@tavily/core';
import 'dotenv/config';

const parser = new Parser();

// Initialize AI and DB clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);
const exa = new Exa(process.env.EXA_API_KEY);
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const CORPORATE_QUERIES = [
  "tech startup acquisition",
  "venture capital funding round",
  "tech executive appointment",
  "enterprise restructuring news"
];

function isValidArticle(markdown: string): boolean {
  const badWords = ["CAPTCHA", "Cloudflare", "Security Checkpoint", "Too Many Requests", "Access Denied", "DDoS", "Enable JavaScript"];
  const upperMarkdown = markdown.toUpperCase();
  for (const word of badWords) {
    if (upperMarkdown.includes(word.toUpperCase())) {
      return false;
    }
  }
  return true;
}

async function runTest() {
  console.log("Starting Phase 6 Corporate-Tech Intelligence Pipeline...");
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

  // --- 1B. DYNAMIC GOOGLE NEWS RSS ---
  console.log("\n[1B] Building Dynamic Google News Feeds...");
  for (const query of CORPORATE_QUERIES) {
    try {
      const dynamicRssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:1d')}`;
      const feed = await parser.parseURL(dynamicRssUrl);
      
      const latestItem = feed.items[0];
      if (latestItem && latestItem.link) {
        articlesToProcess.push({
          title: latestItem.title || "Unknown Title",
          link: latestItem.link
        });
      }
    } catch (error) {
      console.error(`Failed to parse Dynamic RSS for query: ${query}`);
    }
  }

  // --- 1E. TAVILY CORPORATE SEARCH ---
  console.log("\n[1E] Running Tavily AI Corporate Discovery...");
  for (const query of CORPORATE_QUERIES) {
    try {
      const tavilyResponse = await tvly.search(query, {
        searchDepth: "basic",
        timeRange: "d", 
        maxResults: 1
      });
      
      tavilyResponse.results.forEach((result: any) => {
        articlesToProcess.push({
          title: result.title || "Tavily Discovered Article",
          link: result.url
        });
      });
    } catch (error: any) {
      console.error(`Tavily Search failed for query ${query}:`, error.message);
    }
  }

  // --- 1C. SOCIAL MEDIA INGESTION (Reddit) ---
  console.log("\n[1C] Fetching Reddit Social Streams...");
  let globalSocialContext = "--- CURRENT DEVELOPER CHATTER ---\n";
  const subreddits = ['webdev', 'reactjs', 'machinelearning'];
  
  for (const sub of subreddits) {
    try {
      const redditRes = await axios.get(`https://www.reddit.com/r/${sub}/hot.json?limit=3`, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      const threads = redditRes.data.data.children;
      threads.forEach((t: any) => {
        globalSocialContext += `[Reddit r/${sub}] ${t.data.title} (Score: ${t.data.score})\n`;
      });
    } catch (e: any) {
      console.error(`Failed to fetch Reddit r/${sub}: ${e.message}`);
    }
  }

  // --- 1D. EXA AI GITHUB FILTERING ---
  console.log("\n[1D] Running Exa AI Repo Search...");
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const socialResponse = await exa.search("trending AI releases, major web framework updates, developer discussions", {
      type: "neural",
      useAutoprompt: true,
      numResults: 5,
      includeDomains: ['github.com', 'news.ycombinator.com'],
      startPublishedDate: oneDayAgo
    });
    
    socialResponse.results.forEach(result => {
      globalSocialContext += `[Exa Social] ${result.title || 'Post'} - ${result.url}\n`;
    });
    console.log(`Exa AI found ${socialResponse.results.length} recent social/repo links!`);
  } catch (error) {
    console.error("Exa AI Social Search failed:", error);
  }

  console.log(`\nTotal Articles Queued for Processing: ${articlesToProcess.length}`);

  // --- PIPELINE PROCESSING ---
  for (const article of articlesToProcess) {
    console.log(`\n========================================`);
    console.log(`Processing: ${article.title}`);
    console.log(`URL: ${article.link}`);
    
    try {
      const { data: existing } = await supabase
        .from('curated_news')
        .select('id')
        .eq('url', article.link)
        .single();
        
      if (existing) {
        console.log("Article already exists in Supabase. Skipping.");
        continue;
      }
      
      let markdownContent = "";
      try {
        console.log("Extracting content with Jina AI...");
        const jinaUrl = `https://r.jina.ai/${article.link}`;
        const response = await axios.get(jinaUrl, { timeout: 10000 });
        markdownContent = response.data;
        
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
          continue; 
        }
      }

      if (!isValidArticle(markdownContent)) {
        console.log("Security wall detected in markdown, aborting article.");
        continue;
      }
      
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
      
      console.log("Verifying facts and calculating Intelligence with Groq...");
      const groqPrompt = `
        You are an expert fact-checker and tech trend analyst. Review the following facts from an article.
        Cross-reference them against the general social media context provided.
        
        1. Assign a "trust_score" from 0 to 100 based on plausibility.
        2. Assign a "hype_score" from 0 to 100 based on how much excitement or impact this aligns with current developer chatter.
        3. Identify the overall developer "sentiment" as "Positive", "Skeptical", or "Critical".
        4. Categorize the article as "[Technical]", "[Corporate/Business]", or "[Macro-Trend]".
        5. Provide a brief "impact_summary" explaining how this news might impact everyday developers or the industry.
        
        Social Context:
        ${globalSocialContext}

        Facts to Evaluate:
        ${JSON.stringify(facts, null, 2)}
        
        Output ONLY a JSON object with this exact structure:
        {
          "trust_score": number,
          "hype_score": number,
          "sentiment": "Positive" | "Skeptical" | "Critical",
          "category": "[Technical]" | "[Corporate/Business]" | "[Macro-Trend]",
          "impact_summary": "string"
        }
      `;
      
      const groqResponse = await groq.chat.completions.create({
        messages: [{ role: 'user', content: groqPrompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });
      
      const verification = JSON.parse(groqResponse.choices[0]?.message?.content || "{}");
      const trustScore = verification.trust_score || 0;
      const hypeScore = verification.hype_score || 0;
      const sentiment = verification.sentiment || "Skeptical";
      const category = verification.category || "[Technical]";
      const impactSummary = verification.impact_summary || "No clear impact identified.";
      
      console.log(`Saving to Supabase (Category: ${category}, Trust: ${trustScore}, Hype: ${hypeScore})...`);
      const { error } = await supabase.from('curated_news').insert({
        title: article.title,
        url: article.link,
        content_markdown: markdownContent,
        extracted_facts: facts,
        trust_score: trustScore,
        hype_score: hypeScore,
        sentiment: sentiment,
        category: category,
        impact_summary: impactSummary
      });
      
      if (error) {
        console.error("Error saving to Supabase:", error);
      } else {
        console.log("Successfully saved to Supabase!");
      }

      if (trustScore > 85) {
        console.log("Trust score > 85! Sending Discord and Telegram alerts...");
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            await axios.post(webhookUrl, {
              embeds: [{
                title: `${category} ${article.title}`,
                url: article.link,
                color: category === '[Corporate/Business]' ? 16753920 : 5814783,
                description: impactSummary,
                fields: [
                  { name: "Trust Score", value: `⭐ ${trustScore}/100`, inline: true },
                  { name: "Hype Score", value: `🔥 ${hypeScore}/100`, inline: true },
                  { name: "Sentiment", value: `💬 ${sentiment}`, inline: true },
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
            const textMessage = `*🚀 ${category} [${article.title}](${article.link})*\n\n⭐ *Trust Score:* ${trustScore}/100 | 🔥 *Hype Score:* ${hypeScore}/100 | 💬 *Sentiment:* ${sentiment}\n\n*Impact:* ${impactSummary}\n\n_Verified by Groq_`;
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
  console.log("Phase 6 Backend pipeline complete!");
}

runTest();
