import { Router, type IRouter } from "express";
import TelegramBot from "node-telegram-bot-api";

const router: IRouter = Router();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.REPLIT_DOMAINS
  ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
  : "https://localhost";

const MINI_APP_URL = APP_URL;

let bot: TelegramBot | null = null;

if (BOT_TOKEN) {
  bot = new TelegramBot(BOT_TOKEN);

  // Set webhook
  const webhookUrl = `${APP_URL}/api/telegram/webhook`;
  bot.setWebHook(webhookUrl).then(() => {
    console.log(`Webhook set to: ${webhookUrl}`);
  }).catch((err) => {
    console.error("Failed to set webhook:", err.message);
  });

  // Set bot commands
  bot.setMyCommands([
    { command: "start", description: "Botni ishga tushirish" },
    { command: "catalog", description: "Katalogni ko'rish" },
    { command: "orders", description: "Buyurtmalarimni ko'rish" },
    { command: "help", description: "Yordam" },
  ]).catch(console.error);

  // Set menu button to open Mini App
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menu_button: {
        type: "web_app",
        text: "🛍 ABZ Market",
        web_app: { url: MINI_APP_URL }
      }
    })
  }).then(r => r.json()).then(d => {
    if (d.ok) console.log("Menu button set to:", MINI_APP_URL);
    else console.error("Failed to set menu button:", d.description);
  }).catch(console.error);
}

function getMainMenuKeyboard() {
  return {
    keyboard: [
      [
        { text: "🛍 Katalog", web_app: { url: `${MINI_APP_URL}/catalog` } },
        { text: "🔍 Mahsulot qidirish", web_app: { url: `${MINI_APP_URL}/catalog` } },
      ],
      [
        { text: "🛒 Savatcham", web_app: { url: `${MINI_APP_URL}/cart` } },
        { text: "📦 Buyurtmalarim", web_app: { url: `${MINI_APP_URL}/orders` } },
      ],
      [
        { text: "🏪 Do'konlar", web_app: { url: `${MINI_APP_URL}/stores` } },
        { text: "🤝 Hamkor bo'lish", web_app: { url: `${MINI_APP_URL}/register-store` } },
      ],
      [
        { text: "📊 Analitika", web_app: { url: `${MINI_APP_URL}/analytics` } },
        { text: "📞 Aloqa", callback_data: "contact" },
      ],
      [
        { text: "🏠 Bosh sahifa", web_app: { url: MINI_APP_URL } },
      ],
    ],
    resize_keyboard: true,
    persistent: true,
  };
}

function getInlineMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🛍 Katalog", web_app: { url: `${MINI_APP_URL}/catalog` } },
        { text: "🔍 Mahsulot qidirish", web_app: { url: `${MINI_APP_URL}/catalog` } },
      ],
      [
        { text: "🛒 Savatcham", web_app: { url: `${MINI_APP_URL}/cart` } },
        { text: "📦 Buyurtmalarim", web_app: { url: `${MINI_APP_URL}/orders` } },
      ],
      [
        { text: "🏪 Do'konlar", web_app: { url: `${MINI_APP_URL}/stores` } },
        { text: "🤝 Hamkor bo'lish", web_app: { url: `${MINI_APP_URL}/register-store` } },
      ],
      [
        { text: "📊 Analitika", web_app: { url: `${MINI_APP_URL}/analytics` } },
      ],
      [
        { text: "🏠 Ko'proq ma'lumot", callback_data: "info" },
      ],
    ],
  };
}

