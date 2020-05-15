import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { Title } from "./Title";
import { ValidatorStats } from "common";
import { formatEth } from "utils";

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
    <>
      <Title>Total balance</Title>
      <Typography component="p" variant="h4">
        {formatEth(totalBalance)}
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
    </>
  );
}
