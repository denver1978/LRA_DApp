import { useEffect, useState } from "react";
import { parseEther } from "ethers";
import toast from "react-hot-toast";

export default function RequestSaleForm({ contract, latestCID, triggerRefresh, selectedLandId = "" }) {
  const [landId, setLandId] = useState("");
  const [buyer, setBuyer] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [deedCID, setDeedCID] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Enter Land ID to validate seller wallet.");
  const [loading, setLoading] = useState(false);

  const activeLandId = selectedLandId || landId;

  useEffect(() => {
    if (latestCID) setDeedCID(latestCID);
  }, [latestCID]);

  const validateSellerWallet = async (currentLandId) => {
    try {
      if (!contract || !currentLandId) {
        setCanSubmit(false);
        setStatusMessage("Enter Land ID to validate seller wallet.");
        return;
      }

      const land = await contract.lands(BigInt(currentLandId));

      if (!land.exists) {
        setCanSubmit(false);
        setStatusMessage("Land does not exist.");
        return;
      }

      const connected = await contract.runner.getAddress();

      if (connected.toLowerCase() === land.owner.toLowerCase()) {
        setCanSubmit(true);
        setStatusMessage("Correct wallet: connected account is the current land owner.");
      } else {
        setCanSubmit(false);
        setStatusMessage("Wrong wallet: connected account is not the current land owner.");
      }
    } catch (error) {
      console.error("Seller validation error:", error);
      setCanSubmit(false);
      setStatusMessage("Failed to validate seller wallet.");
    }
  };

  useEffect(() => {
    validateSellerWallet(activeLandId);
  }, [activeLandId, contract]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!contract) {
        toast.error("Please connect wallet first.");
        return;
      }

      if (!canSubmit) {
        toast.error("Wrong wallet connected for seller action.");
        return;
      }

      if (!buyer.startsWith("0x") || buyer.length !== 42) {
        toast.error("Buyer address must be a full valid Ethereum address.");
        return;
      }

      setLoading(true);

      const tx = await contract.requestSell(
        BigInt(activeLandId),
        buyer,
        parseEther(priceEth),
        deedCID
      );

      await tx.wait();
      toast.success("Sale requested successfully.");
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error("Request sale error:", error);
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
    <form onSubmit={handleSubmit} className="card">
      <h2 className="section-title">Request Sale</h2>
      <p className="section-note">Prepare the buyer, price, and deed CID for the sale request.</p>

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
          <label className="form-label">Buyer Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Price (ETH)</label>
          <input
            type="text"
            placeholder="e.g. 0.1"
            value={priceEth}
            onChange={(e) => setPriceEth(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="form-label">Deed CID</label>
          <input
            type="text"
            placeholder="IPFS CID"
            value={deedCID}
            onChange={(e) => setDeedCID(e.target.value)}
          />
        </div>
      </div>

      <div className="card-actions">
        <button type="submit" disabled={!canSubmit || loading}>
          {loading ? "Requesting..." : "Request Sale"}
        </button>
      </div>
    </form>
  );
}