import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function generateBriefing() {
  console.log("Starting Daily Briefing generation...");
  
  // Get articles from the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: articles, error } = await supabase
    .from('curated_news')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .order('trust_score', { ascending: false })
    .limit(5);

  if (error || !articles || articles.length === 0) {
    console.log("No articles found in the last 24 hours to generate a briefing.");
    return;
  }

  const prompt = `
You are a senior tech analyst and executive.
Based on the following top tech/corporate news from the last 24 hours, generate a "Morning Briefing".
The briefing must consist of exactly 3 concise, highly professional bullet points summarizing the macro shifts of the day.

Articles:
${articles.map(a => `- [${a.category}] ${a.title}\n  Summary: ${a.impact_summary}`).join('\n\n')}

Return ONLY the 3 bullet points, using markdown list format (-). Keep them incredibly high-signal and executive-focused.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const content = response.text;
    
    if (content) {
      // Save to Supabase
      await supabase.from('daily_briefings').insert([{ content }]);
      console.log("Successfully generated and saved the Daily Briefing!");
      console.log(content);
    }
  } catch (err: any) {
    console.error("Failed to generate briefing:", err.message);
  }
}

generateBriefing();
