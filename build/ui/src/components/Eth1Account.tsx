import React from "react";
import makeBlockie from "ethereum-blockies-base64";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid, Button, Box } from "@material-ui/core";
import { ErrorView } from "./ErrorView";
import { LoadingView } from "./LoadingView";
import { newTabProps, formatEth } from "utils";
import { AccountView } from "./AccountView";
import params from "params";
import { responseInterface } from "swr";
import { Eth1AccountStats } from "common";

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
  buttons: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    "& > *:not(:last-child)": {
      marginRight: "1rem",
    },
    textAlign: "center",
  },
  buttonFunds: {},
  buttonAddValidator: {},
  accountContainer: {
    display: "flex",
  },
  accountBlockie: {
    borderRadius: "50%",
    height: "4.2rem",
    marginRight: "1rem",
    opacity: 0.75,
  },
  accountTextContainer: {
    display: "flex",
    flexDirection: "column",
  },
  accountAddress: {
    lineHeight: 1,
    marginBottom: "0.15rem",
  },
  accountSubtitle: {
    flex: "auto",
    fontSize: "0.85rem",
  },
  accountBalance: {
    lineHeight: 1,
    fontWeight: 500,
  },
  inputContainer: {
    display: "flex",
  },
  numberInput: {
    width: "10rem",
    marginRight: "1rem",
    fontSize: "2rem",
    "& > div > input": {
      fontSize: "1.8rem",
    },
  },
}));

export function Eth1Account({
  eth1Account,
  onAddValidators,
  addingValidators,
}: {
  eth1Account: responseInterface<Eth1AccountStats, Error>;
  onAddValidators: () => void;
  addingValidators?: boolean;
}) {
  const classes = useStyles();

  if (eth1Account.data) {
    const { address, balance, insufficientFunds } = eth1Account.data;
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} className={classes.accountContainer}>
          <img
            src={makeBlockie(address)}
            className={classes.accountBlockie}
            alt="icon"
          />
          <Box className={classes.accountTextContainer}>
            <AccountView address={address} />
            <Typography
              color="textSecondary"
              className={classes.accountSubtitle}
            >
              Eth1 account (Goerli)
            </Typography>
            <Typography className={classes.accountBalance}>
              {formatEth(balance)} ETH
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} className={classes.buttons}>
          <Button
            href={`${params.goerliFaucet}?address=${address}`}
            {...newTabProps}
            variant="contained"
            color="default"
          >
            Get funds
          </Button>
          <Button
            onClick={onAddValidators}
            disabled={addingValidators || insufficientFunds}
            variant="contained"
            color="primary"
          >
            Add validators
          </Button>
        </Grid>
      </Grid>
    );
  }

  if (eth1Account.error) return <ErrorView error={eth1Account.error} />;

  if (eth1Account.isValidating)
    return <LoadingView steps={["Loading Eth1 account"]}></LoadingView>;

  return null;
}
