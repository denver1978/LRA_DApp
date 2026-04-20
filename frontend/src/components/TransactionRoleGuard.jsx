import { useState } from "react";

export default function TransactionRoleGuard({ contract, account, mode }) {
  const [landId, setLandId] = useState("");
  const [message, setMessage] = useState("");

  const checkRole = async () => {
    try {
      if (!contract || !account) {
        setMessage("Connect wallet first.");
        return;
      }

      if (!landId) {
        setMessage("Enter Land ID.");
        return;
      }

      const wallet = account.toLowerCase();

      if (mode === "seller") {
        const land = await contract.lands(BigInt(landId));

        if (!land.exists) {
          setMessage("Land does not exist.");
          return;
        }

        if (wallet === land.owner.toLowerCase()) {
          setMessage("Correct wallet: connected account is the Seller / current land owner.");
        } else {
          setMessage("Wrong wallet: connected account is NOT the Seller / current land owner.");
        }
      }

      if (mode === "buyer") {
        const sale = await contract.sales(BigInt(landId));

        if (!sale.active && sale.buyer === "0x0000000000000000000000000000000000000000") {
          setMessage("No sale record found for this Land ID.");
          return;
        }

        if (wallet === sale.buyer.toLowerCase()) {
          setMessage("Correct wallet: connected account is the Buyer for this sale.");
        } else {
          setMessage("Wrong wallet: connected account is NOT the Buyer for this sale.");
        }
      }
    } catch (error) {
      console.error("Transaction role guard error:", error);
      setMessage(error.reason || error.message || "Failed to check role.");
    }
  };

  const isCorrect = message.startsWith("Correct wallet");

  return (
    <div
      className="card"
      style={{
        border: message
          ? isCorrect
            ? "1px solid #86efac"
            : "1px solid #fca5a5"
          : "1px solid #dbe4ee",
        background: message
          ? isCorrect
            ? "#f0fdf4"
            : "#fef2f2"
          : "#ffffff"
      }}
    >
      <h2 className="section-title">
        {mode === "seller" ? "Seller Wallet Check" : "Buyer Wallet Check"}
      </h2>

      <div className="form-grid">
        <div className="form-row">
          <label className="form-label">Land ID</label>
          <input
            type="number"
            placeholder="Enter Land ID"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
        </div>
      </div>

      <div className="card-actions">
        <button onClick={checkRole}>Check Wallet</button>
      </div>

      {message && (
        <p
          style={{
            marginTop: "14px",
            color: isCorrect ? "#166534" : "#b91c1c",
            fontWeight: 600
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}