import { mapValues } from "lodash";
import useSWR, { responseInterface } from "swr";
import { routesData, Routes, ResolvedType } from "../common/routes";
import * as paths from "./paths";
import { parseRpcResponse } from "./utils";

/**
 * Call a RPC route through an autobahn session
 * @param apiUrl
 * @param route "restartPackage"
 * @param args ["bitcoin.dnp.dappnode.eth"]
 */
export async function callRoute(route: string, args: any[]) {
  const res = await fetch(paths.rpc, {
    method: "post",
    body: JSON.stringify({ method: route, params: args }),
    headers: { "Content-Type": "application/json" },
  });
  return parseRpcResponse<any>(res);
}

export const api: Routes = mapValues(
  routesData,
  (data, route) => (...args: any[]) => callRoute(route, args)
);

export const useApi: {
  [K in keyof Routes]: (
    ...args: Parameters<Routes[K]>
  ) => responseInterface<ResolvedType<Routes[K]>, Error>;
} = mapValues(api, (handler, route) => {
  return function (...args: any[]) {
    const argsKey = args.length > 0 ? JSON.stringify(args) : "";
    const cacheKey = route + argsKey;
    const fetcher: (...args: any[]) => Promise<any> = handler;
    return useSWR([cacheKey, route], () => fetcher(...args));
  };
});
