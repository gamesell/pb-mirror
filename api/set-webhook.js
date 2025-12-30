const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Защита ключом (опционально)
  if (req.query.key !== process.env.SECRET_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const VERCEL_URL = process.env.VERCEL_URL;
  
  if (!BOT_TOKEN) {
    return res.status(400).json({ error: 'BOT_TOKEN not set' });
  }
  
  try {
    // Удаляем старый webhook
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    
    // Устанавливаем новый
    const webhookUrl = `${VERCEL_URL}/api/bot`;
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}&drop_pending_updates=true`
    );
    
    const data = await response.json();
    
    return res.status(200).json({
      success: data.ok,
      message: data.description,
      webhook_url: webhookUrl,
      bot_info: `https://api.telegram.org/bot${BOT_TOKEN}/getMe`
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to set webhook',
      details: error.message 
    });
  }
};
