import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import { RequestStatus } from "types";
import { PendingValidator } from "common";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  LinearProgress,
  Box,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
} from "@material-ui/core";
import { ErrorView } from "./ErrorView";
import { LoadingView } from "./LoadingView";
import { PublicKeyView } from "./PublicKeyView";
import { Eth1TransactionView } from "./Eth1TransactionView";
import { useApi } from "api/rpc";

const redColor = "#e6756d";
const maxItems = 10;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  headerContent: {
    width: "100%",
  },
  headerText: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  progressBar: {
    height: "16px",
    borderRadius: "4px",
  },
  detailsContent: {
    flexDirection: "column",
  },
  table: {
    "& > tbody > tr > td": {
      borderBottom: "none",
    },
  },
  closeButton: {
    alignSelf: "center",
    marginLeft: "0.5rem",
  },
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export function ValidatorsProgress({
  status,
  closeProgress,
}: {
  status: RequestStatus<PendingValidator[]>;
  closeProgress: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const { result, loading, error } = status;
  const progress = useApi.getPendingValidators();
  const [pendingValidators, setPendingValidators] = useState<
    PendingValidator[]
  >();
  // pendingValidators must be an internal state so it's cached and never goes
  // from defined to undefined

  useEffect(() => {
    if (!isEmpty(result)) setPendingValidators(result);
    else if (!isEmpty(progress.data)) setPendingValidators(progress.data);
  }, [result, progress.data]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(progress.revalidate, 500);
    return () => clearInterval(interval);
  }, [loading, progress]);

  const classes = useStyles();

  if (pendingValidators) {
    const totalProgress =
      (100 *
        pendingValidators.reduce(
          (total, validator) => total + progressPoints(validator.status),
          0
        )) /
      pendingValidators.length;
    const someErrors = pendingValidators.some(
      (validator) => validator.status === "error"
    );
    const hasFinished = Boolean(result);

    // Limit the amount of items to show at once >1000 can crash the page
    const pendingValidatorsToShow = showAll
      ? pendingValidators
      : pendingValidators.slice(0, 10);

    return (
      <div className={classes.root}>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Box
              flexDirection="column"
              my={1}
              className={classes.headerContent}
            >
              <Box className={classes.headerText}>
                <Typography className={classes.heading}>
                  {hasFinished
                    ? someErrors
                      ? "Added validators, with errors"
                      : "Successfully added validators"
                    : loading
                    ? "Adding validators..."
                    : error
                    ? "Error adding validators"
                    : ""}
                </Typography>
                {loading && (
                  <Typography className={classes.heading}>
                    {Math.round(totalProgress)}%
                  </Typography>
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalProgress}
                className={classes.progressBar}
                style={
                  hasFinished && someErrors ? { backgroundColor: redColor } : {}
                }
              />
            </Box>

            {/* To be able to dismiss and close the card */}
            {hasFinished && (
              <IconButton
                aria-label="close"
                className={classes.closeButton}
                onClick={closeProgress}
              >
                <CloseIcon />
              </IconButton>
            )}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.detailsContent}>
            {/* Help message if there were errors */}
            {hasFinished && someErrors && (
              <Typography gutterBottom color="textSecondary">
                The ether of the deposit trasactions that failed is safe. You
                can retry just by adding new validators.
              </Typography>
            )}

            <TableContainer>
              <Table size="small" className={classes.table}>
                <TableBody>
                  {pendingValidatorsToShow.map((validator) => (
                    <PendingValidatorRow
                      key={validator.account}
                      validator={validator}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Limit the amount of items to show at once >1000 can crash the page */}
            {pendingValidators.length > maxItems && (
              <Button
                className={classes.seeMore}
                color="primary"
                onClick={() => setShowAll(true)}
              >
                See all {pendingValidators.length} validators
              </Button>
            )}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }

  if (error) return <ErrorView error={error} />;
  if (loading) return <LoadingView steps={["Adding validators..."]} />;

  return null;
}

function PendingValidatorRow({ validator }: { validator: PendingValidator }) {
  return (
    <TableRow>
      <TableCell>{formatAccountName(validator.account)}</TableCell>
      <TableCell>
        <PendingValidatorStatus status={validator.status} />
      </TableCell>

      {validator.publicKey && (
        <TableCell>
          <PublicKeyView publicKey={validator.publicKey} />
        </TableCell>
      )}
      {validator.transactionHash && (
        <TableCell>
          <Eth1TransactionView transactionHash={validator.transactionHash}>
            TX
          </Eth1TransactionView>
        </TableCell>
      )}
      {validator.error && <TableCell>{validator.error}</TableCell>}
    </TableRow>
  );
}

/**
 * @param account "validator/23"
 * @returns "23"
 */
function formatAccountName(account: string): string {
  return (account || "").split("/")[1] || account;
}

function PendingValidatorStatus({
  status,
}: {
  status: PendingValidator["status"];
}) {
  switch (status) {
    case "confirmed":
      return <Typography color="primary">Confirmed</Typography>;
    case "error":
      return <Typography color="error">Error</Typography>;
    case "mined":
      return (
        <Typography color="textSecondary">Waiting confirmation...</Typography>
      );
    case "pending":
      return <Typography color="textSecondary">Pending...</Typography>;
    default:
      return null;
  }
}

function progressPoints(status: PendingValidator["status"]): number {
  switch (status) {
    case "confirmed":
      return 1;
    case "mined":
      return 0.5;
    case "pending":
      return 0;
    case "error":
      return 0;
    default:
      return 0;
  }
}
