import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  makeStyles,
  Button,
  Box,
} from "@material-ui/core";
import { api } from "api/rpc";
import { RequestStatus, InstalledPackage } from "types";
import { ErrorView } from "./ErrorView";
import { LoadingView } from "./LoadingView";
import { useInstalledPackages } from "utils/installedPackages";
import { newTabProps, urlJoin, noAStyle } from "utils";
import { shortNameCapitalized } from "utils/format";
import { ValidatorSettings, BeaconProviderName } from "common";
import {
  LIGHTHOUSE_DNPNAME,
  PRYSM_DNPNAME,
  INSTALL_DNP_URL,
  PACKAGE_DNP_URL,
} from "params";
import { Alert } from "@material-ui/lab";
import { responseInterface } from "swr";

const beaconProviderOptions: {
  value: BeaconProviderName;
  label: string;
  dnpName: string;
}[] = [
  {
    value: "lighthouse",
    label: "Local DAppNode Lighthouse",
    dnpName: LIGHTHOUSE_DNPNAME,
  },
  {
    value: "prysm",
    label: "Local DAppNode Prysm",
    dnpName: PRYSM_DNPNAME,
  },
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
  bottomContainer: {
    marginTop: theme.spacing(2),
    "& > div:not(:last-child)": {
      marginBottom: theme.spacing(2),
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
    const serverOption = beaconProviderOptions.find(
      (o) => o.value === validatorSettings.beaconProvider
    );
    if (serverOption) setBeaconProvider(serverOption.value);
  }, [validatorSettings.beaconProvider]);

  const hasChanged = beaconProvider !== validatorSettings.beaconProvider;
  const currentOption = beaconProviderOptions.find(
    (option) => option.value === beaconProvider
  );
  const currentDnp = installedPackages.data?.find(
    (dnp) => dnp.name === currentOption?.dnpName
  );
  const dnpNotReady = installedPackages.data && !currentDnp;
  const currentOptionDnpname = currentOption
    ? shortNameCapitalized(currentOption.dnpName)
    : beaconProvider;

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

      <Box mt={2}>
        <BeaconNodeDnpStatus
          beaconProvider={beaconProvider}
          installedPackages={installedPackages}
        />
      </Box>

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
          disabled={!hasChanged || dnpNotReady || reqStatus.loading}
        >
          Apply changes
        </Button>
      </div>
    </>
  );
}

function BeaconNodeDnpStatus({
  beaconProvider,
  installedPackages,
}: {
  beaconProvider: BeaconProviderName;
  installedPackages: responseInterface<InstalledPackage[], Error>;
}) {
  const currentOption = beaconProviderOptions.find(
    (option) => option.value === beaconProvider
  );

  if (installedPackages.data && currentOption) {
    const dnpName = currentOption.dnpName;
    const dnp = installedPackages.data.find(({ name }) => name === dnpName);
    const dnpNamePretty = shortNameCapitalized(dnpName);

    if (dnp) {
      if (dnp.state === "running") {
        return (
          <Alert severity="success">
            Package {dnpNamePretty} is installed and running
          </Alert>
        );
      } else {
        return (
          <Alert
            severity="error"
            action={
              <a
                href={urlJoin(PACKAGE_DNP_URL, dnpName)}
                {...newTabProps}
                style={noAStyle}
              >
                <Button color="inherit">RESTART</Button>
              </a>
            }
          >
            Package {dnpNamePretty} is not running. Review its status and
            restart it.
          </Alert>
        );
      }
    } else {
      return (
        <Alert
          severity="warning"
          action={
            <a
              href={urlJoin(INSTALL_DNP_URL, dnpName)}
              {...newTabProps}
              style={noAStyle}
            >
              <Button color="inherit">INSTALL</Button>
            </a>
          }
        >
          Package {dnpNamePretty} is not installed. Install it to continue.
        </Alert>
      );
    }
  } else if (installedPackages.error) {
    return <ErrorView error={installedPackages.error} />;
  } else if (installedPackages.isValidating) {
    return <LoadingView steps={["Loading installed packages"]} />;
  } else {
    return null;
  }
}
