import React from "react";
import { useApi } from "api/rpc";
import { LayoutItem } from "components/LayoutItem";
import { ValidatorStatsTable } from "components/ValidatorStatsTable";
import { NodeStats } from "components/NodeStats";
import { TotalBalance } from "components/TotalBalance";

export function Home() {
  const validators = useApi.getValidators();

  return (
    <>
      <LayoutItem sm={6}>
        <TotalBalance validators={validators.data || []} />
      </LayoutItem>
      <LayoutItem sm={6}>
        <NodeStats />
      </LayoutItem>

      <LayoutItem>
        <ValidatorStatsTable
          validators={validators.data || []}
          loading={!validators.data && validators.isValidating}
        />
      </LayoutItem>
    </>
  );
}
