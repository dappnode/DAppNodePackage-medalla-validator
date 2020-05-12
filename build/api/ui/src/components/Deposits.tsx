import React, { useEffect } from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Title } from "./Title";
import { useApi } from "api/rpc";

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
  bottomLink: {
    marginTop: 24,
  },
});

export function Deposits() {
  const nodeStats = useApi.nodeStats();
  const validatorsStats = useApi.validatorsStats();
  const classes = useStyles();

  useEffect(() => {
    const interval = setInterval(() => {
      if (nodeStats.data) nodeStats.revalidate();
      if (validatorsStats.data) validatorsStats.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [nodeStats, validatorsStats]);

  function computeBalance() {
    if (!validatorsStats.data) return { sum: "?", partial: false };
    const balances = validatorsStats.data.map((validator) => validator.balance);
    const sum = balances.reduce((a, b) => (b ? a + parseFloat(b) : a), 0);
    const unknown = balances.every((n) => typeof n === "undefined");
    const partial = balances.some((n) => typeof n === "undefined");
    if (unknown) return { sum: "?", partial: false };
    else return { sum, partial };
  }

  const totalBalance = computeBalance();

  return (
    <React.Fragment>
      <Title>Total balance</Title>
      <Typography component="p" variant="h4">
        {totalBalance.sum}
        {totalBalance.partial ? "*" : ""} ETH
      </Typography>
      {totalBalance.partial && (
        <Typography color="textSecondary" className={classes.depositContext}>
          * Some validator balances are unknown
        </Typography>
      )}

      {/* Node stats */}
      {nodeStats.data ? (
        <div>
          <Typography color="textSecondary" className={classes.depositContext}>
            Current epoch:{" "}
            <strong>
              {nodeStats.data.chainhead
                ? nodeStats.data.chainhead.headEpoch
                : "?"}
            </strong>{" "}
            {nodeStats.data.syncing
              ? nodeStats.data.syncing.syncing
                ? "(syncing)"
                : "(synced)"
              : ""}
          </Typography>
          <Typography color="textSecondary" className={classes.depositContext}>
            Peers:{" "}
            <strong>
              {nodeStats.data.peers ? nodeStats.data.peers.length : "?"}
            </strong>
          </Typography>
        </div>
      ) : null}

      <div className={classes.bottomLink}>
        <Link color="primary" href="#">
          View balance
        </Link>
      </div>
    </React.Fragment>
  );
}
