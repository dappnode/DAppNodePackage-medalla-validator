import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Title } from "./Title";
import { useApi } from "api/rpc";
import { getEstimatedBalanceFormDepositEvents } from "utils";
import { Grid } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  depositContext: {
    flex: 1,
  },
  bottomLink: {
    marginTop: 24,
  },
  noteText: {
    color: theme.palette.text.secondary,
    fontStyle: "italic",
    fontSize: "100%",
  },
}));

export function SummaryStats() {
  return (
    <Grid container spacing={3}>
      <TotalBalance />
      <NodeStats />
    </Grid>
  );
}

export function TotalBalance() {
  const validatorsStats = useApi.validatorsStats();
  const classes = useStyles();

  useEffect(() => {
    const interval = setInterval(() => {
      if (validatorsStats.data) validatorsStats.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [validatorsStats]);

  function computeBalance(): {
    sum: string | number | null;
    isEstimated?: boolean;
    isPartial?: boolean;
  } {
    if (!validatorsStats.data) return { sum: null };
    let isEstimated = false;
    let isPartial = false;
    const sum = validatorsStats.data.reduce((total, validator) => {
      if (validator.balance) return total + parseFloat(validator.balance);
      const estimedBalance = getEstimatedBalanceFormDepositEvents(
        validator.depositEvents
      );
      if (estimedBalance) {
        isEstimated = true;
        return total + estimedBalance;
      }
      isPartial = true;
      return total;
    }, 0);
    if (!sum) return { sum: null };
    else return { sum, isEstimated, isPartial };
  }

  const totalBalance = computeBalance();

  if (totalBalance.sum === null) return null;

  return (
    <Grid item xs={12} sm={6}>
      <Title>Total balance</Title>
      <Typography component="p" variant="h4">
        {totalBalance.sum}
        {totalBalance.isEstimated ? "*" : ""}{" "}
        {totalBalance.isPartial ? "**" : ""} ETH
      </Typography>
      {totalBalance.isEstimated && (
        <Typography className={classes.noteText}>
          * Some validator balances are estimated from their eth1 deposit
        </Typography>
      )}
      {totalBalance.isPartial && (
        <Typography className={classes.noteText}>
          ** Some validator balances are unknown
        </Typography>
      )}
    </Grid>
  );
}

export function NodeStats() {
  const nodeStats = useApi.nodeStats();
  const classes = useStyles();

  useEffect(() => {
    const interval = setInterval(() => {
      if (nodeStats.data) nodeStats.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [nodeStats]);

  if (!nodeStats.data) return null;

  return (
    <Grid item xs={12} sm={6}>
      <Title>Node Stats</Title>
      <Typography className={classes.depositContext}>
        Current epoch:{" "}
        <strong>
          {nodeStats.data.chainhead ? nodeStats.data.chainhead.headEpoch : "?"}
        </strong>{" "}
        {nodeStats.data.syncing
          ? nodeStats.data.syncing.syncing
            ? "(syncing)"
            : "(synced)"
          : ""}
      </Typography>
      <Typography className={classes.depositContext}>
        Peers:{" "}
        <strong>
          {nodeStats.data.peers ? nodeStats.data.peers.length : "?"}
        </strong>
      </Typography>
    </Grid>
  );
}
