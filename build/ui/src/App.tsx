import React, { useState, useEffect, useCallback, useMemo } from "react";
import * as auth from "api/auth";
import * as apiPaths from "api/paths";
// import { Chart } from "./Chart";
import { Layout } from "./Layout";
import { LayoutItem } from "LayoutItem";
import { SignIn } from "./components/SignIn";
import { LoadingView } from "components/LoadingView";
import {
  Box,
  ThemeProvider,
  createMuiTheme,
  makeStyles,
  CssBaseline,
} from "@material-ui/core";
import { useApi, api } from "api/rpc";
import { Eth1Account } from "components/Eth1Account";
import { ValidatorsTable } from "./components/ValidatorsTable";
import { ValidatorsProgress } from "components/ValidatorsProgress";
import { NodeStats } from "components/NodeStats";
import { TotalBalance } from "components/TotalBalance";
import { RequestStatus } from "types";
import { PendingValidator } from "common";
import { BackupWithdrawalDialog } from "components/BackupWithdrawalDialog";

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
    const interval = setInterval(checkLogin, 5000);
    return () => clearInterval(interval);
  }, [loginStatus, checkLogin]);

  function onSignIn() {
    checkLogin();
  }

  function logout() {
    auth.logout().then(checkLogin).catch(console.error);
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

  // Fetch app data

  const [openWithdrawal, setOpenWithdrawal] = useState(false);
  const validators = useApi.getValidators();
  const [statusAddingValidators, setStatusAddingValidators] = useState<
    RequestStatus<PendingValidator[]>
  >();

  function checkWithdrawalAccount() {
    api
      .withdrawalAccountGet()
      .then((withdrawalAccount) => {
        if (!withdrawalAccount.exists) setOpenWithdrawal(true);
      })
      .catch(console.error);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (validators.data) validators.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [validators]);

  useEffect(() => {
    checkWithdrawalAccount();
  }, []);

  async function addValidators(num: number) {
    try {
      setStatusAddingValidators({ loading: true });
      const result = await api.addValidators(num);
      setStatusAddingValidators({ result });
      console.log(`Added ${num} validators`, result);
    } catch (e) {
      setStatusAddingValidators({ error: e });
      console.error(`Error adding ${num} validators`, e);
      checkWithdrawalAccount();
    }
  }

  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {loginStatus === "login" ? (
        <Layout darkMode={darkMode} switchDark={switchDark} logout={logout}>
          {/* <Chart /> */}
          <LayoutItem sm={6}>
            <TotalBalance validators={validators.data || []} />
          </LayoutItem>
          <LayoutItem sm={6}>
            <NodeStats />
          </LayoutItem>

          {/* TEMP */}
          <BackupWithdrawalDialog
            open={openWithdrawal}
            onClose={() => setOpenWithdrawal(false)}
          />

          <LayoutItem>
            <Eth1Account
              addValidators={addValidators}
              addingValidators={
                statusAddingValidators && statusAddingValidators.loading
              }
            />
          </LayoutItem>

          {statusAddingValidators && (
            <LayoutItem noPaper>
              <ValidatorsProgress
                status={statusAddingValidators}
                closeProgress={() => setStatusAddingValidators(undefined)}
              />
            </LayoutItem>
          )}

          <LayoutItem>
            <ValidatorsTable
              validators={validators.data || []}
              loading={!validators.data && validators.isValidating}
            />
          </LayoutItem>
        </Layout>
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
