// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";

export const chainExplorer = async (
  page: puppeteer.Page,
  tokenAddresses,
  network
) => {
  const explorerUrl = (() => {
    if (network === "Avalanche") return "snowtrace.io";
    if (network === "Heco") return "hecoinfo.com";
    return "bscscan.com";
  })();

  for (const tokenAddress of tokenAddresses) {
    await page.waitForTimeout(1000);
    await page.goto(`https://${explorerUrl}/token/${tokenAddress.address}`, {
      waitUntil: "networkidle2",
      timeout: 90000,
    });
    await page.waitForXPath("//*[@id='totaltxns' and not(text()='-')]", {
      timeout: 90000,
    });

    const [tokenFullNamePath] = await page.$x(
      "/html/body/div[1]/main/div[1]/div/div[1]/h1/div/span"
    );
    const tokenFullName = await tokenFullNamePath.evaluate(
      (el) => el.textContent
    );
    console.log("token full name", tokenFullName);

    const [tokenDecPath] = await page.$x(
      "/html/body/div[1]/main/div[4]/div[1]/div[2]/div/div[2]/div[2]/div/div[2]"
    );
    const tokenDec = parseInt(
      await tokenDecPath.evaluate((el) => el.textContent),
      10
    );
    console.log("token decimals", tokenDec);

    const [officialSitePath] = await page.$x(
      "/html/body/div[1]/main/div[4]/div[1]/div[2]/div/div[2]/div[3]/div/div[2]"
    );
    const officialSiteBase = await officialSitePath.evaluate(
      (el) => el.textContent
    );
    const officialSite = officialSiteBase.includes("Not Available, Update ?")
      ? undefined
      : officialSiteBase.replaceAll("\\n", "").trim();
    console.log("official site", officialSite);

    var social = undefined;
    const [socialPath] = await page.$x(
      "/html/body/div[1]/main/div[4]/div[1]/div[2]/div/div[2]/div[4]/div/div[2]/ul"
    );
    if (socialPath) {
      const socialLinks = await socialPath.$$("a");
      for (const socialLink of socialLinks) {
        const title = await socialLink.evaluate((el) =>
          el.getAttribute("data-original-title")
        );

        if (title) {
          if (social) {
            social = `${social}||${title}`;
          } else {
            social = title;
          }
        }
      }
    }
    console.log("social", social);

    var tags = undefined;
    const [tagsPath] = await page.$x(
      "/html/body/div[1]/main/div[1]/div/div[1]/div"
    );
    const tagLinks = await tagsPath.$$("a");
    for (const tagLink of tagLinks) {
      const tag = await tagLink.evaluate((el) => el.textContent);
      if (tag) {
        if (tags) {
          tags = `${tags}||${tag}`;
        } else {
          tags = tag;
        }
      }
    }
    console.log("tags", tags);

    const getNumContent = async (
      xPath: string,
      cleanStr?: string[],
      isInt?: boolean
    ) => {
      const [path] = await page.$x(xPath);
      if (path) {
        const baseStr = await path.evaluate((el) => el.textContent);
        const numBaseStr = (
          cleanStr ? [...cleanStr, ",", "$"] : [",", "$"]
        ).reduce((prev, curr) => prev.replaceAll(curr, ""), baseStr);
        const numBase = isInt
          ? parseInt(numBaseStr, 10)
          : parseFloat(numBaseStr);
        // console.log("intBase", intBase);

        return numBase;
      }

      return undefined;
    };

    const price = await getNumContent(
      "/html/body/div[1]/main/div[4]/div[1]/div[1]/div/div[2]/div[1]/div/div[1]/span/span[1]"
    );
    console.log("price", price);

    const priceChange = await getNumContent(
      "/html/body/div[1]/main/div[4]/div[1]/div[1]/div/div[2]/div[1]/div/div[1]/span/span[3]",
      ["(", ")", "%"]
    );
    console.log("priceChange", priceChange);

    const marketCap = await getNumContent('//*[@id="pricebutton"]');
    console.log("marketCap", marketCap);

    const totalSupply = await getNumContent(
      "/html/body/div[1]/main/div[4]/div[1]/div[1]/div/div[2]/div[2]/div[2]/span[1]"
    );
    console.log("totalSupply", totalSupply);

    const cSupply = await getNumContent(
      "/html/body/div[1]/main/div[4]/div[1]/div[1]/div/div[2]/div[2]/div[2]/span[2]/span",
      ["CSupply: "]
    );
    console.log("cSupply", cSupply);

    const holders = await getNumContent(
      network === "Heco"
        ? "/html/body/div[1]/main/div[4]/div[1]/div[1]/div/div[2]/div[3]/div/div[2]"
        : "/html/body/div[1]/main/div[4]/div[1]/div[1]/div/div[2]/div[3]/div/div[2]/div/div",
      [" addresses"],
      true
    );
    console.log("holders", holders);

    const transfers = await getNumContent('//*[@id="totaltxns"]', [], true);
    console.log("transfers", transfers);

    const query = `insert into ${db}.tokens values (${dbConn.escape(
      tokenAddress.name
    )}, ${dbConn.escape(network)}, ${dbConn.escape(
      tokenAddress.address
    )}, ${dbConn.escape(tokenFullName)}, ${tokenDec}, ${dbConn.escape(
      officialSite
    )}, ${dbConn.escape(social)}, ${dbConn.escape(tags)}, ${price}, ${
      priceChange || null
    }, ${marketCap || null}, ${totalSupply || null}, ${cSupply || null}, ${
      holders || null
    }, ${transfers || null}, NOW(), NOW());`;

    console.log(query);

    await new Promise((res, rej) => {
      dbConn.query(query, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    });
  }
};
