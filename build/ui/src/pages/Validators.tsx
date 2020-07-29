import React from "react";
import { useApi } from "api/rpc";
import { Typography } from "@material-ui/core";
import { LayoutItem } from "components/LayoutItem";
import { ValidatorActionsTable } from "components/ValidatorActionsTable";

export function Validators() {
  const validators = useApi.getValidators();

  return (
    <>
      <LayoutItem noPaper>
        <Typography variant="h4" color="textSecondary">
          Validators
        </Typography>
      </LayoutItem>

      <LayoutItem>
        <ValidatorActionsTable
          validators={validators.data || []}
          loading={!validators.data && validators.isValidating}
        />
      </LayoutItem>
    </>
  );
}
