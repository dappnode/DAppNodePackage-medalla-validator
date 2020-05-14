import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";
import { Title } from "./Title";
import { useApi } from "api/rpc";

const useStyles = makeStyles((theme) => ({
  depositContext: {
    flex: 1,
  },
  noteText: {
    color: theme.palette.text.secondary,
    fontStyle: "italic",
    fontSize: "100%",
  },
}));

export function NodeStats() {
  const nodeStats = useApi.nodeStats();
  const classes = useStyles();

  useEffect(() => {
    const interval = setInterval(() => {
      if (nodeStats.data) nodeStats.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [nodeStats]);

  if (!nodeStats.data) return null;

  return (
    <>
      <Title>Node Stats</Title>
      <Typography className={classes.depositContext}>
        Current epoch:{" "}
        <strong>
          {nodeStats.data.chainhead ? nodeStats.data.chainhead.headEpoch : "?"}
        </strong>{" "}
        {nodeStats.data.syncing
          ? nodeStats.data.syncing.syncing
            ? "(syncing)"
            : "(synced)"
          : ""}
      </Typography>
      <Typography className={classes.depositContext}>
        Peers:{" "}
        <strong>
          {nodeStats.data.peers ? nodeStats.data.peers.length : "?"}
        </strong>
      </Typography>
    </>
  );
}
