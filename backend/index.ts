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

async function runTest() {
  console.log("Fetching RSS feed...");
  try {
    // 1. Discovery
    const feed = await parser.parseURL('https://techcrunch.com/feed/');
    const latestItem = feed.items[0];
    
    if (!latestItem || !latestItem.link) {
      console.log("No articles found.");
      return;
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
      return;
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
      console.log("No facts extracted, aborting scoring.");
      return;
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
    
    console.log("\nBackend pipeline complete!");
    
  } catch (error) {
    console.error("Error during execution:", error);
  }
}

runTest();
