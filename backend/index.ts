import Parser from 'rss-parser';
import axios from 'axios';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import Exa from 'exa-js';
import { tavily } from '@tavily/core';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenAI } from '@google/genai';
import { sendRichNotifications, sendAuditLog, sendBatchTelegram, sendApiExhaustedAlert } from './notifier.js';
import 'dotenv/config';

let errorLogs: string[] = [];
async function handleApiError(serviceName: string, error: any) {
    const status = error?.status || error?.response?.status;
    const msg = error?.message || String(error);
    if (status === 429 || status === 402 || status === 403) {
        await sendApiExhaustedAlert(serviceName, msg);
    }
    errorLogs.push(`[${serviceName}] ${msg}`);
}

const parser = new Parser();

// Initialize AI and DB clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string }); // Shared Gemini instance
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);
const exa = new Exa(process.env.EXA_API_KEY);
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY as string });

const SEARCH_QUERIES = [
  "latest artificial intelligence breakthroughs", 
  "new frontend web development tools", 
  "cybersecurity news today", 
  "startup funding tech"
].sort(() => 0.5 - Math.random());

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
  console.log("Starting Phase 37 Premium Pipeline...");
  
  const searchTasks = ['1A', '1E', '1D', '1H'].sort(() => 0.5 - Math.random()).slice(0, 2);
  let firecrawlBudget = 3;
  let websitesVisited = 0;
  let blockedSites = 0;
  let tokensUsed = 0;
  let exaQueries = 0;
  let tavilyQueries = 0;
  let firecrawlCreditsUsed = 0;
  let successfulIngests: string[] = [];
  errorLogs = [];

  let articlesToProcess: { title: string, link: string, published_date?: string, image_url?: string, preFetchedContent?: string, isSocial?: boolean, video_metadata?: any }[] = [];

  // --- 1A. AGENTIC SEARCH (Exa AI) ---
  if (searchTasks.includes('1A')) {
    console.log("\n[1A] Running Exa AI Agentic Search...");
    try {
      exaQueries++;
      await logTelemetry('api_usage', null, 'Exa', 1);
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const exaQuery = SEARCH_QUERIES[0];
      const exaResponse = await exa.search(exaQuery, {
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
    } catch (error: any) {
      console.error("Exa AI Search failed:", error.message);
      await handleApiError("Exa AI", error);
    }
  }

  // --- 1B. DYNAMIC GOOGLE NEWS RSS ---
  console.log("\n[1B] Building Dynamic Google News Feeds...");
  for (const query of SEARCH_QUERIES) {
    try {
      const dynamicRssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:1d')}`;
      const feed = await parser.parseURL(dynamicRssUrl);
      
      const latestItem = feed.items[0];
      if (latestItem && latestItem.link) {
        articlesToProcess.push({
          title: latestItem.title || "Unknown Title",
          link: latestItem.link,
          published_date: latestItem.isoDate || latestItem.pubDate || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Failed to parse Dynamic RSS for query: ${query}`);
    }
  }

  // --- 1E. TAVILY CORPORATE SEARCH ---
  if (searchTasks.includes('1E')) {
    console.log("\n[1E] Running Tavily AI Discovery...");
    const tavilyQuery = SEARCH_QUERIES[1] || "";
    try {
      tavilyQueries++;
      await logTelemetry('api_usage', null, 'Tavily', 1);
      const tavilyResponse = await tvly.search(tavilyQuery, {
        searchDepth: "basic",
        timeRange: "d", 
        maxResults: 1
      });
      
      tavilyResponse.results.forEach((result: any) => {
        articlesToProcess.push({
          title: result.title || "Tavily Discovered Article",
          link: result.url,
          published_date: new Date().toISOString()
        });
      });
    } catch (error: any) {
      console.error(`Tavily Search failed for query ${tavilyQuery}:`, error.message);
      await handleApiError("Tavily AI", error);
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
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
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
  if (searchTasks.includes('1D')) {
    console.log("\n[1D] Running Exa AI Repo Search...");
    try {
      exaQueries++;
      await logTelemetry('api_usage', null, 'Exa-Social', 1);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const socialResponse = await exa.search("trending AI releases, major web framework updates, developer discussions", {
        type: "neural",
        useAutoprompt: true,
        numResults: 5,
        includeDomains: ['github.com', 'news.ycombinator.com'],
        startPublishedDate: oneDayAgo
      });
      
      socialResponse.results.forEach((result: any) => {
        globalSocialContext += `[Exa Social] ${result.title || 'Post'} - ${result.url}\n`;
      });
      console.log(`Exa AI found ${socialResponse.results.length} recent social/repo links!`);
    } catch (error: any) {
      console.error("Exa AI Social Search failed:", error.message);
      await handleApiError("Exa AI", error);
    }
  }

  // --- 1F. HACKER NEWS FIREBASE PIPELINE ---
  console.log("\n[1F] Fetching top stories from Hacker News Firebase API...");
  try {
      const topStoriesRes = await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json");
      const topStoryIds = topStoriesRes.data.slice(0, 3);
      for (const id of topStoryIds) {
          const storyRes = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          const story = storyRes.data;
          if (story && story.url) {
              articlesToProcess.push({
                  title: story.title || "Hacker News Article",
                  link: story.url,
                  published_date: story.time ? new Date(story.time * 1000).toISOString() : new Date().toISOString()
              });
          }
      }
      console.log(`Added ${topStoryIds.length} Hacker News stories to processing queue.`);
  } catch(e: any) {
      console.error("Hacker News API failed:", e.message);
  }

  // --- 1I. DEV.TO API INGESTION ---
  console.log("\n[1I] Fetching top articles from Dev.to API...");
  try {
      const devToRes = await axios.get("https://dev.to/api/articles?top=1&per_page=5");
      for (const article of devToRes.data) {
          articlesToProcess.push({
              title: article.title || "Dev.to Article",
              link: article.url,
              published_date: article.published_at || new Date().toISOString(),
              image_url: article.cover_image || article.social_image
          });
      }
      console.log(`Added ${devToRes.data.length} Dev.to articles to processing queue.`);
  } catch(e: any) {
      console.error("Dev.to API failed:", e.message);
  }

  // --- 1G. BLUESKY AT PROTOCOL INGESTION ---
  console.log("\n[1G] Fetching live posts from Bluesky API...");
  try {
      const bskyQuery = encodeURIComponent("AI OR web development");
      const bskyRes = await axios.get(`https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${bskyQuery}&limit=3`);
      const posts = bskyRes.data.posts || [];
      for (const post of posts) {
          const author = post.author?.handle || "Unknown";
          const text = post.record?.text || "";
          const link = `https://bsky.app/profile/${author}/post/${post.uri.split('/').pop()}`;
          
          globalSocialContext += `[Bluesky @${author}] ${text.substring(0, 100)}\n`;
          
          articlesToProcess.push({
              title: `Bluesky Insight by @${author}`,
              link: link,
              published_date: post.record?.createdAt || new Date().toISOString(),
              preFetchedContent: text,
              isSocial: true
          });
      }
      console.log(`Added ${posts.length} Bluesky posts to processing queue.`);
  } catch(e: any) {
      console.error("Bluesky API failed:", e.message);
  }

  // --- 1H. AUTONOMOUS YOUTUBE DISCOVERY ---
  if (searchTasks.includes('1H')) {
    console.log("\n[1H] Searching YouTube via Exa AI...");
    try {
        const ytResponse = await exa.search("tech announcements OR AI releases OR coding tutorials", {
            includeDomains: ["youtube.com"],
            useAutoprompt: true,
            startPublishedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            numResults: 2
        });
        let ytCount = 0;
        for (const result of ytResponse.results) {
            let rawTranscript = "";
            let aiSummary = "AI Summary unavailable: Video requires CAPTCHA or has disabled captions.";
            
            const videoIdMatch = result.url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;

            if (videoId) {
                try {
                    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
                    rawTranscript = transcriptArray.map((t: any) => t.text).join(' ').substring(0, 50000);
                } catch (primaryError: any) {
                    const errMsg = primaryError.message.toLowerCase();
                    if (errMsg.includes("captcha") || errMsg.includes("too many requests")) {
                        console.log(`Primary YouTube fetch hit CAPTCHA/IP Block. Attempting Piped API Fallback...`);
                        try {
                            const pipedRes = await axios.get(`https://pipedapi.kavin.rocks/streams/${videoId}`);
                            const subtitles = pipedRes.data?.subtitles;
                            if (subtitles && subtitles.length > 0) {
                                const enSub = subtitles.find((s: any) => s.code === 'en' || s.code === 'en-US' || s.code === 'en-GB' || s.autoGenerated);
                                if (enSub && enSub.url) {
                                    const subRes = await axios.get(enSub.url);
                                    rawTranscript = subRes.data.replace(/<[^>]*>?/gm, ' ').substring(0, 50000);
                                    console.log("Piped API Fallback successful!");
                                } else {
                                    throw new Error("No English subtitle track found on Piped.");
                                }
                            } else {
                                throw new Error("No subtitles array in Piped response.");
                            }
                        } catch (fallbackError: any) {
                            console.log(`Piped API Fallback failed: ${fallbackError.message}`);
                            errorLogs.push(`[YouTube Fallback] ${fallbackError.message}`);
                        }
                    } else {
                        console.log(`Skipping YouTube video ${result.url}: ${primaryError.message}`);
                        await handleApiError("YouTube", primaryError);
                    }
                }
            }

            if (!rawTranscript) {
                console.log(`Skipping ${result.url} - No transcript available for extraction.`);
                continue;
            }

            // Generate AI Summary if we got transcript
            if (rawTranscript) {
                try {
                    console.log(`Summarizing YouTube Video: ${result.title}...`);
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: `You are a Senior Technical Analyst. Read this raw YouTube transcript and write a highly detailed, comprehensive summary. Format your response with a 2-paragraph macro-overview of the video's core subject, followed by a 'Key Technical Takeaways' section with 5 to 7 detailed bullet points. Do not hallucinate; rely only on the transcript. \n\nTranscript: ${rawTranscript}`
                    });
                    if (response.text) {
                        aiSummary = response.text;
                    }
                } catch (geminiError: any) {
                    console.log(`Gemini summarization failed: ${geminiError.message}`);
                    await handleApiError("Gemini", geminiError);
                }
            }

            articlesToProcess.push({
                title: result.title || "YouTube Discovery",
                link: result.url,
                published_date: result.publishedDate,
                preFetchedContent: aiSummary
            });
            ytCount++;
        }
        console.log(`Added ${ytCount} YouTube videos to processing queue.`);
    } catch (error: any) {
        console.error("YouTube Discovery failed:", error.message);
        await handleApiError("Exa YouTube", error);
    }
  }

  console.log(`\nFinal Total Articles Queued for Processing: ${articlesToProcess.length}`);

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

      if (article.preFetchedContent) {
          console.log("Using pre-fetched content (skipping Jina/Firecrawl)...");
          markdownContent = article.preFetchedContent;
      } else {
          try {
            console.log("Extracting content with Jina AI...");
            await logTelemetry('crawl_attempt', article.link, 'Jina', 0);
            const jinaUrl = `https://r.jina.ai/${article.link}`;
            const response = await axios.get(jinaUrl, { 
              timeout: 10000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
              }
            });
            markdownContent = response.data;
            
          } catch (jinaError: any) {
            console.log(`Jina extraction failed or was blocked.`);
            blockedSites++;
            
            if (firecrawlBudget > 0) {
              console.log(`Falling back to Firecrawl deep scrape...`);
              firecrawlBudget--;
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
                await handleApiError("Firecrawl", firecrawlError);
                continue; 
              }
            } else {
              console.log(`Firecrawl budget exhausted (max 3 fallbacks). Skipping.`);
              continue;
            }
          }
      }

      if (!isValidArticle(markdownContent)) {
        console.log("Security wall detected in markdown, aborting article.");
        await logTelemetry('blocked', article.link, 'Jina', 0);
        continue;
      }

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
      
      let facts = [];
      let extractTokens = 0;

      try {
        const extractionResponse = await groq.chat.completions.create({
          messages: [{ role: 'user', content: extractionPrompt }],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' }
        });
        
        extractTokens = extractionResponse.usage?.total_tokens || 0;
        await logTelemetry('api_usage', article.link, 'Groq-Extract', extractTokens);
        
        const rawJson = JSON.parse(extractionResponse.choices[0]?.message?.content || "{}");
        facts = Array.isArray(rawJson) ? rawJson : (rawJson.facts || Object.values(rawJson)[0] || []);
        
      } catch (groqExtractError: any) {
        console.log(`Groq extraction failed (${groqExtractError.message}). Falling back to Gemini...`);
        try {
          const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: extractionPrompt + "\n\nRespond with ONLY valid JSON.",
            config: {
              responseMimeType: "application/json"
            }
          });
          const rawJson = JSON.parse(geminiResponse.text || "{}");
          facts = Array.isArray(rawJson) ? rawJson : (rawJson.facts || Object.values(rawJson)[0] || []);
          console.log("Gemini fallback extraction successful!");
          await logTelemetry('api_usage', article.link, 'Gemini-Extract-Fallback', 1);
        } catch (geminiExtractError: any) {
          console.log(`Gemini fallback extraction also failed: ${geminiExtractError.message}`);
        }
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
      
      let verification: any = {};
      let verifyTokens = 0;

      try {
        const groqResponse = await groq.chat.completions.create({
          messages: [{ role: 'user', content: groqPrompt }],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' }
        });

        verifyTokens = groqResponse.usage?.total_tokens || 0;
        await logTelemetry('api_usage', article.link, 'Groq-Verify', verifyTokens);
        verification = JSON.parse(groqResponse.choices[0]?.message?.content || "{}");
        
      } catch (groqVerifyError: any) {
        console.log(`Groq verification failed (${groqVerifyError.message}). Falling back to Gemini...`);
        try {
          const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: groqPrompt + "\n\nRespond with ONLY valid JSON.",
            config: {
              responseMimeType: "application/json"
            }
          });
          verification = JSON.parse(geminiResponse.text || "{}");
          console.log("Gemini fallback verification successful!");
          await logTelemetry('api_usage', article.link, 'Gemini-Verify-Fallback', 1);
        } catch (geminiVerifyError: any) {
          console.log(`Gemini fallback verification also failed: ${geminiVerifyError.message}`);
        }
      }

      tokensUsed += (verifyTokens + extractTokens);
      websitesVisited++;
      
      const trustScore = verification.trust_score || 0;
      const hypeScore = verification.hype_score || 0;
      const sentiment = verification.sentiment || "Skeptical";
      const category = verification.category || "[Technical]";
      const impactSummary = verification.impact_summary || "No clear impact identified.";
      
      if (trustScore === 0 && hypeScore === 0 && impactSummary === "No clear impact identified.") {
          console.log("Verification output was empty or failed completely. Skipping DB insert.");
          continue;
      }

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
        published_date: article.published_date || new Date().toISOString(),
        video_metadata: article.video_metadata || null
      });
      
      if (error) {
        console.error("Error saving to Supabase:", error);
      } else {
        console.log("Successfully saved to Supabase!");
        successfulIngests.push(article.title);
        await sendRichNotifications(
          article.title, 
          article.link, 
          heroImage, 
          category, 
          trustScore, 
          hypeScore, 
          sentiment, 
          impactSummary, 
          facts
        );
      }
      
    } catch (error: any) {
      console.error(`Error processing article:`, error.message);
      await handleApiError("Groq/Pipeline", error);
    }

    console.log("Throttling RPM: Waiting 2.5s before next article...");
    await new Promise(r => setTimeout(r, 2500));
  }
  
  console.log("\n========================================");
  console.log("Dispatching final batch notifications...");
  await sendBatchTelegram();
  await sendAuditLog(successfulIngests, exaQueries, tavilyQueries, firecrawlCreditsUsed, tokensUsed, errorLogs);
  console.log("All notifications dispatched.");

  if (process.env.TELEGRAM_LOADING_MSG_ID && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      console.log(`Deleting Telegram loading message: ${process.env.TELEGRAM_LOADING_MSG_ID}`);
      await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/deleteMessage`, {
        params: {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          message_id: process.env.TELEGRAM_LOADING_MSG_ID
        }
      });
    } catch (err: any) {
      console.log(`Failed to delete Telegram loading message: ${err.message}`);
    }
  }

  console.log("Phase 37 Backend pipeline complete!");
  process.exit(0);
}

runTest();
