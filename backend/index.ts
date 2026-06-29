import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { generateObject } from 'ai';
import { z } from 'zod';
import { search } from 'duck-duck-scrape';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import Exa from 'exa-js';
import { tavily } from '@tavily/core';
import 'dotenv/config';

// --- 1. Global Configuration & Client Setup ---

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY as string });

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY as string,
});

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY as string,
});

const cerebras = createOpenAI({
  baseURL: 'https://api.cerebras.ai/v1',
  apiKey: process.env.CEREBRAS_API_KEY as string,
});

const github = createOpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GH_MODELS_TOKEN as string,
});

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

// --- 2. The Scout Agent (NewsData.io) ---

async function runScoutAgent() {
  console.log(`[Scout] Fetching latest technology news via NewsData.io...`);
  try {
    const res = await axios.get(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&category=technology&language=en`);
    if (res.data && res.data.results) {
      // Loop top 3 urls to save tokens during testing
      const urls = res.data.results.slice(0, 3).map((article: any) => article.link);
      console.log(`[Scout] Found ${urls.length} URLs via NewsData.`);
      return urls;
    }
    return [];
  } catch (error: any) {
    console.error(`[Scout] ⚠️ Scout Agent failed, relying on fallback sources. Error: ${error.message}`);
    return [];
  }
}

async function getHackerNewsUrls() {
  try {
    const res = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = res.data.slice(0, 2);
    const urls: string[] = [];
    for (const id of ids) {
      const story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (story.data && story.data.url) urls.push(story.data.url);
    }
    return urls;
  } catch (e: any) {
    console.error(`[Scout-Fallback] HackerNews failed: ${e.message}`);
    return [];
  }
}

async function getDevToUrls() {
  try {
    const res = await axios.get('https://dev.to/api/articles?top=1&per_page=2');
    return res.data.map((a: any) => a.url);
  } catch (e: any) {
    console.error(`[Scout-Fallback] Dev.to failed: ${e.message}`);
    return [];
  }
}

async function getExaUrls() {
  if (!process.env.EXA_API_KEY) return [];
  try {
    const exa = new (Exa as any)(process.env.EXA_API_KEY);
    const result = await exa.searchAndContents("latest artificial intelligence startup news", { type: "neural", numResults: 2 });
    return result.results.map((r: any) => r.url);
  } catch (e: any) {
    console.error(`[Scout-Fallback] Exa failed: ${e.message}`);
    return [];
  }
}

async function getTavilyUrls() {
  if (!process.env.TAVILY_API_KEY) return [];
  try {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const res = await tvly.search("latest tech news", { maxResults: 2 });
    return res.results.map((r: any) => r.url);
  } catch (e: any) {
    console.error(`[Scout-Fallback] Tavily failed: ${e.message}`);
    return [];
  }
}


// --- 3. Agent Section 1: The Harvester ---

const HarvesterSchema = z.object({
  rawTextSummary: z.string().describe("A concise summary of the scraped content."),
  coreClaimsToVerify: z.array(z.string()).describe("List of critical claims or facts that require verification.")
});

async function runHarvesterAgent(url: string) {
  let scrapedText = "";

  try {
    console.log(`[Harvester] Attempting to scrape with Spider Cloud: ${url}`);
    const spiderRes = await axios.post(
      'https://api.spider.cloud/crawl',
      { url, limit: 1, return_format: "markdown" },
      { headers: { 'Authorization': `Bearer ${process.env.SPIDER_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    scrapedText = spiderRes.data[0]?.content || "";
    if (!scrapedText) throw new Error("Spider Cloud returned empty content.");
  } catch (spiderError: any) {
    console.log(`[Harvester] Spider Cloud failed (${spiderError.message}). Falling back to Firecrawl...`);
    const firecrawlRes = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      { url, formats: ['markdown'] },
      { headers: { 'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    
    if (firecrawlRes.data && firecrawlRes.data.success) {
      scrapedText = firecrawlRes.data.data.markdown;
    } else {
      throw new Error("Both Spider Cloud and Firecrawl scraping failed.");
    }
  }

  const prompt = `You are an expert data extractor. Review the following scraped article text and extract a concise summary and a list of core claims that must be fact-checked.\n\nText: ${scrapedText.substring(0, 15000)}`;

  let activeModel = '';
  try {
    console.log(`[Harvester] Extracting with Primary Brain (Mistral)...`);
    const result = await generateObject({
      model: mistral('mistral-large-latest'),
      schema: HarvesterSchema,
      prompt: prompt,
    });
    activeModel = 'Mistral-Large';
    return { data: result.object, modelUsed: activeModel };
  } catch (primaryError: any) {
    console.log(`[Harvester] Primary Brain failed (${primaryError.message}). Falling back to Cerebras...`);
    const result = await generateObject({
      model: cerebras('llama3.1-70b'),
      schema: HarvesterSchema,
      prompt: prompt,
    });
    activeModel = '⚠️ Fallback Triggered: Cerebras';
    return { data: result.object, modelUsed: activeModel };
  }
}

// --- 4. Agent Section 2: The Verifier ---

const VerifierSchema = z.object({
  claimVerifications: z.array(z.object({
    claim: z.string(),
    isVerified: z.boolean(),
    confidenceScore: z.number().min(0).max(100),
    sourceUrls: z.array(z.string())
  })),
  overallTrustRating: z.number().min(0).max(100)
});

async function runVerifierAgent(claims: string[]) {
  console.log(`[Verifier] Cross-referencing ${claims.length} claims via duck-duck-scrape...`);
  
  let searchContext = "";
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (const claim of claims) {
    try {
      const searchResults = await search(claim);
      const topResults = searchResults.results.slice(0, 3);
      searchContext += `\nClaim: "${claim}"\n`;
      topResults.forEach(r => {
        searchContext += `- Source: ${r.url}\n  Snippet: ${r.description}\n`;
      });
      await delay(2500);
    } catch (e: any) {
      console.log(`[Verifier] Live search failed for claim "${claim}": ${e.message}`);
    }
  }

  const prompt = `You are a strict fact-checker. Review the original claims against the provided live search snippets. Verify if each claim is true, assign a confidence score, and list the source URLs. Finally, assign an overall trust rating.\n\nContext:\n${searchContext}`;

  let activeModel = '';
  try {
    console.log(`[Verifier] Verifying with Primary Brain (OpenRouter/Qwen)...`);
    const result = await generateObject({
      model: openrouter('qwen/qwen-2.5-72b-instruct'),
      schema: VerifierSchema,
      prompt: prompt,
    });
    activeModel = 'Qwen-3-OpenRouter';
    return { data: result.object, modelUsed: activeModel };
  } catch (primaryError: any) {
    console.log(`[Verifier] Primary Brain failed (${primaryError.message}). Falling back to Gemini 1.5 Flash...`);
    const result = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: VerifierSchema,
      prompt: prompt,
    });
    activeModel = '⚠️ Fallback Triggered: Gemini 1.5 Flash';
    return { data: result.object, modelUsed: activeModel };
  }
}

// --- 5. Agent Section 3: The Curator ---

const CuratorSchema = z.object({
  title: z.string().describe("A catchy, premium title for the article."),
  cleanMarkdownContent: z.string().describe("The finalized markdown prose, written in a sleek 'Acorn' typography tone, tailored for a glassmorphism UI."),
  category: z.string().describe("The article category, e.g., 'Artificial Intelligence', 'Web Development'."),
  finalHypeScore: z.number().min(0).max(100),
  finalTrustScore: z.number().min(0).max(100),
  tags: z.array(z.string()).max(5)
});

async function runCuratorAgent(harvestData: any, verificationData: any) {
  const prompt = `You are a premium tech journalist writing for an elite SaaS product with a dark glassmorphism UI and Acorn typography tone. 
  
Review the following harvested data and its verification results. Write a polished, highly engaging markdown article. Ensure you synthesize the information, highlight verified facts, and assign final Hype and Trust scores based on the verifications.

Harvested Summary:
${harvestData.rawTextSummary}

Verification Data:
${JSON.stringify(verificationData.claimVerifications, null, 2)}
Overall Trust from Verifier: ${verificationData.overallTrustRating}
`;

  let activeModel = '';
  try {
    console.log(`[Curator] Drafting content with Primary Brain (GitHub Models/GPT-4o)...`);
    const result = await generateObject({
      model: github('gpt-4o'),
      schema: CuratorSchema,
      prompt: prompt,
    });
    activeModel = 'GPT-4o-GitHub';
    return { data: result.object, modelUsed: activeModel };
  } catch (primaryError: any) {
    console.log(`[Curator] Primary Brain failed (${primaryError.message}). Falling back to Gemini 1.5 Pro...`);
    const result = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: CuratorSchema,
      prompt: prompt,
    });
    activeModel = '⚠️ Fallback Triggered: Gemini 1.5 Pro';
    return { data: result.object, modelUsed: activeModel };
  }
}

