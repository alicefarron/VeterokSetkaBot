import { Bot } from "grammy";
import { BOT_TOKEN } from "./config";
import { registerCommands } from "./handlers/commands";
import { registerGossip } from "./handlers/gossip";
import { registerArticle } from "./handlers/article";

const bot = new Bot(BOT_TOKEN);

registerCommands(bot);
registerGossip(bot);
registerArticle(bot);

bot.start();
