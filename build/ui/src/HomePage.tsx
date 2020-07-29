import React, { useState } from "react";
import { LayoutItem } from "LayoutItem";
import { useApi, api } from "api/rpc";
import { ManageValidators } from "components/ManageValidators";
import { ValidatorsTable } from "./components/ValidatorsTable";
import { ValidatorsProgress } from "components/ValidatorsProgress";
import { ImportValidatorsDialog } from "components/ImportValidatorsDialog";
import { NodeStats } from "components/NodeStats";
import { TotalBalance } from "components/TotalBalance";
import { RequestStatus } from "types";
import { PendingValidator } from "common";
import { BackupWithdrawalDialog } from "components/BackupWithdrawalDialog";
import { ValidatorCountDialog } from "components/ValidatorCountDialog";

export function HomePage() {
  const [openWithdrawal, setOpenWithdrawal] = useState(false);
  const [openAddValidators, setOpenAddValidators] = useState(false);
  const [withdrawalIsMigration, setWithdrawalIsMigration] = useState(false);
  const [statusAddingValidators, setStatusAddingValidators] = useState<
    RequestStatus<PendingValidator[]>
  >();
  const validators = useApi.getValidators();
  const eth1Account = useApi.eth1AccountGet();

  /**
   * On clicking the button Add Validators in the home page
   * Either opens the backup modal or the validator count modal
   */
  async function onAddValidatorsButton() {
    try {
      if (await canAddValidators()) setOpenAddValidators(true);
    } catch (e) {
      console.error(e);
    }
  }

  async function canAddValidators(): Promise<boolean> {
    try {
      const withdrawalAccount = await api.withdrawalAccountGet();
      if (withdrawalAccount.exists) {
        return true;
      } else {
        setWithdrawalIsMigration(withdrawalAccount.isMigration);
        setOpenWithdrawal(true);
        return false;
      }
    } catch (e) {
      setStatusAddingValidators({ error: e });
      console.error(`Error getting withdrawal account`, e);
      return false;
    }
  }

  /**
   * After collecting the num of validators in the modal form,
   * actually call the server to add them
   * @param num
   */
  async function addValidators(num: number) {
    try {
      if (await canAddValidators()) {
        setStatusAddingValidators({ loading: true });
        const result = await api.addValidators(num);
        setStatusAddingValidators({ result });
        console.log(`Added ${num} validators`, result);
      }
    } catch (e) {
      setStatusAddingValidators({ error: e });
      console.error(`Error adding ${num} validators`, e);
    }
  }

  return (
    <>
      {/* <Chart /> */}
      <LayoutItem sm={6}>
        <TotalBalance validators={validators.data || []} />
      </LayoutItem>
      <LayoutItem sm={6}>
        <NodeStats />
      </LayoutItem>

      <BackupWithdrawalDialog
        open={openWithdrawal}
        onClose={() => setOpenWithdrawal(false)}
        onSuccess={() => setOpenAddValidators(true)}
        withdrawalIsMigration={withdrawalIsMigration}
      />

      {/* Modal to confirm number of validators */}
      <ValidatorCountDialog
        open={openAddValidators}
        balance={eth1Account.data?.balance || 0}
        addValidators={addValidators}
        onClose={() => setOpenAddValidators(false)}
      />

      <ImportValidatorsDialog
        open={true}
        onClose={() => setOpenWithdrawal(false)}
        onSuccess={() => setOpenAddValidators(true)}
        withdrawalIsMigration={withdrawalIsMigration}
      />

      <LayoutItem>
        <ManageValidators
          eth1Account={eth1Account}
          onAddValidators={onAddValidatorsButton}
          addingValidators={
            statusAddingValidators && statusAddingValidators.loading
          }
        />
      </LayoutItem>

      {statusAddingValidators && (
        <LayoutItem noPaper>
          <ValidatorsProgress
            status={statusAddingValidators}
            closeProgress={() => setStatusAddingValidators(undefined)}
          />
        </LayoutItem>
      )}

      <LayoutItem>
        <ValidatorsTable
          validators={validators.data || []}
          loading={!validators.data && validators.isValidating}
        />
      </LayoutItem>
    </>
  );
}
