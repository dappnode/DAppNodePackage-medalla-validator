import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  makeStyles,
  Button,
  TextField,
  Chip,
} from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import DoneIcon from "@material-ui/icons/Done";
import { api } from "api/rpc";
import { RequestStatus, InstalledPackage } from "types";
import { ValidatorSettings, BeaconProviderName } from "common";
import { ErrorView } from "./ErrorView";
import { LoadingView } from "./LoadingView";
import { useInstalledPackages } from "utils/installedPackages";
import { newTabProps } from "utils";
import { shortNameCapitalized } from "utils/format";

const beaconProviderOptions: {
  value: BeaconProviderName;
  label: string;
}[] = [
  { value: "lighthouse", label: "Local DAppNode Lighthouse" },
  { value: "prysm", label: "Local DAppNode Prysm" },
];

interface BeaconNodeDnp {
  name: string;
}

const beaconNodeDnps: BeaconNodeDnp[] = [
  { name: "ipfs.dnp.dappnode.eth" },
  { name: "geth.dnp.dappnode.eth" },
  { name: "prysm-beacon-node.dnp.dappnode.eth" },
  { name: "lighthouse-beacon-node.dnp.dappnode.eth" },
];

const useStyles = makeStyles((theme) => ({
  chipArray: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: theme.spacing(1),
    "& > *": {
      margin: theme.spacing(0.5),
    },
  },
  selectDescription: {
    flexGrow: 1,
  },
  selectFormControl: {
    marginTop: theme.spacing(2),
  },
  providerInput: {
    marginTop: theme.spacing(3),
  },
  bottomContainer: {
    marginTop: theme.spacing(3),
    "& > div:not(:last-child)": {
      marginBottom: theme.spacing(3),
    },
  },
}));

export function SelectBeaconProvider({
  validatorSettings,
  revalidateSettings,
}: {
  validatorSettings: ValidatorSettings;
  revalidateSettings: () => void;
}) {
  const [beaconProvider, setBeaconProvider] = useState<BeaconProviderName>(
    beaconProviderOptions[0].value
  );
  const [reqStatus, setReqStatus] = useState<RequestStatus>({});
  const installedPackages = useInstalledPackages();

  useEffect(() => {
    const currentOption = beaconProviderOptions.find(
      (o) => o.value === validatorSettings.beaconProvider
    );
    if (currentOption) setBeaconProvider(currentOption.value);
  }, [validatorSettings.beaconProvider]);

  const hasChanged = beaconProvider !== validatorSettings.beaconProvider;

  async function changeBeaconProvider() {
    if (!hasChanged) return;
    try {
      setReqStatus({ loading: true });
      await api.setBeaconProvider(beaconProvider);
      setReqStatus({ result: "" });
    } catch (e) {
      console.log("Error on switchValidatorClient", e);
      setReqStatus({ error: e });
    } finally {
      revalidateSettings();
    }
  }

  const classes = useStyles();

  return (
    <>
      {installedPackages.data && (
        <div className={classes.chipArray}>
          {beaconNodeDnps.map((beaconNodeDnp) => (
            <BeaconNodeDnpStatus
              key={beaconNodeDnp.name}
              beaconNodeDnp={beaconNodeDnp}
              installedPackages={installedPackages.data || []}
            />
          ))}
        </div>
      )}

      <FormControl variant="outlined" className={classes.selectFormControl}>
        <Select
          value={beaconProvider}
          onChange={(e) =>
            setBeaconProvider(e.target.value as BeaconProviderName)
          }
        >
          {beaconProviderOptions.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className={classes.bottomContainer}>
        {reqStatus.error && <ErrorView error={reqStatus.error} />}
        {reqStatus.loading && (
          <LoadingView
            steps={[
              "Stopping current client",
              "Migrating files",
              "Starting new client",
            ]}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={changeBeaconProvider}
          disabled={!hasChanged || reqStatus.loading}
        >
          Apply changes
        </Button>
      </div>
    </>
  );
}

function BeaconNodeDnpStatus({
  beaconNodeDnp,
  installedPackages,
}: {
  beaconNodeDnp: BeaconNodeDnp;
  installedPackages: InstalledPackage[];
}) {
  const name = beaconNodeDnp.name;
  const label = shortNameCapitalized(name);
  const dnp = installedPackages.find((d) => d.name === name);

  if (dnp) {
    if (dnp.state === "running")
      return <Chip label={label} color="primary" deleteIcon={<DoneIcon />} />;
    else {
      return <Chip label={label} clickable deleteIcon={<GetAppIcon />} />;
    }
  } else {
    return (
      <a
        href="http://google.es"
        style={{ color: "inherit", textDecoration: "none" }}
        {...newTabProps}
      >
        <Chip
          label={label}
          clickable
          onDelete={() => {}}
          deleteIcon={<GetAppIcon />}
        />
      </a>
    );
  }
}
