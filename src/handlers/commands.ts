import { Bot } from "grammy";

export function registerCommands(bot: Bot): void {
  bot.command(["start", "help"], (ctx) =>
    ctx.reply(
      "Привет, житель города Ветерок! 👋\n\n" +
        "Здесь ты можешь поделиться с нами слухом или сплетней, которые определённо точно не попадут потом в газету...\n\n" +
        "Просто напиши сообщение 🤫"
    )
  );

  bot.command("chatid", (ctx) =>
    ctx.reply(`Chat ID: \`${ctx.chat.id}\``, { parse_mode: "Markdown" })
  );
}
