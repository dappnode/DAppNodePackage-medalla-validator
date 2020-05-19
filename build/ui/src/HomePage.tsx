import React, { useState, useEffect } from "react";
import { LayoutItem } from "LayoutItem";
import { useApi, api } from "api/rpc";
import { Eth1Account } from "components/Eth1Account";
import { ValidatorsTable } from "./components/ValidatorsTable";
import { ValidatorsProgress } from "components/ValidatorsProgress";
import { NodeStats } from "components/NodeStats";
import { TotalBalance } from "components/TotalBalance";
import { RequestStatus } from "types";
import { PendingValidator } from "common";
import { BackupWithdrawalDialog } from "components/BackupWithdrawalDialog";

export function HomePage() {
  const [openWithdrawal, setOpenWithdrawal] = useState(false);
  const [withdrawalIsMigration, setWithdrawalIsMigration] = useState(false);
  const [statusAddingValidators, setStatusAddingValidators] = useState<
    RequestStatus<PendingValidator[]>
  >();
  const validators = useApi.getValidators();

  useEffect(() => {
    const interval = setInterval(() => {
      if (validators.data) validators.revalidate();
    }, 2000);
    return () => clearInterval(interval);
  }, [validators]);

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

      {/* TEMP */}
      <BackupWithdrawalDialog
        open={openWithdrawal}
        onClose={() => setOpenWithdrawal(false)}
        withdrawalIsMigration={withdrawalIsMigration}
      />

      <LayoutItem>
        <Eth1Account
          canAddValidators={canAddValidators}
          addValidators={addValidators}
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
