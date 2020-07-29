import React from "react";
import { useLocation } from "react-router";
import { Typography } from "@material-ui/core";

export function NoMatch() {
  let location = useLocation();

  return (
    <div>
      <Typography variant="h3">
        No match for <code>{location.pathname}</code>
      </Typography>
    </div>
  );
}
