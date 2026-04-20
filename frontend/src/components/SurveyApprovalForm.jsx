import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SurveyApprovalForm({ contract, triggerRefresh, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connect Surveyor wallet to approve.");
  const [loading, setLoading] = useState(false);

  const activeLandId = selectedLandId || landId;

  const validateSurveyor = async () => {
    try {
      if (!contract) {
        setCanSubmit(false);
        setStatusMessage("Connect wallet first.");
        return;
      }

      const connected = await contract.runner.getAddress();
      const surveyor = await contract.surveyor();

      if (connected.toLowerCase() === surveyor.toLowerCase()) {
        setCanSubmit(true);
        setStatusMessage("Correct wallet: Surveyor connected.");
      } else {
        setCanSubmit(false);
        setStatusMessage("Wrong wallet: connected account is not the Surveyor.");
      }
    } catch (error) {
      console.error("Surveyor validation error:", error);
      setCanSubmit(false);
      setStatusMessage("Failed to validate Surveyor wallet.");
    }
  };

  useEffect(() => {
    validateSurveyor();
  }, [contract]);

  const approveSurvey = async () => {
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

      const tx = await contract.setSurvey(BigInt(activeLandId), true);
      await tx.wait();

      toast.success("Survey approved");
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
      <h2 className="section-title">Survey Approval</h2>
      <p className="section-note">Approve the survey stage for the selected transaction.</p>

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
        <button onClick={approveSurvey} disabled={!canSubmit || loading}>
          {loading ? "Approving..." : "Approve Survey"}
        </button>
      </div>
    </div>
  );
}