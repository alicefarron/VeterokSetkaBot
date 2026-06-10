import { Bot, InlineKeyboard } from "grammy";
import { TEAM_CHAT_ID, TEAM_THREAD_ID } from "../config";
import { storeGossip } from "../store";

export function registerGossip(bot: Bot): void {
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;
    if (ctx.chat.type !== "private" && !ctx.message.is_topic_message) return;

    const gossipText = ctx.message.text;
    const gossipId = storeGossip(gossipText);
    const sender = ctx.from.username
      ? `@${ctx.from.username}`
      : `[${ctx.from.first_name}](tg://user?id=${ctx.from.id})`;

    await ctx.reply("Сплетня принята 🤫");

    const keyboard = new InlineKeyboard().text("✍️ Написать статью", `write:${gossipId}`);

    await bot.api.sendMessage(
      TEAM_CHAT_ID,
      `🌬️ Новая сплетня из Ветерка:\n"${gossipText}"\n— ${sender}`,
      { reply_markup: keyboard, message_thread_id: TEAM_THREAD_ID, parse_mode: "Markdown" }
    );
  });
}
