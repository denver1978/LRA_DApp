import { useState } from "react";

export default function SetAuthoritiesForm({ contract }) {
  const [surveyor, setSurveyor] = useState("");
  const [bir, setBir] = useState("");
  const [cityTreasury, setCityTreasury] = useState("");
  const [assessor, setAssessor] = useState("");
  const [rd, setRd] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!contract) {
        alert("Please connect wallet first.");
        return;
      }

      console.log("contract object:", contract);
      console.log("setAuthorities exists?", typeof contract?.setAuthorities);

      const tx = await contract.setAuthorities(
        surveyor,
        bir,
        cityTreasury,
        assessor,
        rd
      );

      await tx.wait();
      alert("Authorities set successfully.");
    } catch (error) {
      console.error("Set authorities error:", error);
      alert(error?.shortMessage || error?.message || "Transaction failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <h2>Set Authorities</h2>

      <input
        type="text"
        placeholder="Surveyor Address"
        value={surveyor}
        onChange={(e) => setSurveyor(e.target.value)}
      />
      <br />

      <input
        type="text"
        placeholder="BIR Address"
        value={bir}
        onChange={(e) => setBir(e.target.value)}
      />
      <br />

      <input
        type="text"
        placeholder="City Treasury Address"
        value={cityTreasury}
        onChange={(e) => setCityTreasury(e.target.value)}
      />
      <br />

      <input
        type="text"
        placeholder="Assessor Address"
        value={assessor}
        onChange={(e) => setAssessor(e.target.value)}
      />
      <br />

      <input
        type="text"
        placeholder="RD Address"
        value={rd}
        onChange={(e) => setRd(e.target.value)}
      />
      <br />

      <button type="submit">Set Authorities</button>
    </form>
  );
}