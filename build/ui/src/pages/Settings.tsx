import React from "react";
import { useApi } from "api/rpc";
import { Typography, makeStyles } from "@material-ui/core";
import { LayoutItem } from "components/LayoutItem";
import { Title, TitlePage } from "components/Title";
import { SelectBeaconProvider } from "components/SelectBeaconProvider";
import { SelectValidatorClient } from "components/SelectValidatorClient";
import { ErrorView } from "components/ErrorView";
import { LoadingView } from "components/LoadingView";

const useStyles = makeStyles((theme) => ({
  selectDescription: {
    flexGrow: 1,
  },
  selectFormControl: {
    marginTop: theme.spacing(3),
  },
}));

export function Settings() {
  const validatorSettings = useApi.getValidatorSettings();
  const classes = useStyles();
  return (
    <>
      <TitlePage>Settings</TitlePage>

      {validatorSettings.data ? (
        <>
          <LayoutItem>
            <Title>Beacon node provider</Title>
            <Typography className={classes.selectDescription}>
              Beacon node provider that all validators connect to, to fetch
              duties and publish attestations and blocks
            </Typography>
            <SelectBeaconProvider validatorSettings={validatorSettings.data} />
          </LayoutItem>

          <LayoutItem>
            <Title>Validator client</Title>
            <Typography className={classes.selectDescription}>
              Validator client used to validate with all provided keystores
            </Typography>
            <SelectValidatorClient validatorSettings={validatorSettings.data} />
          </LayoutItem>
        </>
      ) : validatorSettings.error ? (
        <ErrorView error={validatorSettings.error} />
      ) : validatorSettings.isValidating ? (
        <LoadingView steps={["Loading settings..."]} />
      ) : null}
    </>
  );
}
