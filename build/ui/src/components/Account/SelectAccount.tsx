import React, { useState, useEffect, useMemo } from "react";
import { sortBy } from "lodash";
import { CreateAccount } from "./CreateAccount";
import { useApi, api } from "api/rpc";
import { responseInterface } from "swr";
import { WalletType } from "./walletTypes";
import { EthdoAccount, WalletAccount } from "common";
// Material UI
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
  FormGroup,
  Select,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
} from "@material-ui/core";
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
  setValidatorAccount: (account: string) => void;
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

export function SelectWithdrawalAccount({
  withdrawalAccount,
  setWithdrawalAccount,
}: {
  withdrawalAccount: string;
  setWithdrawalAccount: (id: string) => void;
}) {
  const withdrawalAccounts = useApi.accountWithdrawalList();
  return (
    <SelectAccount
      wallet="withdrawal"
      placeholderName="Primary"
      withPassphrase={true}
      account={withdrawalAccount}
      setAccount={setWithdrawalAccount}
      accounts={withdrawalAccounts}
      accountCreate={api.accountWithdrawalCreate}
    />
  );
}

function SelectAccount({
  wallet,
  placeholderName,
  withPassphrase,
  account: selectedAccount,
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
    if (!selectedAccount && first) setAccount(first.account);
  }, [accountsAvailable, selectedAccount, setAccount]);

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
                value={selectedAccount}
                onChange={(e) => setAccount(e.target.value as string)}
              >
                {sortBy(
                  accountsAvailable,
                  (account) => account.createdTimestamp || 0
                )
                  .reverse() // Sort by latest created account first
                  .map(({ account, name }) => (
                    <MenuItem key={account} value={account}>
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

        {/* Dialog to create a withdrawal account */}
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
