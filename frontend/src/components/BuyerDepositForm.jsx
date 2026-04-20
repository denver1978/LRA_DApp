import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function BuyerDepositForm({
  contract,
  selectedLandId,
  triggerRefresh
}) {
  const [landId, setLandId] = useState("");
  const [requiredWei, setRequiredWei] = useState(null);
  const [requiredEth, setRequiredEth] = useState("");
  const [requiredPhp, setRequiredPhp] = useState("");
  const [ratePhpPerEth, setRatePhpPerEth] = useState(null);

  const [loadingSale, setLoadingSale] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (selectedLandId) {
      setLandId(String(selectedLandId));
    }
  }, [selectedLandId]);

  const fetchRate = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=php"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch ETH/PHP rate");
      }

      const data = await res.json();
      const rate = data?.ethereum?.php;

      if (!rate || Number(rate) <= 0) {
        throw new Error("Invalid ETH/PHP rate");
      }

      setRatePhpPerEth(Number(rate));
    } catch (error) {
      console.error("Rate fetch error:", error);
      setRatePhpPerEth(null);
    }
  };

  const loadSaleAmount = async (activeLandId) => {
    try {
      if (!contract || !activeLandId) return;

      setLoadingSale(true);
      setStatus("");

      const sale = await contract.sales(BigInt(activeLandId));

      if (!sale || !sale.active) {
        setRequiredWei(null);
        setRequiredEth("");
        setRequiredPhp("");
        setStatus("No active sale found for this Land ID.");
        return;
      }

      const wei = sale.priceWei;
      const eth = ethers.formatEther(wei);

      setRequiredWei(wei);
      setRequiredEth(eth);

      if (ratePhpPerEth) {
        const php = Number(eth) * ratePhpPerEth;
        setRequiredPhp(
          php.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        );
      } else {
        setRequiredPhp("");
      }
    } catch (error) {
      console.error("Load sale amount error:", error);
      setRequiredWei(null);
      setRequiredEth("");
      setRequiredPhp("");
      setStatus("Failed to load required sale amount.");
    } finally {
      setLoadingSale(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  useEffect(() => {
    if (landId) {
      loadSaleAmount(landId);
    } else {
      setRequiredWei(null);
      setRequiredEth("");
      setRequiredPhp("");
    }
  }, [landId, contract, ratePhpPerEth]);

  const handleDeposit = async (e) => {
    e.preventDefault();

    try {
      setStatus("");

      if (!contract) {
        setStatus("Contract not loaded.");
        return;
      }

      if (!landId) {
        setStatus("Please enter a Land ID.");
        return;
      }

      if (!requiredWei) {
        setStatus("No exact deposit amount is available for this sale.");
        return;
      }

      setSubmitting(true);

      const tx = await contract.buyerDeposit(BigInt(landId), {
        value: requiredWei
      });

      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setStatus("Deposit successful. Exact escrow amount funded.");

      if (triggerRefresh) {
        triggerRefresh();
      }
    } catch (error) {
      console.error("buyerDeposit error:", error);

      setStatus(
        error?.reason ||
          error?.shortMessage ||
          error?.data?.message ||
          error?.message ||
          "Deposit failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Buyer Escrow Deposit</h2>
      <p className="section-note">
        The system reads the exact required sale amount from the blockchain and deposits that exact value.
      </p>

      <form onSubmit={handleDeposit}>
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

        <div className="panel-subtle" style={{ marginTop: "12px" }}>
          {loadingSale ? (
            <p>Loading required sale amount...</p>
          ) : (
            <>
              <p>
                <strong>Required ETH:</strong> {requiredEth || "N/A"}
              </p>
              <p>
                <strong>PHP Equivalent:</strong>{" "}
                {requiredPhp ? `₱${requiredPhp}` : "N/A"}
              </p>
            </>
          )}
        </div>

        <div className="card-actions" style={{ marginTop: "14px" }}>
          <button type="submit" disabled={submitting || !requiredWei}>
            {submitting ? "Depositing..." : "Deposit Exact Amount"}
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