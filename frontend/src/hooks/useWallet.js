import { useState } from "react";
import { BrowserProvider } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

function getMetaMaskProvider() {
  if (!window.ethereum) return null;

  if (Array.isArray(window.ethereum.providers)) {
    const metaMaskProvider = window.ethereum.providers.find(
      (provider) => provider.isMetaMask
    );
    if (metaMaskProvider) return metaMaskProvider;
  }

  if (window.ethereum.isMetaMask) {
    return window.ethereum;
  }

  return null;
}

export default function useWallet() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    try {
      const metaMaskProvider = getMetaMaskProvider();

      if (!metaMaskProvider) {
        alert(
          "MetaMask is not available in this browser. On tablet or mobile, open the site inside the MetaMask app browser."
        );
        return;
      }

      const browserProvider = new BrowserProvider(metaMaskProvider);

      await metaMaskProvider.request({ method: "eth_requestAccounts" });

      const currentChainId = await metaMaskProvider.request({
        method: "eth_chainId"
      });

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          await metaMaskProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }]
          });
        } catch (switchError) {
          console.error("Sepolia switch error:", switchError);
          alert("Please switch MetaMask to Sepolia test network first.");
          return;
        }
      }

      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address);
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert(error?.message || "Failed to connect wallet.");
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setProvider(null);
    setSigner(null);
  };

  return {
    account,
    provider,
    signer,
    connectWallet,
    disconnectWallet
  };
}