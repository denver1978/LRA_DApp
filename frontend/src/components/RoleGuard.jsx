import { useEffect, useState } from "react";

export default function RoleGuard({ contract, account, expectedRole }) {
  const [detectedRole, setDetectedRole] = useState("Unknown");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectRole = async () => {
      try {
        if (!contract || !account) {
          setDetectedRole("Not Connected");
          setLoading(false);
          return;
        }

        const owner = await contract.owner();
        const surveyor = await contract.surveyor();
        const bir = await contract.bir();
        const cityTreasury = await contract.cityTreasury();
        const assessor = await contract.assessor();
        const rd = await contract.rd();

        const wallet = account.toLowerCase();
        let role = "Unassigned";

        if (wallet === owner.toLowerCase()) role = "Owner / Admin";
        else if (wallet === surveyor.toLowerCase()) role = "Surveyor";
        else if (wallet === bir.toLowerCase()) role = "BIR";
        else if (wallet === cityTreasury.toLowerCase()) role = "City Treasury";
        else if (wallet === assessor.toLowerCase()) role = "Assessor";
        else if (wallet === rd.toLowerCase()) role = "Registry of Deeds";

        setDetectedRole(role);
      } catch (error) {
        console.error("Role guard error:", error);
        setDetectedRole("Unknown");
      } finally {
        setLoading(false);
      }
    };

    detectRole();
  }, [contract, account]);

  if (loading) return null;

  if (!account) {
    return (
      <div
        className="card"
        style={{
          border: "1px solid #fcd34d",
          background: "#fff7ed"
        }}
      >
        <h2 className="section-title" style={{ color: "#92400e" }}>
          Wallet Required
        </h2>
        <p>Please connect MetaMask to continue.</p>
      </div>
    );
  }

  if (detectedRole !== expectedRole && detectedRole !== "Owner / Admin") {
    return (
      <div
        className="card"
        style={{
          border: "1px solid #fca5a5",
          background: "#fef2f2"
        }}
      >
        <h2 className="section-title" style={{ color: "#b91c1c" }}>
          Wrong Wallet Connected
        </h2>
        <p><strong>Expected Role:</strong> {expectedRole}</p>
        <p><strong>Detected Role:</strong> {detectedRole}</p>
        <p>Please switch MetaMask account to use this page correctly.</p>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        border: "1px solid #86efac",
        background: "#f0fdf4"
      }}
    >
      <h2 className="section-title" style={{ color: "#166534" }}>
        Correct Wallet Connected
      </h2>
      <p><strong>Expected Role:</strong> {expectedRole}</p>
      <p><strong>Detected Role:</strong> {detectedRole}</p>
    </div>
  );
}