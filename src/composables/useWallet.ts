import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { reactive, ref, toRefs } from "vue";

declare global {
  interface Window {
    ethereum: { request: (opt: { method: string }) => Promise<Array<string>> };
  }
}

const getProvider = async () => {
  const provider = await detectEthereumProvider();

  let etherProvider;

  if (provider) {
    try {
      etherProvider = new ethers.providers.Web3Provider(window.ethereum);

      await etherProvider.send("eth_requestAccounts", []);
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("No MetaMask Wallet found");
  }

  return etherProvider;
};

interface IWallet {
  provider: ethers.providers.Web3Provider | null;
  walletAddress: string | null;
  connected: boolean;
  chainId: string | number;
  signer: null | ethers.providers.JsonRpcSigner;
}

const useWallet = () => {
  const walletObj: IWallet = reactive({
    provider: null,
    walletAddress: null,
    connected: false,
    chainId: 1,
    signer: null,
  });

  const fetching = ref(false);
  const assets = ref<string | number>(0);

  const getUserBalance = async () => {
    if (!walletObj.provider || !walletObj.walletAddress) {
      return 0;
    }

    const balance = await walletObj.provider.getBalance(
      walletObj.walletAddress
    );
    return ethers.utils.formatEther(balance);
  };

  const getAccountAssets = async () => {
    fetching.value = true;

    assets.value = await getUserBalance();
  };

  const subscribeProvider = async (
    connectedProvider: ethers.providers.Web3Provider
  ) => {
    const provider: any = connectedProvider.provider;

    if (!provider.on) {
      return;
    }

    provider.on("close", () => async () => {});
    provider.on("accountsChanged", async (accounts: Array<string>) => {
      walletObj.walletAddress = accounts[0];
      await getAccountAssets();
    });
    provider.on("chainChanged", async () => {
      const chainId = (await connectedProvider.getNetwork()).chainId;
      walletObj.chainId = chainId;
      await getAccountAssets();
    });
  };

  const onConnect = async () => {
    const provider = await getProvider();

    await subscribeProvider(provider);

    const signer = provider.getSigner();

    const address = await signer.getAddress();

    const chainId = (await provider.getNetwork()).chainId;

    walletObj.provider = provider;
    walletObj.connected = true;
    walletObj.walletAddress = address;
    walletObj.chainId = chainId;
    walletObj.signer = signer;
    await getAccountAssets();
  };

  return {
    ...toRefs(walletObj),
    fetching,
    assets,
    onConnect,
  };
};

export { getProvider, useWallet };
