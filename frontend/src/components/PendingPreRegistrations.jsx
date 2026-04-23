import { useEffect, useState } from "react";
import CopyButton from "./CopyButton";
import ExplorerLink from "./ExplorerLink";

export default function PendingPreRegistrations({
  onSelectPending,
  refreshKey,
  onAfterSelect
}) {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const loadPendingItems = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("pendingPreRegistrations") || "[]"
      );

      const pendingOnly = saved.filter((item) => item.status === "pending");

      setAllItems(saved);
      setItems(pendingOnly);
    } catch (error) {
      console.error("Failed to load pending pre-registrations:", error);
      setAllItems([]);
      setItems([]);
    }
  };

  useEffect(() => {
    loadPendingItems();
  }, [refreshKey]);

  // ✅ Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "pendingPreRegistrations") {
        loadPendingItems();
      }
    };

    // ✅ Listen for same-tab custom refresh events
    const handlePendingRefresh = () => {
      loadPendingItems();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pendingPreRegistrationsUpdated", handlePendingRefresh);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pendingPreRegistrationsUpdated", handlePendingRefresh);
    };
  }, []);

  const handleSelect = (item) => {
    setSelectedId(item.localId);

    if (onSelectPending) {
      onSelectPending(item);
    }

    if (onAfterSelect) {
      onAfterSelect();
    }
  };

  const handleRemove = (localId) => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("pendingPreRegistrations") || "[]"
      );

      const updated = saved.filter((item) => item.localId !== localId);

      localStorage.setItem(
        "pendingPreRegistrations",
        JSON.stringify(updated)
      );

      // ✅ Same-tab instant update
      window.dispatchEvent(new Event("pendingPreRegistrationsUpdated"));

      loadPendingItems();

      if (selectedId === localId) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to remove pending pre-registration:", error);
    }
  };

  const summary = {
    totalPending: allItems.filter((item) => item.status === "pending").length,
    totalRegistered: allItems.filter((item) => item.status === "registered").length,
    selected: selectedId ? 1 : 0
  };

  if (items.length === 0) {
    return (
      <div className="card">
        <h2 className="section-title">Pending Pre-Registrations</h2>
        <p className="section-note">No pending pre-registrations found.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Pending Pre-Registrations</h2>
      <p className="section-note">
        Select a pending pre-registration to continue land registration on-chain.
      </p>

      <div className="summary-mini-cards">
        <div className="summary-mini-card">
          <span className="summary-mini-label">Pending</span>
          <strong>{summary.totalPending}</strong>
        </div>

        <div className="summary-mini-card">
          <span className="summary-mini-label">Selected</span>
          <strong>{summary.selected}</strong>
        </div>

        <div className="summary-mini-card">
          <span className="summary-mini-label">Registered</span>
          <strong>{summary.totalRegistered}</strong>
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: "14px" }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Temp Land ID</th>
              <th>TCT Number</th>
              <th>Owner</th>
              <th>Location</th>
              <th>Property Type</th>
              <th>Metadata CID</th>
              <th>Uploaded At</th>
              <th>Status / Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.localId}
                className={selectedId === item.localId ? "selected-row" : ""}
              >
                <td>{item.landId || "Not assigned"}</td>
                <td>{item.tctNumber}</td>
                <td className="table-break">{item.ownerAddress}</td>
                <td>{item.location}</td>
                <td>{item.propertyType}</td>
                <td className="table-break">
                  {item.metadataCID}
                  <div style={{ marginTop: "6px" }}>
                    <CopyButton text={item.metadataCID} />
                    <ExplorerLink type="ipfs" value={item.metadataCID} />
                  </div>
                </td>
                <td>{new Date(item.uploadedAt).toLocaleString()}</td>
                <td>
                  <div className="table-actions">
                    {selectedId === item.localId && (
                      <span className="selected-badge">Selected</span>
                    )}

                    <button
                      onClick={() => handleSelect(item)}
                      disabled={selectedId === item.localId}
                      className={selectedId === item.localId ? "disabled-select-btn" : ""}
                    >
                      {selectedId === item.localId ? "Selected" : "Select"}
                    </button>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleRemove(item.localId)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}