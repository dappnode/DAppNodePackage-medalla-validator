import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Typography,
  Box,
} from "@material-ui/core";
import { InputPassword } from "./InputPassword";
import { ErrorView } from "./ErrorView";
import { PublicKeyView } from "./PublicKeyView";

export function ValidatorPasswordInput({
  pubkey,
  onAddPassword,
}: {
  pubkey: string;
  onAddPassword: (pubkey: string, passphrase: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [validationError, setValidationError] = useState<Error>();

  const errors: string[] = [];
  if (password && passwordConfirm && password !== passwordConfirm)
    errors.push("Password do not match");
  const hasErrors = errors.length > 0;

  function onValidate() {
    try {
      setValidationError(undefined);
      onAddPassword(pubkey, password);
      setOpen(false);
    } catch (e) {
      setValidationError(e);
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        size="small"
        onClick={() => setOpen(true)}
      >
        Input password
      </Button>

      {open && (
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Validator keystore password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Provide this validator's keystore password to perform its duties
              in the validator client
            </DialogContentText>
            <PublicKeyView publicKey={pubkey} />

            <Box my={1}>
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

              {errors.map((error, i) => (
                <Typography key={i} variant="body2" color="error">
                  {error}
                </Typography>
              ))}
            </Box>

            {validationError && <ErrorView error={validationError} />}

            <Box mt={3} mb={1}>
              <Button
                variant="contained"
                color="primary"
                disabled={hasErrors}
                onClick={onValidate}
              >
                Validate
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
