import { Bot, CallbackQueryContext, Context, InlineKeyboard } from "grammy";
import { isTeamMember } from "../config";
import { getGossip } from "../store";
import { CONTENT_LABELS, LEVEL_OPTIONS, isContentType, buildSystemPrompt, ContentType } from "../tones";
import { generateArticle } from "../groq";

async function guardTeamMember(ctx: CallbackQueryContext<Context>): Promise<boolean> {
  if (isTeamMember(ctx.from.id)) return true;
  await ctx.answerCallbackQuery({ text: "⛔ Только для команды кэмпа", show_alert: true });
  return false;
}

async function resolveGossip(
  ctx: CallbackQueryContext<Context>,
  gossipId: string
): Promise<string | null> {
  const text = getGossip(gossipId);
  if (!text) await ctx.answerCallbackQuery({ text: "Сплетня не найдена", show_alert: true });
  return text ?? null;
}

function contentTypeKeyboard(gossipId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("🗞️ Серьёзная",    `ct:${gossipId}:article_serious`)
    .text("😂 Смешная",       `ct:${gossipId}:article_funny`)
    .text("🌀 Абсурдная",     `ct:${gossipId}:article_absurd`)
    .row()
    .text("📢 Агитация",      `ct:${gossipId}:article_agitation`)
    .text("🏆 Легендарная",   `ct:${gossipId}:article_legendary`)
    .text("🤫 Сплетня",       `ct:${gossipId}:gossip`)
    .row()
    .text("💰 Заказной",      `ct:${gossipId}:paid_article`)
    .text("📋 Объявление",    `ct:${gossipId}:official_announcement`)
    .text("📺 Телепрограмма", `ct:${gossipId}:tv_schedule`)
    .row()
    .text("😄 Анекдот",       `ct:${gossipId}:joke`)
    .text("🔮 Гороскоп",      `ct:${gossipId}:horoscope`);
}

function levelKeyboard(buildData: (level: number) => string): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const level of LEVEL_OPTIONS) {
    kb.text(String(level), buildData(level));
  }
  return kb;
}

export function registerArticle(bot: Bot): void {
  // Step 1 — content type picker
  bot.callbackQuery(/^write:(.+)$/, async (ctx) => {
    if (!(await guardTeamMember(ctx))) return;
    const gossipId = ctx.match[1];
    if (!(await resolveGossip(ctx, gossipId))) return;

    await ctx.answerCallbackQuery();
    await ctx.reply("Выбери формат:", { reply_markup: contentTypeKeyboard(gossipId) });
  });

  // Step 2 — madness level picker
  bot.callbackQuery(/^ct:([^:]+):([^:]+)$/, async (ctx) => {
    if (!(await guardTeamMember(ctx))) return;
    const [, gossipId, contentType] = ctx.match;
    if (!(await resolveGossip(ctx, gossipId))) return;
    if (!isContentType(contentType)) {
      await ctx.answerCallbackQuery({ text: "Неизвестный формат", show_alert: true });
      return;
    }

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `${CONTENT_LABELS[contentType]}\n\nУровень безумия (0 = реальность, 10 = сюрреализм):`,
      { reply_markup: levelKeyboard((l) => `ml:${gossipId}:${contentType}:${l}`) }
    );
  });

  // Step 3 — tabloid level picker
  bot.callbackQuery(/^ml:([^:]+):([^:]+):(\d+)$/, async (ctx) => {
    if (!(await guardTeamMember(ctx))) return;
    const [, gossipId, contentType, madnessStr] = ctx.match;
    if (!(await resolveGossip(ctx, gossipId))) return;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `${CONTENT_LABELS[contentType as ContentType]} | 🌀 ${madnessStr}\n\nУровень желтизны (0 = спокойно, 10 = кликбейт):`,
      { reply_markup: levelKeyboard((l) => `tl:${gossipId}:${contentType}:${madnessStr}:${l}`) }
    );
  });

  // Step 4 — generate
  bot.callbackQuery(/^tl:([^:]+):([^:]+):(\d+):(\d+)$/, async (ctx) => {
    if (!(await guardTeamMember(ctx))) return;
    const [, gossipId, contentType, madnessStr, tabloidStr] = ctx.match;

    const gossipText = await resolveGossip(ctx, gossipId);
    if (!gossipText) return;

    if (!isContentType(contentType)) {
      await ctx.answerCallbackQuery({ text: "Неизвестный формат", show_alert: true });
      return;
    }

    const madness = parseInt(madnessStr, 10);
    const tabloid = parseInt(tabloidStr, 10);
    const label = CONTENT_LABELS[contentType];

    await ctx.answerCallbackQuery();
    await ctx.editMessageText("✍️ Генерирую...");

    try {
      const article = await generateArticle(buildSystemPrompt(contentType, madness, tabloid), gossipText);
      await ctx.editMessageText(`${label} | 🌀 ${madness} | 📰 ${tabloid}\n\n${article}`);
    } catch {
      await ctx.editMessageText("❌ Ошибка при генерации. Попробуй ещё раз.");
    }
  });
}
