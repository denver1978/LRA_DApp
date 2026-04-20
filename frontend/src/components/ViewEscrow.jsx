import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ViewEscrow({ contract, refreshKey, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [escrow, setEscrow] = useState("");

  const activeLandId = selectedLandId || landId;

  const loadEscrow = async () => {
    try {
      if (!contract || !activeLandId) return;

      const amount = await contract.escrow(BigInt(activeLandId));
      setEscrow(amount.toString());
    } catch (error) {
      console.error("Load escrow error:", error);
      toast.error(error.reason || error.message || "Failed to load escrow");
    }
  };

  useEffect(() => {
    if (activeLandId) {
      loadEscrow();
    } else {
      setEscrow("");
    }
  }, [refreshKey, selectedLandId]);

  return (
    <div className="card">
      <h2>View Escrow</h2>

      {!selectedLandId && (
        <>
          <input
            type="number"
            placeholder="Land ID"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
          <button onClick={loadEscrow}>Load Escrow</button>
        </>
      )}

      {selectedLandId && (
        <p><strong>Using Shared Land ID:</strong> {selectedLandId}</p>
      )}

      {escrow !== "" && (
        <p style={{ marginTop: "16px" }}>
          <strong>Escrow Amount (Wei):</strong> {escrow}
        </p>
      )}
    </div>
  );
}