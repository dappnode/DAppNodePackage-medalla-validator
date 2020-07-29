import React, { useState } from "react";
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  makeStyles,
} from "@material-ui/core";
import { LayoutItem } from "components/LayoutItem";
import { Title } from "components/Title";

type BeaconProvider = "lighthouse" | "prysm" | "custom";
type ValidatorClient = "lighthouse" | "prysm";

const beaconProviderOptions: { value: BeaconProvider; label: string }[] = [
  {
    value: "lighthouse",
    label: "Local DAppNode Lighthouse",
  },
  {
    value: "prysm",
    label: "Local DAppNode Prysm",
  },
  {
    value: "custom",
    label: "Custom",
  },
];

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

export function Settings() {
  const [beaconProvider, setBeaconProvider] = useState<BeaconProvider>(
    beaconProviderOptions[0].value
  );
  const [validatorClient, setValidatorClient] = useState<ValidatorClient>(
    validatorClientOptions[0].value
  );

  const classes = useStyles();

  return (
    <>
      <LayoutItem noPaper>
        <Typography variant="h4" color="textSecondary">
          Settings
        </Typography>
      </LayoutItem>

      <LayoutItem sm={6}>
        <Title>Beacon node provider</Title>
        <Typography className={classes.selectDescription}>
          Beacon node provider that all validators connect to, to fetch duties
          and publish attestations and blocks
        </Typography>
        <FormControl variant="outlined" className={classes.selectFormControl}>
          <Select
            value={beaconProvider}
            onChange={(e) =>
              setBeaconProvider(e.target.value as BeaconProvider)
            }
          >
            {beaconProviderOptions.map(({ value, label }) => (
              <MenuItem value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </LayoutItem>

      <LayoutItem sm={6}>
        <Title>Validator client</Title>
        <Typography className={classes.selectDescription}>
          Validator client used to validate with all provided keystores
        </Typography>
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
      </LayoutItem>
    </>
  );
}
