import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CopyButton from "./CopyButton";
import ExplorerLink from "./ExplorerLink";

export default function ViewSale({ contract, refreshKey, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [sale, setSale] = useState(null);

  const activeLandId = selectedLandId || landId;

  const loadSale = async () => {
    try {
      if (!contract || !activeLandId) return;

      const data = await contract.sales(BigInt(activeLandId));

      setSale({
        landId: data.landId.toString(),
        seller: data.seller,
        buyer: data.buyer,
        priceWei: data.priceWei.toString(),
        deedCID: data.deedCID,
        surveyOK: data.surveyOK,
        birOK: data.birOK,
        treasuryOK: data.treasuryOK,
        assessorOK: data.assessorOK,
        buyerFunded: data.buyerFunded,
        active: data.active
      });
    } catch (error) {
      console.error("Load sale error:", error);
      toast.error(error.reason || error.message || "Failed to load sale");
    }
  };

  useEffect(() => {
    if (activeLandId) {
      loadSale();
    } else {
      setSale(null);
    }
  }, [refreshKey, selectedLandId]);

  return (
    <div className="card">
      <h2>View Sale</h2>

      {!selectedLandId && (
        <>
          <input
            type="number"
            placeholder="Land ID"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
          />
          <button onClick={loadSale}>Load Sale</button>
        </>
      )}

      {selectedLandId && (
        <p><strong>Using Shared Land ID:</strong> {selectedLandId}</p>
      )}

      {sale && (
        <div style={{ marginTop: "16px" }}>
          <p><strong>Land ID:</strong> {sale.landId}</p>

          <p>
            <strong>Seller:</strong> {sale.seller}
            <CopyButton text={sale.seller} />
            <ExplorerLink type="address" value={sale.seller} />
          </p>

          <p>
            <strong>Buyer:</strong> {sale.buyer}
            <CopyButton text={sale.buyer} />
            <ExplorerLink type="address" value={sale.buyer} />
          </p>

          <p><strong>Price (Wei):</strong> {sale.priceWei}</p>

          <p>
            <strong>Deed CID:</strong> {sale.deedCID}
            <CopyButton text={sale.deedCID} />
            <ExplorerLink type="ipfs" value={sale.deedCID} />
          </p>

          <p><strong>Survey Approved:</strong> {sale.surveyOK ? "Yes" : "No"}</p>
          <p><strong>BIR Approved:</strong> {sale.birOK ? "Yes" : "No"}</p>
          <p><strong>Treasury Approved:</strong> {sale.treasuryOK ? "Yes" : "No"}</p>
          <p><strong>Assessor Approved:</strong> {sale.assessorOK ? "Yes" : "No"}</p>
          <p><strong>Buyer Funded:</strong> {sale.buyerFunded ? "Yes" : "No"}</p>
          <p><strong>Sale Active:</strong> {sale.active ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}