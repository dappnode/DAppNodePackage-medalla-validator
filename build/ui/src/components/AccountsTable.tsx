import React, { useEffect } from "react";
import moment from "moment";
import { useApi } from "api/rpc";
import { makeStyles } from "@material-ui/core/styles";
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Grid,
  LinearProgress,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import { Title } from "./Title";
import { DepositEvent, ValidatorStats, DepositEvents } from "../common/types";
import { goerliTxViewer, beaconAccountViewer } from "common/params";
import { ErrorView } from "components/ErrorView";
import { HelpText } from "components/HelpText";
import {
  newTabProps,
  getEstimatedBalanceFormDepositEvents,
  formatEth,
  urlJoin,
} from "utils";
import { prysmStatusDescription } from "text";

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

export function AccountsTable({
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

function PublicKeyView({ publicKey }: { publicKey: string }) {
  const classes = useStyles();
  const shortHex = publicKey.substr(0, 6) + "..." + publicKey.substr(-4);
  return (
    <div className={classes.centerLink}>
      {shortHex}
      <Link
        className={classes.linkIcon}
        href={`${beaconAccountViewer}/${publicKey}`}
        {...newTabProps}
      >
        <LaunchIcon fontSize="inherit" />
      </Link>
    </div>
  );
}

function DepositEventsView({
  depositEvents,
}: {
  depositEvents: {
    [transactionHash: string]: {
      transactionHash?: string;
      blockNumber?: number;
    };
  };
}) {
  const classes = useStyles();
  return (
    <div>
      {Object.entries(depositEvents).map(([key, depositEvent]) => (
        <div key={key} className={classes.centerLink}>
          Deposited: {depositEvent.blockNumber}
          <Link
            className={classes.linkIcon}
            href={urlJoin(goerliTxViewer, depositEvent.transactionHash || "")}
            {...newTabProps}
          >
            <LaunchIcon fontSize="inherit" />
          </Link>
        </div>
      ))}
    </div>
  );
}
