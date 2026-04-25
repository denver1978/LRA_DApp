{/*}

export default function ConnectWallet({ account, connectWallet }) {
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
}
*/}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ConnectWallet({
  account,
  connectWallet,
  disconnectWallet,
  roleLabel = ""
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const mobileCheck = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);
  }, []);

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "";

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Wallet address copied");

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      toast.error("Unable to copy wallet address");
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      {isMobile && !account && (
        <p style={{ color: "orange", marginBottom: "10px", fontSize: "14px" }}>
          Mobile detected: You may be redirected to MetaMask app.
        </p>
      )}

      {!account && (
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 15px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🦊 Connect MetaMask
        </button>
      )}

      {account && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            padding: "8px 10px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#f9fafb"
          }}
        >
          <span style={{ fontSize: "14px" }}>🦊</span>

          <span style={{ fontSize: "13px", fontWeight: "600" }}>
            Wallet:
          </span>

          <span style={{ fontSize: "13px", fontFamily: "monospace" }}>
            {shortAddress}
          </span>

          {roleLabel && (
            <span
              style={{
                fontSize: "12px",
                padding: "3px 8px",
                borderRadius: "999px",
                background: "#e0f2fe",
                color: "#0369a1",
                fontWeight: "600"
              }}
            >
              {roleLabel}
            </span>
          )}

          <button
            onClick={copyAddress}
            title="Copy Address"
            style={{
              padding: "6px 10px",
              fontSize: "12px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
              background: "#f3f4f6",
              color: "#111",              // ✅ force visible text
              fontWeight: "600",          // ✅ clearer text
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={disconnectWallet}
            style={{
              padding: "5px 9px",
              fontSize: "12px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}