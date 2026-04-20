{/* import { useState } from "react";
import { BrowserProvider } from "ethers";

export default function useWallet() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);

      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address);
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert("Failed to connect wallet.");
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
------------------- 2nd edition -------

import { useEffect, useRef, useState } from "react";
import { BrowserProvider } from "ethers";
import { createEVMClient } from "@metamask/connect-evm";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

export default function useWallet() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);

  const clientRef = useRef(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY;

        if (!infuraApiKey) {
          console.error("Missing VITE_INFURA_API_KEY in .env");
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

  const ensureSepolia = async (evmProvider) => {
    const chainId = await evmProvider.request({ method: "eth_chainId" });

    if (chainId === SEPOLIA_CHAIN_ID) {
      return true;
    }

    try {
      await evmProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }]
      });
      return true;
    } catch (switchError) {
      console.error("Network switch failed:", switchError);
      alert("Please enable test networks in MetaMask and switch to Sepolia.");
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      if (!clientRef.current) {
        alert("Wallet connector is still initializing. Try again in a moment.");
        return;
      }

      const evmProvider = await clientRef.current.connect({
        chainIds: [SEPOLIA_CHAIN_ID]
      });

      const onSepolia = await ensureSepolia(evmProvider);
      if (!onSepolia) return;

      const browserProvider = new BrowserProvider(evmProvider);
      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();

      setWalletProvider(evmProvider);
      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address);
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert("Failed to connect wallet.");
    }
  };

  const disconnectWallet = async () => {
    try {
      if (clientRef.current) {
        await clientRef.current.disconnect();
      }
    } catch (error) {
      console.error("Wallet disconnect error:", error);
    } finally {
      setAccount("");
      setProvider(null);
      setSigner(null);
      setWalletProvider(null);
    }
  };

  return {
    account,
    provider,
    signer,
    walletProvider,
    connectWallet,
    disconnectWallet
  };
} */}

// --------3rd edition.  -----------
import { useEffect, useRef, useState } from "react";
import { BrowserProvider } from "ethers";
import { createEVMClient } from "@metamask/connect-evm";

const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

export default function useWallet() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);

  const clientRef = useRef(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY;

        if (!infuraApiKey) {
          console.error("Missing VITE_INFURA_API_KEY in .env");
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
        console.log("MetaMask Connect client initialized");
      } catch (error) {
        console.error("MetaMask Connect init error:", error);
      }
    };

    initClient();
  }, []);

  const connectWallet = async () => {
    try {
      if (!clientRef.current) {
        alert("Wallet connector is still initializing. Try again in a moment.");
        return;
      }

      const evmProvider = await clientRef.current.connect({
        chainIds: ["0xaa36a7"]
      });

      const browserProvider = new BrowserProvider(evmProvider);
      const network = await browserProvider.getNetwork();

      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DECIMAL) {
        alert("Please switch MetaMask to the Sepolia test network first.");
        return;
      }

      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();

      setWalletProvider(evmProvider);
      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address);

      console.log("Wallet connected:", address);
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
      console.error("Wallet disconnect error:", error);
    } finally {
      setAccount("");
      setProvider(null);
      setSigner(null);
      setWalletProvider(null);
    }
  };

  return {
    account,
    provider,
    signer,
    walletProvider,
    connectWallet,
    disconnectWallet
  };
}