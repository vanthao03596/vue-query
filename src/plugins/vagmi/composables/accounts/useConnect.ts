import type { ConnectArgs, ConnectResult } from "@wagmi/core";
import { connect } from "@wagmi/core";
import { useMutation } from "@tanstack/vue-query";

import { useClient } from "../../plugin";
import type { MutationConfig, SetMaybeRef } from "../../types";
import { getMaybeRefValue } from "../../utils";
import { computed, toRefs } from "vue";

export type UseConnectArgs = Partial<ConnectArgs>;

export type UseConnectConfig = MutationConfig<
  ConnectResult,
  Error,
  ConnectArgs,
  unknown
>;

export const mutationKey = (args: UseConnectArgs) => [
  { entity: "connect", ...args },
];

const mutationFn = (args: UseConnectArgs) => {
  const { connector, chainId } = args;
  if (!connector) throw new Error("connector is required");
  return connect({ connector, chainId });
};

export function useConnect({
  chainId,
  connector,
  onError,
  onMutate,
  onSettled,
  onSuccess,
}: SetMaybeRef<UseConnectArgs & UseConnectConfig> = {}) {
  const client = useClient();

  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables,
  } = useMutation(
    mutationKey({
      connector: getMaybeRefValue(connector),
      chainId: getMaybeRefValue(chainId),
    }),
    mutationFn,
    {
      onError,
      onMutate,
      onSettled,
      onSuccess,
    }
  );

  const connect = (args?: Partial<ConnectArgs>) => {
    return mutate({
      chainId: args?.chainId ?? chainId,
      connector: args?.connector ?? connector,
    } as ConnectArgs);
  };

  const connectAsync = (args?: Partial<ConnectArgs>) => {
    return mutateAsync({
      chainId: args?.chainId ?? chainId,
      connector: args?.connector ?? connector,
    } as ConnectArgs);
  };

  const pendingConnector = computed(() => {
    return variables.value?.connector;
  });

  return {
    connect,
    connectAsync,
    connectors: client.value.connectors,
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    status,
    variables,
    pendingConnector,
  } as const;
}
