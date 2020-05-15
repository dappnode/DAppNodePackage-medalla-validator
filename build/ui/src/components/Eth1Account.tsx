import React, { useEffect } from "react";
import makeBlockie from "ethereum-blockies-base64";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid, Button, Box } from "@material-ui/core";
import { useApi } from "api/rpc";
import { ErrorView } from "./ErrorView";
import { LoadingView } from "./LoadingView";
import { newTabProps, formatEth } from "utils";
import { ValidatorCountDialog } from "./ValidatorCountDialog";

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
    opacity: 0.7,
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
  addValidators,
  addingValidators,
}: {
  addValidators: (num: number) => Promise<void>;
  addingValidators?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const eth1Account = useApi.eth1AccountGet();

  useEffect(() => {
    const interval = setInterval(() => {
      if (eth1Account.data) eth1Account.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [eth1Account]);

  const classes = useStyles();

  if (eth1Account.data) {
    const { address, balance, insufficientFunds } = eth1Account.data;
    const accountShort = address.slice(0, 6) + "..." + address.slice(-4);
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} className={classes.accountContainer}>
          <img
            src={makeBlockie(address)}
            className={classes.accountBlockie}
            alt="icon"
          />
          <Box className={classes.accountTextContainer}>
            <Typography className={classes.accountAddress}>
              {accountShort}
            </Typography>
            <Typography
              color="textSecondary"
              className={classes.accountSubtitle}
            >
              Eth1 account
            </Typography>
            <Typography className={classes.accountBalance}>
              {formatEth(balance)} ETH
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} className={classes.buttons}>
          <Button
            href="https://faucet.dappnode.net"
            {...newTabProps}
            variant="contained"
            color="default"
          >
            Get funds
          </Button>
          <Button
            onClick={() => setOpen(true)}
            disabled={addingValidators || insufficientFunds}
            variant="contained"
            color="primary"
          >
            Add validators
          </Button>
        </Grid>

        {/* Modal to confirm number of validators */}
        <ValidatorCountDialog
          open={open}
          balance={balance}
          addValidators={addValidators}
          onClose={() => setOpen(false)}
        />
      </Grid>
    );
  }

  if (eth1Account.error) return <ErrorView error={eth1Account.error} />;

  if (eth1Account.isValidating)
    return <LoadingView steps={["Loading Eth1 account"]}></LoadingView>;

  return null;
}
