import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { Title } from "./Title";
import { ValidatorStats } from "../common/types";
import { HelpText } from "components/HelpText";
import { prysmStatusDescription } from "text";
import { PublicKeyView } from "./PublicKeyView";
import { DepositEventsView } from "./Eth1TransactionView";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(1),
  },
  centerLink: {
    display: "flex",
    alignItems: "center",
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    display: "flex",
    fontSize: "1.2rem",
  },
}));

export function ValidatorsTable({
  validators,
}: {
  validators: ValidatorStats[];
}) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Title>Validator accounts</Title>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>PubKey</TableCell>
            <TableCell>Deposit</TableCell>
            <TableCell>
              <span className={classes.centerLink}>
                Status <HelpText table={prysmStatusDescription} />
              </span>
            </TableCell>
            <TableCell align="right">Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {validators.map((validator, i) => (
            <TableRow key={validator.name || i}>
              <TableCell>{validator.name}</TableCell>
              <TableCell>
                <PublicKeyView publicKey={validator.publicKey} />
              </TableCell>
              <TableCell>
                <DepositEventsView depositEvents={validator.depositEvents} />
              </TableCell>
              <TableCell>{validator.status}</TableCell>
              <TableCell align="right">
                {validator.balance.eth}
                {validator.balance.isEstimated && "(estimated)"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className={classes.seeMore}>
        {/* <Link color="primary" href="#">
            See more validators
          </Link> */}
      </div>
    </React.Fragment>
  );
}
