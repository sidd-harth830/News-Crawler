import axios from "axios";
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
    console.log("🔥 [1/3] Fetching top stories from Hacker News Firebase API...");
    
    try {
        // Fetch top story IDs
        const topStoriesRes = await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json");
        const topStoryIds = topStoriesRes.data.slice(0, 3); // Take top 3 for isolated testing

        if (!topStoryIds || topStoryIds.length === 0) {
            console.log("❌ No stories found.");
            return;
        }

        console.log(`✅ Found top ${topStoryIds.length} stories. Fetching details...\n`);

        for (const id of topStoryIds) {
            const storyRes = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const story = storyRes.data;

            if (!story || !story.url) {
                console.log(`⚠️ Story ${id} has no URL (might be an Ask HN). Skipping...`);
                continue;
            }

            console.log(`======================================`);
            console.log(`📰 Article: ${story.title}`);
            console.log(`🔗 URL: ${story.url}`);
            console.log(`📈 Score: ${story.score}`);
            console.log(`======================================`);

            console.log("🕸️  [2/3] Extracting content with Jina AI...");
            
            try {
                const jinaUrl = `https://r.jina.ai/${story.url}`;
                const jinaResponse = await axios.get(jinaUrl, { timeout: 15000 });
                
                const markdownContent = jinaResponse.data;
                console.log(`✅ Jina AI Extraction Successful! Extracted ${markdownContent.length} characters.`);
                console.log(`\n📄 --- SNIPPET --- 📄`);
                console.log(markdownContent.substring(0, 300) + "...");
                console.log("----------------------\n");

            } catch (jinaError: any) {
                console.log(`❌ Jina AI failed for ${story.url}: ${jinaError.message}`);
                
                // Firecrawl Fallback
                console.log("🕷️  [3/3] Falling back to Firecrawl deep scrape...");
                if (!process.env.FIRECRAWL_API_KEY) {
                    console.log("⚠️ FIRECRAWL_API_KEY missing. Cannot perform fallback.");
                    continue;
                }

                try {
                    const firecrawlUrl = 'https://api.firecrawl.dev/v1/scrape';
                    const firecrawlResponse = await axios.post(
                        firecrawlUrl,
                        { url: story.url, formats: ["markdown"] },
                        { 
                            headers: { 
                                'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                                'Content-Type': 'application/json'
                            } 
                        }
                    );
                    
                    if (firecrawlResponse.data && firecrawlResponse.data.success) {
                        const markdown = firecrawlResponse.data.data.markdown;
                        console.log(`✅ Firecrawl Extraction Successful! Extracted ${markdown.length} characters.`);
                    } else {
                        console.log("❌ Firecrawl returned unsuccessful response.");
                    }
                } catch (fcError: any) {
                    console.log(`❌ Firecrawl failed as well: ${fcError.message}\n`);
                }
            }
        }
        
        console.log("🎉 Autonomous Hacker News Discovery Test Complete!");

    } catch (error: any) {
        console.error("❌ Failed during execution:", error.message);
    }
}

run().catch(console.error);
