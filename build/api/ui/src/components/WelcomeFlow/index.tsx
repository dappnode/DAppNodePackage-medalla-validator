import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { SelectWithdrawlAccount } from "components/Withdrawl/SelectWithdrawlAccount";
import { FooterNote } from "../FooterNote";
import { useApi } from "rpc";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  layout: {
    width: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
  code: {
    wordBreak: "break-all",
  },
}));

export function WelcomeFlow() {
  const classes = useStyles();
  const [withdrawlAccount, setWithdrawlAccount] = useState("");
  const depositData = {
    data:
      "0xa551e2558c839162b5df961ceb27cd10e9cf711ac15ff7866143cbf6df5fe523e5c3c91fdfa95f47e20b9499ee5766fc0x3e89ad55d05fa8e412045c4187417e6a480a82203bd85779e673a43761dcbcb1",
  };
  // useApi.depositDataGenerate({
  //   withdrawlAccount,
  //   validatorAccount,
  // });

  return (
    <main className={classes.layout}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" align="center">
          Create validator
        </Typography>
        <Typography align="center">
          State {JSON.stringify({ withdrawlAccount })}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Select withdrawl account
        </Typography>
        <Typography gutterBottom>
          This account will receive the validator funds after an exit
        </Typography>
        <Box mt={3}>
          <SelectWithdrawlAccount setWithdrawlAccount={setWithdrawlAccount} />
        </Box>

        <Typography variant="h6" gutterBottom>
          Select validator account
        </Typography>
        <Typography gutterBottom>Auto-generated validator account</Typography>

        <Typography variant="h6" gutterBottom>
          Deposit data
        </Typography>
        <code className={classes.code}>{depositData.data}</code>
      </Paper>
      <FooterNote />
    </main>
  );
}
