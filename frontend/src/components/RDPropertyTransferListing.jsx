{/*

import { useEffect, useMemo, useRef, useState } from "react";

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

  const [coordinateCache, setCoordinateCache] = useState({});
  const [loadingMapLandId, setLoadingMapLandId] = useState("");

  const itemsPerPage = 5;
  const loadingRef = useRef(false);

  const loadTransferListing = async () => {
    if (!contract || loadingRef.current) return;

    try {
      loadingRef.current = true;
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
            metadataCID: land.metadataCID || "",
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
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (contract) {
      loadTransferListing();
    }
  }, [contract, refreshKey, maxLandId]);

  // ✅ Real-time refresh on every mined block
  useEffect(() => {
    const provider = contract?.runner?.provider;
    if (!provider || typeof provider.on !== "function") return;

    let timeoutId = null;

    const handleBlock = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        loadTransferListing();
      }, 300);
    };

    provider.on("block", handleBlock);

    return () => {
      clearTimeout(timeoutId);
      if (typeof provider.off === "function") {
        provider.off("block", handleBlock);
      }
    };
  }, [contract, maxLandId]);

  const handleSelect = (item) => {
    setSelectedLandId(item.landId);
    if (onSelectLandId) {
      onSelectLandId(item.landId);
    }
  };

  const handleViewMap = async (item) => {
    try {
      if (!item.metadataCID) {
        alert("No metadata CID found for this land.");
        return;
      }

      const cached = coordinateCache[item.landId];
      if (cached?.latitude && cached?.longitude) {
        window.open(
          `https://www.google.com/maps?q=${cached.latitude},${cached.longitude}`,
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      setLoadingMapLandId(item.landId);

      const res = await fetch(`https://gateway.pinata.cloud/ipfs/${item.metadataCID}`);
      if (!res.ok) {
        throw new Error("Failed to fetch metadata from IPFS.");
      }

      const data = await res.json();
      const latitude = data?.coordinates?.latitude || "";
      const longitude = data?.coordinates?.longitude || "";

      if (!latitude || !longitude) {
        alert("No coordinates available in this property metadata.");
        return;
      }

      setCoordinateCache((prev) => ({
        ...prev,
        [item.landId]: { latitude, longitude }
      }));

      window.open(
        `https://www.google.com/maps?q=${latitude},${longitude}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error("Map load error:", error);
      alert(error?.message || "Failed to load map coordinates.");
    } finally {
      setLoadingMapLandId("");
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
                      <button
                        type="button"
                        className="table-link-btn"
                        onClick={() => handleViewMap(item)}
                        disabled={loadingMapLandId === item.landId}
                      >
                        {loadingMapLandId === item.landId ? "Loading..." : "📍 View"}
                      </button>
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

*/}

//------ with refresh button and auto timer

import { useEffect, useMemo, useRef, useState } from "react";

export default function RDPropertyTransferListing({
  contract,
  refreshKey,
  onSelectLandId,
  maxLandId = 50
}) {
  const REFRESH_INTERVAL = 300; // 5 minutes

  const [items, setItems] = useState([]);
  const [selectedLandId, setSelectedLandId] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [coordinateCache, setCoordinateCache] = useState({});
  const [loadingMapLandId, setLoadingMapLandId] = useState("");

  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const itemsPerPage = 5;
  const loadingRef = useRef(false);

  const loadTransferListing = async () => {
    if (!contract || loadingRef.current) return;

    try {
      loadingRef.current = true;
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
            metadataCID: land.metadataCID || "",
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
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (contract) {
      loadTransferListing();
    }
  }, [contract, refreshKey, maxLandId]);

  // ✅ 5-minute auto refresh timer
  useEffect(() => {
    if (!contract || !autoRefresh) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadTransferListing();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [contract, autoRefresh, maxLandId]);

  // ✅ Reset countdown when toggling auto refresh
  useEffect(() => {
    if (autoRefresh) {
      setCountdown(REFRESH_INTERVAL);
    }
  }, [autoRefresh]);

  const handleManualRefresh = async () => {
    await loadTransferListing();
    setCountdown(REFRESH_INTERVAL);
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh((prev) => !prev);
  };

  const handleSelect = (item) => {
    setSelectedLandId(item.landId);
    if (onSelectLandId) {
      onSelectLandId(item.landId);
    }
  };

  const handleViewMap = async (item) => {
    try {
      if (!item.metadataCID) {
        alert("No metadata CID found for this land.");
        return;
      }

      const cached = coordinateCache[item.landId];
      if (cached?.latitude && cached?.longitude) {
        window.open(
          `https://www.google.com/maps?q=${cached.latitude},${cached.longitude}`,
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      setLoadingMapLandId(item.landId);

      const res = await fetch(`https://gateway.pinata.cloud/ipfs/${item.metadataCID}`);
      if (!res.ok) {
        throw new Error("Failed to fetch metadata from IPFS.");
      }

      const data = await res.json();
      const latitude = data?.coordinates?.latitude || "";
      const longitude = data?.coordinates?.longitude || "";

      if (!latitude || !longitude) {
        alert("No coordinates available in this property metadata.");
        return;
      }

      setCoordinateCache((prev) => ({
        ...prev,
        [item.landId]: { latitude, longitude }
      }));

      window.open(
        `https://www.google.com/maps?q=${latitude},${longitude}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error("Map load error:", error);
      alert(error?.message || "Failed to load map coordinates.");
    } finally {
      setLoadingMapLandId("");
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

      {/* ✅ Refresh Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "12px",
          marginBottom: "12px"
        }}
      >
        <div style={{ fontSize: "14px", color: "#555" }}>
          {autoRefresh ? (
            <>
              Auto refresh in:{" "}
              <strong>
                {Math.floor(countdown / 60)}m {countdown % 60}s
              </strong>
            </>
          ) : (
            <strong>Auto refresh is OFF</strong>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={handleToggleAutoRefresh}
            />
            Live / Auto Refresh
          </label>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="secondary-btn"
          >
            🔄 Refresh Now
          </button>
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
                      <button
                        type="button"
                        className="table-link-btn"
                        onClick={() => handleViewMap(item)}
                        disabled={loadingMapLandId === item.landId}
                      >
                        {loadingMapLandId === item.landId ? "Loading..." : "📍 View"}
                      </button>
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