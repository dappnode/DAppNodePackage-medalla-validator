import React from "react";
import { useApi } from "api/rpc";
import { Typography } from "@material-ui/core";
import { LayoutItem } from "components/LayoutItem";
import { ValidatorActionsTable } from "components/ValidatorActionsTable";

export function Validators() {
  const validators = useApi.getValidators();

  return (
    <>
      <div>
        <Typography variant="h3">Validators</Typography>
      </div>

      <LayoutItem>
        <ValidatorActionsTable
          validators={validators.data || []}
          loading={!validators.data && validators.isValidating}
        />
      </LayoutItem>
    </>
  );
}
