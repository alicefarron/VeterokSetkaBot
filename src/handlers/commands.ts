import { Bot } from "grammy";

export function registerCommands(bot: Bot): void {
  bot.command(["start", "help"], (ctx) =>
    ctx.reply(
      "👋 Привет! Это анонимный бот для сплетен лагеря Ветерок.\n\n" +
        "Просто напиши любое сообщение — и оно анонимно уйдёт команде.\n\n" +
        "🤫 Имя отправителя нигде не сохраняется и не передаётся."
    )
  );

  bot.command("chatid", (ctx) =>
    ctx.reply(`Chat ID: \`${ctx.chat.id}\``, { parse_mode: "Markdown" })
  );
}
