// Bismillaahirrahmaanirrahiim

import { dbConn, db } from "../db";

(async () => {
  const query = `delete FROM ${db}.farms WHERE DATE_ADD(updatedAt, INTERVAL 12 HOUR) < NOW();`;

  await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  console.log("finish");
  process.exit();
})();
