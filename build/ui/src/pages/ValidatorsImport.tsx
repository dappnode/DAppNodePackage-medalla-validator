import React from "react";
import { Typography } from "@material-ui/core";
import { LayoutItem } from "components/LayoutItem";
import { ValidatorsImportFiles } from "components/ValidatorsImportFiles";

export function ValidatorsImport() {
  return (
    <>
      <LayoutItem noPaper>
        <Typography variant="h4" color="textSecondary">
          Import validators
        </Typography>
      </LayoutItem>

      <LayoutItem>
        <ValidatorsImportFiles />
      </LayoutItem>
    </>
  );
}
