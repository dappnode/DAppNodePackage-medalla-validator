import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button } from "@material-ui/core";
import { responseInterface } from "swr";
import { Eth1AccountStats } from "common";

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    "& > *:not(:last-child)": {
      marginRight: "1rem",
    },
    textAlign: "center",
  },
}));

export function ManageValidators({
  eth1Account,
  onAddValidators,
  addingValidators,
}: {
  eth1Account: responseInterface<Eth1AccountStats, Error>;
  onAddValidators: () => void;
  addingValidators?: boolean;
}) {
  const classes = useStyles();

  if (eth1Account.data) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} className={classes.buttons}>
          <Button
            onClick={onAddValidators}
            disabled={addingValidators}
            variant="contained"
            color="primary"
          >
            Add validators
          </Button>
        </Grid>
      </Grid>
    );
  }

  return null;
}
