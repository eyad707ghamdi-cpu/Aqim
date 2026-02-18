
/**
 * دالة لتنظيف النصوص من الرموز التي قد تكسر نظام HTML في تلجرام
 */
function escapeHTML(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendToTelegram(message: string, botToken: string, chatId: string, type: 'SUGGESTION' | 'REPORT' = 'SUGGESTION') {
  // استخدام البيانات المباشرة التي زودنا بها المستخدم
  const token = botToken || "8502852009:AAFfrMzlspC7lo4aL4wgg4sh0_33UYB0rDM";
  const id = chatId || "5928920376";

  if (!token || !id) {
    console.warn("Telegram configuration is missing.");
    return false;
  }
  
  const emoji = type === 'REPORT' ? '🚨 بلاغ جديد' : '📩 اقتراح جديد';
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: id,
        text: `<b>${emoji}</b>\n\n${message}`,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Telegram API Error:", err);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Fetch error for Telegram:", e);
    return false;
  }
}
