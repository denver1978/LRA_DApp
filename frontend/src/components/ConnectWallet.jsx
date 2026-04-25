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

export default function ConnectWallet({ account, connectWallet, disconnectWallet }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileCheck = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);
  }, []);

  return (
    <div style={{ marginBottom: "20px" }}>
      
      {/* Mobile Notice */}
      {isMobile && !account && (
        <p style={{ color: "orange", marginBottom: "10px" }}>
          Mobile detected: You may be redirected to MetaMask app.
        </p>
      )}

      {/* Connect / Disconnect Button */}
      <button
        onClick={account ? disconnectWallet : connectWallet}
        style={{
          padding: "10px 15px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        {account
          ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect MetaMask"}
      </button>

      {/* Full Address Display */}
      {account && (
        <p style={{ marginTop: "10px", wordBreak: "break-all" }}>
          Connected Account: {account}
        </p>
      )}
    </div>
  );
}

