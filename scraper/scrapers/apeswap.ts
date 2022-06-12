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

  console.log("Go to apeswap page...");
  await page.goto("https://apeswap.finance/farms", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  console.log("Wait for ten seconds...");
  await page.waitForTimeout(15000);

  console.log("Scrolling...");
  let isLoadingAvailable = true; // Your condition-to-stop

  while (isLoadingAvailable) {
    const lastPoint = await scrollPageToBottom(page, { size: 30 });
    console.log("Scrolling...", lastPoint);
    await page.waitForTimeout(1000);
    const [main] = await page.$x(
      "/html/body/div/div[1]/div[1]/div[1]/div[1]/div/div[3]/div"
    );
    const [bottom] = await page.$x(
      "/html/body/div/div[1]/div[2]/div[1]/div[1]/span"
    );
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
  console.log("finish scrolling");

  const divs = await page.$x(
    "/html/body/div/div[1]/div[1]/div[1]/div[1]/div/div[3]/div/div"
  );

  if (divs.length > 0) {
    const farms = [];

    for (const div of divs) {
      console.log(await div.evaluate((el) => el.textContent));

      var name = "";
      const [pairNameEl] = await div.$x("div[1]/div[2]/div[1]");
      const basename = await pairNameEl.evaluate((el) => el.textContent);
      if (basename === "HOT") {
        const [pairEl] = await div.$x("div[1]/div[2]/div[2]");
        name = await pairEl.evaluate((el) => el.textContent);
      } else {
        name = basename;
      }

      const [aprEl1] = await div.$x("div[2]/div[2]/div[2]");
      const aprTxt1 = (await aprEl1.evaluate((el) => el.textContent))
        .replace("%", "")
        .replace(",", "");
      const apr1 = parseFloat(aprTxt1);

      const [aprEl2] = await div.$x("div[2]/div[2]/div[3]");
      const aprTxt2 = (await aprEl2.evaluate((el) => el.textContent))
        .replace("%", "")
        .replace(",", "");
      const apr2 = parseFloat(aprTxt2);

      const apr = apr1 + apr2;
      const apy = aprToApy(apr);

      const [totalValueEl] = await div.$x("div[2]/div[3]/div[2]");
      const totalValueTxt = (
        await totalValueEl.evaluate((el) => el.textContent)
      )
        .replace("$", "")
        .replace(",", "");
      const totalValue = parseFloat(totalValueTxt);

      if (apy > 0 && totalValue) {
        farms.push({
          name,
          apr,
          apy,
          totalValue,
        });
      }
    }

    console.log(farms);

    const insertValRaw = farms.reduce((prev, farm) => {
      return `${prev}
          (${dbConn.escape(farm.name)}, 'ApeSwap', 'BSC', ${farm.apr}, ${
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
          (null, ${dbConn.escape(farm.name)}, 'ApeSwap', 'BSC', ${farm.apr}, ${
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
