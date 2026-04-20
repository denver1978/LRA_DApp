import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function NetworkStatus() {
  const [networkName, setNetworkName] = useState("Unknown");
  const [chainId, setChainId] = useState("");
  const [isSepolia, setIsSepolia] = useState(false);

  const loadNetwork = async () => {
    try {
      if (!window.ethereum) {
        setNetworkName("MetaMask not detected");
        setChainId("");
        setIsSepolia(false);
        return;
      }

      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId"
      });

      const chainIdDecimal = parseInt(chainIdHex, 16);

      setChainId(chainIdDecimal);

      if (chainIdDecimal === 11155111) {
        setNetworkName("Sepolia");
        setIsSepolia(true);
      } else if (chainIdDecimal === 1) {
        setNetworkName("Ethereum Mainnet");
        setIsSepolia(false);
      } else if (chainIdDecimal === 31337) {
        setNetworkName("Hardhat Local");
        setIsSepolia(false);
      } else {
        setNetworkName(`Unknown Network (${chainIdDecimal})`);
        setIsSepolia(false);
      }
    } catch (error) {
      console.error("Network status error:", error);
      setNetworkName("Failed to detect network");
      setChainId("");
      setIsSepolia(false);
    }
  };

  const switchToSepolia = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not detected.");
        return;
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }]
      });

      await loadNetwork();
      toast.success("Switched to Sepolia.");
    } catch (error) {
      console.error("Switch network error:", error);

      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"]
              }
            ]
          });

          await loadNetwork();
          toast.success("Sepolia network added.");
        } catch (addError) {
          console.error("Add Sepolia error:", addError);
          toast.error("Failed to add Sepolia network.");
        }
      } else {
        toast.error("Failed to switch MetaMask to Sepolia.");
      }
    }
  };

  useEffect(() => {
    loadNetwork();

    if (window.ethereum) {
      window.ethereum.on("chainChanged", loadNetwork);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("chainChanged", loadNetwork);
      }
    };
  }, []);

  return (
    <div
      className="card"
      style={{
        border: isSepolia ? "1px solid #86efac" : "1px solid #fca5a5",
        background: isSepolia ? "#f0fdf4" : "#fef2f2"
      }}
    >
      <h2
        className="section-title"
        style={{ color: isSepolia ? "#166534" : "#b91c1c" }}
      >
        Network Status
      </h2>

      <p><strong>Current Network:</strong> {networkName}</p>
      <p><strong>Chain ID:</strong> {chainId || "N/A"}</p>

      <p style={{ color: isSepolia ? "#166534" : "#b91c1c", fontWeight: 600 }}>
        {isSepolia
          ? "Correct network: MetaMask is connected to Sepolia."
          : "Wrong network: please switch MetaMask to Sepolia."}
      </p>

      {!isSepolia && (
        <div className="card-actions">
          <button onClick={switchToSepolia}>Switch to Sepolia</button>
        </div>
      )}
    </div>
  );
}