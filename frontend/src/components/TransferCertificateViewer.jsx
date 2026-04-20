import { useEffect, useState } from "react";
import TemporaryTransferCertificate from "./TemporaryTransferCertificate";

export default function TransferCertificateViewer({
  contract,
  account,
  selectedLandId,
  refreshKey
}) {
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Select a Land ID first.");

  useEffect(() => {
    const loadCertificate = async () => {
      if (!selectedLandId) {
        setCertificateData(null);
        setMessage("Select a Land ID first.");
        return;
      }

      try {
        setLoading(true);
        setCertificateData(null);
        setMessage("");

        // 1. Try saved certificate first
        const saved = JSON.parse(
          localStorage.getItem("temporaryTransferCertificates") || "[]"
        );
        const savedMatch = saved.find(
          (item) => String(item.landId) === String(selectedLandId)
        );

        if (savedMatch) {
          setCertificateData(savedMatch);
          setMessage("");
          return;
        }

        // 2. If no saved certificate, try generating from blockchain
        if (!contract || !account) {
          setMessage("Connect wallet first.");
          return;
        }

        const land = await contract.lands(BigInt(selectedLandId));
        if (!land || !land.exists) {
          setMessage("Land record not found.");
          return;
        }

        const currentOwner = land.owner?.toLowerCase?.() || "";
        const connectedWallet = account.toLowerCase();

        // buyer should now be the current owner for a purchased property
        if (currentOwner !== connectedWallet) {
          setMessage("No purchased transfer certificate available for this property.");
          return;
        }

        let sale = null;
        try {
          sale = await contract.sales(BigInt(selectedLandId));
        } catch {
          sale = null;
        }

        const approvalDate = new Date().toLocaleString();
        const referenceNo = `TLTC-${selectedLandId}`;

        const generatedCertificate = {
          referenceNo,
          approvalDate,
          landId: String(selectedLandId),
          tctNumber: land.tctNumber || "N/A",
          location: land.location || "N/A",
          propertyType: land.propertyType || "N/A",
          previousOwner: sale?.seller || "N/A",
          newOwner: land.owner || "N/A",
          status: "Ownership Successfully Transferred"
        };

        setCertificateData(generatedCertificate);
        setMessage("");
      } catch (error) {
        console.error("TransferCertificateViewer error:", error);
        setMessage("Failed to load temporary transfer certificate.");
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [contract, account, selectedLandId, refreshKey]);

  return (
    <div className="card">
      <h2 className="section-title">Temporary Transfer Certificate</h2>
      <p className="section-note">
        View and print the temporary transfer certificate for purchased properties.
      </p>

      {loading && (
        <p className="section-note" style={{ marginTop: "12px" }}>
          Loading certificate...
        </p>
      )}

      {!loading && message && (
        <p className="section-note" style={{ marginTop: "12px" }}>
          {message}
        </p>
      )}

      {certificateData && (
        <TemporaryTransferCertificate certificateData={certificateData} />
      )}
    </div>
  );
}