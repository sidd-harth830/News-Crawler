<div align="center">

# 🌌 Omni-Channel Tech Radar

**An Autonomous, AI-Powered Intelligence Pipeline & Command Center**

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=20&duration=4000&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=Autonomous+Tech+Intelligence;Real-Time+Telemetry;AI-Verified+Data)](https://git.io/typing-svg)

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](#)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](#)

<br/>

![GitHub Repository Stats](https://github-readme-stats.vercel.app/api?username=sidd-harth830&repo=News-Crawler&theme=tokyonight&show_icons=true&hide_border=true&count_private=true)
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=sidd-harth830&repo=News-Crawler&theme=tokyonight&show_icons=true&hide_border=true&layout=compact)

![Visitor Badge](https://visitor-badge.laobi.icu/badge?page_id=sidd-harth830.News-Crawler&left_text=Visitors)

</div>

<br/>

> **Omni-Channel Tech Radar** transcends the standard RSS reader. It is a highly-tuned, autonomous intelligence pipeline designed to ingest the noise of the modern web and distill it into high-fidelity, verified signal. By leveraging massive parallel scraping, algorithmic AI verification, and real-time webhook routing, it serves as a central command center for tracking the bleeding edge of technology.

---

## 🏗️ System Architecture: The Deep Dive

Our architecture is strictly divided into an autonomous backend ingestion engine and a highly interactive, serverless front-end dashboard. Every component was designed with fault-tolerance, speed, and real-time responsiveness in mind.

### 1. The Ingestion Engine (Data Harvesting)
Running completely serverlessly via **GitHub Actions**, our automated cron jobs awake every 90 minutes. This engine systematically sweeps a curated array of highly dense information vectors: RSS feeds, specific GitHub repository releases, and key YouTube channels. By orchestrating parallel fetch requests, we rapidly index raw, unstructured data before it hits the mainstream algorithm.

### 2. The AI Brain (Verification & Extraction)
Raw data is notoriously filled with clickbait and tracking garbage. We intercept URLs and strip them down to pure markdown using extraction APIs like **Firecrawl/Jina AI**. This raw text is immediately piped into the **Google Gemini API**, where a complex system prompt forces the LLM to:
- Eradicate clickbait and extract only the empirical facts.
- Generate a concise, boardroom-ready executive summary.
- Compute mathematical algorithmic scores out of 100 for **"Trust"** (verifiability) and **"Hype"** (marketing fluff).
- Categorize the vector as a Macro-Trend, Open-Source Repo, or General Tech News.

### 3. The Relational Database (State Management)
Verified intelligence is committed to a **Supabase PostgreSQL** database. Rather than relying on simple local state, our architecture implements robust **Row Level Security (RLS)** and complex junction tables (`user_read_status`). This empowers individual, authenticated users to have completely distinct states—allowing instantaneous tracking of Unread articles and securing historical data in a permanent, searchable **Archive Vault**.

### 4. The UI/UX Philosophy (The Command Center)
The frontend Next.js application was meticulously engineered to feel premium and frictionless.
- **Bento-Grid Masonry:** A Javascript-calculated, multi-column cascade that organizes dense data into a highly readable, Pinterest-style interface.
- **Custom Typography:** Driven by the bold and highly legible **Acorn** font for superior editorial hierarchy.
- **Optimistic UI:** When marking intelligence as 'Read', the UI instantly updates without waiting for server round-trips, ensuring zero interaction lag.
- **Soft Light Mode:** In addition to a sleek dark mode, we engineered a low-strain "Soft Light Mode" that utilizes warm stone tones instead of harsh pure whites, drastically reducing eye fatigue.

---

## 🛠️ Step-by-Step API Setup Guides

Because the Omni-Channel Tech Radar is deeply integrated with third-party webhooks and AI models, setting up your environment requires some API key generation. Follow these idiot-proof guides to get your command center fully online.

<details>
<summary><b>1. 💬 Discord Webhooks (Multi-Channel Routing)</b></summary>
<br/>

To receive real-time, categorized news alerts in your Discord server:
1. Open your Discord Server and create 4 distinct channels (e.g., `#macro-news`, `#repo-alerts`, `#video-intel`, `#server-logs`).
2. Hover over a channel, click the **Gear Icon (Edit Channel)**.
3. Navigate to **Integrations** -> **Webhooks** -> **New Webhook**.
4. Name the Webhook, copy the **Webhook URL**, and save your changes.
5. Repeat this for all 4 channels and paste the URLs into your backend `.env` variables:
   - `DISCORD_MACRO_WEBHOOK_URL`
   - `DISCORD_REPO_WEBHOOK_URL`
   - `DISCORD_VIDEO_WEBHOOK_URL`
   - `DISCORD_CRASH_WEBHOOK_URL`
</details>

<details>
<summary><b>2. 🤖 Telegram Bot Configuration (Broadcasts)</b></summary>
<br/>

To receive formatted intelligence broadcasts straight to your phone:
1. Open Telegram and search for **@BotFather**.
2. Start a chat and send the command `/newbot`.
3. Follow the prompts to name your bot and choose a username.
4. BotFather will reply with an **HTTP API Token**. Save this as your `TELEGRAM_BOT_TOKEN`.
5. To get your **Chat ID**, send a message to your new bot, then open your browser and visit:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
6. Look for the `"chat": {"id": 123456789}` array in the JSON response. Save this number as your `TELEGRAM_CHAT_ID`.
</details>

<details>
<summary><b>3. 🧠 Gemini AI & 🗄️ Supabase Configuration</b></summary>
<br/>

**Google Gemini API:**
1. Navigate to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key** and generate a new key for a new project. 
3. Save this as your `GEMINI_API_KEY`.

**Supabase Configuration:**
1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Go to **Project Settings** -> **API**.
3. Copy your Project URL and anon `public` key for your frontend `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Scroll down and copy the `service_role` secret key for your backend and server actions (`SUPABASE_SERVICE_ROLE_KEY`).
</details>

---

## 🚀 Installation & Deployment

Deploying your local instance is straightforward once your environment is configured.

```bash
# 1. Clone the repository
git clone https://github.com/sidd-harth830/News-Crawler.git

# 2. Install dependencies for the frontend dashboard
cd "News Crawler/frontend"
npm install

# 3. Spin up the Next.js development server
npm run dev
```

*Note: The backend engine runs autonomously in GitHub Actions. Be sure to configure your repository secrets before enabling the workflow!*
