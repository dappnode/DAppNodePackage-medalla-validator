import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  makeStyles,
  Box,
  Button,
} from "@material-ui/core";
import { api } from "api/rpc";
import { RequestStatus } from "types";
import { LoadingView } from "./LoadingView";
import { ErrorView } from "./ErrorView";
import { ValidatorSettings } from "common";

type ValidatorClient = "lighthouse" | "prysm";

const validatorClientOptions: { value: ValidatorClient; label: string }[] = [
  {
    value: "lighthouse",
    label: "Lighthouse",
  },
  {
    value: "prysm",
    label: "Prysm",
  },
];

const useStyles = makeStyles((theme) => ({
  selectDescription: {
    flexGrow: 1,
  },
  selectFormControl: {
    marginTop: theme.spacing(3),
  },
}));

export function SelectValidatorClient({
  validatorSettings,
}: {
  validatorSettings: ValidatorSettings;
}) {
  const [validatorClient, setValidatorClient] = useState<ValidatorClient>(
    validatorClientOptions[0].value
  );
  const [reqStatus, setReqStatus] = useState<RequestStatus>({});

  useEffect(() => {
    setValidatorClient(validatorSettings.validatorClient);
  }, [validatorSettings.validatorClient]);

  async function switchValidatorClient() {
    try {
      setReqStatus({ loading: true });
      await api.switchValidatorClient(validatorClient);
      setReqStatus({ result: "" });
    } catch (e) {
      console.log("Error on switchValidatorClient", e);
      setReqStatus({ error: e });
    }
  }

  const classes = useStyles();

  return (
    <>
      <FormControl variant="outlined" className={classes.selectFormControl}>
        <Select
          value={validatorClient}
          onChange={(e) =>
            setValidatorClient(e.target.value as ValidatorClient)
          }
        >
          {validatorClientOptions.map(({ value, label }) => (
            <MenuItem value={value}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

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

      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={switchValidatorClient}
          disabled={validatorSettings.validatorClient === validatorClient}
        >
          Apply changes
        </Button>
      </Box>
    </>
  );
}
