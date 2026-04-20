import { useState } from "react";
import toast from "react-hot-toast";

export default function ResolveSuccessionForm({ contract, latestCID, triggerRefresh, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [loading, setLoading] = useState(false);

  const activeLandId = selectedLandId || landId;

  const resolveSuccession = async () => {
    try {
      if (!contract) {
        toast.error("Connect wallet first");
        return;
      }

      setLoading(true);

      const tx = await contract.resolveSuccession(
        BigInt(activeLandId),
        newOwner,
        latestCID
      );

      await tx.wait();

      toast.success("Succession resolved");
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error(error);
      toast.error(error.reason || error.message || "Failed to resolve succession");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Resolve Succession</h2>

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

      <input
        type="text"
        placeholder="New Owner Address"
        value={newOwner}
        onChange={(e) => setNewOwner(e.target.value)}
      />

      <input
        type="text"
        value={latestCID || ""}
        readOnly
      />

      <button onClick={resolveSuccession} disabled={loading}>
        {loading ? "Resolving..." : "Resolve Succession"}
      </button>
    </div>
  );
}