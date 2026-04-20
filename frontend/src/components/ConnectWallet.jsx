{/* export default function ConnectWallet({ account, connectWallet }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={connectWallet}>
        {account ? "Wallet Connected" : "Connect MetaMask"}
      </button>

      {account && (
        <p style={{ marginTop: "10px" }}>
          Connected Account: {account}
        </p>
      )}
    </div>
  );
} */}

import { useState } from "react";
import { BrowserProvider } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

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

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId"
      });

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
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