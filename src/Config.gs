// Pengaturan Bot Telegram
const token = "GANTI DENGAN TOKEN BOT TELEGRAM ANDA";
const adminID = "GANTI DENGAN ID TELEGRAM ANDA"; // ID Telegram Anda

// Inisialisasi Library Lumpia
const bot = new lumpia.init(token);

// Konstanta Konversi
const M_TO_DEG = 0.000009;

// Ganti dengan URL Web App setelah Anda melakukan "Deploy"
const webAppUrl = "GANTI DENGAN URL WEBHOOK DARI GAS";

function setWebhook() {
  let url = `https://api.telegram.org/bot${token}/setWebhook?url=${webAppUrl}`;
  let response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function getWebhookInfo() {
  let url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
  let response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

