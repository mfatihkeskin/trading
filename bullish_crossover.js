import yahooFinance from "yahoo-finance2";
import tickers from "./tickers.json" assert { type: "json" };

async function getCloseValueOfLast200Days(ticker) {
  try {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 200);

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

function getSMA(priceArr, startIndex, days) {
  let sum = 0;
  for (let i = startIndex; i < startIndex + days; i++) {
    sum += Number(priceArr[i]);
  }
  return +(sum / days);
}

function getEMA(Ft, lastEma, days) {
  const k = 2 / (days + 1);
  return +(Ft * k + lastEma * (1 - k));
}

async function main() {
  console.log("Bullish Crossover Taraması Başlatılıyor...");
  //const tickers = ["SILVR", "DMRGD", "THYAO", "EREGL"];

  for (let ticker of tickers) {
    const prices = await getCloseValueOfLast200Days(ticker + ".IS");

    if (prices.length < 56) {
      //console.log(ticker, "için yeterli veri yok.");
      continue;
    }

    // EMA21 hesapla
    const ema21 = [];
    ema21[0] = getSMA(prices, 0, 21);
    for (let i = 21; i < prices.length; i++) {
      ema21[i - 20] = getEMA(prices[i], ema21[i - 21], 21);
    }

    // EMA55 hesapla
    const ema55 = [];
    ema55[0] = getSMA(prices, 0, 55);
    for (let i = 55; i < prices.length; i++) {
      ema55[i - 54] = getEMA(prices[i], ema55[i - 55], 55);
    }

    const lastIndex21 = ema21.length - 1;
    const lastIndex55 = ema55.length - 1;

    const todayEMA21 = ema21[lastIndex21];
    const yesterdayEMA21 = ema21[lastIndex21 - 1];

    const todayEMA55 = ema55[lastIndex55];
    const yesterdayEMA55 = ema55[lastIndex55 - 1];

    // console.log(`${ticker}`);
    // console.log(`  EMA21: ${todayEMA21.toFixed(5)}`);
    // console.log(`  EMA55: ${todayEMA55.toFixed(5)}`);

    // EMA21 yukarıdan EMA55'i kesti mi?
    if (yesterdayEMA21 < yesterdayEMA55 && todayEMA21 > todayEMA55) {
      console.log(`  🔔 BULLISH CROSSOVER SİNYAL: ${ticker} - ${todayEMA21.toFixed(5)} -> EMA21 ve EMA55 kesişimi gerçekleşti`);
    }
  }
}

main();

//node --no-warnings bullish_crossover.js