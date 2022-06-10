// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";
import { dbConnLocal, dbLocal } from "../db";
import { aprToApy } from "../tools/aprToApy";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to spookyswap page...");
  await page.goto("https://spooky.fi/#/farms", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  console.log("Wait for two seconds...");
  await page.waitForTimeout(2000);

  const trs = await page.$x(
    "/html/body/div/div[2]/div/div[3]/div/div[3]/div[3]/div[2]/div/div/div[1]/table/tbody/tr[@class]"
  );

  if (trs.length > 0) {
    const farms = [];

    for (const tr of trs) {
      console.log(await tr.evaluate((el) => el.textContent));

      const childTds = await tr.$x("td");
      if (childTds.length > 0) {
        let pairName;
        let pairApr;
        let pairValue;
        for (const [i, childTd] of childTds.entries()) {
          // console.log(i, await childDiv.evaluate((el) => el.textContent));
          if (i === 0) {
            pairName = await childTd.evaluate((el) => el.textContent);
          }

          if (i === 1) {
            pairApr = parseFloat(
              (await childTd.evaluate((el) => el.textContent))
                .replace("%", "")
                .replace(",", "")
            );
          }

          if (i === 2) {
            pairValue = parseFloat(
              (await childTd.evaluate((el) => el.textContent))
                .replace("$", "")
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
          (${dbConn.escape(farm.name)}, 'SpookySwap', 'Fantom', ${farm.apr}, ${
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
          (null, ${dbConn.escape(farm.name)}, 'SpookySwap', 'Fantom', ${
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
