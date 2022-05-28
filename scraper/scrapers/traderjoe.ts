// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
// import { consoleasync } from "../tools/consoleasync";
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

  // consoleasync(page);

  console.log("Go to Trader Joe page...");
  await page.goto("https://traderjoexyz.com/farm", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  await page.waitForTimeout(2000);
  // await page.waitForTimeout(2000000);
  await page.waitForNetworkIdle({
    timeout: 10000,
  });

  const farmVal = await loopPagination(page, []);

  const insertValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (${dbConn.escape(farm.visualName)}, 'TraderJoe', 'Avalanche', ${
      farm.apr
    }, ${farm.apy}, ${farm.totalValue}, null, NOW(), NOW()),`;
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
      (null, ${dbConn.escape(farm.name)}, 'TraderJoe', ${farm.apr}, ${
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

async function loopPagination(
  page: puppeteer.Page,
  res: {
    name: string;
    apr: number;
    totalValue: number;
  }[]
) {
  const [xpathHandle] = await page.$x(
    "/html/body/div/div/div[3]/div[3]/div[2]/div/div/div[1]/div/div[3]"
  );

  const data = (
    await xpathHandle.$$eval("a", (els) => {
      const elsRes = els.map((el) => {
        const ret = {
          name: el.firstChild.firstChild.lastChild.textContent
            .toUpperCase()
            .replaceAll(".", "")
            .trim(),
          apr: parseFloat(
            el.children[2].children[2].firstChild.textContent
              .replaceAll("%", "")
              .replaceAll(",", "")
              .trim()
          ),
          totalValue: parseInt(
            el.children[1].children[2].textContent
              .replaceAll(",", "")
              .replaceAll("$", "")
              .trim(),
            10
          ),
        };

        return ret;
      });

      return elsRes;
    })
  )
    .filter((pair) => pair.name.includes("-"))
    .map((pair) => {
      const pairSplit = pair.name.split("-");
      const firstToken = pairSplit[0];
      const secondToken = pairSplit[1];

      if (firstToken === "AVAX") {
        return {
          ...pair,
          name: `${secondToken}-${firstToken}`,
          visualName: pair.name,
        };
      } else {
        return {
          ...pair,
          visualName: pair.name,
        };
      }
    })
    .map((pair) => ({
      ...pair,
      apy: aprToApy(pair.apr),
    }))
    .filter((farm) => farm.apr > 0);

  // console.log(data);

  const nextPage = await page.$(
    'button[aria-label="Go to next page"]:not([class~="Mui-disabled"])'
  );
  if (nextPage) {
    await page.evaluate((ele) => ele.click(), nextPage);
    await page.waitForTimeout(1000);
    await page.waitForNetworkIdle({
      timeout: 10000,
    });
    console.log("sini");
    await page.waitForTimeout(1000);
    return await loopPagination(page, [...res, ...data]);
  } else {
    return [...res, ...data];
  }
}
