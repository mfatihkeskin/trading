// piercing.js
import yahooFinance from "yahoo-finance2";
import tickers from "./tickers.json" assert { type: "json" };

function isPiercing(ticker, data) {
  if (data.length < 2) {
    //console.log("Error data length");
    return;
  }

  const prev = data[0];
  const curr = data[1];

  if (prev.open <= prev.close) {
    //ilk mum yeşilse
    if (curr.open < prev.open && curr.close > prev.close) {
      console.log(
        ticker.split(".")[0],
        "piercing (model 1)",
        "->",
        "Alış:",
        curr.close.toFixed(2),
        ", Scalp Stop:",
        ((curr.close + curr.low) / 2).toFixed(2),
        ", Swing Stop:",
        curr.low.toFixed(2)
      );
    }
  } else {
    //ilk mum kırmızıysa
    if (curr.open < prev.close && curr.close > prev.open) {
      console.log(
        ticker.split(".")[0],
        "piercing (model 2)",
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
}

async function scanTicker(ticker) {
  try {
    const today = new Date();
    const past = new Date();

    const isMonday = today.getDay() === 1; // Pazartesi = 1
    const isTuesday = today.getDay() === 2; //Salı = 2
    const daysBack = isMonday || isTuesday ? 4 : 2;

    past.setDate(today.getDate() - daysBack);

    const result = await yahooFinance.chart(ticker, {
      period1: past.toISOString().split("T")[0],
      period2: today.toISOString().split("T")[0],
      interval: "1d",
    });
    //console.log(ticker, result.quotes);
    isPiercing(ticker, result.quotes);
  } catch (err) {
    //console.error(ticker + " error retrieving data");
  }
}

async function main() {
  console.log("Piercing list");
  //let test = ["SILVR", "DMRGD"];
  for (let ticker of tickers) {
    await scanTicker(ticker + ".IS");
  }
}

main();

//node --no-warnings piercing.js
