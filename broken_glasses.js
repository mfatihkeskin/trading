// glasses.js
import yahooFinance from "yahoo-finance2";
import tickers from "./tickers.json" assert { type: "json" };

function isDoji(open, high, low, close) {
  const bodyRatio = ((close - open) / open) * 100;
  let topWickRatio;
  if (bodyRatio < 0) {
    //kırmızı mumsa
    topWickRatio = ((high - open) / open) * 100;
  } else {
    //yeşil mumsa
    topWickRatio = ((high - close) / close) * 100;
  }
  let bottomWickRatio;
  if (bodyRatio < 0) {
    //kırmızı mumsa
    bottomWickRatio = ((low - prev.close) / prev.close) * 100;
  } else {
    //yeşil mumsa
    bottomWickRatio = ((low - open) / open) * 100;
  }

  if (
    bodyRatio < Math.abs(topWickRatio) &&
    bodyRatio < Math.abs(bottomWickRatio)
  )
    return true;
  else return false;
}

function isGlasses(ticker, data) {
  if (data.length < 2) {
    //console.log("Error data length");
    return;
  }

  const prev = data[0];
  const curr = data[1];
  const bodyRatio = ((prev.close - prev.open) / prev.open) * 100;

  if (
    isDoji(prev.open, prev.high, prev.low, prev.close) &&
    ((bodyRatio > 0 && curr.close > prev.close && curr.open < prev.open) ||
      (bodyRatio < 0 && curr.close > prev.open && curr.open < prev.close))
  ) {
    console.log(
      ticker.split(".")[0],
      "broken glasses model",
      "->",
      "Alış:",
      curr.close.toFixed(2),
      ", Scalp Stop:",
      ((curr.close + curr.low) / 2).toFixed(2),
      ", Swing Stop:",
      curr.low.toFixed(2)
    );
  }
}

async function scanTicker(ticker) {
  try {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 2);

    const result = await yahooFinance.chart(ticker, {
      period1: past.toISOString().split("T")[0],
      period2: today.toISOString().split("T")[0],
      interval: "1d",
    });
    //console.log(ticker, result.quotes);
    isGlasses(ticker, result.quotes);
  } catch (err) {
    //console.error(ticker + " error retrieving data");
  }
}

async function main() {
  console.log("Glasses list");
  for (let ticker of tickers) {
    await scanTicker(ticker + ".IS");
  }
}

main();

//node --no-warnings broken_glasses.js
