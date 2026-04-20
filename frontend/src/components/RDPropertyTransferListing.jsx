import { useEffect, useMemo, useState } from "react";

export default function RDPropertyTransferListing({
  contract,
  refreshKey,
  onSelectLandId,
  maxLandId = 50
}) {
  const [items, setItems] = useState([]);
  const [selectedLandId, setSelectedLandId] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const loadTransferListing = async () => {
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
          } catch {
            sale = null;
          }

          // ✅ Fetch coordinates from metadata
          let latitude = "";
          let longitude = "";

          try {
            if (land.metadataCID) {
              const res = await fetch(`https://gateway.pinata.cloud/ipfs/${land.metadataCID}`);
              if (res.ok) {
                const data = await res.json();
                latitude = data?.coordinates?.latitude || "";
                longitude = data?.coordinates?.longitude || "";
              }
            }
          } catch (err) {
            console.error("Metadata fetch error:", err);
          }

          let saleStatus = "No Active Sale";
          let approvalStatus = "Not in Transfer";
          let buyer = "—";

          if (sale?.active) {
            buyer = sale.buyer || "—";

            if (!sale.buyerFunded) {
              saleStatus = "For Sale";
              approvalStatus = "Awaiting Buyer Funding";
            } else {
              saleStatus = "Pending Transfer";

              if (!sale.surveyOK) {
                approvalStatus = "Pending Survey";
              } else if (!sale.birOK) {
                approvalStatus = "Pending BIR";
              } else if (!sale.treasuryOK) {
                approvalStatus = "Pending Treasury";
              } else if (!sale.assessorOK) {
                approvalStatus = "Pending Assessor";
              } else {
                approvalStatus = "Ready for RD Final Approval";
              }
            }
          }

          found.push({
            landId: land.landId?.toString?.() || String(i),
            tctNumber: land.tctNumber || "",
            location: land.location || "",
            propertyType: land.propertyType || "",
            owner: land.owner || "",
            buyer,
            latitude,
            longitude,
            saleStatus,
            approvalStatus
          });
        } catch {
          // ignore invalid land ids
        }
      }

      setItems(found);
      setCurrentPage(1);
    } catch (error) {
      console.error("RDPropertyTransferListing error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransferListing();
  }, [contract, refreshKey]);

  const handleSelect = (item) => {
    setSelectedLandId(item.landId);
    if (onSelectLandId) {
      onSelectLandId(item.landId);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.landId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tctNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.propertyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.buyer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        item.saleStatus === statusFilter ||
        item.approvalStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const summary = {
    total: items.length,
    activeSales: items.filter(
      (item) => item.saleStatus === "Pending Transfer" || item.saleStatus === "For Sale"
    ).length,
    readyForRD: items.filter(
      (item) => item.approvalStatus === "Ready for RD Final Approval"
    ).length,
    noSale: items.filter((item) => item.saleStatus === "No Active Sale").length
  };

  const getBadgeClass = (text) => {
    if (text === "No Active Sale") return "status-badge status-owned";
    if (text === "For Sale") return "status-badge status-sale";
    if (text === "Pending Transfer") return "status-badge status-pending";
    if (text === "Ready for RD Final Approval") return "status-badge status-purchased";
    return "status-badge";
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="section-title">Property Transfer Listing</h2>
        <p className="section-note">Loading property transfer records...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Property Transfer Listing</h2>
      <p className="section-note">
        Review current owners, buyers, and transfer status before RD final processing.
      </p>

      <div className="summary-mini-cards">
        <div className="summary-mini-card">
          <span className="summary-mini-label">Total</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-mini-card">
          <span className="summary-mini-label">Active Sales</span>
          <strong>{summary.activeSales}</strong>
        </div>
        <div className="summary-mini-card">
          <span className="summary-mini-label">Ready for RD</span>
          <strong>{summary.readyForRD}</strong>
        </div>
        <div className="summary-mini-card">
          <span className="summary-mini-label">No Active Sale</span>
          <strong>{summary.noSale}</strong>
        </div>
      </div>

      <div className="table-toolbar">
        <input
          type="text"
          placeholder="Search by Land ID, TCT, owner, buyer, location..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="table-filter-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="table-filter-select"
        >
          <option value="All">All Status</option>
          <option value="No Active Sale">No Active Sale</option>
          <option value="For Sale">For Sale</option>
          <option value="Pending Transfer">Pending Transfer</option>
          <option value="Ready for RD Final Approval">Ready for RD Final Approval</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <p className="section-note" style={{ marginTop: "14px" }}>
          No property records found.
        </p>
      ) : (
        <>
          <p className="section-note" style={{ marginTop: "10px" }}>
            ← Scroll horizontally to view more details →
          </p>
          <div className="table-wrap" style={{ marginTop: "14px" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Land ID</th>
                  <th>TCT Number</th>
                  <th>Owner / Seller</th>
                  <th>Buyer</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Sale Status</th>
                  <th>Approval Status</th>
                  <th>Map</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedItems.map((item) => (
                  <tr
                    key={item.landId}
                    className={selectedLandId === item.landId ? "selected-row" : ""}
                  >
                    <td>{item.landId}</td>
                    <td>{item.tctNumber}</td>
                    <td className="table-break">{item.owner}</td>
                    <td className="table-break">{item.buyer}</td>
                    <td>{item.location}</td>
                    <td>{item.propertyType}</td>
                    <td>
                      <span className={getBadgeClass(item.saleStatus)}>
                        {item.saleStatus}
                      </span>
                    </td>
                    <td>
                      <span className={getBadgeClass(item.approvalStatus)}>
                        {item.approvalStatus}
                      </span>
                    </td>
                    <td>
                      {item.latitude && item.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="table-link-btn"
                        >
                          📍 View
                        </a>
                      ) : (
                        "-"
                      )}
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

          <div className="table-pagination">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <span className="pagination-text">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}