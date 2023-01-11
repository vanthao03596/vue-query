import { createApp } from "vue";
import { createPinia } from "pinia";
import { getDefaultProvider } from "ethers";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

import { VagmiPlugin, createClient } from "./plugins/vagmi/plugin";

const app = createApp(App);

app.use(createPinia());
app.use(router);

import {bscTestnet} from '@wagmi/chains'
import { CoinbaseWalletConnector } from "@wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "@wagmi/connectors/injected";
import { WalletConnectConnector } from "@wagmi/connectors/walletConnect";

import { configureChains, mainnet } from "@wagmi/core";
import { publicProvider } from "@wagmi/core/providers/public";

const { chains, provider } = configureChains([bscTestnet], [publicProvider()]);

const client = createClient({
  autoConnect: true,
  connectors: [
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  provider,
});

app.use(VagmiPlugin(client));

app.mount("#app");
