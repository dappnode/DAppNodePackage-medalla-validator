import React, { useState } from "react";
import { InputPassword } from "components/InputPassword";
import { RequestStatus } from "types";
// Material UI
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Typography,
  Grid,
  Box,
  TextField,
  BottomNavigation,
  BottomNavigationAction,
} from "@material-ui/core";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import { LinearProgress } from "@material-ui/core";
import { EthdoAccount } from "common";
import { ErrorView } from "components/ErrorView";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  paper: {},
  bottomNavigation: {
    margin: theme.spacing(2),
  },
  generate: {
    marginTop: theme.spacing(1),
  },
  successBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: theme.palette.primary.main,
  },
  success: {
    color: theme.palette.primary.main,
    fontSize: 60,
  },
}));

export function CreateAccount({
  wallet,
  existingAccounts,
  placeholderName,
  withPassphrase,
  accountCreate,
}: {
  wallet: string;
  existingAccounts: { id: string; name: string }[];
  placeholderName: string;
  withPassphrase?: boolean;
  accountCreate: (account: EthdoAccount) => Promise<void>;
}) {
  const [status, setStatus] = useState<RequestStatus<true>>({});
  const [name, setName] = useState(placeholderName);
  const [passphrase, setPassphrase] = useState("");
  const [navValue, setNavValue] = useState(0);

  async function generateAccount() {
    try {
      setStatus({ loading: true });
      await accountCreate({ account: name, passphrase });
      setName(""); // Clear name on success
      setStatus({ result: true });
    } catch (e) {
      setStatus({ error: e });
    }
  }

  const nameErrors: string[] = [];
  if (existingAccounts.some((account) => account.name === name))
    nameErrors.push(`Account ${name} already exists`);

  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Add {wallet} account
      </Typography>

      <BottomNavigation
        value={navValue}
        onChange={(event, newValue) => setNavValue(newValue)}
        showLabels
        className={classes.bottomNavigation}
      >
        <BottomNavigationAction label="Generate" icon={<ShuffleIcon />} />
        {/* <BottomNavigationAction label="Import" icon={<PublishIcon />} /> */}
      </BottomNavigation>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography gutterBottom>
            Protect the account keystore with a strong password
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            required
            id="validatorName"
            label="Validator name"
            fullWidth
            error={nameErrors.length > 0}
            helperText={nameErrors.join(" - ")}
          />
          {withPassphrase && (
            <InputPassword password={passphrase} setPassword={setPassphrase} />
          )}
        </Grid>

        <Grid item xs={12}>
          {status.result ? (
            <Box className={classes.successBox}>
              <CheckCircleOutlineIcon className={classes.success} />
              <Typography gutterBottom>Account added</Typography>
            </Box>
          ) : status.loading ? (
            <LinearProgress></LinearProgress>
          ) : (
            <Button
              disabled={
                status.loading || !name || (!passphrase && withPassphrase)
              }
              onClick={generateAccount}
              className={classes.generate}
              variant="contained"
              color="primary"
              fullWidth
            >
              Generate
            </Button>
          )}
        </Grid>

        {status.error && (
          <Grid item xs={12}>
            <Box my={2}>
              <ErrorView error={status.error} />
            </Box>
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
}
