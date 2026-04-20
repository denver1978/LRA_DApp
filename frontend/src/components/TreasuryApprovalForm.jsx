import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function TreasuryApprovalForm({ contract, triggerRefresh, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connect City Treasury wallet to approve.");
  const [loading, setLoading] = useState(false);

  const activeLandId = selectedLandId || landId;

  const validateTreasury = async () => {
    try {
      if (!contract) {
        setCanSubmit(false);
        setStatusMessage("Connect wallet first.");
        return;
      }

      const connected = await contract.runner.getAddress();
      const treasury = await contract.cityTreasury();

      if (connected.toLowerCase() === treasury.toLowerCase()) {
        setCanSubmit(true);
        setStatusMessage("Correct wallet: City Treasury connected.");
      } else {
        setCanSubmit(false);
        setStatusMessage("Wrong wallet: connected account is not City Treasury.");
      }
    } catch (error) {
      console.error("Treasury validation error:", error);
      setCanSubmit(false);
      setStatusMessage("Failed to validate City Treasury wallet.");
    }
  };

  useEffect(() => {
    validateTreasury();
  }, [contract]);

  const approveTreasury = async () => {
    try {
      if (!contract) {
        toast.error("Connect wallet first");
        return;
      }

      if (!activeLandId) {
        toast.error("Select a Land ID first");
        return;
      }

      if (!canSubmit) {
        toast.error("Wrong wallet connected.");
        return;
      }

      setLoading(true);

      const tx = await contract.setCityTreasury(BigInt(activeLandId), true);
      await tx.wait();

      toast.success("Treasury approved");
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error(error);
      toast.error(error.reason || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">City Treasury Approval</h2>
      <p className="section-note">Approve the treasury stage for the selected transaction.</p>

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

        <p className={canSubmit ? "status-text-success" : "status-text-error"}>
          {statusMessage}
        </p>
      </div>

      <div className="card-actions">
        <button onClick={approveTreasury} disabled={!canSubmit || loading}>
          {loading ? "Approving..." : "Approve Treasury"}
        </button>
      </div>
    </div>
  );
}