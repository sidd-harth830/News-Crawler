import Groq from "groq-sdk";
import * as dotenv from 'dotenv';

dotenv.config();

// Ensure keys are present
if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
    console.log("🦋 [1/3] Fetching live posts from Bluesky Public API...");
    
    // Bluesky Unauthenticated Search API
    const query = encodeURIComponent("AI OR web development");
    const url = `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${query}&limit=3`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Bluesky API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        const posts = data.posts || [];
        
        if (posts.length === 0) {
            console.log("❌ No posts found.");
            return;
        }

        console.log(`✅ Found ${posts.length} posts. Analyzing Sentiment & Hype... \n`);

        for (const post of posts) {
            const author = post.author?.handle || "Unknown";
            const text = post.record?.text || "";
            const likes = post.likeCount || 0;
            const reposts = post.repostCount || 0;
            const engagement = likes + reposts;

            console.log(`======================================`);
            console.log(`👤 Author: @${author}`);
            console.log(`💬 Post: "${text.replace(/\n/g, ' ')}"`);
            console.log(`🔥 Engagement: ${likes} Likes, ${reposts} Reposts`);
            console.log(`======================================`);

            console.log("🧠 [2/3] Running Groq Llama 3.3 Sentiment Analysis...");
            
            // Build the prompt for Groq
            const prompt = `You are a social media sentiment analyzer. Analyze the following tech post and determine its sentiment (Positive, Negative, or Neutral) and calculate a "Hype Score" from 0 to 100 based on the text's excitement level and the engagement metrics (${engagement} total interactions). 
            
            Respond STRICTLY in JSON format with no markdown formatting:
            {"sentiment": "Positive|Negative|Neutral", "hype_score": number, "reason": "1 sentence explanation"}

            Post text: "${text}"`;

            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.2,
                response_format: { type: 'json_object' }
            });

            const resultRaw = chatCompletion.choices[0]?.message?.content || "{}";
            const result = JSON.parse(resultRaw);

            console.log("📊 --- ANALYSIS RESULTS --- 📊");
            console.log(`Sentiment:  ${result.sentiment}`);
            console.log(`Hype Score: ${result.hype_score}/100`);
            console.log(`Reason:     ${result.reason}`);
            console.log("----------------------------\n");
        }
        
        console.log("🎉 Autonomous Bluesky Discovery Test Complete!");

    } catch (error: any) {
        console.error("❌ Failed during execution:", error.message);
    }
}

run().catch(console.error);