// --- 6. The Boss Agent (The Supervisor & Telemetry Router) ---

async function sendDiscordTelemetry(embed: any) {
  if (!process.env.DISCORD_LOG_WEBHOOK) return;
  try {
    await axios.post(process.env.DISCORD_LOG_WEBHOOK, { embeds: [embed] });
  } catch (e: any) {
    console.error("Failed to send Discord telemetry:", e.message);
  }
}

export async function processPipeline() {
  console.log(`\n========================================`);
  console.log(`[Boss Agent] Initiating Pipeline...`);
  
  const scoutUrls = await runScoutAgent();
  const hnUrls = await getHackerNewsUrls();
  const devToUrls = await getDevToUrls();
  const exaUrls = await getExaUrls();
  const tavilyUrls = await getTavilyUrls();

  const allUrls = [...new Set([...scoutUrls, ...hnUrls, ...devToUrls, ...exaUrls, ...tavilyUrls])];

  if (allUrls.length === 0) {
    console.log("[Boss Agent] No URLs found from any source. Exiting.");
    return;
  }
  
  console.log(`[Boss Agent] Consolidated ${allUrls.length} total URLs for processing.`);

  for (const url of allUrls) {
    console.log(`\n[Boss Agent] Processing URL: ${url}`);
    const startTime = performance.now();
    let harvesterTime = 0, verifierTime = 0, curatorTime = 0;
    let harvesterModel = '', verifierModel = '', curatorModel = '';
    
    try {
      // Check for duplicates first before running expensive agents
      const { data: existing } = await supabase
        .from('curated_news')
        .select('id')
        .eq('url', url)
        .single();
        
      if (existing) {
        console.log("[Boss Agent] Article already exists in Supabase. Skipping DB insert & pipeline.");
        continue; // Go to next URL
      }

      // 1. Harvester
      const t0 = performance.now();
      const harvesterOutput = await runHarvesterAgent(url);
      harvesterTime = performance.now() - t0;
      harvesterModel = harvesterOutput.modelUsed;

      if (!harvesterOutput.data.coreClaimsToVerify || harvesterOutput.data.coreClaimsToVerify.length === 0) {
        throw new Error("Harvester found no claims to verify.");
      }

      // 2. Verifier
      const t1 = performance.now();
      const verifierOutput = await runVerifierAgent(harvesterOutput.data.coreClaimsToVerify);
      verifierTime = performance.now() - t1;
      verifierModel = verifierOutput.modelUsed;

      // 3. Curator
      const t2 = performance.now();
      const curatorOutput = await runCuratorAgent(harvesterOutput.data, verifierOutput.data);
      curatorTime = performance.now() - t2;
      curatorModel = curatorOutput.modelUsed;

      const { data: finalPayload } = curatorOutput;

      console.log("[Boss Agent] Saving verified payload to Supabase...");
      const { error } = await supabase.from('curated_news').insert({
        title: finalPayload.title,
        url: url,
        content_markdown: finalPayload.cleanMarkdownContent,
        trust_score: finalPayload.finalTrustScore,
        hype_score: finalPayload.finalHypeScore,
        sentiment: finalPayload.finalTrustScore > 70 ? "Positive" : "Skeptical",
        category: finalPayload.category,
        impact_summary: finalPayload.tags.join(", "),
        published_date: new Date().toISOString()
      });
      if (error) throw new Error(`Supabase insert failed: ${error.message}`);

      // Discord Telemetry - Success
      await sendDiscordTelemetry({
        title: "🟢 Pipeline Execution Success",
        description: `Successfully processed URL: [Link](${url})\n\n**Audit Trail:**\n[Harvester]: Success via ${harvesterModel} (${(harvesterTime / 1000).toFixed(1)}s)\n[Verifier]: Success via ${verifierModel} (${(verifierTime / 1000).toFixed(1)}s)\n[Curator]: Success via ${curatorModel} (${(curatorTime / 1000).toFixed(1)}s)`,
        color: 0x00FF00,
        fields: [
          { name: "Final Metrics", value: `Trust: ${finalPayload.finalTrustScore}/100\nHype: ${finalPayload.finalHypeScore}/100`, inline: false },
        ],
        footer: { text: `Total Time: ${((performance.now() - startTime) / 1000).toFixed(1)}s` }
      });

      console.log("[Boss Agent] Processing Complete for URL.");
      
    } catch (error: any) {
      console.error(`[Boss Agent] CRITICAL FAILURE for ${url}: ${error.message}`);
      
      // Discord Telemetry - Failure (using standard fetch to bypass axios issues)
      if (process.env.DISCORD_LOG_WEBHOOK) {
        try {
          await fetch(process.env.DISCORD_LOG_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: "🔴 **Pipeline Crash**",
                description: `URL: ${url}\nError: ${error.message}`,
                color: 0xFF0000,
                footer: { text: `Failed after ${((performance.now() - startTime) / 1000).toFixed(1)}s` }
              }]
            })
          });
        } catch (fetchErr) {
          console.error("[Boss Agent] Failed to send Discord crash log via fetch.");
        }
      }
    }
  }
}

// --- Execution Hook ---
async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("🚨 WARNING: GROQ_API_KEY is missing! Your local .env file might be missing from the backend directory.");
  }
  console.log("🚀 Initiating Boss Agent Swarm Pipeline...");
  await processPipeline();
}

main().catch(console.error);
