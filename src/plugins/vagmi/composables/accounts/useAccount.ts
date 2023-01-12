import type { GetAccountResult } from "@wagmi/core";

import { Connector, getAccount, watchAccount } from "@wagmi/core";

import { onScopeDispose, ref, unref, watch } from "vue";

import type { MaybeRef } from "@vueuse/core";

export type AccountConfig = {
  /** Function to invoke when connected */
  onConnect?({
    address,
    connector,
    isReconnected,
  }: {
    address?: GetAccountResult["address"];
    connector?: GetAccountResult["connector"];
    isReconnected: boolean;
  }): void;
  /** Function to invoke when disconnected */
  onDisconnect?(): void;
};

export type UseAccountConfig = {
  [Property in keyof AccountConfig]: MaybeRef<AccountConfig[Property]>;
};

export const useAccount = ({
  onConnect,
  onDisconnect,
}: UseAccountConfig = {}) => {

  const account = ref<GetAccountResult>(getAccount());

  const previousAccount = ref<GetAccountResult>();
  const unsubscribeAccount = watchAccount((acc: GetAccountResult) => {
    account.value = acc;
  });
  watch(account, () => {
    const plainConnect = unref(onConnect);
    const plainDisconnect = unref(onDisconnect);

    if (
      !!plainConnect &&
      previousAccount.value?.status !== "connected" &&
      account.value.status === "connected"
    )
      plainConnect({
        address: account.value.address,
        connector: account.value.connector as Connector,
        isReconnected: previousAccount.value?.status === "reconnecting",
      });

    if (
      !!plainDisconnect &&
      previousAccount.value?.status == "connected" &&
      account.value.status === "disconnected"
    )
      plainDisconnect();
    previousAccount.value = account.value as GetAccountResult;
  });
  onScopeDispose(() => {
    unsubscribeAccount();
  });
  return {
    account,
  };
};