// Webhook endpoint
router.post("/telegram/webhook", async (req, res) => {
  try {
    const update = req.body;

    if (!bot || !update) {
      return res.sendStatus(200);
    }

    // Handle different update types
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || "";
      const firstName = msg.from?.first_name || "Foydalanuvchi";

      if (text === "/start" || text.startsWith("/start")) {
        await bot.sendMessage(
          chatId,
          `Assalomu alaykum, *${firstName}*! 👋\n\n` +
          `*ABZ_MARKET* ga xush kelibsiz! 🏪\n\n` +
          `Bu yerda siz quyidagilarni amalga oshirishingiz mumkin:\n` +
          `• Mebel va uy jihozlari xarid qilish\n` +
          `• Buyurtmalaringizni kuzatish\n` +
          `• O'z do'koningizni ochish\n\n` +
          `Quyidagi tugmalardan birini tanlang:`,
          {
            parse_mode: "Markdown",
            reply_markup: getMainMenuKeyboard(),
          }
        );

        // Also send inline keyboard with Mini App buttons
        await bot.sendMessage(
          chatId,
          `📱 *ABZ MARKET* mini ilovasini ochish uchun quyidagi tugmalardan foydalaning:`,
          {
            parse_mode: "Markdown",
            reply_markup: getInlineMenuKeyboard(),
          }
        );
      } else if (text === "/catalog") {
        await bot.sendMessage(chatId, "🛍 Katalogni ochish uchun tugmani bosing:", {
          reply_markup: {
            inline_keyboard: [[
              { text: "📂 Katalogni ochish", web_app: { url: `${MINI_APP_URL}/catalog` } }
            ]]
          }
        });
      } else if (text === "/orders") {
        await bot.sendMessage(chatId, "📦 Buyurtmalarimni ko'rish:", {
          reply_markup: {
            inline_keyboard: [[
              { text: "📦 Buyurtmalarimni ko'rish", web_app: { url: `${MINI_APP_URL}/orders` } }
            ]]
          }
        });
      } else if (text === "/help") {
        await bot.sendMessage(
          chatId,
          `*Yordam* 🆘\n\n` +
          `*ABZ MARKET* — O'zbekistondagi eng yirik mebel bozori platformasi.\n\n` +
          `*Buyurtma berish:*\n` +
          `1. Katalogdan mahsulot tanlang\n` +
          `2. Savatga qo'shing\n` +
          `3. Buyurtmani rasmiylashtiring\n\n` +
          `*Muammo bo'lsa:*\n` +
          `📞 +998 90 123-45-67\n` +
          `📧 info@abzmarket.uz`,
          {
            parse_mode: "Markdown",
            reply_markup: getMainMenuKeyboard(),
          }
        );
      } else if (text.startsWith("/")) {
        await bot.sendMessage(chatId, "❓ Noma'lum buyruq. /help yozing yoki quyidagi menyu tugmalaridan foydalaning.", {
          reply_markup: getMainMenuKeyboard(),
        });
      }
    }

    // Handle callback queries
    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message?.chat.id;

      if (chatId) {
        if (query.data === "contact") {
          await bot.sendMessage(chatId,
            `📞 *Aloqa ma'lumotlari:*\n\n` +
            `📱 Telefon: +998 90 123-45-67\n` +
            `📧 Email: info@abzmarket.uz\n` +
            `🌐 Web: abzmarket.uz`,
            { parse_mode: "Markdown" }
          );
        } else if (query.data === "info") {
          await bot.sendMessage(chatId,
            `ℹ️ *ABZ MARKET haqida:*\n\n` +
            `O'zbekistondagi eng yirik onlayn mebel bozori platformasi.\n\n` +
            `✅ 500+ mahsulot\n` +
            `✅ 50+ do'kon\n` +
            `✅ Tez yetkazib berish\n` +
            `✅ 1 yil kafolat`,
            {
              parse_mode: "Markdown",
              reply_markup: getInlineMenuKeyboard()
            }
          );
        }
      }

      await bot.answerCallbackQuery(query.id);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    res.sendStatus(200);
  }
});

// Get bot info endpoint
router.get("/telegram/info", async (req, res) => {
  try {
    if (!bot) {
      return res.json({ error: "Bot not configured" });
    }
    const me = await bot.getMe();
    res.json({ bot: me, miniAppUrl: MINI_APP_URL });
  } catch (err) {
    res.status(500).json({ error: "Failed to get bot info" });
  }
});

// Set webhook manually
router.post("/telegram/set-webhook", async (req, res) => {
  try {
    if (!bot) {
      return res.status(400).json({ error: "Bot not configured" });
    }
    const webhookUrl = `${APP_URL}/api/telegram/webhook`;
    await bot.setWebHook(webhookUrl);
    res.json({ success: true, webhookUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to set webhook" });
  }
});

export default router;
