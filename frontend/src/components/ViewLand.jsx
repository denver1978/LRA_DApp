import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CopyButton from "./CopyButton";
import ExplorerLink from "./ExplorerLink";

export default function ViewLand({ contract, refreshKey, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [land, setLand] = useState(null);

  const activeLandId = selectedLandId || landId;

  const loadLand = async () => {
    try {
      if (!contract || !activeLandId) return;

      const data = await contract.lands(BigInt(activeLandId));

      setLand({
        landId: data.landId.toString(),
        tctNumber: data.tctNumber,
        location: data.location,
        propertyType: data.propertyType,
        metadataCID: data.metadataCID,
        owner: data.owner,
        locked: data.locked,
        exists: data.exists
      });
    } catch (error) {
      console.error("Load land error:", error);
      toast.error(error.reason || error.message || "Failed to load land");
    }
  };

  useEffect(() => {
    if (activeLandId) {
      loadLand();
    } else {
      setLand(null);
    }
  }, [refreshKey, selectedLandId]);

  return (
    <div className="card">
      <h2>View Land</h2>

      {!selectedLandId && (
        <>
          <input
            type="number"
            placeholder="Land ID"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
          <button onClick={loadLand}>Load Land</button>
        </>
      )}

      {selectedLandId && (
        <p><strong>Using Shared Land ID:</strong> {selectedLandId}</p>
      )}

      {land && (
        <div style={{ marginTop: "16px" }}>
          <p><strong>Land ID:</strong> {land.landId}</p>
          <p><strong>TCT Number:</strong> {land.tctNumber}</p>
          <p><strong>Location:</strong> {land.location}</p>
          <p><strong>Property Type:</strong> {land.propertyType}</p>

          <p>
            <strong>Metadata CID:</strong> {land.metadataCID}
            <CopyButton text={land.metadataCID} />
            <ExplorerLink type="ipfs" value={land.metadataCID} />
          </p>

          <p>
            <strong>Owner:</strong> {land.owner}
            <CopyButton text={land.owner} />
            <ExplorerLink type="address" value={land.owner} />
          </p>

          <p><strong>Locked:</strong> {land.locked ? "Yes" : "No"}</p>
          <p><strong>Exists:</strong> {land.exists ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}