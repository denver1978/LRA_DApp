import { useEffect, useState } from "react";
import { ethers } from "ethers";
import EthPhpConverter from "./EthPhpConverter";

export default function RequestSellForm({
  contract,
  triggerRefresh,
  selectedLandId,
  latestCID
}) {
  const [landId, setLandId] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [pricePhp, setPricePhp] = useState("");

  const [resolvedCID, setResolvedCID] = useState("");
  const [loadingCID, setLoadingCID] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (selectedLandId) {
      setLandId(String(selectedLandId));
    }
  }, [selectedLandId]);

  // ✅ Resolve CID automatically from latest upload OR existing registered land
  useEffect(() => {
    const loadCID = async () => {
      try {
        setResolvedCID("");
        setStatus("");

        // 1. Prefer latest uploaded CID if available
        if (latestCID && String(latestCID).trim()) {
          setResolvedCID(String(latestCID).trim());
          return;
        }

        // 2. Otherwise, load existing land metadataCID from blockchain
        if (!contract || !selectedLandId) return;

        setLoadingCID(true);

        const land = await contract.lands(BigInt(selectedLandId));

        if (land && land.exists && land.metadataCID) {
          setResolvedCID(String(land.metadataCID).trim());
        }
      } catch (error) {
        console.error("Resolve CID error:", error);
      } finally {
        setLoadingCID(false);
      }
    };

    loadCID();
  }, [contract, selectedLandId, latestCID]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setStatus("");

      if (!contract) {
        setStatus("Contract not loaded.");
        return;
      }

      if (!landId) {
        setStatus("Please enter or select a Land ID.");
        return;
      }

      if (!buyerAddress || !ethers.isAddress(buyerAddress)) {
        setStatus("Please enter a valid buyer wallet address.");
        return;
      }

      if (!priceEth || Number(priceEth) <= 0) {
        setStatus("Please enter a valid sale price.");
        return;
      }

      if (!resolvedCID || !String(resolvedCID).trim()) {
        setStatus("No metadata CID found for this land. Upload documents only if this land has no existing metadata.");
        return;
      }

      setSubmitting(true);

      const priceWei = ethers.parseEther(priceEth);

      const tx = await contract.requestSell(
        BigInt(landId),
        buyerAddress.trim(),
        priceWei,
        String(resolvedCID).trim()
      );

      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setStatus("Sale request created successfully.");

      setBuyerAddress("");
      setPriceEth("");
      setPricePhp("");

      if (triggerRefresh) {
        triggerRefresh();
      }
    } catch (error) {
      console.error("requestSell error:", error);
      setStatus(
        error?.reason ||
          error?.data?.message ||
          error?.message ||
          "Failed to request sale."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Request Property Sale</h2>
      <p className="section-note">
        Create a sale request by selecting a land record, entering the buyer wallet,
        setting the sale price, and using the existing land metadata CID automatically.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "14px" }}>
          <label>Land ID</label>
          <input
            type="number"
            min="1"
            value={landId}
            onChange={(e) => setLandId(e.target.value)}
            placeholder="Enter Land ID"
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label>Buyer Wallet Address</label>
          <input
            type="text"
            value={buyerAddress}
            onChange={(e) => setBuyerAddress(e.target.value)}
            placeholder="Enter buyer wallet address"
          />
        </div>

        <EthPhpConverter
          ethValue={priceEth}
          setEthValue={setPriceEth}
          phpValue={pricePhp}
          setPhpValue={setPricePhp}
          label="Sale Price"
        />

        <div className="panel-subtle" style={{ marginTop: "14px", marginBottom: "14px" }}>
          <p>
            <strong>Resolved Metadata CID:</strong>{" "}
            {loadingCID ? "Loading..." : resolvedCID || "No CID found yet"}
          </p>
          <p className="section-note">
            The form first uses the latest uploaded CID. If none is available, it loads the existing land metadata CID from the blockchain.
          </p>
        </div>

        <div className="card-actions">
          <button type="submit" disabled={submitting || loadingCID}>
            {submitting ? "Submitting..." : "Request Sell"}
          </button>
        </div>

        {status && (
          <div className="panel-subtle" style={{ marginTop: "12px" }}>
            <p>{status}</p>
          </div>
        )}
      </form>
    </div>
  );
}