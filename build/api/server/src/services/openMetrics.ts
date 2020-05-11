import fetch from "node-fetch";
import { openMetricsUrl } from "../params";

const tags = {
  validator_statuses: "validator_statuses",
  validator_balance: "validator_balance"
};
const relevantTags = [tags.validator_balance, tags.validator_statuses];

const statuses = {
  "0": "UNKNOWN",
  "1": "DEPOSITED",
  "2": "PENDING",
  "3": "ACTIVE",
  "4": "EXITING",
  "5": "SLASHING",
  "6": "EXITED"
};

interface ValidatorOpenMetrics {
  validatorBalance: { [pubKey: string]: number };
  validatorStatus: { [pubKey: string]: string };
}

export async function getOpenMetrics(): Promise<ValidatorOpenMetrics> {
  const res = await fetch(openMetricsUrl).then(res => res.text());
  return parseOpenMetrics(res);
}

/**
 * Ugly patch until gRPC setup is available
 * @param data
 */
export function parseOpenMetrics(data: string): ValidatorOpenMetrics {
  const lines = data
    .trim()
    .split("\n")
    .map(line => line.trim())
    .filter(line => !line.startsWith("#"));

  const validatorBalance: { [pubKey: string]: number } = {};
  const validatorStatus: { [pubKey: string]: string } = {};

  for (const line of lines) {
    const [def, value] = line.split(" ");
    const propIndex = def.indexOf("{");
    if (propIndex < 0) continue;
    const name = def.slice(0, propIndex);
    if (!relevantTags.includes(name)) continue;
    const propsString = def.slice(propIndex);
    const props = (/{(.*?)}/g.exec(def) || [])[1];
    if (!props) continue;
    const [propName, propValue] = props.split("=");
    if (propName !== "pubkey") continue;
    const pubKey = propValue.slice(1, -1);
    if (name === tags.validator_balance)
      validatorBalance[pubKey] = parseFloat(value);
    if (name === tags.validator_statuses)
      validatorStatus[pubKey] = statuses[value as keyof typeof statuses];
  }

  return { validatorBalance, validatorStatus };
}
