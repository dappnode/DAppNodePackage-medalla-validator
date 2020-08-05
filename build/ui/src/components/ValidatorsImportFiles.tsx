import React, { useState, useCallback } from "react";
import {
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  makeStyles,
} from "@material-ui/core";
import { api } from "api/rpc";
import { ValidatorFiles } from "common";
import { RequestStatus } from "types";
import { ErrorView } from "components/ErrorView";
import { Alert } from "@material-ui/lab";
import BackupIcon from "@material-ui/icons/Backup";
import CloseIcon from "@material-ui/icons/Close";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import { useDropzone } from "react-dropzone";
import { processEth2File } from "../utils/eth2FileParser";
import { PublicKeyView } from "components/PublicKeyView";
import { ValidatorPasswordInput } from "components/ValidatorPasswordInput";
import { Title } from "components/Title";
import { LoadingView } from "components/LoadingView";

type ValidatorFilesPartial = Partial<ValidatorFiles> &
  Pick<ValidatorFiles, "pubkey">;

const useStyles = makeStyles((theme) => ({
  dropzone: {
    height: theme.spacing(20),
    backgroundColor: "#e5e5e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  dropzoneIcon: {
    color: theme.palette.text.secondary,
    fontSize: theme.spacing(6),
  },
  successIcon: {
    color: theme.palette.success.main,
    display: "flex",
  },
  deleteValidator: {
    display: "flex",
    opacity: 0.5,
    "&:hover": {
      opacity: 1,
    },
  },
  spacing: {
    "& > *:not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
  importValidators: {
    alignSelf: "flex-start",
  },
}));

export function ValidatorsImportFiles() {
  const [validators, setValidators] = useState<
    Record<string, ValidatorFilesPartial>
  >({});
  const [loadingFiles, setLoadingFiles] = useState<string>();
  const [importStatus, setImportStatus] = useState<RequestStatus<string>>({});

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Set loading=true associated to a random ID. There can be multiple onDrop events at once
      const loadingId = String(Math.random());
      setLoadingFiles(loadingId);
      for (const file of acceptedFiles) {
        try {
          const eth2File = await processEth2File(file);
          setValidators((_validators) => {
            switch (eth2File.type) {
              case "keystore": {
                const pubkey = eth2File.keystore.pubkey;
                return {
                  [pubkey]: {
                    ...(_validators[pubkey] || {}),
                    pubkey,
                    keystore: eth2File.keystore,
                  },
                };
              }

              // case "deposit": {
              //   for (const deposit of eth2File.data) {
              //     let validator = validators.get(deposit.pubkey);
              //     if (!validator) validator = { pubkey: deposit.pubkey };
              //     validator.depositData = deposit;
              //     validators.set(validator.pubkey, validator);
              //   }
              //   break;
              // }

              case "passphrase": {
                const pubkey = eth2File.pubkey;
                return {
                  [pubkey]: {
                    ...(_validators[pubkey] || {}),
                    pubkey,
                    passphrase: eth2File.passphrase,
                  },
                };
              }
            }

            return _validators;
          });
        } catch (e) {
          console.error(`Error processing ${file.name}`, e);
        }
      }
      setLoadingFiles((currentLoadingId) => {
        // Only mark as loading done if it's the current loadingId process
        if (currentLoadingId === loadingId) return undefined;
        else return currentLoadingId;
      });
    },
    [setValidators]
  );

  // Curried callback to first bind `pubkey` and let the child component provide the passphrase
  const onAddPassword = useCallback(
    (pubkey: string, passphrase: string) => {
      setValidators((_validators) => {
        const validator = _validators[pubkey];
        if (!validator) throw Error(`No validator for pubkey ${pubkey}`);
        if (!validator.keystore) throw Error(`Validator has no keystore`);
        return {
          [pubkey]: { ...validator, pubkey, passphrase },
        };
      });
    },
    [setValidators]
  );

  function removeValidatorFiles(pubkey: string) {
    setValidators((_validators) => {
      const { [pubkey]: _deleted, ..._validatorsRest } = _validators;
      return _validatorsRest;
    });
  }

  async function importValidators() {
    try {
      if (importStatus.loading) return;

      const validatorsReady: ValidatorFiles[] = [];
      for (const validator of Object.values(validators))
        if (validator.pubkey && validator.keystore && validator.passphrase)
          validatorsReady.push(validator as ValidatorFiles);

      if (validatorsReady.length === 0) return;

      setImportStatus({ loading: true });
      await api.importValidators(validatorsReady);
      setImportStatus({ result: "success" });
      setValidators({});
    } catch (e) {
      console.error(`Error importing validators`, e);
      setImportStatus({ error: e });
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const classes = useStyles();

  return (
    <div className={classes.spacing}>
      <div>
        <Title>Import validators</Title>
        <Typography color="textSecondary">
          Drag and drop validator keystores and their passphrases generated by
          either the Ethereum Foundation Launchpad or any client keymanagment
          tool.
        </Typography>
      </div>

      <Box mb={2}>
        <Alert severity="warning">
          Do not upload withdrawal keystores or mnemonics, only voting / signing
          keystores
        </Alert>
      </Box>

      <div {...getRootProps()} className={classes.dropzone}>
        <input {...getInputProps()} />
        <div>
          <BackupIcon className={classes.dropzoneIcon} />
          <Typography color="textSecondary">
            {isDragActive
              ? "Drop the files here..."
              : "Drag and drop some files here, or click to select files"}
          </Typography>
        </div>
      </div>
      {loadingFiles && (
        <LoadingView steps={["Uploading files...", "Parsing files..."]} />
      )}

      {Object.values(validators).length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Pubkey</TableCell>
                <TableCell>Keystore</TableCell>
                <TableCell>Passphrase</TableCell>
                {/* <TableCell>Deposit data</TableCell> */}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(validators).map((validator) => (
                <TableRow key={validator.pubkey}>
                  <TableCell>
                    <PublicKeyView publicKey={validator.pubkey} />
                  </TableCell>
                  <TableCell>
                    {validator.keystore ? (
                      <CheckCircleOutlineIcon className={classes.successIcon} />
                    ) : (
                      "missing"
                    )}
                  </TableCell>
                  <TableCell>
                    {validator.passphrase ? (
                      <CheckCircleOutlineIcon className={classes.successIcon} />
                    ) : (
                      <ValidatorPasswordInput
                        pubkey={validator.pubkey}
                        onAddPassword={onAddPassword}
                      />
                    )}
                  </TableCell>
                  {/* <TableCell>
                    {validator.depositData ? "OK" : "missing"}
                  </TableCell> */}
                  <TableCell
                    className={classes.deleteValidator}
                    onClick={() => removeValidatorFiles(validator.pubkey)}
                    align="right"
                  >
                    <CloseIcon />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {importStatus.result && (
        <Alert severity="success">Successfully imported validators</Alert>
      )}
      {importStatus.error && <ErrorView error={importStatus.error} />}
      {importStatus.loading && (
        <LoadingView
          steps={["Importing validator files", "Restarting validator client"]}
        />
      )}

      <Button
        variant="contained"
        color="primary"
        className={classes.importValidators}
        onClick={importValidators}
        disabled={
          importStatus.loading ||
          !Object.values(validators).some(isValidatorReady)
        }
      >
        Import validators
      </Button>
    </div>
  );
}

function isValidatorReady(validator: ValidatorFilesPartial): boolean {
  return Boolean(
    validator.keystore && validator.passphrase && validator.pubkey
  );
}
