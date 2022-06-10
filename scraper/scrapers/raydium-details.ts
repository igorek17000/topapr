// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
// import * as fs from "fs";

import { dbConn, db } from "../db";
import { solanaExplorer } from "./solanaExplorer";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const query = `select pair from ${db}.farms where pool='Raydium'`;

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
      select 1 from ${db}.tokens where data.name = tokens.name and tokens.network = 'Solana'
    )
  `;

  const excludeTokens = [
    "FCON",
    "FLWR",
    "PRGC",
    "PRMS",
    "PSY",
    "REAL",
    "ROLL",
    "WEWETH",
    "WOOD",
    "SLC",
  ];
  const newTokens: any = (
    (await new Promise((res, rej) => {
      dbConn.query(newTokensQuery, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    })) as any
  ).filter((token) => !excludeTokens.includes(token.name));

  console.log(newTokens);

  if (newTokens.length > 0) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });
    const page = await browser.newPage();
    await page.emulate(device);
    await page.goto("https://raydium.io/farms/", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    var tokenAddresses = [];

    for (const token of newTokens.slice(0, 5)) {
      const input = await page.$("input[placeholder='Search by token']");
      input.click({ clickCount: 3 });
      await page.waitForTimeout(1000);
      await page.keyboard.type(token.name === "ETH" ? "ETH-USDC" : token.name);
      await page.waitForTimeout(1000);

      const [img] = await page.$x(
        token.name === "USDC" ||
          token.name === "USDH" ||
          token.name === "USDT" ||
          token.name === "SOL"
          ? "/html/body/div/div/div[1]/main/div[2]/div/div[3]/div/div/div/div/div[2]/div[1]/div[2]/div/img"
          : "/html/body/div/div/div[1]/main/div[2]/div/div[3]/div/div/div/div/div[2]/div[1]/div[1]/div/img"
      );
      if (img) {
        const imgUrl = await img.evaluate((el) => el.getAttribute("src"));

        // const pageNew = await browser.newPage();
        // try {
        //   const response = await pageNew.goto(imgUrl, {
        //     timeout: 0,
        //     waitUntil: "networkidle0",
        //   });
        //   const imageBuffer = await response.buffer();
        //   await fs.promises.writeFile(
        //     `C:\\Users\\cakia\\dev\\topapr\\front\\public\\token2\\${token.name}.png`,
        //     imageBuffer
        //   );
        // } catch {
        //   console.log("error");
        const excludeImgTokens = ["SOL", "NOVA"];
        if (!excludeImgTokens.find((exc) => exc === token.name))
          img.screenshot({
            path: `C:\\Users\\cakia\\dev\\topapr\\front\\public\\token\\${token.name}.png`,
            type: "png",
            omitBackground: true,
            captureBeyondViewport: false,
          });
        // } finally {
        //   await pageNew.close();
        // }

        const tokenAddress = imgUrl
          .replace("https://sdk.raydium.io/icons/", "")
          .replace("https://img.raydium.io/icon/", "")
          .replace(
            "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/",
            ""
          )
          .replace(
            "https://raw.githubusercontent.com/DarleyGo/token-list/main/assets/mainnet/",
            ""
          )
          .replace(
            "https://raw.githubusercontent.com/MarkSackerberg/token-list/main/assets/mainnet/",
            ""
          )
          .replace(
            "https://github.com/ArthurPaivaT/token-list/blob/main/assets/mainnet/",
            ""
          )
          .replace(".png", "")
          .replace("/logo", "")
          .replace("/icon", "")
          .replace(".svg", "")
          .replace("/usdh", "")
          .replace("/yaw", "")
          .replace("?raw=true", "");

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
    await solanaExplorer(page, tokenAddresses);
    await browser.close();
  }
  process.exit();
})();
