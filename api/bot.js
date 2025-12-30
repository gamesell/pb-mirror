const { Telegraf } = require('telegraf');

// Инициализация бота из переменных окружения
const bot = new Telegraf(process.env.BOT_TOKEN);

// ========== КОМАНДЫ БОТА ==========

bot.start((ctx) => {
  return ctx.reply(
    `🎉 Привет, ${ctx.from.first_name}!\n\n` +
    `🤖 Я бот, развернутый на Vercel через GitHub\n` +
    `✅ Вебхук работает: ${process.env.VERCEL_URL ? 'Да' : 'Нет'}\n\n` +
    `📋 Команды:\n` +
    `/help - справка\n` +
    `/github - ссылка на код\n` +
    `/vercel - информация о деплое\n` +
    `/echo [текст] - повтор текста\n` +
    `/chatid - ID этого чата`
  );
});

bot.help((ctx) => {
  return ctx.reply(
    '📚 Доступные команды:\n\n' +
    '/start - начать\n' +
    '/help - эта справка\n' +
    '/github - исходный код\n' +
    '/vercel - информация о Vercel\n' +
    '/echo [текст] - эхо\n' +
    '/chatid - ID чата\n\n' +
    '💡 Бот работает на Vercel Serverless Functions'
  );
});

bot.command('github', (ctx) => {
  return ctx.reply(
    '📂 Исходный код этого бота:\n' +
    'https://github.com/ваш-username/telegram-bot-vercel\n\n' +
    '⭐ Не забудьте поставить звезду на GitHub!'
  );
});

bot.command('vercel', (ctx) => {
  const vercelInfo = {
    url: process.env.VERCEL_URL || 'Не установлен',
    env: process.env.NODE_ENV || 'production',
    region: process.env.VERCEL_REGION || 'Неизвестно',
    time: new Date().toLocaleString('ru-RU')
  };
  
  return ctx.reply(
    `🚀 Информация о Vercel:\n\n` +
    `🔗 URL: ${vercelInfo.url}\n` +
    `🌍 Регион: ${vercelInfo.region}\n` +
    `⚙️ Окружение: ${vercelInfo.env}\n` +
    `🕐 Время сервера: ${vercelInfo.time}\n\n` +
    `💡 Бесплатный хостинг для Serverless функций!`
  );
});

bot.command('echo', (ctx) => {
  const text = ctx.message.text.substring(5).trim();
  if (!text) {
    return ctx.reply('Напишите текст после команды: /echo Привет мир');
  }
  return ctx.reply(`🔊 Эхо: ${text}`);
});

bot.command('chatid', (ctx) => {
  return ctx.reply(`🆔 ID этого чата: \`${ctx.chat.id}\``, {
    parse_mode: 'Markdown'
  });
});

// Простой обработчик текста
bot.on('text', (ctx) => {
  const userText = ctx.message.text.toLowerCase();
  
  if (userText.includes('привет')) {
    return ctx.reply('И тебе привет! 😊');
  }
  
  if (userText.includes('github')) {
    return ctx.reply('Ссылка на GitHub: https://github.com/ваш-username/telegram-bot-vercel');
  }
  
  return ctx.reply(
    `Вы написали: "${ctx.message.text}"\n\n` +
    `Используйте /help для списка команд`
  );
});

// ========== VERCEL SERVERLESS HANDLER ==========

module.exports = async (req, res) => {
  console.log('🔔 Получен запрос от Telegram');
  
  try {
    // OPTIONS запросы для CORS
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }
    
    // GET запросы для проверки работоспособности
    if (req.method === 'GET') {
      return res.status(200).json({
        status: '✅ Бот активен',
        platform: 'Vercel + GitHub',
        timestamp: new Date().toISOString(),
        endpoints: {
          webhook: '/api/bot (POST)',
          health: '/api/bot (GET)'
        },
        github: 'https://github.com/ваш-username/telegram-bot-vercel'
      });
    }
    
    // POST запросы - обновления от Telegram
    if (req.method === 'POST') {
      const update = req.body;
      console.log(`📨 Update ID: ${update.update_id}`);
      
      await bot.handleUpdate(update, res);
      return;
    }
    
    // Все другие методы
    res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Локальный запуск (для разработки)
if (require.main === module) {
  require('dotenv').config();
  console.log('🚀 Запуск бота в режиме polling...');
  bot.launch()
    .then(() => console.log('🤖 Бот запущен!'))
    .catch(console.error);
}
