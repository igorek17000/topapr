// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
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

  console.log("Go to pangolin page...");
  await page.goto("https://app.pangolin.exchange/#/png/2", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  await page.waitForXPath(
    "/html/body/div/div/div[3]/div[3]/div[2]/div[2]/div[1]/div[1]/div[2]"
  );

  console.log("Wait for two seconds...");
  await page.waitForTimeout(2000);

  const divs = await page.$x(
    "/html/body/div/div/div[3]/div[3]/div[2]/div[2]/div"
  );
  if (divs.length > 0) {
    const farms = [];

    for (const [i, div] of divs.entries()) {
      console.log(i, await div.evaluate((el) => el.textContent));
      if (i === 0) continue;

      const [pairNameEl] = await div.$x("div[1]/div[1]");
      const pairName = await pairNameEl.evaluate((el) => el.textContent);

      const [aprEl] = await div.$x("div[3]/div[3]/div[2]");
      const aprTxt = (await aprEl.evaluate((el) => el.textContent))
        .replace("%", "")
        .replace(",", "");

      const [totalValueEl] = await div.$x("div[2]/div[1]/div[2]");
      const totalValueTxt = (
        await totalValueEl.evaluate((el) => el.textContent)
      )
        .replace("$", "")
        .replace(",", "");

      if (aprTxt !== "-") {
        const apr = parseFloat(aprTxt);
        const totalValue = parseFloat(totalValueTxt);

        farms.push({
          name: pairName,
          apr,
          totalValue,
          apy: aprToApy(apr),
        });
      }
    }

    console.log(farms);

    const insertValRaw = farms.reduce((prev, farm) => {
      return `${prev}
          (${dbConn.escape(farm.name)}, 'Pangolin', 'Avalanche', ${farm.apr}, ${
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
          (null, ${dbConn.escape(farm.name)}, 'Pangolin', 'Avalanche', ${
        farm.apr
      }, ${farm.totalValue}, NOW()),`;
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
