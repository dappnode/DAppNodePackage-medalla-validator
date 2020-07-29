import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, GridSize } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
}));

export const LayoutItem: React.FC<{
  sm?: GridSize;
  noPaper?: boolean;
}> = function LayoutItem({ sm, noPaper, children }) {
  const classes = useStyles();
  if (noPaper)
    return (
      <Grid item xs={12} sm={sm}>
        {children}
      </Grid>
    );
  else
    return (
      <Grid item xs={12} sm={sm}>
        <Paper className={classes.paper}>{children}</Paper>
      </Grid>
    );
};
