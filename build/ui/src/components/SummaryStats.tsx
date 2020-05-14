import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";
import { Title } from "./Title";
import { useApi } from "api/rpc";
import { getEstimatedBalanceFormDepositEvents, formatEth } from "utils";
import { ValidatorStats } from "common";

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

export function SummaryStats({ validators }: { validators: ValidatorStats[] }) {
  const totalBalance = validators.reduce(
    (total, validator) => total + (validator.balance.eth || 0),
    0
  );
  const isEstimated = validators.some(
    (validator) => validator.balance.isEstimated
  );

  return (
    <Grid container spacing={3}>
      <TotalBalance validators={validators} />
      <NodeStats />
    </Grid>
  );
}

export function TotalBalance({ validators }: { validators: ValidatorStats[] }) {
  const classes = useStyles();

  const totalBalance = validators.reduce(
    (total, validator) => total + (validator.balance.eth || 0),
    0
  );
  const isEstimated = validators.some(
    (validator) => validator.balance.isEstimated
  );
  const isPartial = validators.some(
    (validator) => validator.balance.eth === null
  );

  return (
    <Grid item xs={12} sm={6}>
      <Title>Total balance</Title>
      <Typography component="p" variant="h4">
        {totalBalance}
        {isEstimated ? "*" : ""} {isPartial ? "**" : ""} ETH
      </Typography>
      {isEstimated && (
        <Typography className={classes.noteText}>
          * Some validator balances are estimated from their eth1 deposit
        </Typography>
      )}
      {isPartial && (
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
