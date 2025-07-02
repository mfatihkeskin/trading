import yahooFinance from "yahoo-finance2";
import tickers from "./tickers.json" assert { type: "json" };

async function getCloseValueOfLast200Days(ticker) {
  try {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 250); // SMA200 + 1 gün için geniş tuttuk

    const result = await yahooFinance.chart(ticker, {
      period1: Math.floor(past.getTime() / 1000),
      period2: Math.floor(today.getTime() / 1000),
      interval: "1d",
    });

    const closes = result.quotes.map((item) => item.close ?? item.adjclose);
    return closes.map((c) => Number(c));
  } catch (err) {
    console.error(ticker + " verisi alınamadı:", err.message);
    return [];
  }
}

function getSMA(prices, endIndex, period) {
  if (endIndex < period - 1) return null;
  const slice = prices.slice(endIndex - period + 1, endIndex + 1);
  const sum = slice.reduce((a, b) => a + b, 0);
  return +(sum / period);
}

async function main() {
  console.log("Golden Cross Taraması Başlatılıyor...\n");

  for (let ticker of tickers) {
    const prices = await getCloseValueOfLast200Days(ticker + ".IS");

    if (prices.length < 201) {
      //console.log(`⛔ ${ticker} için yeterli veri yok (${prices.length} gün)`);
      continue;
    }

    const lastIndex = prices.length - 1;
    const prevIndex = prices.length - 2;

    const sma50Today = getSMA(prices, lastIndex, 50);
    const sma200Today = getSMA(prices, lastIndex, 200);

    const sma50Yesterday = getSMA(prices, prevIndex, 50);
    const sma200Yesterday = getSMA(prices, prevIndex, 200);

    if (sma50Yesterday < sma200Yesterday && sma50Today > sma200Today) {
      console.log(`  🔔 GOLDEN CROSS: ${ticker} - ${prices[lastIndex].toFixed(2)} -> SMA50 ve SMA200 kesişimi gerçekleşti`);
    }
  }
}

main();
