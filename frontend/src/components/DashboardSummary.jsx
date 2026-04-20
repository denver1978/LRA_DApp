import { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";

export default function DashboardSummary({ contract, account, latestCID }) {
  const [role, setRole] = useState("Unknown");
  const [authoritiesLoaded, setAuthoritiesLoaded] = useState(false);

  useEffect(() => {
    const loadRole = async () => {
      try {
        if (!contract || !account) return;

        const owner = await contract.owner();
        const surveyor = await contract.surveyor();
        const bir = await contract.bir();
        const cityTreasury = await contract.cityTreasury();
        const assessor = await contract.assessor();
        const rd = await contract.rd();

        const wallet = account.toLowerCase();

        let detected = "Unassigned";

        if (wallet === owner.toLowerCase()) detected = "Owner / Admin";
        else if (wallet === surveyor.toLowerCase()) detected = "Surveyor";
        else if (wallet === bir.toLowerCase()) detected = "BIR";
        else if (wallet === cityTreasury.toLowerCase()) detected = "City Treasury";
        else if (wallet === assessor.toLowerCase()) detected = "Assessor";
        else if (wallet === rd.toLowerCase()) detected = "Registry of Deeds";

        setRole(detected);
        setAuthoritiesLoaded(true);
      } catch (error) {
        console.error("Dashboard summary error:", error);
      }
    };

    loadRole();
  }, [contract, account]);

  return (
    <div
      className="summary-card-row"
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        marginTop: "0",
        marginBottom: "0"
      }}
    >
      <SummaryCard
        title="Connected Role"
        value={role}
        subtitle={account ? "Wallet connected" : "No wallet connected"}
      />

      <SummaryCard
        title="Authorities"
        value={authoritiesLoaded ? "Loaded" : "Not Loaded"}
        subtitle="Role registry from contract"
      />

      <SummaryCard
        title="Latest CID"
        value={latestCID ? "Available" : "None"}
        subtitle={latestCID ? `${latestCID.slice(0, 20)}...` : "No CID generated yet"}
      />
    </div>
  );
}