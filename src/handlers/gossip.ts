import { Bot, InlineKeyboard } from "grammy";
import { TEAM_CHAT_ID, TEAM_THREAD_ID } from "../config";
import { storeGossip, getGossip, deleteGossip } from "../store";
import { logSender } from "../logger";

async function forwardGossip(
  bot: Bot,
  gossipId: string,
  signature: string,
  parseMode?: "Markdown"
): Promise<void> {
  const entry = getGossip(gossipId);
  if (!entry) return;

  deleteGossip(gossipId);
  logSender(gossipId, entry.userId, entry.username, entry.firstName, entry.text);

  const keyboard = new InlineKeyboard().text("✍️ Написать статью", `write:${gossipId}`);

  await bot.api.sendMessage(
    TEAM_CHAT_ID,
    `🌬️ Новая сплетня из Ветерка:\n"${entry.text}"\n— ${signature}`,
    { reply_markup: keyboard, message_thread_id: TEAM_THREAD_ID, parse_mode: parseMode }
  );
}

export function registerGossip(bot: Bot): void {
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;
    if (ctx.chat.type !== "private" && !ctx.message.is_topic_message) return;

    const gossipId = storeGossip({
      text: ctx.message.text,
      userId: ctx.from.id,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });

    const keyboard = new InlineKeyboard()
      .text("🤫 Анонимно", `anon:${gossipId}`)
      .text("👤 С авторством", `named:${gossipId}`);

    await ctx.reply("Как отправить сплетню?", { reply_markup: keyboard });
  });

  bot.callbackQuery(/^anon:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("Сплетня принята 🤫");
    await forwardGossip(bot, ctx.match[1], "Аноним");
  });

  bot.callbackQuery(/^named:(.+)$/, async (ctx) => {
    const entry = getGossip(ctx.match[1]);
    const hasUsername = !!entry?.username;
    const signature = hasUsername
      ? `@${entry!.username}`
      : `[${ctx.from.first_name}](tg://user?id=${ctx.from.id})`;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText("Сплетня принята 🤫");
    await forwardGossip(bot, ctx.match[1], signature, hasUsername ? undefined : "Markdown");
  });
}
