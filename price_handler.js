// main.js
const puppeteer = require("puppeteer");
const alarms = require("./alarms.json");
const tickers = require("./tickers.json");
const notifier = require("node-notifier");

async function fetchAllQuotes() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url =
    "https://uzmanpara.milliyet.com.tr/canli-borsa/bist-TUM-hisseleri/";
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector("table tbody tr");

  const results = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr");
    const data = {};

    for (let row of rows) {
      const tds = row.querySelectorAll("td");
      if (!tds.length) continue;

      const code = tds[0]?.innerText?.trim();
      const priceText = tds[2]?.innerText?.trim();
      const changeText = tds[3]?.innerText?.trim();
      const time = tds[4]?.innerText?.trim();

      if (code && priceText && changeText && time) {
        const price = parseFloat(priceText.replace(",", "."));
        const change = parseFloat(changeText.replace(",", "."));
        data[code] = { price, change, time };
      }
    }

    return data;
  });

  await browser.close();
  return results;
}

function sendAlarmNotification(ticker, price, state) {
  notifier.notify({
    title: "🔔 Hisse Alarmı",
    message:
      state === ">"
        ? `${ticker} ${price} fiyatına yükseldi.`
        : `${ticker} ${price} fiyatına düştü.`,
    sound: true, // sistem sesi çıkar
    wait: false, // bildirimi beklemeye alma
    timeout: 15, // bazı sistemlerde (Linux) süreyi belirler
  });
}

async function main() {
  while (true) {
    try {
      console.log("\n📡 Veri çekiliyor...");

      const quotes = await fetchAllQuotes();

      for (let ticker of tickers) {
        const quote = quotes[ticker];
        if (!quote) {
          console.error(`${ticker} bulunamadı.`);
          continue;
        }

        console.log(
          `${ticker} → ${quote.price.toFixed(2)} TL (değişim ${
            quote.change
          }%) (saat ${quote.time})`
        );

        if (ticker in alarms) {
          if (
            alarms[ticker].state === ">" &&
            quote.price >= alarms[ticker].price &&
            !alarms[ticker].triggered
          ) {
            console.log(
              `🔔 ALARM! ${ticker} ${quote.price.toFixed(2)} fiyatına yükseldi.`
            );
            sendAlarmNotification(ticker, quote.price.toFixed(2), ">");
          } else if (
            alarms[ticker].state === "<" &&
            quote.price <= alarms[ticker].price &&
            !alarms[ticker].triggered
          ) {
            console.log(
              `🔔 ALARM! ${ticker} ${quote.price.toFixed(2)} fiyatına düştü.`
            );
            sendAlarmNotification(ticker, quote.price.toFixed(2), "<");
          }
        }
      }
      console.log("✅ Bekleniyor (5DK)...");
    } catch (err) {
      console.error("⛔ Genel hata:", err.message);
    }

    await new Promise((res) => setTimeout(res, 300000));
  }
}

main();
