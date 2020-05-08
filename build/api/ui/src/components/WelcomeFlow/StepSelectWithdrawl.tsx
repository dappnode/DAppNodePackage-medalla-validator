import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { SelectWithdrawlAccount } from "components/Withdrawl/SelectWithdrawlAccount";
import { NavButtons } from "./NavButtons";

export function StepSelectWithdrawl({
  withdrawlAccount,
  setWithdrawlAccount,
  onNext,
  onBack,
}: {
  withdrawlAccount: string;
  setWithdrawlAccount: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
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
        <SelectWithdrawlAccount
          withdrawlAccount={withdrawlAccount}
          setWithdrawlAccount={setWithdrawlAccount}
        />
      </Box>

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        disableNext={!withdrawlAccount}
        nextLabel="Select account"
      ></NavButtons>
    </React.Fragment>
  );
}
