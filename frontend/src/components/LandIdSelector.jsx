export default function LandIdSelector({ landId, setLandId, label = "Active Land ID" }) {
  return (
    <div className="card">
      <h2 className="section-title">{label}</h2>
      <p className="section-note">
        Choose one land record and the page sections below will use it automatically.
      </p>

      <div className="form-row">
        <label className="form-label">Land ID</label>
        <input
          type="number"
          placeholder="Enter Land ID"
          value={landId}
          onChange={(e) => setLandId(e.target.value)}
        />
      </div>

      {landId && (
        <div className="panel-subtle">
          <strong>Selected Land ID:</strong> {landId}
        </div>
      )}
    </div>
  );
}