import React from "react";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

export function FooterNote() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"APLv2 - "}
      <Link color="inherit" href="https://dappnode.io/">
        DAppNode
      </Link>{" "}
      {"2020."}
    </Typography>
  );
}
