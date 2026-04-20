import { useEffect, useRef, useState } from "react";
import { BrowserProvider } from "ethers";
import { createEVMClient } from "@metamask/connect-evm";

const SEPOLIA_CHAIN_ID = 11155111;

export default function useWallet() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const clientRef = useRef(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY;

        if (!infuraApiKey) {
          console.error("Missing VITE_INFURA_API_KEY");
          return;
        }

        const client = await createEVMClient({
          dapp: {
            name: "Baguio Land Registry DApp",
            url: window.location.origin,
            iconUrl: `${window.location.origin}/favicon.ico`
          },
          api: {
            supportedNetworks: {
              "0xaa36a7": `https://sepolia.infura.io/v3/${infuraApiKey}`
            }
          }
        });

        clientRef.current = client;
      } catch (error) {
        console.error("MetaMask Connect init error:", error);
      }
    };

    initClient();
  }, []);

  const connectWallet = async () => {
    try {
      let injected = window.ethereum;

      // 🔥 PRIORITY: use MetaMask extension if available
      if (injected) {
        console.log("Using MetaMask extension");

        const browserProvider = new BrowserProvider(injected);

        await injected.request({ method: "eth_requestAccounts" });

        const network = await browserProvider.getNetwork();

        if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
          alert("Please switch MetaMask to Sepolia network.");
          return;
        }

        const signerInstance = await browserProvider.getSigner();
        const address = await signerInstance.getAddress();

        setProvider(browserProvider);
        setSigner(signerInstance);
        setAccount(address);

        return;
      }

      // 🔥 FALLBACK: MetaMask Connect (mobile / tablet)
      if (!clientRef.current) {
        alert("Wallet connector not ready");
        return;
      }

      console.log("Using MetaMask Connect fallback");

      const evmProvider = await clientRef.current.connect({
        chainIds: ["0xaa36a7"]
      });

      // ⚠️ DO NOT wrap directly → causes error
      if (!evmProvider?.accounts || !evmProvider?.chainId) {
        throw new Error("Invalid wallet provider");
      }

      const address = evmProvider.accounts[0];

      if (parseInt(evmProvider.chainId, 16) !== SEPOLIA_CHAIN_ID) {
        alert("Please switch MetaMask to Sepolia network.");
        return;
      }

      setAccount(address);

    } catch (error) {
      console.error("Wallet connection error:", error);
      alert(error?.message || "Failed to connect wallet.");
    }
  };

  const disconnectWallet = async () => {
    try {
      if (clientRef.current) {
        await clientRef.current.disconnect();
      }
    } catch (error) {
      console.error("Disconnect error:", error);
    }

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