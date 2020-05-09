import React from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Title } from "./Title";
import { ValidatorAccount } from "./common/types";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(1),
  },
}));

export function Accounts({ accounts }: { accounts: ValidatorAccount[] }) {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        className={classes.header}
      >
        <Grid item>
          <Title>Validator accounts</Title>
        </Grid>
        <Grid item>
          <Button color="primary" variant="contained">
            Add validator
          </Button>
        </Grid>
      </Grid>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Wallet</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.name}>
              <TableCell>{account.name}</TableCell>
              <TableCell>{account.wallet}</TableCell>
              <TableCell>{account.status}</TableCell>
              <TableCell align="right">{account.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className={classes.seeMore}>
        <Link color="primary" href="#">
          See more validators
        </Link>
      </div>
    </React.Fragment>
  );
}
