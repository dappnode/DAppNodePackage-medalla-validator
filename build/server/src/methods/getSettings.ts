import memoizee from "memoizee";
import { AppSettings, DnpInstalledStatus } from "../../common";
import * as db from "../db";
import { getInstalledPackages } from "../services/installedPackages";
import { LIGHTHOUSE_DNPNAME, PRYSM_DNPNAME, DMS_DNPNAME } from "../params";

const getInstalledPackagesMem = memoizee(getInstalledPackages, {
  maxAge: 5 * 1000,
  promise: true
});

export async function getSettings(): Promise<AppSettings> {
  const getDnp = async (name: string): Promise<DnpInstalledStatus> => {
    try {
      const dnps = await getInstalledPackagesMem();
      const dnp = dnps.find(dnp => dnp.name === name);
      if (dnp) return { ...dnp, status: "installed" };
      else return { name, status: "not-installed" };
    } catch (e) {
      return { name, status: "fetch-error", error: e.message };
    }
  };

  return {
    validatorClient: db.server.validatorClient.get(),
    beaconProvider: db.server.beaconProvider.get(),
    beaconDnps: {
      lighthouse: await getDnp(LIGHTHOUSE_DNPNAME),
      prysm: await getDnp(PRYSM_DNPNAME)
    },
    dmsDnp: await getDnp(DMS_DNPNAME)
  };
}
