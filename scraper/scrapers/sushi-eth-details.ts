// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";
import { chainExplorer } from "./chainExplorer";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const query = `select pair from ${db}.farms where pool='Sushi'`;

  // console.log(query);
  const pairs: any = await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  const tokens = [
    ...new Set(
      pairs.reduce((res, pair) => {
        const tokenPair = pair.pair.split("-");
        console.log(tokenPair);

        return [...res, ...tokenPair];
      }, [])
    ),
  ]
    // .filter((token) => token !== "BNB")
    .map((token) => `"${token}"`);

  const newTokensQuery = `
    SELECT *
    FROM
      JSON_TABLE(
        '[${tokens}]',
        "$[*]"
        COLUMNS(
          name VARCHAR(45) PATH "$"
        )
      ) data
    where not exists (
      select 1 from ${db}.tokens where data.name = tokens.name and tokens.network = 'ETH'
    )
  `;

  const newTokens: any = await new Promise((res, rej) => {
    dbConn.query(newTokensQuery, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  console.log(newTokens);

  if (newTokens.length > 0) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });
    const page = await browser.newPage();
    await page.emulate(device);
    await page.goto("https://app.sushi.com/analytics/tokens?chainId=1", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    await page.waitForXPath(
      "/html/body/div[1]/div/main/main/div/div/div[1]/div/input"
    );
    await page.waitForTimeout(3000);

    var tokenAddresses = [];

    for (const token of newTokens) {
      console.log("token", token.name);
      const [input] = await page.$x(
        "/html/body/div[1]/div/main/main/div/div/div[1]/div/input"
      );
      input.click({ clickCount: 3 });
      await page.waitForTimeout(1000);
      await page.keyboard.type(token.name);
      await page.waitForTimeout(1000);

      const trs = await page.$x(
        "/html/body/div[1]/div/main/main/div/div/div[2]/div[2]/table/tbody/tr"
      );

      for (const tr of trs) {
        const [tokenEl] = await tr.$x("td");
        const tokenName = await tokenEl.evaluate((el) => el.textContent);
        if (
          tokenName.toLocaleLowerCase().trim() ===
          token.name.toLocaleLowerCase().trim()
        ) {
          const href = await tr.evaluate((el) => el.getAttribute("href"));
          const tokenAddress = href
            .replace("/analytics/tokens/", "")
            .replace("?chainId=1", "");
          console.log("tokenName found", tokenName, tokenAddress);
          tokenAddresses = [
            ...tokenAddresses,
            {
              name: token.name,
              address: tokenAddress,
            },
          ];
          break;
        }
      }
    }

    console.log(tokenAddresses);
    await chainExplorer(page, tokenAddresses, "ETH", true);
    await browser.close();
  }
  process.exit();
})();
