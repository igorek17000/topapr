// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";

export const solanaExplorer = async (page: puppeteer.Page, tokenAddresses) => {
  for (const tokenAddress of tokenAddresses) {
    await page.waitForTimeout(1000);
    await page.goto(`https://solscan.io/token/${tokenAddress.address}`, {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    await page.waitForXPath(
      "/html/body/div[1]/section/main/div/div[3]/div[2]/div/div[1]/div[1]"
    );
    await page.waitForTimeout(1000);

    await page.waitForXPath(
      "/html/body/div[1]/section/main/div/div[1]/div[2]/h2/div/div[2]/span"
    );
    await page.waitForTimeout(1000);

    const [tokenFullNamePath] = await page.$x(
      "/html/body/div[1]/section/main/div/div[1]/div[2]/h2/div/div[2]/span"
    );
    const tokenFullName = await tokenFullNamePath.evaluate(
      (el) => el.textContent
    );
    console.log("token full name", tokenFullName);

    const marketDivs = await page.$x(
      "/html/body/div/section/main/div/div[2]/div/div[1]/div/div[2]/div"
    );

    const getNum = (str) =>
      parseFloat(str.replaceAll(",", "").replaceAll("$", ""));

    var price = 0;
    var marketCap = null;
    var cSupply = null;
    var totalSupply = null;
    var holders = null;
    var officialSite = null;
    var social = null;
    var tags = null;
    for (const marketDiv of marketDivs) {
      const divCols = await marketDiv.$$("div");
      const title = await divCols[0].evaluate((el) => el.textContent);
      const desc = await divCols[1].evaluate((el) => el.textContent);
      console.log(title, desc);

      if (title === "Price") price = getNum(desc);
      if (title === "Fully Diluted Market Cap") marketCap = getNum(desc);
      if (title === "Max Total Supply") totalSupply = getNum(desc);
      if (title === "Holders") holders = getNum(desc);
      if (title === "Website") officialSite = desc;

      if (title === "Social Channels") {
        const socialArr = [];
        const links = await divCols[1].$$("a");
        for (const link of links) {
          const href = await link.evaluate((el) => el.getAttribute("href"));

          if (href.includes("coingecko")) {
            socialArr.push(
              `CoinGecko: ${href.replace(
                "https://coingecko.com/en/coins/",
                ""
              )}`
            );
          } else {
            socialArr.push(href);
          }
        }

        if (socialArr.length > 0) {
          social = socialArr.join("||");
          console.log("social", social);
        }
      }
    }

    const profileDivs = await page.$x(
      "/html/body/div[1]/section/main/div/div[2]/div/div[2]/div/div[2]/div"
    );
    console.log(profileDivs.length);

    var tokenDec = undefined;
    for (const profileDiv of profileDivs) {
      const divCols = await profileDiv.$$("div");
      if (divCols.length > 1) {
        const title = await divCols[0].evaluate((el) => el.textContent);
        const desc = await divCols[1].evaluate((el) => el.textContent);

        if (title === "Decimals") tokenDec = getNum(desc);
        if (title === "Tags") {
          const tagsArr = [];
          const tagsSpan = await divCols[1].$$("span");
          for (const tag of tagsSpan) {
            const tagText = await tag.evaluate((el) => el.textContent);
            tagsArr.push(tagText);
          }

          if (tagsArr.length > 0) {
            tags = [...new Set(tagsArr)].join("||");
            console.log(tags);
          }
        }
      }
    }

    const query = `replace into ${db}.tokens values (${dbConn.escape(
      tokenAddress.name
    )}, 'Solana', ${dbConn.escape(tokenAddress.address)}, ${dbConn.escape(
      tokenFullName
    )}, ${tokenDec}, ${dbConn.escape(officialSite)}, ${dbConn.escape(
      social
    )}, ${dbConn.escape(tags)}, ${price}, ${null}, ${marketCap || null}, ${
      totalSupply || null
    }, ${cSupply || null}, ${holders || null}, ${null}, NOW(), NOW());`;

    console.log(query);

    await new Promise((res, rej) => {
      dbConn.query(query, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    });
  }
};
