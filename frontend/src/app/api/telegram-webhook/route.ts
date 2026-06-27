import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Telegram sends the message object
    const message = body?.message;
    if (!message || !message.text) {
      return NextResponse.json({ status: "ignored", reason: "No text message" }, { status: 200 });
    }

    const chatId = message.chat.id.toString();
    
    // Fallback parser in case frontend/.env.local is missing the keys during local testing
    let allowedChatId = process.env.TELEGRAM_CHAT_ID;
    let githubPat = process.env.GITHUB_PAT;
    let tgToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!allowedChatId || !githubPat || !tgToken) {
      try {
        const backendEnvPath = path.join(process.cwd(), '../backend/.env');
        const envFile = fs.readFileSync(backendEnvPath, 'utf8');
        
        if (!allowedChatId) {
          const m = envFile.match(/TELEGRAM_CHAT_ID=(.+)/);
          if (m) allowedChatId = m[1].trim().replace(/^["']|["']$/g, '');
        }
        if (!tgToken) {
          const m = envFile.match(/TELEGRAM_BOT_TOKEN=(.+)/);
          if (m) tgToken = m[1].trim().replace(/^["']|["']$/g, '');
        }
        if (!githubPat) {
          const m = envFile.match(/GITHUB_PAT=(.+)/);
          if (m) githubPat = m[1].trim().replace(/^["']|["']$/g, '');
        }
      } catch(e) {
        console.warn("Could not parse backend/.env for missing variables.");
      }
    }
    
    // Step 2 Security Check: Prevent unauthorized users from triggering our cloud crawlers
    if (chatId !== allowedChatId) {
      console.warn(`Unauthorized scan attempt from Chat ID: ${chatId} (Expected: ${allowedChatId})`);
      return NextResponse.json({ status: "unauthorized" }, { status: 403 });
    }

    // Only process exactly "/scan"
    if (message.text.trim() === '/scan') {
      if (!githubPat) {
        console.error("GITHUB_PAT is missing from environment variables!");
        return NextResponse.json({ status: "error", message: "Missing PAT" }, { status: 500 });
      }

      // Ping GitHub Actions REST API to trigger workflow_dispatch
      const githubApiUrl = 'https://api.github.com/repos/sidd-harth830/News-Crawler/actions/workflows/cron.yml/dispatches';
      
      const ghResponse = await fetch(githubApiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubPat}`,
          'User-Agent': 'News-Crawler-Webhook',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ ref: 'master' }),
      });

      if (!ghResponse.ok) {
        const errText = await ghResponse.text();
        console.error("GitHub API failed:", ghResponse.status, errText);
        return NextResponse.json({ status: "error", message: "GitHub Trigger Failed" }, { status: 500 });
      }

      // User Feedback: Acknowledge the command via Telegram API
      if (tgToken) {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: "🚀 Manual override accepted. Initializing web crawlers. Scanning the internet now..."
          })
        });
      }

      return NextResponse.json({ status: "success", message: "Workflow triggered!" }, { status: 200 });
    }

    // Acknowledge other messages cleanly so Telegram doesn't retry
    return NextResponse.json({ status: "ignored", reason: "Not a /scan command" }, { status: 200 });
    
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error.message);
    return NextResponse.json({ status: "error", message: "Internal Server Error" }, { status: 500 });
  }
}
