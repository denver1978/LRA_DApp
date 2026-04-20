import CopyButton from "./CopyButton";
import ExplorerLink from "./ExplorerLink";

export default function LastRegisteredPanel({ lastRegistered }) {
  if (!lastRegistered) return null;

  return (
    <div
      className="card"
      style={{
        border: "1px solid #86efac",
        background: "#f0fdf4"
      }}
    >
      <h2 className="section-title" style={{ color: "#166534" }}>
        Last Registered Land
      </h2>

      <p><strong>Land ID:</strong> {lastRegistered.landId}</p>
      <p><strong>TCT Number:</strong> {lastRegistered.tctNumber}</p>

      <p>
        <strong>Metadata CID:</strong> {lastRegistered.metadataCID}
        <CopyButton text={lastRegistered.metadataCID} />
        <ExplorerLink type="ipfs" value={lastRegistered.metadataCID} />
      </p>
    </div>
  );
}