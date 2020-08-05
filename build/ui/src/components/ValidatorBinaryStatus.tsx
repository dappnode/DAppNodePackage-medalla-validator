import React, { useState } from "react";
import {
  Typography,
  makeStyles,
  Button,
  Link,
  Divider,
} from "@material-ui/core";
import { useApi } from "api/rpc";
import { LoadingView } from "./LoadingView";
import { ErrorView } from "./ErrorView";
import { parseDateDiff } from "../utils/dates";
import { Alert } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
  },
  centerLink: {
    display: "flex",
    alignItems: "center",
  },
  total: {
    color: theme.palette.text.secondary,
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    display: "flex",
    fontSize: "1.2rem",
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  noValidatorsContainer: {
    textAlign: "center",
    margin: theme.spacing(6),
  },
  noValidators: {
    fontSize: "0.85rem",
  },
  terminal: {
    whiteSpace: "pre",
    fontFamily: `"Inconsolata", monospace`,
    overflow: "auto",
    borderRadius: "0.25rem",
    borderColor: "#343a40",
  },
}));

export function ValidatorBinaryStatus() {
  const [showCrashData, setShowCrashData] = useState(false);
  const binaryStatus = useApi.getBinaryStatus();
  const classes = useStyles();

  if (binaryStatus.data) {
    const { runningSince, recentCrashes, recentLogs } = binaryStatus.data;
    const crashesInLastHour = recentCrashes.filter(
      (c) => Date.now() - c.timestamp < 60 * 60 * 1000
    );
    return (
      <>
        <Typography>
          Runing for:{" "}
          {runningSince ? parseDateDiff(Date.now() - runningSince) : "???"} (
          {crashesInLastHour.length} recent crashes){" "}
          {crashesInLastHour.length > 0 && (
            <Link onClick={() => setShowCrashData((x) => !x)}>
              Show crash data
            </Link>
          )}
        </Typography>

        {showCrashData ? (
          <>
            <Divider className={classes.divider} />

            <Typography variant="subtitle2" color="primary">
              Client logs
            </Typography>
            <code className={classes.terminal}>{recentLogs.join("\n")}</code>

            <Divider className={classes.divider} />

            <Typography variant="subtitle2" color="primary">
              Crash data
            </Typography>
            {recentCrashes.map((c, i) => (
              <div key={i}>
                Exit code {c.code}: {new Date(c.timestamp).toLocaleString()}
              </div>
            ))}
          </>
        ) : crashesInLastHour.length > 5 ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => setShowCrashData(true)}>
                Show crash data
              </Button>
            }
          >
            Validator client is restarting too often
          </Alert>
        ) : null}
      </>
    );
  } else if (binaryStatus.isValidating) {
    return <LoadingView steps={["Fetching validator binary status"]} />;
  } else if (binaryStatus.error) {
    return <ErrorView error={binaryStatus.error} />;
  } else {
    return null;
  }
}
