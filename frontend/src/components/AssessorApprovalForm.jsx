import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AssessorApprovalForm({ contract, triggerRefresh, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connect Assessor wallet to approve.");
  const [loading, setLoading] = useState(false);

  const activeLandId = selectedLandId || landId;

  const validateAssessor = async () => {
    try {
      if (!contract) {
        setCanSubmit(false);
        setStatusMessage("Connect wallet first.");
        return;
      }

      const connected = await contract.runner.getAddress();
      const assessor = await contract.assessor();

      if (connected.toLowerCase() === assessor.toLowerCase()) {
        setCanSubmit(true);
        setStatusMessage("Correct wallet: Assessor connected.");
      } else {
        setCanSubmit(false);
        setStatusMessage("Wrong wallet: connected account is not Assessor.");
      }
    } catch (error) {
      console.error("Assessor validation error:", error);
      setCanSubmit(false);
      setStatusMessage("Failed to validate Assessor wallet.");
    }
  };

  useEffect(() => {
    validateAssessor();
  }, [contract]);

  const approveAssessor = async () => {
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

      const tx = await contract.setAssessor(BigInt(activeLandId), true);
      await tx.wait();

      toast.success("Assessor approved");
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
      <h2 className="section-title">Assessor Approval</h2>
      <p className="section-note">Approve the assessor stage for the selected transaction.</p>

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
        <button onClick={approveAssessor} disabled={!canSubmit || loading}>
          {loading ? "Approving..." : "Approve Assessor"}
        </button>
      </div>
    </div>
  );
}