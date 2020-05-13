import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  Button,
  Box,
  TextField,
} from "@material-ui/core";
import { RequestStatus } from "types";
import { ErrorView } from "components/ErrorView";
import { NavButtons } from "./NavButtons";
import { LoadingView } from "components/LoadingView";
import { useApi, api } from "api/rpc";

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
  depositData: {
    color: theme.palette.text.secondary,
  },
  code: {
    wordBreak: "break-all",
  },
}));

type TxHash = string | undefined;

export function StepDeposit({
  validatorAccount,
  withdrawalAccount,
  setDepositTxHash,
  onNext,
  onBack,
}: {
  validatorAccount: string;
  withdrawalAccount: string;
  setDepositTxHash: (txHash: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [depositStatus, setDepositStatus] = useState<RequestStatus<TxHash>>({});
  const [showGetFunds, setShowGetFunds] = useState<boolean>(); // Never go back to show get funds
  const depositData = useApi.getDepositData({
    validatorAccount,
    withdrawalAccount,
  });

  const eth1Account = useApi.eth1AccountGet();
  const eth1Address = eth1Account.data && eth1Account.data.address;
  const eth1Balance = eth1Account.data && eth1Account.data.balance;
  const insufficientFunds = eth1Account.data?.insufficientFunds;
  useEffect(() => {
    if (insufficientFunds && showGetFunds === undefined) setShowGetFunds(true);
    if (!insufficientFunds && showGetFunds === true) setShowGetFunds(false);
  }, [insufficientFunds]);

  useEffect(() => {
    const interval = setInterval(eth1Account.revalidate, 2000);
    return () => clearInterval(interval);
  }, [eth1Account]);

  async function makeDeposit() {
    try {
      setDepositStatus({ loading: true });
      if (!depositData.data) throw Error(`No depositData`);
      const txHash = await api.eth1MakeDeposit(depositData.data);
      console.log("Deposit result", { txHash });
      setDepositStatus({ result: txHash });
      setDepositTxHash(txHash || "");
      onNext();
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
          <Typography variant="body2">{validatorAccount}</Typography>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={"Withdrawal"} secondary={""} />
          <Typography variant="body2">{withdrawalAccount}</Typography>
        </ListItem>
      </List>

      <hr className={classes.separator}></hr>

      {/* Do deposit */}
      <Typography variant="h6" gutterBottom>
        Send deposit
      </Typography>

      <TextField
        label="Internal Eth1 account"
        inputProps={{ paddingTop: 10 }}
        variant="outlined"
        disabled
        value={eth1Address || "Loading..."}
        fullWidth
      />

      <Grid container>
        <Grid item xs={6}>
          <Typography>Balance</Typography>
        </Grid>
        <Grid item xs={6}>
          {eth1Account.data ? (
            <Typography align="right" noWrap>
              {eth1Balance}
            </Typography>
          ) : eth1Account.error ? (
            <ErrorView error={eth1Account.error} />
          ) : eth1Account.isValidating ? (
            <Typography align="right" noWrap>
              Loading...
            </Typography>
          ) : null}
        </Grid>
      </Grid>

      {showGetFunds && (
        <Button color="primary" variant="contained" fullWidth>
          Get funds
        </Button>
      )}

      <Box>
        <Typography gutterBottom>Deposit data:</Typography>
        {depositData.data ? (
          <details className={classes.depositData}>
            <summary>
              <Typography>View</Typography>
            </summary>
            <code className={classes.code}>{depositData.data}</code>
          </details>
        ) : depositData.error ? (
          <ErrorView error={depositData.error} />
        ) : depositData.isValidating ? (
          <LoadingView steps={["Computing deposit data"]} />
        ) : null}
      </Box>

      <Button
        color="primary"
        variant="contained"
        fullWidth
        onClick={makeDeposit}
        disabled={
          !eth1Account.data ||
          insufficientFunds ||
          depositStatus.loading ||
          Boolean(depositStatus.result)
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
