import React from "react";
import { Typography } from "@material-ui/core";
import { Title } from "./Title";
import { NodeStats } from "common";

export function NodeStatsView({ nodeStats }: { nodeStats: NodeStats }) {
  return (
    <>
      <Title>Node stats</Title>
      <Typography>
        Current epoch:{" "}
        <strong>
          {nodeStats.chainhead ? nodeStats.chainhead.headEpoch : "?"}
        </strong>{" "}
        {nodeStats.syncing
          ? nodeStats.syncing.syncing
            ? "(syncing)"
            : "(synced)"
          : ""}
      </Typography>
      <Typography>
        Peers: <strong>{nodeStats.peers ? nodeStats.peers.length : "?"}</strong>
      </Typography>
      <Typography>
        Network: <strong>{nodeStats.eth2NetworkName}</strong>
      </Typography>
    </>
  );
}
