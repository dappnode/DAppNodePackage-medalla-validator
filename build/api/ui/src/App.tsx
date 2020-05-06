import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { Layout } from "./Dashboard";
import { Chart } from "./Chart";
import { Deposits } from "./Deposits";
import { Accounts } from "./Accounts";
import { useApi, api } from "./rpc";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
}));

export default function App() {
  const accounts = useApi.accountsGet();
  async function addAccount(name: string) {
    try {
      await api.accountCreate(name);
      console.log(`Created account ${name}`);
    } catch (e) {
      console.error(e);
    } finally {
      accounts.revalidate();
    }
  }

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Layout>
        <Chart />
        {/* <Deposits /> */}
        <Accounts accounts={accounts.data || []} />
      </Layout>
    </div>
  );
}
