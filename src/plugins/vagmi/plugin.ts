import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/query-persist-client-core";
import { persistQueryClient } from "@tanstack/query-persist-client-core";
import type {
  ClientConfig,
  Client as CoreClient,
  Provider,
  WebSocketProvider,
} from "@wagmi/core";
import {
  createClient as createCoreClient,
  createStorage,
  noopStorage,
} from "@wagmi/core";
import {
  type InjectionKey,
  type Ref,
  type Plugin,
  shallowRef,
  triggerRef,
  markRaw,
  inject,
} from "vue";

export type CreateClientConfig<
  TProvider extends Provider = Provider,
  TWebSocketProvider extends WebSocketProvider = WebSocketProvider
> = ClientConfig<TProvider, TWebSocketProvider> & {
  queryClient?: QueryClient;
  persister?: Persister | null;
};
export function createClient<
  TProvider extends Provider,
  TWebSocketProvider extends WebSocketProvider
>({
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1_000 * 60 * 60 * 24, // 24 hours
        networkMode: "offlineFirst",
        refetchOnWindowFocus: false,
        retry: 0,
      },
      mutations: {
        networkMode: "offlineFirst",
      },
    },
  }),
  storage = createStorage({
    storage:
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage
        : noopStorage,
  }),
  persister = typeof window !== "undefined"
    ? createSyncStoragePersister({
        key: "cache",
        storage,
        // Serialization is handled in `storage`.
        serialize: (x) => x as unknown as string,
        // Deserialization is handled in `storage`.
        deserialize: (x) => x as unknown as PersistedClient,
      })
    : undefined,
  ...config
}: CreateClientConfig<TProvider, TWebSocketProvider>) {
  const client = createCoreClient<TProvider, TWebSocketProvider>({
    ...config,
    storage,
  });

  if (persister)
    persistQueryClient({
      queryClient,
      persister,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) =>
          query.cacheTime !== 0 &&
          // Note: adding a `persist` flag to a query key will instruct the
          // persister whether or not to persist the response of the query.
          (query.queryKey[0] as { persist?: boolean }).persist !== false,
      },
    });

  return Object.assign(client, { queryClient });
}

export type Client<
  TProvider extends Provider = Provider,
  TWebSocketProvider extends WebSocketProvider = WebSocketProvider,
> = CoreClient<TProvider, TWebSocketProvider> & { queryClient: QueryClient }

export const VagmiClientKey: InjectionKey<Ref<Client>> = Symbol("vagmi");

export function VagmiPlugin<
  TProvider extends Provider,
  TWebSocketProvider extends WebSocketProvider
>(client: Client<TProvider, TWebSocketProvider>): Plugin {
  return {
    install(app) {
      // Setup vue-query
      app.use(VueQueryPlugin, {
        queryClient: client.queryClient,
      });

      const reactiveClient = shallowRef(client);

      // Setup @wagmi/core
      if (client.config.autoConnect) client.autoConnect();

      const unsubscribe = client.subscribe(() => {
        triggerRef(markRaw(reactiveClient));
      });

      const originalUnmount = app.unmount;
      app.unmount = function vagmiUnmount() {
        unsubscribe();
        originalUnmount();
      };

      // @ts-expect-error: Internal
      app.provide(VagmiClientKey, markRaw(reactiveClient));
    },
  };
}

export function useClient() {
  const vagmiClient = inject(VagmiClientKey);

  if (!vagmiClient) {
    throw new Error(
      [
        "`useClient` must be used within `WagmiConfig`.\n",
        "Read more: https://wagmi.sh/docs/WagmiConfig",
      ].join("\n")
    );
  }


  return vagmiClient;
}
