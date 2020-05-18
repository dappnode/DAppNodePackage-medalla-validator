import React, { useState } from "react";
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import { InputPassword } from "./InputPassword";
import { api } from "api/rpc";
import { RequestStatus } from "types";
import FileSaver from "file-saver";
import { ErrorView } from "./ErrorView";
import { Alert } from "@material-ui/lab";

const keystoreName = "prysm-validator-dappnode-withdrawal.keystore";

export function BackupWithdrawalDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [keystoreStatus, setKeystoreStatus] = useState<RequestStatus<string>>(
    {}
  );

  const errors: string[] = [];
  if (password && passwordConfirm && password !== passwordConfirm)
    errors.push("Password do not match");
  if (password && password.length < 8)
    errors.push("Password must be at least 8 characters long");
  const hasErrors = errors.length > 0;

  async function fetchKeystore() {
    try {
      setKeystoreStatus({ loading: true });
      const result = await api.withdrawalAccountCreate(password);
      setKeystoreStatus({ result });
      const blob = new Blob([result], {
        type: "text/plain;charset=utf-8",
      });
      FileSaver.saveAs(blob, keystoreName);
      setTimeout(onClose, 500);
    } catch (e) {
      console.error(e);
      setKeystoreStatus({ error: e });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Generate and backup withdrawal account
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography>
            Before being able to create validators, let's generate and backup a
            withdrawal account. Please, provide a strong password for the
            account's keystore. For a testnet you may use a password manager to
            store the password.
          </Typography>
        </DialogContentText>

        <Box my={1}>
          <InputPassword
            password={password}
            setPassword={setPassword}
            error={hasErrors}
          />

          <InputPassword
            name="Confirm"
            id="confirm-password-toogle-show"
            password={passwordConfirm}
            setPassword={setPasswordConfirm}
            error={hasErrors}
          />
          {errors.map((error) => (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ))}
        </Box>

        <Box my={2}>
          <Alert severity="warning">
            Keep your withdrawal keystore safe to be able to recover the funds
          </Alert>
        </Box>

        <Box mt={3} mb={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchKeystore}
            disabled={
              !password ||
              !passwordConfirm ||
              hasErrors ||
              keystoreStatus.loading
            }
          >
            Download
          </Button>
        </Box>

        {keystoreStatus.error && <ErrorView error={keystoreStatus.error} />}
      </DialogContent>
    </Dialog>
  );
}
