import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { 
  sendRichNotifications, 
  sendApiExhaustedAlert, 
  sendAuditLog, 
  sendBatchTelegram,
  telegramBatch
} from './notifier.ts';

async function runTests() {
  console.log("🚀 Initializing Notification Demo Sequence...\n");

  // 1. Corporate/Macro Discord (Category: Corporate)
  console.log("Sending Corporate/Macro Alert...");
  await sendRichNotifications(
    "Nvidia Acquires AI Startup For $1.5B",
    "https://example.com/nvidia-ai-acquisition",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
    "Corporate & Tech Strategy",
    92,
    88,
    "Highly Bullish",
    "Nvidia's latest acquisition positions them strongly in the edge AI computing market, consolidating their hardware dominance with new proprietary software stacks.",
    ["Nvidia acquired edge AI startup for $1.5B", "Stock rose 4% in pre-market trading", "Expected to launch new edge server racks by Q4"]
  );

  // 2. Open-Source Repo Discord (Category: Open-Source)
  console.log("Sending Open-Source Repo Alert...");
  await sendRichNotifications(
    "Next.js 16 Drops Turbopack by Default",
    "https://example.com/nextjs-16-turbopack",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    "Open-Source Repo & Library",
    85,
    95,
    "Neutral/Informational",
    "Vercel has officially released Next.js 16, abandoning Webpack entirely in favor of Rust-based Turbopack for all default environments.",
    ["Next.js 16 released today", "Turbopack is now the default compiler", "Build times improved by up to 55%"]
  );

  // 3. Social/Video Discord (Category: Social)
  console.log("Sending Social/Video Alert...");
  await sendRichNotifications(
    "MKBHD Reviews the Apple Vision Pro 2",
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113",
    "Social & Video (YouTube)",
    98,
    99,
    "Slightly Bearish",
    "Top tech reviewer Marques Brownlee points out significant battery life regressions in the new Vision Pro, despite lighter weight and better screens.",
    ["Battery life reduced to 1.5 hours", "Weight reduced by 20%", "Field of view increased slightly"]
  );

  // 4. Alerts Discord (API Exhausted)
  console.log("Sending API Exhausted Alert...");
  await sendApiExhaustedAlert("Firecrawl API", "402 Payment Required: You have exhausted your plan's scraping credits. Please upgrade your billing.");

  // 5. Logs Discord (Master Telemetry)
  console.log("Sending Master Telemetry Log...");
  await sendAuditLog(
    ["Nvidia Acquires AI Startup For $1.5B", "Next.js 16 Drops Turbopack by Default", "MKBHD Reviews the Apple Vision Pro 2"],
    124,
    42,
    18,
    450892,
    ["Rate limit exceeded on Groq Llama-3 parsing for url: http://example.com/dead"]
  );

  // 6. Crash Webhook (GitHub Action Simulation)
  console.log("Sending GitHub Action Crash Alert...");
  if (process.env.DISCORD_CRASH_WEBHOOK_URL) {
    try {
      await axios.post(process.env.DISCORD_CRASH_WEBHOOK_URL, {
        content: "🚨 **CRITICAL PIPELINE CRASH** - The GitHub Actions workflow failed at the environment level! Please inspect the logs immediately."
      });
      console.log("Crash alert sent!");
    } catch (e) {
      console.error("Failed to send Crash Alert");
    }
  }

  // 7. Telegram Batch
  console.log("Sending Telegram Batch Messages (includes the 3 articles)...");
  // Also push a manual crash alert to Telegram to simulate GitHub actions
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      parse_mode: "HTML",
      text: "🚨 <b>Category: Critical Pipeline Crash</b> - The GitHub Actions runner failed."
    });
    console.log("Telegram Crash alert sent!");
  } catch (e) {
    console.error("Failed to send Telegram crash alert");
  }

  await sendBatchTelegram();

  console.log("\n✅ Demo Sequence Complete! Check your Discord and Telegram!");
}

runTests();
