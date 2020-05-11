import React, { useState, useEffect, useMemo } from "react";
import { sortBy } from "lodash";
import { CreateAccount } from "./CreateAccount";
import { useApi, api } from "rpc";
import { responseInterface } from "swr";
import { WalletType } from "./walletTypes";
import { EthdoAccount, WalletAccount } from "common";
// Material UI
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import LinearProgress from "@material-ui/core/LinearProgress";
import { ErrorView } from "components/ErrorView";

import { findFirstAvailableNum } from "utils";

const useStyles = makeStyles((theme) => ({
  formGroup: {
    alignItems: "center",
  },
  formControlSelect: {
    flex: "auto",
    marginRight: theme.spacing(2),
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  dialogContent: {
    // Prevent vertical scroll showing up, if the password field in the last
    paddingBottom: theme.spacing(2),
  },
}));

export function SelectValidatorAccount({
  validatorAccount,
  setValidatorAccount,
}: {
  validatorAccount: string;
  setValidatorAccount: (id: string) => void;
}) {
  const validatorAccounts = useApi.accountValidatorList();
  const placeholderName = validatorAccounts.data
    ? findFirstAvailableNum(validatorAccounts.data.map(({ name }) => name))
    : "1";
  return (
    <SelectAccount
      wallet="validator"
      placeholderName={placeholderName}
      account={validatorAccount}
      setAccount={setValidatorAccount}
      accounts={validatorAccounts}
      accountCreate={api.accountValidatorCreate}
    />
  );
}

export function SelectWithdrawlAccount({
  withdrawlAccount,
  setWithdrawlAccount,
}: {
  withdrawlAccount: string;
  setWithdrawlAccount: (id: string) => void;
}) {
  const withdrawlAccounts = useApi.accountWithdrawlList();
  return (
    <SelectAccount
      wallet="withdrawl"
      placeholderName="Primary"
      withPassphrase={true}
      account={withdrawlAccount}
      setAccount={setWithdrawlAccount}
      accounts={withdrawlAccounts}
      accountCreate={api.accountWithdrawlCreate}
    />
  );
}

function SelectAccount({
  wallet,
  placeholderName,
  withPassphrase,
  account,
  setAccount,
  accounts,
  accountCreate,
}: {
  wallet: WalletType;
  placeholderName: string;
  withPassphrase?: boolean;
  account: string;
  setAccount: (id: string) => void;
  accounts: responseInterface<WalletAccount[], Error>;
  accountCreate: (account: EthdoAccount) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const accountsAvailable = useMemo(
    () =>
      accounts.data ? accounts.data.filter((account) => account.available) : [],
    [accounts.data]
  );

  useEffect(() => {
    const first = accountsAvailable[0];
    if (!account && first) setAccount(first.id);
  }, [accountsAvailable, account, setAccount]);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const classes = useStyles();

  if (accounts.data)
    return (
      <div>
        {accountsAvailable.length > 0 ? (
          <FormGroup row className={classes.formGroup}>
            <FormControl className={classes.formControlSelect}>
              <InputLabel id="demo-simple-select-helper-label">
                {wallet} account
              </InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={account}
                onChange={(e) => setAccount(e.target.value as string)}
              >
                {sortBy(
                  accountsAvailable,
                  (account) => account.createdTimestamp || 0
                )
                  .reverse() // Sort by latest created account first
                  .map(({ id, name }) => (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  ))}
              </Select>
              <FormHelperText>Some important helper text</FormHelperText>
            </FormControl>

            <FormControl>
              <Button onClick={openDialog} variant="contained">
                Add
              </Button>
            </FormControl>
          </FormGroup>
        ) : (
          <Button
            onClick={openDialog}
            variant="contained"
            color="primary"
            fullWidth
          >
            Add {wallet} account
          </Button>
        )}

        {/* Dialog to create a withdrawl account */}
        <Dialog open={open} onClose={closeDialog}>
          <DialogContent className={classes.dialogContent}>
            <CreateAccount
              wallet={wallet}
              existingAccounts={accounts.data || []}
              placeholderName={placeholderName}
              withPassphrase={withPassphrase}
              accountCreate={(account) =>
                accountCreate(account).then(() => {
                  accounts.revalidate();
                  setTimeout(() => closeDialog(), 500);
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={closeDialog} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );

  if (accounts.error)
    return (
      <Box my={2}>
        <ErrorView error={accounts.error} />
      </Box>
    );
  if (accounts.isValidating)
    return (
      <Box my={2}>
        <LinearProgress />
      </Box>
    );
  return null;
}
