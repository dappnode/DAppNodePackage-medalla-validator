import { mapValues } from "lodash";
import { routesData, Routes } from "../common/routes";

const apiUrl = process.env.REACT_APP_API_URL;
const rpcUrl = `${apiUrl}/rpc`;
console.log({ apiUrl });

/**
 * Call a RPC route through an autobahn session
 * @param apiUrl
 * @param route "restartPackage"
 * @param args ["bitcoin.dnp.dappnode.eth"]
 */
export async function callRoute(route: string, args: any[]) {
  const res = await fetch(rpcUrl, {
    method: "post",
    body: JSON.stringify({ method: route, params: args }),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());

  if (res.error)
    if (res.error.data) throw Error(res.error.message + "\n" + res.error.data);
    else throw Error(res.error.message);
  else return res.result;
}

export const apiClient: Routes = mapValues(
  routesData,
  (data, route) => (...args: any[]) => callRoute(route, args)
);
