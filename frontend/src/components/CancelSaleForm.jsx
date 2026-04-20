import { useState } from "react";
import toast from "react-hot-toast";

export default function CancelSaleForm({ contract, triggerRefresh, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const activeLandId = selectedLandId || landId;

  const cancelSale = async () => {
    try {
      if (!contract) {
        toast.error("Connect wallet first");
        return;
      }

      if (!activeLandId) {
        toast.error("Select a Land ID first");
        return;
      }

      setLoading(true);

      const tx = await contract.cancelSale(BigInt(activeLandId), reason);
      await tx.wait();

      toast.success("Sale cancelled");
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error(error);
      toast.error(error.reason || error.message || "Failed to cancel sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Cancel Sale</h2>
      <p className="section-note">Cancel the selected sale and optionally include a reason.</p>

      <div className="form-grid">
        <div className="form-row">
          <label className="form-label">Land ID</label>
          {selectedLandId ? (
            <input type="text" value={selectedLandId} readOnly className="readonly-input" />
          ) : (
            <input
              type="number"
              placeholder="Land ID"
              value={landId}
              onChange={(e) => setLandId(e.target.value)}
            />
          )}
        </div>

        <div className="form-row">
          <label className="form-label">Reason</label>
          <input
            type="text"
            placeholder="Enter reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      <div className="card-actions">
        <button onClick={cancelSale} disabled={loading}>
          {loading ? "Cancelling..." : "Cancel Sale"}
        </button>
      </div>
    </div>
  );
}