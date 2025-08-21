// oct.js
import yahooFinance from "yahoo-finance2";
import tickers from "./tickers.json" assert { type: "json" };

function max2(param1, param2) {
  return param1 > param2 ? param1 : param2;
}

function min2(param1, param2) {
  return param1 > param2 ? param2 : param1;
}

let ctr = 1;

function isOCT(ticker, quotes) {
  let candle0Open = quotes[0].open.toFixed(2);
  let candle0Close = quotes[0].close.toFixed(2);

  let candle1Open = quotes[1].open.toFixed(2);
  let candle1Close = quotes[1].close.toFixed(2);

  let candle2Open = quotes[2].open.toFixed(2);
  let candle2Close = quotes[2].close.toFixed(2);

  let candle3Open = quotes[3].open.toFixed(2);
  let candle3Close = quotes[3].close.toFixed(2);
  let candle3High = quotes[3].high.toFixed(2);
  let candle3Low = quotes[3].low.toFixed(2);

  let redHigh = max2(candle1Open, candle2Open); //ilk 2 mumun en yüksek açılış fiyatı
  let redLow = min2(candle1Close, candle2Close); //ilk 2 mumun en düşük kapanış fiyatı

  let greenHigh = max2(candle1Close, candle2Close); //ilk 2 mumun en yüksek açılış fiyatı
  let greenLow = min2(candle1Open, candle2Open); //ilk 2 mumun en düşük kapanış fiyatı

  if (
    candle0Close > candle0Open &&
    candle1Open > candle1Close &&
    candle2Open > candle2Close &&
    candle3Open < candle3Close
  ) {
    //ilk mum yeşil diğer 2 mum kırmızı, son mum yeşil ise
    if (candle3Open <= redLow && candle3Close >= redHigh) {
      console.log(`  ${ctr++}. ${ticker.split(".")[0]} ➡️  OCT(sert yükseliş modeli)`);
    }
  } else if (
    candle0Close < candle0Open &&
    candle1Open < candle1Close &&
    candle2Open < candle2Close &&
    candle3Open > candle3Close
  ) {
    //ilk mum kırmızı diğer 2 mum yeşil son mum kırmızı ise
    if (candle3High >= greenHigh && candle3Low <= greenLow) {
      console.log(`  ${ctr++}. ${ticker.split(".")[0]} ➡️  OCT(soft yükseliş modeli)`);
    }
  }
}

async function scanTicker(ticker) {
  try {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 7);

    const result = await yahooFinance.chart(ticker, {
      period1: from.toISOString().split("T")[0],
      period2: today.toISOString().split("T")[0],
      interval: "1d",
    });

    const quotes = result.quotes;
    if (quotes.length < 3) {
      console.warn(
        ticker + ": Son 3 mum alınamadı, sadece " + quotes.length + " gün var."
      );
      return;
    }

    const last4Candles = quotes.slice(-4);
    //console.log(ticker, last4Candles);
    isOCT(ticker, last4Candles);
  } catch (err) {
    console.error(ticker + "error retrieving data -> ", err);
  }
}

async function main() {
  const today = new Date();
  console.log(
    "\n⚠️  Sorumluluk Reddi ⚠️ \nAşağıda listelenen hisseler ve alış/satış fiyatları 2025 OCT konseptine göre belirlenmiştir ve kesinlikle yatırım tavsiyesi içermemektedir.\n"
  );
  console.log(
    today.toISOString().split("T")[0],
    "Tarihli OCT listesi hazırlanıyor...\n"
  );
  //let tickers = ["KIMMR", "AKFIS", "MPARK"];
  for (let ticker of tickers) {
    await scanTicker(ticker + ".IS");
  }
  console.log("\nİşlem tamamlandı. Bol kazançlar 🙂");
}

main();

//node --no-warnings oct.js
