import React, { useState, useEffect } from "react";
import { Layout } from "./Layout";
import useSWR from "swr";
import * as auth from "api/auth";
// import { Chart } from "./Chart";
// import { Deposits } from "./Deposits";
import { AccountsTable } from "./components/AccountsTable";
import { SignIn } from "./components/SignIn";
import { WelcomeFlow } from "./components/WelcomeFlow";
import { LoadingView } from "components/LoadingView";

export default function App() {
  const [showValidatorFlow, setShowValidatorFlow] = useState(false);
  const login = useSWR("login", auth.loginStatus, { revalidateOnFocus: true });
  const loggedIn = login.data;
  const isFirstLoad = !login.data && !login.error && login.isValidating;

  // If it's logged in, keep checking for logged in
  useEffect(() => {
    if (!loggedIn) return;
    const interval = setInterval(login.revalidate, 5000);
    return () => clearInterval(interval);
  }, [loggedIn, login.revalidate]);

  function onSignIn() {
    login.revalidate();
  }

  function logout() {
    auth.logout().then(login.revalidate).catch(console.error);
  }

  function addValidator() {
    setShowValidatorFlow(true);
  }

  if (loggedIn)
    if (showValidatorFlow)
      return <WelcomeFlow onExit={() => setShowValidatorFlow(false)} />;
    else
      return (
        <Layout logout={logout}>
          {/* <Chart /> */}
          {/* <Deposits /> */}
          <AccountsTable addValidator={addValidator} />
        </Layout>
      );

  if (isFirstLoad)
    return (
      <LoadingView steps={["Connecting to server", "Retrieving session"]} />
    );

  return <SignIn onSignIn={onSignIn} />;
}
