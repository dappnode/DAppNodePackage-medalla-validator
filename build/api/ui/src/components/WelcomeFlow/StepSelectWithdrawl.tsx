import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { SelectWithdrawlAccount } from "components/Withdrawl/SelectWithdrawlAccount";

export function StepSelectWithdrawl({
  setWithdrawlAccount,
}: {
  setWithdrawlAccount: (id: string) => void;
}) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Select withdrawl account
      </Typography>
      <Typography gutterBottom>
        This account will receive the validator funds after an exit
      </Typography>
      <Box mt={3}>
        <SelectWithdrawlAccount setWithdrawlAccount={setWithdrawlAccount} />
      </Box>
    </React.Fragment>
  );
}
