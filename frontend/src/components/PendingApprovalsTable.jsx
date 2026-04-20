import { useEffect, useState } from "react";

export default function PendingApprovalsTable({
  contract,
  role,
  onSelectLandId,
  refreshKey,
  maxLandId = 50
}) {
  const [items, setItems] = useState([]);
  const [allMatchedItems, setAllMatchedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLandId, setSelectedLandId] = useState("");

  const isPendingForRole = (sale, roleName) => {
    if (!sale) return false;

    const active = sale.active ?? false;
    const buyerFunded = sale.buyerFunded ?? false;
    const surveyOK = sale.surveyOK ?? false;
    const birOK = sale.birOK ?? false;
    const treasuryOK = sale.treasuryOK ?? false;
    const assessorOK = sale.assessorOK ?? false;
    const rdOK = sale.rdOK ?? false;

    if (!active || !buyerFunded) return false;

    if (roleName === "surveyor") {
      return !surveyOK;
    }

    if (roleName === "bir") {
      return surveyOK && !birOK;
    }

    if (roleName === "treasury") {
      return surveyOK && birOK && !treasuryOK;
    }

    if (roleName === "assessor") {
      return surveyOK && birOK && treasuryOK && !assessorOK;
    }

    if (roleName === "rd") {
      return surveyOK && birOK && treasuryOK && assessorOK && !rdOK;
    }
    
    return false;
  };

  const loadPendingApprovals = async () => {
    if (!contract) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const found = [];

      for (let i = 1; i <= maxLandId; i++) {
        try {
          const land = await contract.lands(BigInt(i));
          if (!land || !land.exists) continue;

          let sale = null;

          try {
            sale = await contract.sales(BigInt(i));
          } catch (saleError) {
            console.error(`sales(${i}) failed:`, saleError);
            continue;
          }

          if (!isPendingForRole(sale, role)) continue;

          found.push({
            landId: land.landId?.toString?.() || String(i),
            tctNumber: land.tctNumber || "",
            location: land.location || "",
            propertyType: land.propertyType || "",
            owner: land.owner || "",
            buyer: sale.buyer || "",
            priceWei: sale.priceWei?.toString?.() || "0",
            surveyOK: sale.surveyOK ?? false,
            birOK: sale.birOK ?? false,
            treasuryOK: sale.treasuryOK ?? false,
            assessorOK: sale.assessorOK ?? false,
            rdOK: sale.rdOK ?? false
          });
        } catch (innerError) {
          // ignore missing or invalid ids
          console.error(`Land scan error for ID ${i}:`, innerError);
        }
      }

      setAllMatchedItems(found);
      setItems(found);
    } catch (error) {
      console.error("Pending approvals load error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingApprovals();
  }, [contract, refreshKey, role]);

  const handleSelect = (item) => {
    setSelectedLandId(item.landId);

    if (onSelectLandId) {
      onSelectLandId(item.landId);
    }
  };

  const getRoleTitle = () => {
    if (role === "surveyor") return "Pending Survey Approvals";
    if (role === "bir") return "Pending BIR Approvals";
    if (role === "treasury") return "Pending City Treasury Approvals";
    if (role === "assessor") return "Pending Assessor Approvals";
    if (role === "rd") return "Pending RD Final Approvals";
    return "Pending Approvals";
  };

  const summary = {
    totalPending: allMatchedItems.length,
    selected: selectedLandId ? 1 : 0
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="section-title">{getRoleTitle()}</h2>
        <p className="section-note">Loading pending approvals...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card">
        <h2 className="section-title">{getRoleTitle()}</h2>
        <p className="section-note">No pending items found for this approval stage.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">{getRoleTitle()}</h2>
      <p className="section-note">
        Select a pending land transaction appropriate to this approval stage.
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
          <span className="summary-mini-label">Role</span>
          <strong>{getRoleTitle().replace("Pending ", "").replace(" Approvals", "")}</strong>
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: "14px" }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Land ID</th>
              <th>TCT Number</th>
              <th>Location</th>
              <th>Property Type</th>
              <th>Buyer</th>
              <th>Approval Status</th>
              <th>Status / Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.landId}
                className={selectedLandId === item.landId ? "selected-row" : ""}
              >
                <td>{item.landId}</td>
                <td>{item.tctNumber}</td>
                <td>{item.location}</td>
                <td>{item.propertyType}</td>
                <td className="table-break">{item.buyer}</td>
                <td>
                  <div className="approval-status-mini">
                    <span>S:{item.surveyOK ? "✔" : "—"}</span>
                    <span>B:{item.birOK ? "✔" : "—"}</span>
                    <span>T:{item.treasuryOK ? "✔" : "—"}</span>
                    <span>A:{item.assessorOK ? "✔" : "—"}</span>
                    <span>RD:{item.rdOK ? "✔" : "—"}</span>
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    {selectedLandId === item.landId && (
                      <span className="selected-badge">Selected</span>
                    )}

                    <button
                      onClick={() => handleSelect(item)}
                      disabled={selectedLandId === item.landId}
                      className={selectedLandId === item.landId ? "disabled-select-btn" : ""}
                    >
                      {selectedLandId === item.landId ? "Selected" : "Select"}
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