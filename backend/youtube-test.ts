import Exa from "exa-js";
import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

dotenv.config();

// Ensure keys are present
if (!process.env.EXA_API_KEY) throw new Error("Missing EXA_API_KEY");
if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

const exa = new Exa(process.env.EXA_API_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
    console.log("🔍 [1/3] Searching YouTube via Exa AI for recent tech news...");
    
    // 24 hours ago
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Exa Search targeting only YouTube
    const searchRes = await exa.search("tech announcements OR AI releases OR coding tutorials", {
        includeDomains: ["youtube.com"],
        useAutoprompt: true,
        startPublishedDate: yesterday,
        numResults: 2 // Limit to 2 for the isolated test
    });

    if (!searchRes.results || searchRes.results.length === 0) {
        console.log("❌ No YouTube videos found in the last 24 hours.");
        return;
    }

    console.log(`✅ Found ${searchRes.results.length} videos. Processing...\n`);

    for (const result of searchRes.results) {
        console.log(`======================================`);
        console.log(`🎬 Video: ${result.title}`);
        console.log(`🔗 URL: ${result.url}`);
        console.log(`======================================`);
        
        try {
            console.log("📜 [2/3] Extracting Transcript...");
            // Pass the URL to youtube-transcript
            const transcriptArray = await YoutubeTranscript.fetchTranscript(result.url);
            
            if (!transcriptArray || transcriptArray.length === 0) {
                console.log("⚠️ No transcript available for this video (might be disabled by creator or it's a short). Skipping...\n");
                continue;
            }

            // Join the transcript text
            const rawTranscript = transcriptArray.map(t => t.text).join(' ');
            console.log(`✅ Extracted transcript length: ${rawTranscript.length} characters.`);
            
            // Truncate if it's wildly long to ensure fast testing
            const textToSummarize = rawTranscript.substring(0, 50000); 

            console.log("🤖 [3/3] Generating Journalistic Summary with Gemini 2.5 Flash...");
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are an elite tech journalist. Analyze the following YouTube video transcript and write a concise, journalistic summary (2-3 paragraphs). Highlight the key announcements, technical details, or tutorials covered. \n\nTranscript: ${textToSummarize}`
            });

            console.log("\n📰 --- GEMINI SUMMARY --- 📰");
            console.log(response.text);
            console.log("----------------------------\n");

        } catch (error: any) {
            console.error(`❌ Failed to process video ${result.url}:`, error.message, "\n");
        }
    }
    
    console.log("🎉 Autonomous YouTube Discovery Test Complete!");
}

run().catch(console.error);
