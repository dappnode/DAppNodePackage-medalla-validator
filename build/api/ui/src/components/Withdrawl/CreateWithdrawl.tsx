import React, { useState } from "react";
import { InputPassword } from "components/InputPassword";
import { api, useApi } from "rpc";
import { RequestStatus } from "types";
// Material UI
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import { LinearProgress } from "@material-ui/core";

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

export function CreateWithdrawl() {
  const [status, setStatus] = useState<RequestStatus>({});
  const [name, setName] = useState("Primary");
  const [passphrase, setPassphrase] = useState("");
  const [navValue, setNavValue] = useState(0);
  const withdrawlAccounts = useApi.accountWithdrawlList();

  async function generateWithdrawlAccount() {
    try {
      setStatus({ loading: true });
      await api.accountWithdrawlCreate({ name, passphrase });
      setStatus({ success: true });
      withdrawlAccounts.revalidate();
    } catch (e) {
      setStatus({ error: e.message });
    }
  }

  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Add withdrawl account
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
            Protect the withdrawl keystore with a strong password
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
          />
          <InputPassword password={passphrase} setPassword={setPassphrase} />
        </Grid>

        <Grid item xs={12}>
          {status.success ? (
            <Box className={classes.successBox}>
              <CheckCircleOutlineIcon className={classes.success} />
              <Typography gutterBottom>Account added</Typography>
            </Box>
          ) : status.loading ? (
            <LinearProgress></LinearProgress>
          ) : (
            <Button
              disabled={status.loading}
              onClick={generateWithdrawlAccount}
              className={classes.generate}
              variant="contained"
              fullWidth
            >
              Generate
            </Button>
          )}
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
