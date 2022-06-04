// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
const { scrollPageToBottom } = require("puppeteer-autoscroll-down");
import { dbConn, db } from "../db";
import { dbConnLocal, dbLocal } from "../db";
import { aprToApy } from "../tools/aprToApy";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
  });
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to sushi page...");
  await page.goto("https://app.sushi.com/farm?chainId=1", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  console.log("Wait for two seconds...");
  await page.waitForTimeout(2000);

  let isLoadingAvailable = true; // Your condition-to-stop

  while (isLoadingAvailable) {
    const lastPoint = await scrollPageToBottom(page, { size: 100 });
    console.log("Scrolling...", lastPoint);
    await page.waitForTimeout(1000);
    const [main] = await page.$x(
      "/html/body/div[1]/div/main/main/div/div/div[2]/div[2]/div/div"
    );
    const [bottom] = await page.$x("/html/body/div[1]/div/div[2]/div/div");
    if (main && bottom) {
      const mainBox = await main.boundingBox();
      const bottomBox = await bottom.boundingBox();
      if (
        bottomBox &&
        mainBox &&
        bottomBox.y +
          bottomBox.height +
          mainBox.y +
          mainBox.height -
          lastPoint <
          0
      )
        isLoadingAvailable = false; // Update your condition-to-stop value
    }
  }

  console.log("Wait for ten seconds...");
  await page.waitForTimeout(10000);

  const divs = await page.$x(
    "/html/body/div[1]/div/main/main/div/div/div[2]/div[2]/div/div/div"
  );

  if (divs.length > 0) {
    const farms = [];

    for (const div of divs) {
      console.log(await div.evaluate((el) => el.textContent));

      const childDivs = await div.$x("div");
      if (childDivs.length > 0) {
        let pairName;
        let pairApr;
        let pairValue;
        for (const [i, childDiv] of childDivs.entries()) {
          if (i === 0) {
            pairName = (await childDiv.evaluate((el) => el.textContent))
              .replace("Kashi Farm", "")
              .replace("SushiSwap Farm", "")
              .replace("/", "-");
          }

          if (i === 1) {
            pairValue = parseFloat(
              (await childDiv.evaluate((el) => el.textContent))
                .replace("$", "")
                .replace(",", "")
            );
          }

          if (i === 3) {
            pairApr = parseFloat(
              (await childDiv.evaluate((el) => el.textContent))
                .replace("%annualized", "")
                .replace(",", "")
            );
          }
        }

        farms.push({
          name: pairName,
          apr: pairApr,
          apy: aprToApy(pairApr),
          totalValue: pairValue,
        });
      }
    }

    console.log(farms);

    const insertValRaw = farms.reduce((prev, farm) => {
      return `${prev}
          (${dbConn.escape(farm.name)}, 'Sushi', 'ETH', ${farm.apr}, ${
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

    const insertHistoryValRaw = farms.reduce((prev, farm) => {
      return `${prev}
        (null, ${dbConn.escape(farm.name)}, 'Sushi', ${farm.apr}, ${
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
  }

  await page.waitForTimeout(1000);
  await browser.close();
  process.exit();
})();
