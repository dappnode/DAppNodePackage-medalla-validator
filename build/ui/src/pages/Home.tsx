import React from "react";
import { useApi } from "api/rpc";
import { LayoutItem } from "components/LayoutItem";
import { ValidatorStatsTable } from "components/ValidatorStatsTable";
import { NodeStatsView } from "components/NodeStats";
import { TotalBalance } from "components/TotalBalance";
import { Alert } from "@material-ui/lab";

export function Home() {
  const validators = useApi.getValidators();
  const nodeStats = useApi.nodeStats();

  return (
    <>
      {nodeStats.data?.syncing && (
        <LayoutItem noPaper>
          <Alert severity="warning">
            Eth2 beacon node is still syncing. The validator can not perform its
            duties until it's fully synced
          </Alert>
        </LayoutItem>
      )}

      <LayoutItem sm={6}>
        <TotalBalance validators={validators.data || []} />
      </LayoutItem>
      {nodeStats.data && (
        <LayoutItem sm={6}>
          <NodeStatsView nodeStats={nodeStats.data} />
        </LayoutItem>
      )}

      <LayoutItem>
        <ValidatorStatsTable
          validators={validators.data || []}
          loading={!validators.data && validators.isValidating}
        />
      </LayoutItem>
    </>
  );
}
