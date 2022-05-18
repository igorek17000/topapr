// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn } from "../db";
import { bscscan_snowtrace } from "./bscscan_snowtrace";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const query = `select pair from topapr.farms where pool='TraderJoe'`;

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
      select 1 from tokens where data.name = tokens.name and tokens.network = 'Avalanche'
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
    await page.goto("https://traderjoexyz.com/farm", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    var tokenAddresses = [];

    for (const token of newTokens) {
      const input = await page.$(
        "input[placeholder='Search by name, symbol, or address']"
      );
      input.click({ clickCount: 3 });
      await page.waitForTimeout(1000);
      await page.keyboard.type(
        token.name === "AVAX" ? "AVAX-" : `-${token.name}`
      );
      await page.waitForTimeout(1000);

      const divImg = await page.$x(
        "/html/body/div/div/div[3]/div[3]/div[2]/div/div/div[1]/div/div[3]/div/a/div[1]/div[1]/div[1]/img"
      );
      if (divImg.length > 0) {
        for (const elImg of divImg) {
          const imgAlt = await elImg.evaluate((el) => el.getAttribute("alt"));
          const isImg =
            token.name === "AVAX" && imgAlt === null
              ? true
              : imgAlt
                  .toLowerCase()
                  .replaceAll(".", "")
                  .includes(token.name.toLowerCase());
          console.log(imgAlt, isImg);

          if (isImg) {
            elImg.screenshot({
              path: `C:\\Users\\cakia\\dev\\topapr\\front\\public\\token2\\${token.name}.png`,
              type: "png",
              omitBackground: true,
              captureBeyondViewport: false,
            });

            const imgUrl = await elImg.evaluate((el) => el.getAttribute("src"));
            const tokenAddress =
              token.name === "AVAX"
                ? "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
                : imgUrl
                    .replace(
                      "https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/",
                      ""
                    )
                    .replace("/logo.png", "");
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
    }
    console.log(tokenAddresses);
    await bscscan_snowtrace(page, tokenAddresses, false);
    await browser.close();
  }
  process.exit();
})();
