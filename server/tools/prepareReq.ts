// Bismillaahirrahmaanirrahiim

import { Request } from "express";

export const prepareReq = async (body: any) => {
  const itemsPerPage = 20;
  const page = body.p ? parseInt((body.p as any) || "1", 10) || 1 : 1;
  const limit = (page - 1) * itemsPerPage;

  const fromTable = (() => {
    if (!body.starred) return "from farms as m";

    return `
      FROM starred as n left join farms as m
      on n.pair = m.pair
      and n.pool = m.pool
      and n.network = m.network
    `;
  })();

  const sortBy = (() => {
    if (body.sort === "Name") return "m.pair";
    if (body.sort === "Total value") return "m.totalValue desc";
    return "m.apr desc";
  })();

  const pairAlphanum = body.q
    ? (body.q as string).replace(/[\W_]+/g, " ").trim()
    : "";
  const pairTextFilter = pairAlphanum
    ? `and m.pair like '%${pairAlphanum}%'`
    : "";

  const checkedPools = `where m.pool in ${(() => {
    if (!body.pools) return "('')";
    return `(${body.pools
      .toString()
      .split(",")
      .reduce((prev, pool) => {
        return `${prev}${prev ? "," : ""}'${pool}'`;
      }, "")})`;
  })()}`;
  // console.log("checkedPools", checkedPools);

  const checkedChains = `and m.network in ${(() => {
    if (!body.chains) return "('')";
    return `(${body.chains
      .toString()
      .split(",")
      .reduce((prev, chain) => {
        return `${prev}${prev ? "," : ""}'${chain}'`;
      }, "")})`;
  })()}`;
  // console.log("checkedChains", checkedChains);

  return {
    fromTable,
    itemsPerPage,
    limit,
    sortBy,
    pairTextFilter,
    checkedPools,
    checkedChains,
  };
};
