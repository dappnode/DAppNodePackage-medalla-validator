import React, { useState } from "react";
import * as apiPaths from "api/paths";
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
import { newTabProps } from "utils";

export function BackupWithdrawalDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const errors: string[] = [];
  if (password && passwordConfirm && password !== passwordConfirm)
    errors.push("Password do not match");
  if (password && password.length < 8)
    errors.push("Password must be at least 8 characters long");
  const hasErrors = errors.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Backup withdrawal account
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Encrypt and download the keystore of your withdrawal account with a
          strong password. Keep your withdrawal key safe to be able to recover
          the funds after a validator exits.
        </DialogContentText>

        <Box my={1}>
          <form
            noValidate
            action={apiPaths.backup}
            method="post"
            {...newTabProps}
          >
            <InputPassword
              password={password}
              setPassword={setPassword}
              error={hasErrors}
            />

            <InputPassword
              name="Confirm"
              password={passwordConfirm}
              setPassword={setPasswordConfirm}
              error={hasErrors}
            />
            {errors.map((error) => (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ))}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!password || !passwordConfirm || hasErrors}
            >
              Download
            </Button>
          </form>
        </Box>

        <DialogActions>
          <Button onClick={onClose} color="primary">
            Back
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={!password || hasErrors}
          >
            Download
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
