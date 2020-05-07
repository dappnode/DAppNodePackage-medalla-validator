import React, { useState } from "react";
import { Layout } from "./Layout";
import { Chart } from "./Chart";
import { Deposits } from "./Deposits";
import { Accounts } from "./Accounts";
import { SignIn } from "./components/SignIn";
import { WelcomeFlow } from "./components/WelcomeFlow";
import { useApi, api } from "./rpc";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [showValidatorFlow, setShowValidatorFlow] = useState(true);
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

  async function onSignIn() {
    setLoggedIn(true);
  }

  if (loggedIn)
    if (showValidatorFlow) return <WelcomeFlow />;
    else
      return (
        <Layout>
          <Chart />
          {/* <Deposits /> */}
          <Accounts accounts={accounts.data || []} />
        </Layout>
      );
  else return <SignIn onSignIn={onSignIn} />;
}
