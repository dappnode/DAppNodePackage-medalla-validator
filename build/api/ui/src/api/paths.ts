import { urlJoin } from "utils";

const baseUrl = process.env.REACT_APP_API_URL || "/";
console.log(`API base url: ${baseUrl}`);

export const login = urlJoin(baseUrl, "/login");
export const logout = urlJoin(baseUrl, "/logout");
export const rpc = urlJoin(baseUrl, "/rpc");
