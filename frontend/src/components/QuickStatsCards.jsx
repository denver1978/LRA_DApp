import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SummaryCard from "./SummaryCard";

export default function QuickStatsCards({ contract, refreshKey, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [stats, setStats] = useState(null);

  const activeLandId = selectedLandId || landId;

  const loadStats = async () => {
    try {
      if (!contract) {
        toast.error("Connect wallet first");
        return;
      }

      if (!activeLandId) {
        toast.error("Enter Land ID");
        return;
      }

      const land = await contract.lands(BigInt(activeLandId));
      const sale = await contract.sales(BigInt(activeLandId));

      const approvalsCompleted =
        (sale.surveyOK ? 1 : 0) +
        (sale.birOK ? 1 : 0) +
        (sale.treasuryOK ? 1 : 0) +
        (sale.assessorOK ? 1 : 0);

      setStats({
        landExists: land.exists ? "Yes" : "No",
        landLocked: land.locked ? "Yes" : "No",
        saleActive: sale.active ? "Yes" : "No",
        buyerFunded: sale.buyerFunded ? "Yes" : "No",
        approvalsCompleted: `${approvalsCompleted}/4`
      });
    } catch (error) {
      console.error("Quick stats error:", error);
      toast.error(error.reason || error.message || "Failed to load stats");
    }
  };

  useEffect(() => {
    if (activeLandId) {
      loadStats();
    } else {
      setStats(null);
    }
  }, [refreshKey, selectedLandId]);

  return (
    <div className="card">
      <h2>Land / Sale Quick Stats</h2>

      {!selectedLandId && (
        <>
          <input
            type="number"
            placeholder="Land ID"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
          <button onClick={loadStats}>Load Quick Stats</button>
        </>
      )}

      {selectedLandId && (
        <p><strong>Using Shared Land ID:</strong> {selectedLandId}</p>
      )}

      {stats && (
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginTop: "20px"
          }}
        >
          <SummaryCard title="Land Exists" value={stats.landExists} />
          <SummaryCard title="Land Locked" value={stats.landLocked} />
          <SummaryCard title="Sale Active" value={stats.saleActive} />
          <SummaryCard title="Buyer Funded" value={stats.buyerFunded} />
          <SummaryCard title="Approvals Done" value={stats.approvalsCompleted} />
        </div>
      )}
    </div>
  );
}