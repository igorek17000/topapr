// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
const { scrollPageToBottom } = require("puppeteer-autoscroll-down");
import { dbConn, db } from "../db";
import { dbConnLocal, dbLocal } from "../db";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
  });
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to biswap page...");
  await page.goto("https://biswap.org/farms", {
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
      "/html/body/div[1]/div[1]/div[2]/div/div/div[3]/div/div/div"
    );
    const [bottom] = await page.$x(
      "/html/body/div[1]/div[1]/div[2]/div/footer/div/div[2]/div[2]/div[1]"
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

  console.log("Wait for ten seconds...");
  await page.waitForTimeout(10000);

  const divs = await page.$x(
    "/html/body/div[1]/div[1]/div[2]/div/div/div[3]/div/div/div/div"
  );

  if (divs.length > 0) {
    const farms = [];

    for (const div of divs) {
      console.log(await div.evaluate((el) => el.textContent));

      const pairName = await (
        await div.$(".farm")
      ).evaluate((el) => el.textContent);
      console.log("pairName", pairName);

      const pairApr = parseFloat(
        (await (await div.$(".apr")).evaluate((el) => el.textContent))
          .replace("APR", "")
          .replace(",", "")
          .replace("%", "")
      );
      console.log("pairApr", pairApr);

      const pairApy = parseFloat(
        (await (await div.$(".apy")).evaluate((el) => el.textContent))
          .replace("APY", "")
          .replace(",", "")
          .replace("%", "")
      );
      console.log("pairApy", pairApy);

      const pairLiquidity = parseFloat(
        (await (await div.$(".liquidity")).evaluate((el) => el.textContent))
          .replace("Liquidity", "")
          .replace(",", "")
          .replace("$", "")
          .replace(" ", "")
      );
      console.log("pairLiquidity", pairLiquidity);

      farms.push({
        name: pairName,
        apr: pairApr,
        apy: pairApy,
        totalValue: pairLiquidity,
      });
    }

    const insertValRaw = farms.reduce((prev, farm) => {
      return `${prev}
        (${dbConn.escape(farm.name)}, 'Biswap', 'BSC', ${farm.apr}, ${
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
        (null, ${dbConn.escape(farm.name)}, 'Biswap', ${farm.apr}, ${
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
