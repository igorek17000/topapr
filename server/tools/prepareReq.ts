// Bismillaahirrahmaanirrahiim

import { Request } from "express";

export const prepareReq = async (req: Request) => {
  const itemsPerPage = 20;
  const page = parseInt((req.query.p as any) || "1", 10) || 1;
  const limit = (page - 1) * itemsPerPage;

  const sortBy = (() => {
    if (req.query.sort === "Name") return "pair";
    if (req.query.sort === "Total value") return "totalValue desc";
    return "apr desc";
  })();

  const pairAlphanum = req.query.q
    ? (req.query.q as string).replace(/[\W_]+/g, " ").trim()
    : "";
  const pairTextFilter = pairAlphanum
    ? `and pair like '%${pairAlphanum}%'`
    : "";

  const checkedPools = `where pool in ${(() => {
    if (!req.query.pools) return "('')";
    return `(${req.query.pools
      .toString()
      .split(",")
      .reduce((prev, pool) => {
        return `${prev}${prev ? "," : ""}'${pool}'`;
      }, "")})`;
  })()}`;
  // console.log("checkedPools", checkedPools);

  const checkedChains = `and network in ${(() => {
    if (!req.query.chains) return "('')";
    return `(${req.query.chains
      .toString()
      .split(",")
      .reduce((prev, chain) => {
        return `${prev}${prev ? "," : ""}'${chain}'`;
      }, "")})`;
  })()}`;
  // console.log("checkedChains", checkedChains);

  return {
    itemsPerPage,
    limit,
    sortBy,
    pairTextFilter,
    checkedPools,
    checkedChains,
  };
};
