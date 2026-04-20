import { useState } from "react";
import toast from "react-hot-toast";

export default function MarkOwnerDeceasedForm({ contract, triggerRefresh, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [loading, setLoading] = useState(false);

  const activeLandId = selectedLandId || landId;

  const markDeceased = async () => {
    try {
      if (!contract) {
        toast.error("Connect wallet first");
        return;
      }

      setLoading(true);

      const tx = await contract.markOwnerDeceased(BigInt(activeLandId));
      await tx.wait();

      toast.success("Owner marked as deceased");
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error(error);
      toast.error(error.reason || error.message || "Failed to mark deceased");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Mark Owner Deceased</h2>

      {selectedLandId ? (
        <input type="text" value={selectedLandId} readOnly />
      ) : (
        <input
          type="number"
          placeholder="Land ID"
          value={landId}
          onChange={(e) => setLandId(e.target.value)}
        />
      )}

      <button onClick={markDeceased} disabled={loading}>
        {loading ? "Marking..." : "Mark Deceased"}
      </button>
    </div>
  );
}