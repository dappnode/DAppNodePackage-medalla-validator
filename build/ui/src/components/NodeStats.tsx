import React, { useEffect } from "react";
import { Typography } from "@material-ui/core";
import { Title } from "./Title";
import { useApi } from "api/rpc";

export function NodeStats() {
  const nodeStats = useApi.nodeStats();

  if (!nodeStats.data) return null;

  return (
    <>
      <Title>Node Stats</Title>
      <Typography>
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
      <Typography>
        Peers:{" "}
        <strong>
          {nodeStats.data.peers ? nodeStats.data.peers.length : "?"}
        </strong>
      </Typography>
    </>
  );
}
