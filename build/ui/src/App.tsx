import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Layout } from "./Layout";
import * as auth from "api/auth";
import * as apiPaths from "api/paths";
// import { Chart } from "./Chart";
import { SummaryStats } from "./components/SummaryStats";
import { AccountsTable } from "./components/AccountsTable";
import { SignIn } from "./components/SignIn";
import { WelcomeFlow } from "./components/WelcomeFlow";
import { LoadingView } from "components/LoadingView";
import {
  Box,
  ThemeProvider,
  createMuiTheme,
  makeStyles,
  CssBaseline,
} from "@material-ui/core";

type LoginStatus = "login" | "logout" | "loading";
const keyuserSettingDarkMode = "user-setting-dark-mode";
const useStyles = makeStyles({
  loaderFullscreen: {
    maxWidth: "25rem",
    margin: "10rem auto",
    padding: "1rem",
  },
});

export default function App() {
  const [showValidatorFlow, setShowValidatorFlow] = useState(true);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>();
  const [isOffline, setIsOffline] = useState<boolean>();
  const [darkMode, setDarkMode] = useState<boolean>();

  const checkLogin = useCallback(() => {
    auth
      .loginStatus()
      .then(() => {
        setLoginStatus("login");
        setIsOffline(false);
      })
      .catch((e) => {
        console.log(`Login check error`, e);
        setLoginStatus("logout");
        fetch(apiPaths.ping).then(
          (res) => setIsOffline(!res.ok),
          () => setIsOffline(true)
        );
      });
  }, [setLoginStatus]);

  // If it's logged in, keep checking for logged in
  useEffect(() => {
    if (loginStatus === "logout") return;
    const interval = setInterval(checkLogin, 5000);
    return () => clearInterval(interval);
  }, [loginStatus, checkLogin]);

  function onSignIn() {
    checkLogin();
  }

  function logout() {
    auth.logout().then(checkLogin).catch(console.error);
  }

  function addValidator() {
    setShowValidatorFlow(true);
  }

  function switchDark() {
    setDarkMode((x) => !x);
  }

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: darkMode ? "dark" : "light",
          primary: { main: "#1ba49a" },
        },
        typography: { h6: { fontWeight: 400 } },
      }),
    [darkMode]
  );
  // Persist user-setting
  useEffect(() => {
    if (typeof darkMode === "boolean")
      localStorage.setItem(keyuserSettingDarkMode, darkMode ? "1" : "");
  }, [darkMode]);
  useEffect(() => {
    const userDarkMode = localStorage.getItem(keyuserSettingDarkMode);
    if (userDarkMode) setDarkMode(true);
  }, []);

  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {loginStatus === "login" ? (
        showValidatorFlow ? (
          <WelcomeFlow onExit={() => setShowValidatorFlow(false)} />
        ) : (
          <Layout darkMode={darkMode} switchDark={switchDark} logout={logout}>
            {/* <Chart /> */}
            <SummaryStats />
            <AccountsTable addValidator={addValidator} />
          </Layout>
        )
      ) : loginStatus === "logout" ? (
        <SignIn onSignIn={onSignIn} isOffline={isOffline} />
      ) : (
        <Box m={3} className={classes.loaderFullscreen}>
          <LoadingView steps={["Connecting to server", "Retrieving session"]} />
        </Box>
      )}
    </ThemeProvider>
  );
}
