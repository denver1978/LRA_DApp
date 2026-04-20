import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import StatusBadge from "./StatusBadge";

export default function TransactionProgressTracker({ contract, refreshKey, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [sale, setSale] = useState(null);

  const activeLandId = selectedLandId || landId;

  const loadProgress = async () => {
    try {
      if (!contract) {
        toast.error("Connect wallet first");
        return;
      }

      if (!activeLandId) {
        toast.error("Enter Land ID");
        return;
      }

      const result = await contract.sales(BigInt(activeLandId));

      setSale({
        landId: result.landId.toString(),
        seller: result.seller,
        buyer: result.buyer,
        surveyOK: result.surveyOK,
        birOK: result.birOK,
        treasuryOK: result.treasuryOK,
        assessorOK: result.assessorOK,
        buyerFunded: result.buyerFunded,
        active: result.active
      });
    } catch (error) {
      console.error(error);
      toast.error(error.reason || error.message || "Failed to load progress");
    }
  };

  useEffect(() => {
    if (activeLandId) {
      loadProgress();
    } else {
      setSale(null);
    }
  }, [refreshKey, selectedLandId]);

  return (
    <div className="card">
      <h2>Transaction Progress Tracker</h2>

      {!selectedLandId && (
        <>
          <input
            type="number"
            placeholder="Land ID"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
          <button onClick={loadProgress}>Load Progress</button>
        </>
      )}

      {selectedLandId && (
        <p><strong>Using Shared Land ID:</strong> {selectedLandId}</p>
      )}

      {sale && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Land ID:</strong> {sale.landId}</p>
          <p><strong>Seller:</strong> {sale.seller}</p>
          <p><strong>Buyer:</strong> {sale.buyer}</p>

          <hr />

          <StatusBadge label="Buyer Funded" value={sale.buyerFunded} />
          <StatusBadge label="Survey" value={sale.surveyOK} />
          <StatusBadge label="BIR" value={sale.birOK} />
          <StatusBadge label="Treasury" value={sale.treasuryOK} />
          <StatusBadge label="Assessor" value={sale.assessorOK} />

          <div style={{ marginTop: "16px" }}>
            <strong>Sale Status:</strong>
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: "600",
                marginLeft: "10px",
                backgroundColor: sale.active ? "#dbeafe" : "#e5e7eb",
                color: sale.active ? "#1d4ed8" : "#374151",
                border: sale.active ? "1px solid #93c5fd" : "1px solid #d1d5db"
              }}
            >
              {sale.active ? "In Progress" : "Completed / Cancelled"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}