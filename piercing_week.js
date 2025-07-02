// piercing.js
import yahooFinance from "yahoo-finance2";
import tickers from "./tickers.json" assert { type: "json" };

function isPiercing(ticker, candles) {
  if (!candles || candles.length < 2) return;

  const prev = candles[candles.length - 2];
  const curr = candles[candles.length - 1];

  if (prev.open < prev.close) {
    if (curr.open < prev.open && curr.close > prev.close) {
      console.log(
        `${ticker} 🟢 piercing (model 1) → Alış: ${curr.close.toFixed(
          2
        )}, Scalp Stop: ${((curr.close + curr.low) / 2).toFixed(
          2
        )}, Swing Stop: ${curr.low.toFixed(2)}`
      );
    }
  } else if (prev.open > prev.close) {
    if (curr.open < prev.close && curr.close > prev.open) {
      console.log(
        `${ticker} 🔴 piercing (model 2) → Alış: ${curr.close.toFixed(
          2
        )}, Scalp Stop: ${((curr.close + curr.low) / 2).toFixed(
          2
        )}, Swing Stop: ${curr.low.toFixed(2)}`
      );
    }
  }
}

async function scanTicker(ticker) {
  const today = new Date();
  const past = new Date();
  today.setDate(today.getDate() - 1);
  past.setMonth(today.getMonth() - 1);

  try {
    const result = await yahooFinance.chart(ticker, {
      interval: "1wk",
      period1: past,
      period2: today,
    });

    //console.log(ticker, result.quotes);
    isPiercing(ticker.replace(".IS", ""), result.quotes);
  } catch (err) {
    console.error(`⚠️ ${ticker}:`, err.message);
  }
}

async function main() {
  console.log("📊 Haftalık Piercing Pattern Tarama Başladı...\n");

  //let tickers = ["SNGYO"];
  for (const t of tickers) {
    await scanTicker(t + ".IS");
  }

  console.log("\n✅ Tarama tamamlandı.");
}

main();
