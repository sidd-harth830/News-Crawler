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

// Telemetry Logger
async function logTelemetry(eventType: string, targetUrl: string | null, serviceUsed: string, tokensUsed: number) {
  try {
    await supabase.from('agent_logs').insert({
      event_type: eventType,
      target_url: targetUrl,
      service_used: serviceUsed,
      tokens_or_credits_used: tokensUsed
    });
  } catch (e) {
    console.error("Failed to log telemetry:", e);
  }
}

async function runTest() {
  console.log("Starting Phase 7 Premium Pipeline...");
  
  // Notice we added published_date and image_url to our internal schema!
  let articlesToProcess: { title: string, link: string, published_date?: string, image_url?: string }[] = [];

  // --- 1A. AGENTIC SEARCH (Exa AI) ---
  console.log("\n[1A] Running Exa AI Agentic Search...");
  try {
    await logTelemetry('api_usage', null, 'Exa', 1);
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const exaResponse = await exa.search("breaking tech news, major framework releases, and trending AI developments", {
      type: "neural",
      useAutoprompt: true,
      numResults: 3,
      startPublishedDate: fourHoursAgo
    });
    
    exaResponse.results.forEach((result: any) => {
      articlesToProcess.push({
        title: result.title || "Exa Discovered Article",
        link: result.url,
        published_date: result.publishedDate
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
          link: latestItem.link,
          published_date: latestItem.isoDate || latestItem.pubDate
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
      await logTelemetry('api_usage', null, 'Tavily', 1);
      const tavilyResponse = await tvly.search(query, {
        searchDepth: "basic",
        timeRange: "d", 
        maxResults: 1
      });
      
      tavilyResponse.results.forEach((result: any) => {
        articlesToProcess.push({
          title: result.title || "Tavily Discovered Article",
          link: result.url,
          published_date: new Date().toISOString() // Tavily basic search doesn't explicitly return ISO date easily, using now as fallback
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
    await logTelemetry('api_usage', null, 'Exa-Social', 1);
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
      let heroImage = article.image_url || null;

      try {
        console.log("Extracting content with Jina AI...");
        await logTelemetry('crawl_attempt', article.link, 'Jina', 0);
        const jinaUrl = `https://r.jina.ai/${article.link}`;
        const response = await axios.get(jinaUrl, { timeout: 10000 });
        markdownContent = response.data;
        
      } catch (jinaError: any) {
        console.log(`Jina extraction failed or was blocked. Falling back to Firecrawl deep scrape...`);
        
        try {
          await logTelemetry('crawl_attempt', article.link, 'Firecrawl', 1);
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
            // Extract Firecrawl Metadata Image
            if (firecrawlResponse.data.data.metadata && firecrawlResponse.data.data.metadata.ogImage) {
              heroImage = firecrawlResponse.data.data.metadata.ogImage;
            }
            console.log("Firecrawl deep scrape successful! 🚀");
          } else {
            throw new Error("Firecrawl returned unsuccessful response.");
          }
        } catch (firecrawlError: any) {
          console.log(`Firecrawl fallback failed too. Skipping this article.`);
          await logTelemetry('blocked', article.link, 'Firecrawl', 1);
          continue; 
        }
      }

      if (!isValidArticle(markdownContent)) {
        console.log("Security wall detected in markdown, aborting article.");
        await logTelemetry('blocked', article.link, 'Jina', 0);
        continue;
      }

      // If we don't have a heroImage yet, use regex to pull the first image from markdown!
      if (!heroImage) {
        const imageMatch = markdownContent.match(/!\[.*?\]\((.*?)\)/);
        if (imageMatch && imageMatch[1] && !imageMatch[1].includes('data:image')) {
           heroImage = imageMatch[1];
        }
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

      // Log Token Usage
      await logTelemetry('api_usage', article.link, 'Groq-Extract', extractionResponse.usage?.total_tokens || 0);
      
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

      await logTelemetry('api_usage', article.link, 'Groq-Verify', groqResponse.usage?.total_tokens || 0);
      
      const verification = JSON.parse(groqResponse.choices[0]?.message?.content || "{}");
      const trustScore = verification.trust_score || 0;
      const hypeScore = verification.hype_score || 0;
      const sentiment = verification.sentiment || "Skeptical";
      const category = verification.category || "[Technical]";
      const impactSummary = verification.impact_summary || "No clear impact identified.";
      
      console.log(`Saving to Supabase (Category: ${category}, Trust: ${trustScore}, Image Found: ${!!heroImage})...`);
      const { error } = await supabase.from('curated_news').insert({
        title: article.title,
        url: article.link,
        content_markdown: markdownContent,
        extracted_facts: facts,
        trust_score: trustScore,
        hype_score: hypeScore,
        sentiment: sentiment,
        category: category,
        impact_summary: impactSummary,
        image_url: heroImage,
        published_date: article.published_date || new Date().toISOString()
      });
      
      if (error) {
        console.error("Error saving to Supabase:", error);
      } else {
        console.log("Successfully saved to Supabase!");
      }
      
    } catch (error) {
      console.error(`Error processing article:`, error);
    }
  }
  
  console.log("\n========================================");
  console.log("Phase 7 Backend pipeline complete!");
}

runTest();
