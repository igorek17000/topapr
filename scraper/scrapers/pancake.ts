// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { scrollToBottom } from "../tools/scrollToBottom";
import { dbConn, db } from "../db";
import { dbConnLocal, dbLocal } from "../db";
import { aprToApy } from "../tools/aprToApy";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to pancake swap page...");
  await page.goto("https://pancakeswap.finance/farms", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  console.log("Wait for ten seconds...");
  await page.waitForTimeout(10000);

  console.log("Scrolling...");
  await page.evaluate(scrollToBottom);

  const tablePairName = await page.$$(
    "table > tbody > tr > td:nth-child(1) > div > div > div > div > div:nth-child(2) > div"
  );
  const pairName = await Promise.all(
    tablePairName.map((tab) => tab.evaluate((el) => el.innerHTML))
  );

  console.log(pairName);

  const tablePairApr = await page.$$(
    "table > tbody > tr > td:nth-child(4) > div > div > div:nth-child(2) > div > div"
  );
  const pairApr = (
    await Promise.all(
      tablePairApr.map((tab) => tab.evaluate((el) => el.innerHTML))
    )
  ).map((apr) =>
    parseFloat(apr.split("<button")[0].replace(",", "").replace("%", ""))
  );

  console.log(pairApr);

  const tablePairLiquidity = await page.$$(
    "table > tbody > tr > td:nth-child(5) > div > div > div:nth-child(2) > div > div > div"
  );
  const pairLiquidity = await Promise.all(
    tablePairLiquidity.map((tab) =>
      tab.evaluate((el) =>
        parseInt(el.innerHTML.replace("$", "").replace(",", ""), 10)
      )
    )
  );

  console.log(pairLiquidity);

  const tablePairMultiplier = await page.$$(
    "table > tbody > tr > td:nth-child(6) > div > div > div:nth-child(2) > div > div:nth-child(1)"
  );
  const pairMultiplier = await Promise.all(
    tablePairMultiplier.map((tab) =>
      tab.evaluate((el) => parseFloat(el.innerHTML.replace("x", "")))
    )
  );

  console.log(pairMultiplier);

  const farmVal = pairName.map((name, idx) => ({
    name,
    apr: pairApr[idx],
    apy: aprToApy(pairApr[idx]),
    totalValue: pairLiquidity[idx],
    multiplier: pairMultiplier[idx],
  }));
  console.log(farmVal);

  const insertValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (${dbConn.escape(farm.name)}, 'PancakeSwap', 'BSC', ${farm.apr}, ${
      farm.apy
    }, ${farm.totalValue}, ${farm.multiplier}, NOW(), NOW()),`;
  }, "");
  const insertVal = insertValRaw.slice(0, insertValRaw.length - 1);

  const query = `insert into ${db}.farms values ${insertVal} on DUPLICATE KEY UPDATE apr = VALUES(apr), apy = VALUES(apy), totalValue = VALUES(totalValue), multiplier = VALUES(multiplier), updatedAt = NOW();`;

  // console.log(query);
  await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  const insertHistoryValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (null, ${dbConn.escape(farm.name)}, 'PancakeSwap', ${farm.apr}, ${
      farm.totalValue
    }, NOW()),`;
  }, "");
  const insertHistoryVal = insertHistoryValRaw.slice(
    0,
    insertHistoryValRaw.length - 1
  );

  const queryHistory = `insert into ${db}.aprhistory values ${insertHistoryVal};`;

  // console.log(queryHistory);
  await new Promise((res, rej) => {
    dbConn.query(queryHistory, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  const queryHistoryLocal = `insert into ${dbLocal}.aprhistory values ${insertHistoryVal};`;

  // console.log(queryHistory);
  await new Promise((res, rej) => {
    dbConnLocal.query(queryHistoryLocal, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  await browser.close();
  process.exit();
})();
