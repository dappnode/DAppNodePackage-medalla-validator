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
import { DepositEvent, ValidatorStats } from "../common/types";
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

export function AccountsTable({ addValidator }: { addValidator: () => void }) {
  const validatorsStats = useApi.validatorsStats();

  useEffect(() => {
    const interval = setInterval(() => {
      if (validatorsStats.data) validatorsStats.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [validatorsStats]);

  const classes = useStyles();
  if (validatorsStats.data && validatorsStats.data.length === 0)
    return (
      <Button variant="contained" color="primary" onClick={addValidator}>
        Add validator
      </Button>
    );
  if (validatorsStats.data)
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
            <Button color="primary" variant="contained" onClick={addValidator}>
              Add validator
            </Button>
          </Grid>
        </Grid>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>PubKey</TableCell>
              <TableCell>Created</TableCell>
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
            {validatorsStats.data.map((account, i) => (
              <AccountRow key={account.id || i} account={account} />
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

  if (validatorsStats.error)
    return (
      <Box my={2}>
        <ErrorView error={validatorsStats.error} />
      </Box>
    );

  if (validatorsStats.isValidating)
    return (
      <Box my={2}>
        <LinearProgress />
      </Box>
    );
  return null;
}

function AccountRow({ account }: { account: ValidatorStats }) {
  const balance = account.balance;
  const estimatedBalance =
    typeof balance === "number" || typeof balance === "string"
      ? null
      : getEstimatedBalanceFormDepositEvents(account.depositEvents);
  return (
    <TableRow key={account.name}>
      <TableCell>{account.name}</TableCell>
      <TableCell>
        <PublicKeyView publicKey={account.publicKey} />
      </TableCell>
      <TableCell>
        {account.createdTimestamp
          ? moment(account.createdTimestamp).fromNow()
          : "-"}
      </TableCell>
      <TableCell>
        <DepositEventsView depositEvents={account.depositEvents} />
      </TableCell>
      <TableCell>{account.status}</TableCell>
      <TableCell align="right">
        {typeof balance === "number" || typeof balance === "string"
          ? formatEth(balance)
          : estimatedBalance
          ? `${estimatedBalance} (estimated)`
          : "-"}
      </TableCell>
    </TableRow>
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
    [txHashAndLogIndex: string]: DepositEvent;
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
            href={urlJoin(goerliTxViewer, depositEvent.txHash || "")}
            {...newTabProps}
          >
            <LaunchIcon fontSize="inherit" />
          </Link>
        </div>
      ))}
    </div>
  );
}
