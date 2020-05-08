import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { RequestStatus } from "types";
import { ErrorView } from "components/ErrorView";
import { LinearProgress } from "@material-ui/core";
import { NavButtons } from "./NavButtons";
import { LoadingView } from "components/LoadingView";
import { useApi, api } from "rpc";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *:not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
  listItem: {
    padding: theme.spacing(0),
  },
  total: {
    fontWeight: 700,
  },
  title: {
    marginTop: theme.spacing(2),
  },
  separator: {
    opacity: 0.4,
    margin: theme.spacing(3, 0),
  },
  accountDetails: {
    color: theme.palette.text.secondary,
  },
  code: {
    wordBreak: "break-all",
  },
}));

export function StepDeposit({
  withdrawlAccount,
  onNext,
  onBack,
}: {
  withdrawlAccount: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [depositData, setDepositData] = useState("");
  const [validatorName, setValidatorName] = useState("");
  const [depositStatus, setDepositStatus] = useState<RequestStatus>({});

  const eth1Account = useApi.eth1AccountGet();
  const eth1Address = eth1Account.data && eth1Account.data.address;
  const eth1Balance = eth1Account.data && eth1Account.data.balance;
  const insufficientFunds =
    typeof eth1Balance === "number" && eth1Balance < 32.05;

  useEffect(() => {
    const interval = setInterval(eth1Account.revalidate, 2000);
    return () => clearInterval(interval);
  }, [eth1Account]);

  async function generateDepositData() {
    try {
      const res = await api.newValidator(withdrawlAccount);
      setDepositData(res.depositData);
      setValidatorName(res.account);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (withdrawlAccount) generateDepositData();
  }, [withdrawlAccount]);

  async function makeDeposit() {
    try {
      setDepositStatus({ loading: true });
      await new Promise((r) => setTimeout(r, 5000));
      if (Math.random() > 0.5) {
        setDepositStatus({ success: true });
        onNext();
      } else {
        throw Error(`Error, could not make deposit`);
      }
    } catch (e) {
      console.error(e);
      setDepositStatus({ error: e });
    }
  }

  const classes = useStyles();

  return (
    <div className={classes.root}>
      {/* Review accounts */}
      <Typography variant="h6" gutterBottom>
        Review accounts
      </Typography>
      <List disablePadding>
        <ListItem className={classes.listItem}>
          <ListItemText primary={"Validator"} secondary={""} />
          <Typography variant="body2">{validatorName}</Typography>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={"Withdrawl"} secondary={""} />
          <Typography variant="body2">{withdrawlAccount}</Typography>
        </ListItem>
      </List>

      <hr className={classes.separator}></hr>

      {/* Do deposit */}
      <Typography variant="h6" gutterBottom>
        Send deposit
      </Typography>

      <details className={classes.accountDetails}>
        <summary>With internal Eth1 account</summary>
        <Typography>Account:</Typography>
        <code className={classes.code}>{eth1Address || "Loading..."}</code>
        <Typography>Deposit data:</Typography>
        <code className={classes.code}>{depositData}</code>
      </details>

      <Grid container>
        <Grid item xs={6}>
          <Typography>Balance</Typography>
        </Grid>
        <Grid item xs={6}>
          {eth1Account.data ? (
            <Typography align="right" noWrap>
              {eth1Balance}
            </Typography>
          ) : eth1Account.isValidating ? (
            <Typography align="right" noWrap>
              Loading...
            </Typography>
          ) : eth1Account.error ? (
            <ErrorView error={eth1Account.error} />
          ) : null}
        </Grid>
      </Grid>

      {insufficientFunds && (
        <Button color="primary" variant="contained" fullWidth>
          Get funds
        </Button>
      )}

      <Button
        color="primary"
        variant="contained"
        fullWidth
        onClick={makeDeposit}
        disabled={
          !eth1Account.data ||
          insufficientFunds ||
          depositStatus.loading ||
          depositStatus.success
        }
      >
        Make deposit
      </Button>

      {depositStatus.loading && (
        <LoadingView
          steps={[
            "Connecting to the node",
            "Broadcasting transaction",
            "Waiting for confirmation",
          ]}
        ></LoadingView>
      )}

      {depositStatus.error && (
        <ErrorView error={depositStatus.error}></ErrorView>
      )}

      <NavButtons onBack={onBack}></NavButtons>
    </div>
  );
}
