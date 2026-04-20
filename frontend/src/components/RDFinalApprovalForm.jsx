import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TemporaryTransferCertificate from "./TemporaryTransferCertificate";

export default function RDFinalApprovalForm({
  contract,
  latestCID,
  triggerRefresh,
  selectedLandId = ""
}) {
  const [landId, setLandId] = useState("");
  const [newMetadataCID, setNewMetadataCID] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connect RD wallet to finalize transfer.");
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  const activeLandId = selectedLandId || landId;

  useEffect(() => {
    if (latestCID) {
      setNewMetadataCID(latestCID);
    }
  }, [latestCID]);

  useEffect(() => {
    if (!activeLandId) {
      setCertificateData(null);
      return;
    }

    const saved = JSON.parse(localStorage.getItem("temporaryTransferCertificates") || "[]");
    const match = saved.find((item) => String(item.landId) === String(activeLandId));
    setCertificateData(match || null);
  }, [activeLandId]);

  const validateRD = async () => {
    try {
      if (!contract) {
        setCanSubmit(false);
        setStatusMessage("Connect wallet first.");
        return;
      }

      const connected = await contract.runner.getAddress();
      const rd = await contract.rd();

      if (connected.toLowerCase() === rd.toLowerCase()) {
        setCanSubmit(true);
        setStatusMessage("Correct wallet: Registry of Deeds connected.");
      } else {
        setCanSubmit(false);
        setStatusMessage("Wrong wallet: connected account is not Registry of Deeds.");
      }
    } catch (error) {
      console.error("RD validation error:", error);
      setCanSubmit(false);
      setStatusMessage("Failed to validate RD wallet.");
    }
  };

  useEffect(() => {
    validateRD();
  }, [contract]);

  const saveCertificateToLocalStorage = (certificate) => {
    const existing = JSON.parse(localStorage.getItem("temporaryTransferCertificates") || "[]");
    const filtered = existing.filter(
      (item) => String(item.landId) !== String(certificate.landId)
    );
    const updated = [certificate, ...filtered];
    localStorage.setItem("temporaryTransferCertificates", JSON.stringify(updated));
  };

  const handleApprove = async () => {
    try {
      if (!contract) {
        toast.error("Please connect wallet first.");
        return;
      }

      if (!activeLandId) {
        toast.error("Select a Land ID first");
        return;
      }

      if (!canSubmit) {
        toast.error("Wrong wallet connected.");
        return;
      }

      setLoading(true);

      const landBefore = await contract.lands(BigInt(activeLandId));
      const saleBefore = await contract.sales(BigInt(activeLandId));

      const previousOwner = landBefore.owner || "N/A";
      const buyer = saleBefore.buyer || "N/A";
      const tctNumber = landBefore.tctNumber || "N/A";
      const location = landBefore.location || "N/A";
      const propertyType = landBefore.propertyType || "N/A";

      const tx = await contract.rdApproveTransfer(
        BigInt(activeLandId),
        newMetadataCID
      );

      await tx.wait();

      const now = new Date();
      const referenceNo = `TLTC-${activeLandId}-${now.getTime()}`;

      const generatedCertificate = {
        referenceNo,
        approvalDate: now.toLocaleString(),
        landId: String(activeLandId),
        tctNumber,
        location,
        propertyType,
        previousOwner,
        newOwner: buyer,
        status: "Ownership Successfully Transferred"
      };

      setCertificateData(generatedCertificate);
      saveCertificateToLocalStorage(generatedCertificate);

      toast.success("RD final approval successful. Ownership transferred.");
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error("RD final approval error:", error);
      toast.error(
        error?.reason ||
          error?.shortMessage ||
          error?.message ||
          error?.info?.error?.message ||
          "Transaction failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card">
        <h2 className="section-title">RD Final Approval</h2>
        <p className="section-note">Finalize the transfer after all required approvals are complete.</p>

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Land ID</label>
            {selectedLandId ? (
              <input type="text" value={selectedLandId} readOnly className="readonly-input" />
            ) : (
              <input
                type="number"
                placeholder="Land ID"
                value={landId}
                onChange={(e) => setLandId(e.target.value)}
              />
            )}
          </div>

          <p className={canSubmit ? "status-text-success" : "status-text-error"}>
            {statusMessage}
          </p>

          <div className="form-row">
            <label className="form-label">New Metadata CID</label>
            <input
              type="text"
              placeholder="New Metadata CID"
              value={newMetadataCID}
              onChange={(e) => setNewMetadataCID(e.target.value)}
            />
            {latestCID && <p className="form-help">Auto-filled from latest uploaded metadata.</p>}
          </div>
        </div>

        <div className="card-actions">
          <button onClick={handleApprove} disabled={!canSubmit || loading}>
            {loading ? "Finalizing..." : "Finalize Transfer"}
          </button>
        </div>
      </div>

      <TemporaryTransferCertificate certificateData={certificateData} />
    </>
  );
}