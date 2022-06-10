// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";
import { chainExplorer } from "./chainExplorer";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const query = `select pair from ${db}.farms where pool='Pangolin'`;

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
      select 1 from ${db}.tokens where data.name = tokens.name and tokens.network = 'Avalanche'
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
    await page.goto("https://app.pangolin.exchange/#/png/2", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    await page.waitForXPath('//*[@id="token-search-input"]');
    await page.waitForTimeout(3000);

    var tokenAddresses = [];

    for (const token of newTokens) {
      console.log("token", token.name);
      const input = await page.$('input[id="token-search-input"]');
      input.click({ clickCount: 3 });
      await page.waitForTimeout(1000);
      await page.keyboard.type(token.name);
      await page.waitForTimeout(2000);

      const [img] = await page.$x(
        "/html/body/div/div/div[3]/div[3]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/img[1]"
      );
      if (img) {
        const imgUrl = await img.evaluate((el) => el.getAttribute("src"));
        const tokenAddress =
          token.name === "AVAX"
            ? "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
            : imgUrl
                .replace(
                  "https://raw.githubusercontent.com/pangolindex/tokens/main/assets/",
                  ""
                )
                .replace("/logo_24.png", "");
        tokenAddresses = [
          ...tokenAddresses,
          {
            name: token.name,
            address: tokenAddress,
          },
        ];
      }
    }

    console.log(tokenAddresses);
    await chainExplorer(page, tokenAddresses, "Avalanche", true);
    await browser.close();
  }
  process.exit();
})();
