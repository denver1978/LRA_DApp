import { useEffect, useRef, useState } from "react";

export default function EthPhpConverter({
  ethValue,
  setEthValue,
  phpValue,
  setPhpValue,
  label = "Amount"
}) {
  const [ratePhpPerEth, setRatePhpPerEth] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [rateError, setRateError] = useState("");
  const lastEditedRef = useRef(null);

  const fetchRate = async () => {
    try {
      setLoadingRate(true);
      setRateError("");

      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=php"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch ETH/PHP rate");
      }

      const data = await res.json();
      const rate = data?.ethereum?.php;

      if (!rate || Number(rate) <= 0) {
        throw new Error("Invalid ETH/PHP rate received");
      }

      setRatePhpPerEth(Number(rate));
    } catch (error) {
      console.error("ETH/PHP fetch error:", error);
      setRateError("Unable to load live ETH/PHP rate.");
    } finally {
      setLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  useEffect(() => {
    if (!ratePhpPerEth) return;

    if (lastEditedRef.current === "eth") {
      const eth = Number(ethValue);
      if (!Number.isFinite(eth) || ethValue === "") {
        setPhpValue("");
        return;
      }
      setPhpValue((eth * ratePhpPerEth).toFixed(2));
    }

    if (lastEditedRef.current === "php") {
      const php = Number(phpValue);
      if (!Number.isFinite(php) || phpValue === "") {
        setEthValue("");
        return;
      }
      setEthValue((php / ratePhpPerEth).toFixed(6));
    }
  }, [ethValue, phpValue, ratePhpPerEth, setEthValue, setPhpValue]);

  const handleEthChange = (e) => {
    lastEditedRef.current = "eth";
    setEthValue(e.target.value);
  };

  const handlePhpChange = (e) => {
    lastEditedRef.current = "php";
    setPhpValue(e.target.value);
  };

  return (
    <div className="card">
      <h3 className="section-title">{label}</h3>

      <div className="form-grid">
        <div>
          <label>ETH Amount</label>
          <input
            type="number"
            step="0.000001"
            min="0"
            value={ethValue}
            onChange={handleEthChange}
            placeholder="Enter amount in ETH"
          />
        </div>

        <div>
          <label>PHP Equivalent</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={phpValue}
            onChange={handlePhpChange}
            placeholder="Enter amount in PHP"
          />
        </div>
      </div>

      <div className="panel-subtle" style={{ marginTop: "12px" }}>
        {loadingRate ? (
          <p>Loading live ETH/PHP rate...</p>
        ) : rateError ? (
          <p>{rateError}</p>
        ) : (
          <p>
            <strong>Current Rate:</strong> 1 ETH = ₱
            {ratePhpPerEth?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        )}
        <p className="section-note">
          The conversion uses a live ETH/PHP market price and should be treated as an estimate.
        </p>
      </div>
    </div>
  );
}