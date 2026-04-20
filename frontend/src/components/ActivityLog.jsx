import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CopyButton from "./CopyButton";
import ExplorerLink from "./ExplorerLink";

export default function ActivityLog({ contract, refreshKey, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeLandId = selectedLandId || landId;

  const loadActivityLog = async () => {
    try {
      if (!contract) {
        toast.error("Connect wallet first");
        return;
      }

      if (!activeLandId) {
        toast.error("Enter Land ID");
        return;
      }

      setLoading(true);

      const id = BigInt(activeLandId);

      const eventConfigs = [
        { getFilter: () => contract.filters.LandRegistered(id), label: "Land Registered" },
        { getFilter: () => contract.filters.SaleRequested(id), label: "Sale Requested" },
        { getFilter: () => contract.filters.BuyerFunded(id), label: "Buyer Funded" },
        { getFilter: () => contract.filters.SurveySet(id), label: "Survey Approved" },
        { getFilter: () => contract.filters.BIRSet(id), label: "BIR Approved" },
        { getFilter: () => contract.filters.TreasurySet(id), label: "Treasury Approved" },
        { getFilter: () => contract.filters.AssessorSet(id), label: "Assessor Approved" },
        { getFilter: () => contract.filters.OwnershipTransferred(id), label: "Ownership Transferred" },
        { getFilter: () => contract.filters.SaleCancelled(id), label: "Sale Cancelled" },
        { getFilter: () => contract.filters.OwnerMarkedDeceased(id), label: "Owner Marked Deceased" },
        { getFilter: () => contract.filters.SuccessionResolved(id), label: "Succession Resolved" }
      ];

      let allEvents = [];

      for (const config of eventConfigs) {
        const filter = config.getFilter();
        const events = await contract.queryFilter(filter, 0, "latest");

        const mapped = events.map((event) => ({
          type: config.label,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber
        }));

        allEvents = [...allEvents, ...mapped];
      }

      allEvents.sort((a, b) => a.blockNumber - b.blockNumber);
      setActivities(allEvents);
    } catch (error) {
      console.error("Activity log error:", error);
      toast.error(error.reason || error.message || "Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeLandId) {
      loadActivityLog();
    } else {
      setActivities([]);
    }
  }, [refreshKey, selectedLandId]);

  return (
    <div className="card">
      <h2 className="section-title">Blockchain Activity Log</h2>
      <p className="section-note">View the on-chain event history for the selected land record.</p>

      {!selectedLandId && (
        <>
          <div className="form-row">
            <label className="form-label">Land ID</label>
            <input
              type="number"
              placeholder="Enter Land ID"
              value={landId}
              onChange={(e) => setLandId(e.target.value)}
            />
          </div>

          <div className="card-actions">
            <button onClick={loadActivityLog}>
              {loading ? "Loading..." : "Load Activity Log"}
            </button>
          </div>
        </>
      )}

      {selectedLandId && (
        <div className="panel-subtle">
          <strong>Using Shared Land ID:</strong> {selectedLandId}
        </div>
      )}

      {activities.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          {activities.map((activity, index) => (
            <div
              key={index}
              style={{
                padding: "14px",
                border: "1px solid #dbe4ee",
                borderRadius: "12px",
                marginBottom: "10px",
                background: "#f8fafc"
              }}
            >
              <p><strong>Event:</strong> {activity.type}</p>
              <p><strong>Block:</strong> {activity.blockNumber}</p>
              <p>
                <strong>Tx Hash:</strong> {activity.txHash}
                <CopyButton text={activity.txHash} />
                <ExplorerLink type="tx" value={activity.txHash} />
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && activities.length === 0 && activeLandId && (
        <p style={{ marginTop: "15px" }}>No activities found for this Land ID yet.</p>
      )}
    </div>
  );
}