// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";
import { dbConnLocal, dbLocal } from "../db";
import { aprToApy } from "../tools/aprToApy";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to raydium page...");
  await page.goto("https://v1.raydium.io/farms/", {
    waitUntil: "networkidle2",
    timeout: 180000,
  });

  await page.waitForXPath(
    "/html/body/div[1]/div/section/main/div/div[3]/div/div/div[2]",
    { timeout: 90000 }
  );

  const elHandles = await page.$$(
    'div[class="ant-collapse-item"][role="tablist"]'
  );
  const farmVal = (
    await Promise.all(
      elHandles.map((elHandle) =>
        elHandle.evaluate((el) => ({
          isVisible: !el.getAttribute("style"),
          name: el.firstChild.lastChild.firstChild.textContent
            .replaceAll("\n", "")
            .replaceAll("DUAL YIELD", "")
            .replaceAll("NEW POOL", "")
            .replaceAll("LP", "")
            .replaceAll("$", "")
            .toUpperCase()
            .trim(),
          apr: parseFloat(
            el.firstChild.lastChild.childNodes[4].textContent
              .replaceAll("Total Apr  \n", "")
              .replaceAll("%", "")
              .replaceAll(",", "")
              .trim()
          ),
          totalValue: parseInt(
            el.firstChild.lastChild.childNodes[6].textContent
              .replace("TVL \n", "")
              .replaceAll(",", "")
              .replaceAll("$", "")
              .trim(),
            10
          ),
        }))
      )
    )
  )
    .filter((val) => val.isVisible && val.apr)
    .map((farm) => ({
      ...farm,
      apy: aprToApy(farm.apr),
    }));

  console.log(farmVal);
  const insertValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (${dbConn.escape(farm.name)}, 'Raydium', 'Solana', ${farm.apr}, ${
      farm.apy
    }, ${farm.totalValue}, null, NOW(), NOW()),`;
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
      (null, ${dbConn.escape(farm.name)}, 'Raydium', ${farm.apr}, ${
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
  console.log("finish");
  process.exit();
})();
