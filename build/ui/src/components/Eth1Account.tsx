import React, { useEffect, useState } from "react";
import makeBlockie from "ethereum-blockies-base64";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid, Button, Box } from "@material-ui/core";
import { Title } from "./Title";
import { useApi, api } from "api/rpc";
import { ErrorView } from "./ErrorView";
import { LoadingView } from "./LoadingView";
import { RequestStatus } from "types";
import { PendingValidator } from "common";
import { newTabProps } from "utils";

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
    "& > button:not(:last-child)": {
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
}));

export function Eth1Account() {
  const [count, setCount] = useState(3);
  const [statusAddingValidators, setStatusAddingValidators] = useState<
    RequestStatus<PendingValidator[]>
  >();
  const eth1Account = useApi.eth1AccountGet();
  const classes = useStyles();

  useEffect(() => {
    const interval = setInterval(() => {
      if (eth1Account.data) eth1Account.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [eth1Account]);

  async function addValidators() {
    try {
      setStatusAddingValidators({ loading: true });
      const result = await api.addValidators(count);
      setStatusAddingValidators({ result });
      console.log(`Added ${count} validators`, result);
    } catch (e) {
      setStatusAddingValidators({ error: e });
      console.error(`Error adding ${count} validators`, e);
    }
  }

  if (eth1Account.data) {
    const { address, balance } = eth1Account.data;
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
              ETH1 ACCOUNT
            </Typography>
            <Typography className={classes.accountBalance}>
              {balance} ETH
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
            onClick={addValidators}
            disabled={statusAddingValidators && statusAddingValidators.loading}
            variant="contained"
            color="primary"
          >
            Add validators
          </Button>
        </Grid>

        {statusAddingValidators && (
          <Grid item xs={12}>
            <AddingValidatorsFeeback status={statusAddingValidators} />
          </Grid>
        )}
      </Grid>
    );
  }

  if (eth1Account.error) return <ErrorView error={eth1Account.error} />;

  if (eth1Account.isValidating)
    return <LoadingView steps={["Loading Eth1 account"]}></LoadingView>;

  return null;
}

function AddingValidatorsFeeback({
  status,
}: {
  status: RequestStatus<PendingValidator[]>;
}) {
  const { result, loading, error } = status;

  if (result)
    return (
      <div>
        {result.map((validator) => (
          <div>{JSON.stringify(validator, null, 2)}</div>
        ))}
      </div>
    );
  if (error) return <ErrorView error={error} />;
  if (loading) return <LoadingView steps={["Adding validators..."]} />;

  return null;
}
