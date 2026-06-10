# Camp Gossip Bot 🌬️

Anonymous gossip collector for camp participants with AI-powered article generation for the team.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | How to get it |
|---|---|
| `BOT_TOKEN` | Message [@BotFather](https://t.me/BotFather) on Telegram → `/newbot` → copy the token |
| `TEAM_CHAT_ID` | Add the bot to your team group, send a message, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` — look for `"chat":{"id":...}`. For channels use the channel ID. Negative numbers (e.g. `-1001234567890`) are normal for groups. |
| `TEAM_MEMBER_IDS` | Get your numeric user ID via [@userinfobot](https://t.me/userinfobot). Comma-separate multiple IDs: `123456789,987654321` |
| `GROQ_API_KEY` | Sign up at [console.groq.com](https://console.groq.com), go to **API Keys** → **Create API Key** |

### 3. Run

**Development (no build step):**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## How it works

**Participants** message the bot any text → they get "Сплетня принята 🤫" and their message is forwarded anonymously to the team chat. No sender info is stored.

**Team members** see gossip in the team chat with a **[✍️ Написать статью]** button. Clicking it (team-only, checked by Telegram user ID) opens a tone picker. After selecting a tone the bot calls the Groq API and replaces the "generating…" placeholder with a finished article.
