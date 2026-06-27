import ytSearch from 'yt-search';
import axios from 'axios';

async function fetchVideoStats(videoId: string) {
    try {
        console.log(`\nFetching base metadata for ${videoId} using yt-search...`);
        const info = await ytSearch({ videoId });
        
        console.log(`Fetching dislike stats using Return YouTube Dislike API...`);
        let dislikes = 0;
        let likes = 0;
        try {
            const dislikeRes = await axios.get(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`);
            dislikes = dislikeRes.data?.dislikes || 0;
            likes = dislikeRes.data?.likes || 0; // Return YT Dislike API also returns accurate likes!
        } catch(e: any) {
            console.log(`Could not fetch dislikes: ${e.message}`);
        }

        const videoMetadata = {
            channel_name: info.author?.name || "Unknown Channel",
            subscriber_count: 0, // yt-search doesn't return subscriber count natively
            likes: likes, // Used Return YT Dislike API for likes since it's accurate
            dislikes: dislikes,
            comment_count: 0, // yt-search doesn't return comments
            video_duration: info.timestamp || "0:00",
            publish_date: info.uploadDate || new Date().toISOString()
        };

        console.log("\n🎬 --- SCRAPED METADATA --- 🎬");
        console.log(JSON.stringify(videoMetadata, null, 2));
        console.log("----------------------------\n");
        console.log("Full info object keys:", Object.keys(info));
        
    } catch(err: any) {
        console.error("Scraping failed:", err.message);
    }
}

fetchVideoStats("mZwQK3azIX0").catch(console.error);
