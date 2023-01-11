import { createClient, configureChains, mainnet } from "@wagmi/core";
import { publicProvider } from "@wagmi/core/providers/public";

const { chains, provider } = configureChains([mainnet], [publicProvider()]);

const client = createClient({
  autoConnect: true,
  provider,
});

export default client;
