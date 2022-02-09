import puppeteer = require("puppeteer");
import { scrollToBottom } from "../tools";
import dbConn from "../db";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to pancake swap page...");
  await page.goto("https://pancakeswap.finance/farms");

  console.log("Wait for ten seconds...");
  await page.waitForTimeout(10000);

  console.log("Scrolling...");
  await page.evaluate(scrollToBottom);

  const tablePairName = await page.$$(
    "table > tbody > tr > td:nth-child(1) > div > div > div > div > div:nth-child(2) > div"
  );
  const pairName = await Promise.all(
    tablePairName.map((tab) => tab.evaluate((el) => el.innerHTML))
  );

  console.log(pairName);

  const tablePairApr = await page.$$(
    "table > tbody > tr > td:nth-child(3) > div > div > div:nth-child(2) > div > div"
  );
  const pairApr = (
    await Promise.all(
      tablePairApr.map((tab) => tab.evaluate((el) => el.innerHTML))
    )
  ).map((apr) => parseFloat(apr.split("<button")[0].replace("%", "")));

  console.log(pairApr);

  const tablePairLiquidity = await page.$$(
    "table > tbody > tr > td:nth-child(4) > div > div > div:nth-child(2) > div > div > div"
  );
  const pairLiquidity = await Promise.all(
    tablePairLiquidity.map((tab) =>
      tab.evaluate((el) =>
        parseInt(el.innerHTML.replace("$", "").replace(",", ""), 10)
      )
    )
  );

  console.log(pairLiquidity);

  const tablePairMultiplier = await page.$$(
    "table > tbody > tr > td:nth-child(5) > div > div > div:nth-child(2) > div > div:nth-child(1)"
  );
  const pairMultiplier = await Promise.all(
    tablePairMultiplier.map((tab) =>
      tab.evaluate((el) => parseFloat(el.innerHTML.replace("x", "")))
    )
  );

  console.log(pairMultiplier);

  const farmVal = pairName.map((name, idx) => ({
    name,
    apr: pairApr[idx],
    totalValue: pairLiquidity[idx],
    multiplier: pairMultiplier[idx],
  }));
  console.log(farmVal);

  const insertValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (${dbConn.escape(farm.name)}, 'PancakeSwap', 'BSC', ${farm.apr}, ${
      farm.totalValue
    }, ${farm.multiplier}, NOW(), NOW()),`;
  }, "");
  const insertVal = insertValRaw.slice(0, insertValRaw.length - 1);

  const query = `insert into topapr.farms values ${insertVal} as new
    on DUPLICATE KEY UPDATE apr = new.apr, totalValue = new.totalValue, multiplier = new.multiplier, updatedAt = NOW();
  `;

  console.log(query);
  await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });
  // const pairName = ["ADA-BNB", "ALICE-BNB"];
  // const pairApr = [215.7, 47.7];
  // const pairLiquidity = [12312, 131231];
  // const pairMultiplier = [1, 1];

  // const db = admin.database();
  // const farmsRef = db.ref("/Farms");
  // const farmsAprRef = db.ref("/FarmsApr");
  // const farmsAprMexcRef = db.ref("/FarmsAprMexc");

  // await Promise.allSettled(
  //   pairName
  //     .map((name, idx) => {
  //       const pancakeFarmRef = farmsRef.child(name).child("PancakeSwap");
  //       const farmVal = {
  //         name,
  //         apr: pairApr[idx],
  //         totalValue: pairLiquidity[idx],
  //         multiplier: pairMultiplier[idx],
  //         network: "BSC",
  //         updatedAt: Date.now(),
  //       };
  //       console.log(farmVal);
  //       const farmValPromise = pancakeFarmRef.set(farmVal);

  //       const farmsAprNameRef = farmsAprRef.child(name);
  //       const farmsAprPromise = farmsAprNameRef.once(
  //         "value",
  //         (dataSnapshot) => {
  //           if (dataSnapshot.exists()) {
  //             console.log(name + " data exist");
  //             const data = dataSnapshot.val();
  //             if (pairApr[idx] > data.apr || data.provider === "PancakeSwap") {
  //               console.log("updating " + name);
  //               return farmsAprNameRef
  //                 .set({
  //                   ...data,
  //                   name,
  //                   apr: pairApr[idx],
  //                   totalValue: pairLiquidity[idx],
  //                   provider: "PancakeSwap",
  //                   network: "BSC",
  //                   updatedAt: Date.now(),
  //                 })
  //                 .then(() =>
  //                   farmsAprNameRef
  //                     .child("providers")
  //                     .child("PancakeSwap")
  //                     .set(1)
  //                 );
  //             } else {
  //               return farmsAprNameRef
  //                 .set({
  //                   ...data,
  //                   updatedAt: Date.now(),
  //                 })
  //                 .then(() =>
  //                   farmsAprNameRef
  //                     .child("providers")
  //                     .child("PancakeSwap")
  //                     .set(1)
  //                 );
  //             }
  //           } else {
  //             return farmsAprNameRef.set({
  //               name,
  //               apr: pairApr[idx],
  //               totalValue: pairLiquidity[idx],
  //               provider: "PancakeSwap",
  //               network: "BSC",
  //               updatedAt: Date.now(),
  //               providers: {
  //                 PancakeSwap: 1,
  //               },
  //             });
  //           }
  //         }
  //       );

  //       const farmsAprMexcRefChild = farmsAprMexcRef.child(name);
  //       const mexcRef = db.ref("MEXC");
  //       const firstToken = name.split("-")[0];
  //       const resMexcRef = mexcRef.once("value", (mexcDataSnapshot) => {
  //         if (mexcDataSnapshot.hasChild(firstToken))
  //           return farmsAprMexcRefChild.set(1);
  //         else return farmsAprMexcRefChild.set(null);
  //       });
  //       return [farmValPromise, farmsAprPromise, resMexcRef];
  //     })
  //     .flat()
  // );

  await browser.close();
  process.exit();
})();
