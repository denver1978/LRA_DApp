import { useEffect, useMemo, useState } from "react";

export default function MyPropertiesTable({
  contract,
  account,
  role, // "seller" or "buyer"
  onSelectLandId,
  refreshKey,
  maxLandId = 50
}) {
  const [items, setItems] = useState([]);
  const [selectedLandId, setSelectedLandId] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const loadProperties = async () => {
    if (!contract || !account) {
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

          const owner = land.owner?.toLowerCase();
          let sale = null;

          // ✅ NEW: fetch coordinates from metadata
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

          try {
            sale = await contract.sales(BigInt(i));
          } catch {
            sale = null;
          }

          const buyer = sale?.buyer?.toLowerCase();

          if (role === "seller" && owner === account.toLowerCase()) {
            let status = "Owned";

            if (sale?.active && !sale?.buyerFunded) {
              status = "For Sale";
            } else if (sale?.active && sale?.buyerFunded) {
              status = "Pending Approval";
            }

            found.push({
              landId: land.landId.toString(),
              tctNumber: land.tctNumber || "",
              location: land.location || "",
              propertyType: land.propertyType || "",
              owner: land.owner || "",
              latitude,
              longitude,
              status
            });
          }

          if (role === "buyer" && buyer === account.toLowerCase()) {
            let status = "Deposit Fund";

            if (sale?.active && sale?.buyerFunded) {
              status = "Pending Approval";
            } else if (!sale?.active && land.owner?.toLowerCase() === account.toLowerCase()) {
              status = "Purchased";
            }

            found.push({
              landId: land.landId.toString(),
              tctNumber: land.tctNumber || "",
              location: land.location || "",
              propertyType: land.propertyType || "",
              owner: land.owner || "",
              latitude,
              longitude,
              status
            });
          }
        } catch {
          // ignore invalid ids
        }
      }

      setItems(found);
      setCurrentPage(1);
    } catch (error) {
      console.error("Load properties error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [contract, account, refreshKey, role]);

  const handleSelect = (item) => {
    setSelectedLandId(item.landId);

    if (onSelectLandId) {
      onSelectLandId(item.landId);
    }
  };

  const title =
    role === "seller"
      ? "My Properties (Seller)"
      : "My Properties (Buyer)";

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.landId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tctNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.propertyType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  const summary = {
    total: items.length,
    owned: items.filter((item) => item.status === "Owned").length,
    forSale: items.filter((item) => item.status === "For Sale").length,
    pending: items.filter((item) => item.status === "Pending Approval").length,
    purchased: items.filter((item) => item.status === "Purchased").length
  };

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeClass = (status) => {
    if (status === "Owned") return "status-badge status-owned";
    if (status === "For Sale") return "status-badge status-sale";
    if (status === "Deposit Fund") return "status-badge status-deposit";
    if (status === "Pending Approval") return "status-badge status-pending";
    if (status === "Purchased") return "status-badge status-purchased";
    return "status-badge";
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="section-title">{title}</h2>
        <p className="section-note">Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">{title}</h2>
      <p className="section-note">
        Select a property to load it into the system.
      </p>

      <div className="summary-mini-cards">
        <div className="summary-mini-card">
          <span className="summary-mini-label">Total</span>
          <strong>{summary.total}</strong>
        </div>

        {role === "seller" && (
          <>
            <div className="summary-mini-card">
              <span className="summary-mini-label">Owned</span>
              <strong>{summary.owned}</strong>
            </div>
            <div className="summary-mini-card">
              <span className="summary-mini-label">For Sale</span>
              <strong>{summary.forSale}</strong>
            </div>
            <div className="summary-mini-card">
              <span className="summary-mini-label">Pending</span>
              <strong>{summary.pending}</strong>
            </div>
          </>
        )}

        {role === "buyer" && (
          <>
            <div className="summary-mini-card">
              <span className="summary-mini-label">Purchased</span>
              <strong>{summary.purchased}</strong>
            </div>
            <div className="summary-mini-card">
              <span className="summary-mini-label">Pending</span>
              <strong>{summary.pending}</strong>
            </div>
          </>
        )}
      </div>

      <div className="table-toolbar">
        <input
          type="text"
          placeholder="Search by Land ID, TCT, location, or type"
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
          <option value="Owned">Owned</option>
          <option value="For Sale">For Sale</option>
          <option value="Deposit Fund">Deposit Fund</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Purchased">Purchased</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <p className="section-note" style={{ marginTop: "14px" }}>
          No properties found.
        </p>
      ) : (
        <>
          <div className="table-wrap" style={{ marginTop: "14px" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Land ID</th>
                  <th>TCT Number</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
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
                    <td>{item.location}</td>
                    <td>{item.propertyType}</td>
                    <td>
                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
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