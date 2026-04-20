import { useEffect, useState } from "react";
import CopyButton from "./CopyButton";
import ExplorerLink from "./ExplorerLink";

export default function UploadedDocumentsViewer({
  contract,
  selectedLandId,
  refreshKey
}) {
  const [loading, setLoading] = useState(false);
  const [landInfo, setLandInfo] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    try {
      setError("");
      setMetadata(null);
      setLandInfo(null);

      if (!contract || !selectedLandId) return;

      setLoading(true);

      const land = await contract.lands(BigInt(selectedLandId));

      if (!land || !land.exists) {
        setError("Land record does not exist.");
        return;
      }

      setLandInfo({
        landId: land.landId?.toString?.() || String(selectedLandId),
        tctNumber: land.tctNumber || "",
        location: land.location || "",
        propertyType: land.propertyType || "",
        owner: land.owner || "",
        metadataCID: land.metadataCID || ""
      });

      if (!land.metadataCID) {
        setError("No metadata CID found for this land record.");
        return;
      }

      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${land.metadataCID}`);
      if (!response.ok) {
        throw new Error("Failed to load metadata from IPFS.");
      }

      const metadataJson = await response.json();
      setMetadata(metadataJson);
    } catch (err) {
      console.error("UploadedDocumentsViewer error:", err);
      setError(err.message || "Failed to load uploaded documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [contract, selectedLandId, refreshKey]);

  const files = metadata?.files || [];

  return (
    <div className="card">
      <h2 className="section-title">Uploaded Documents Viewer</h2>
      <p className="section-note">
        Review the uploaded files linked to the selected land record before approval.
      </p>

      {!selectedLandId && (
        <p className="section-note" style={{ marginTop: "14px" }}>
          Select a Land ID first to view uploaded documents.
        </p>
      )}

      {loading && (
        <p className="section-note" style={{ marginTop: "14px" }}>
          Loading uploaded documents...
        </p>
      )}

      {error && (
        <div className="panel-subtle" style={{ marginTop: "14px" }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {landInfo && (
        <div className="panel-subtle" style={{ marginTop: "14px" }}>
          <p><strong>Land ID:</strong> {landInfo.landId}</p>
          <p><strong>TCT Number:</strong> {landInfo.tctNumber}</p>
          <p><strong>Location:</strong> {landInfo.location}</p>
          <p><strong>Property Type:</strong> {landInfo.propertyType}</p>
          <p><strong>Metadata CID:</strong> {landInfo.metadataCID}</p>
        </div>
      )}

      {metadata && (
        <div style={{ marginTop: "14px" }}>
          <div className="panel-subtle" style={{ marginBottom: "12px" }}>
            <p><strong>Registration Mode:</strong> {metadata.registrationMode || "N/A"}</p>
            <p><strong>Uploaded At:</strong> {metadata.uploadedAt || "N/A"}</p>
          </div>

          {files.length === 0 ? (
            <p className="section-note">No files found in metadata.</p>
          ) : (
            <div className="table-wrap">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>CID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, index) => (
                    <tr key={`${file.cid}-${index}`}>
                      <td>{file.name || "Unnamed file"}</td>
                      <td>{file.type || "Unknown"}</td>
                      <td className="table-break">{file.cid}</td>
                      <td>
                        <div className="table-actions">
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${file.cid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="table-link-btn"
                          >
                            View
                          </a>

                          <CopyButton text={file.cid} />
                          <ExplorerLink type="ipfs" value={file.cid} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}