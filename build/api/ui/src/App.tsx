import React, { useState } from "react";
import { Layout } from "./Layout";
// import { Chart } from "./Chart";
// import { Deposits } from "./Deposits";
import { Accounts } from "./Accounts";
import { SignIn } from "./components/SignIn";
import { WelcomeFlow } from "./components/WelcomeFlow";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [showValidatorFlow, setShowValidatorFlow] = useState(false);
  // const validatorsStats = useApi.validatorsStats();
  // async function addAccount(name: string) {
  //   try {
  //     await api.accountCreate(name);
  //     console.log(`Created account ${name}`);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     accounts.revalidate();
  //   }
  // }

  async function onSignIn() {
    setLoggedIn(true);
  }

  function addValidator() {
    setShowValidatorFlow(true);
  }

  if (loggedIn)
    if (showValidatorFlow)
      return <WelcomeFlow onExit={() => setShowValidatorFlow(false)} />;
    else
      return (
        <Layout>
          {/* <Chart /> */}
          {/* <Deposits /> */}
          <Accounts addValidator={addValidator} />
        </Layout>
      );
  else return <SignIn onSignIn={onSignIn} />;
}
