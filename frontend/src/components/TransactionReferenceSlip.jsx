import { useState } from "react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import CopyButton from "./CopyButton";
import ExplorerLink from "./ExplorerLink";

export default function TransactionReferenceSlip({ contract, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState(null);

  const activeLandId = selectedLandId || landId;

  const loadMetadataFromIPFS = async (cid) => {
    try {
      if (!cid) return null;

      const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      if (!res.ok) return null;

      return await res.json();
    } catch (error) {
      console.error("Metadata fetch error:", error);
      return null;
    }
  };

  const getPreviewImage = (metadata) => {
    if (!metadata || !metadata.files || !Array.isArray(metadata.files)) return "";

    const imageFile = metadata.files.find((file) => {
      const type = (file.type || "").toLowerCase();
      const name = (file.name || "").toLowerCase();

      return (
        type.includes("image") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp")
      );
    });

    return imageFile ? `https://gateway.pinata.cloud/ipfs/${imageFile.cid}` : "";
  };

  const loadReference = async () => {
    try {
      if (!contract) {
        toast.error("Connect wallet first");
        return;
      }

      if (!activeLandId) {
        toast.error("Select a Land ID first");
        return;
      }

      setLoading(true);

      const land = await contract.lands(BigInt(activeLandId));
      const sale = await contract.sales(BigInt(activeLandId));
      const escrow = await contract.escrow(BigInt(activeLandId));

      const approvalsCompleted =
        (sale.surveyOK ? 1 : 0) +
        (sale.birOK ? 1 : 0) +
        (sale.treasuryOK ? 1 : 0) +
        (sale.assessorOK ? 1 : 0);

      let currentStage = "Registered";

      if (sale.active && !sale.buyerFunded) currentStage = "Sale Requested";
      if (sale.active && sale.buyerFunded) currentStage = "Buyer Funded";
      if (sale.surveyOK) currentStage = "Survey Approved";
      if (sale.birOK) currentStage = "BIR Approved";
      if (sale.treasuryOK) currentStage = "Treasury Approved";
      if (sale.assessorOK) currentStage = "Assessor Approved";
      if (!sale.active && sale.buyer !== "0x0000000000000000000000000000000000000000") {
        currentStage = "Completed / Cancelled";
      }

      const metadata = await loadMetadataFromIPFS(land.metadataCID);
      const previewImage = getPreviewImage(metadata);

      const metadataUrl = land.metadataCID
        ? `https://gateway.pinata.cloud/ipfs/${land.metadataCID}`
        : "";

      setReference({
        landId: land.landId.toString(),
        tctNumber: land.tctNumber,
        location: land.location,
        propertyType: land.propertyType,
        metadataCID: land.metadataCID,
        metadataUrl,
        owner: land.owner,
        locked: land.locked,
        exists: land.exists,

        seller: sale.seller,
        buyer: sale.buyer,
        priceWei: sale.priceWei.toString(),
        deedCID: sale.deedCID,
        surveyOK: sale.surveyOK,
        birOK: sale.birOK,
        treasuryOK: sale.treasuryOK,
        assessorOK: sale.assessorOK,
        buyerFunded: sale.buyerFunded,
        active: sale.active,

        escrow: escrow.toString(),
        approvalsCompleted: `${approvalsCompleted}/4`,
        currentStage,
        generatedAt: new Date().toLocaleString(),
        previewImage
      });
    } catch (error) {
      console.error("Reference slip error:", error);
      toast.error(error.reason || error.message || "Failed to load reference slip");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!reference) {
      toast.error("Load the reference slip first");
      return;
    }
    window.print();
  };

  return (
    <div className="card print-card">
      <h2 className="section-title">Transaction Reference Slip</h2>
      <p className="section-note">
        Printable reference sheet for manual follow-up and transaction verification.
      </p>

      {!selectedLandId && (
        <div className="form-row">
          <label className="form-label">Land ID</label>
          <input
            type="number"
            placeholder="Enter Land ID"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
        </div>
      )}

      {selectedLandId && (
        <div className="panel-subtle">
          <strong>Using Shared Land ID:</strong> {selectedLandId}
        </div>
      )}

      <div className="card-actions">
        <button onClick={loadReference} disabled={loading}>
          {loading ? "Loading..." : "Load Reference Slip"}
        </button>

        <button onClick={handlePrint} className="secondary-btn">
          Print / Save PDF
        </button>
      </div>

      {reference && (
        <div className="reference-slip" style={{ marginTop: "20px" }}>

          {/* HEADER */}
          <div className="reference-slip-header">
            <div>
              <h3>Baguio Land Registry Transaction Reference</h3>
              <p><strong>Date Generated:</strong> {reference.generatedAt}</p>
            </div>

            {/* ✅ FIXED QR CODE (ALWAYS SHOWS) */}
            <div className="reference-qr-wrap">
              <QRCodeCanvas
                value={
                  reference.metadataUrl ||
                  JSON.stringify({
                    landId: reference.landId,
                    metadataCID: reference.metadataCID,
                    owner: reference.owner,
                    buyer: reference.buyer,
                    generatedAt: reference.generatedAt
                  })
                }
                size={110}
                level="M"
                includeMargin={true}
              />
              <p className="reference-qr-caption">
                {reference.metadataUrl
                  ? "Scan for Metadata CID"
                  : "Scan for Transaction Reference"}
              </p>
            </div>
          </div>

          {/* IMAGE */}
          {reference.previewImage && (
            <div className="reference-image-wrap">
              <img
                src={reference.previewImage}
                alt="Property Preview"
                className="reference-image"
              />
              <p className="reference-image-caption">Property Preview Image</p>
            </div>
          )}

          {/* DETAILS */}
          <div className="reference-grid">
            <div>
              <h4>Property Details</h4>
              <p><strong>Land ID:</strong> {reference.landId}</p>
              <p><strong>TCT Number:</strong> {reference.tctNumber}</p>
              <p><strong>Location:</strong> {reference.location}</p>
              <p><strong>Property Type:</strong> {reference.propertyType}</p>
              <p><strong>Exists:</strong> {reference.exists ? "Yes" : "No"}</p>
              <p><strong>Locked:</strong> {reference.locked ? "Yes" : "No"}</p>
            </div>

            <div>
              <h4>Ownership / Sale</h4>
              <p><strong>Owner:</strong> {reference.owner}</p>
              <p><strong>Seller:</strong> {reference.seller}</p>
              <p><strong>Buyer:</strong> {reference.buyer}</p>
              <p><strong>Price (Wei):</strong> {reference.priceWei}</p>
              <p><strong>Escrow (Wei):</strong> {reference.escrow}</p>
              <p><strong>Current Stage:</strong> {reference.currentStage}</p>
            </div>
          </div>

          <div className="reference-grid">
            <div>
              <h4>Approval Status</h4>
              <p><strong>Buyer Funded:</strong> {reference.buyerFunded ? "Yes" : "No"}</p>
              <p><strong>Survey:</strong> {reference.surveyOK ? "Approved" : "Pending"}</p>
              <p><strong>BIR:</strong> {reference.birOK ? "Approved" : "Pending"}</p>
              <p><strong>Treasury:</strong> {reference.treasuryOK ? "Approved" : "Pending"}</p>
              <p><strong>Assessor:</strong> {reference.assessorOK ? "Approved" : "Pending"}</p>
              <p><strong>Approvals Completed:</strong> {reference.approvalsCompleted}</p>
            </div>

            <div>
              <h4>Blockchain / IPFS Reference</h4>
              <p>
                <strong>Metadata CID:</strong> {reference.metadataCID}
                <CopyButton text={reference.metadataCID} />
                <ExplorerLink type="ipfs" value={reference.metadataCID} />
              </p>
              <p>
                <strong>Deed CID:</strong> {reference.deedCID}
                {reference.deedCID && <CopyButton text={reference.deedCID} />}
                {reference.deedCID && <ExplorerLink type="ipfs" value={reference.deedCID} />}
              </p>
              <p>
                <strong>Owner Address:</strong> {reference.owner}
                <CopyButton text={reference.owner} />
                <ExplorerLink type="address" value={reference.owner} />
              </p>
              <p>
                <strong>Buyer Address:</strong> {reference.buyer}
                {reference.buyer && reference.buyer !== "0x0000000000000000000000000000000000000000" && (
                  <>
                    <CopyButton text={reference.buyer} />
                    <ExplorerLink type="address" value={reference.buyer} />
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="panel-subtle" style={{ marginTop: "18px" }}>
            <strong>Manual Follow-up Note:</strong> Present this reference slip together with the Land ID,
            blockchain activity log, and uploaded document CIDs when following up with agencies.
          </div>
        </div>
      )}
    </div>
  );
}