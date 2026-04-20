import { useState } from "react";

export default function ViewAuthorities({ contract }) {

  const [data, setData] = useState({
    owner: "",
    surveyor: "",
    bir: "",
    cityTreasury: "",
    assessor: "",
    rd: ""
  });

  const loadAuthorities = async () => {

    if (!contract) {
      alert("Connect wallet first");
      return;
    }

    try {

      const owner = await contract.owner();
      const surveyor = await contract.surveyor();
      const bir = await contract.bir();
      const cityTreasury = await contract.cityTreasury();
      const assessor = await contract.assessor();
      const rd = await contract.rd();

      setData({
        owner,
        surveyor,
        bir,
        cityTreasury,
        assessor,
        rd
      });

    } catch (error) {

      console.log(error);
      alert("Error loading authorities");

    }
  };

  return (

    <div className="card">

      <h2>View Current Authorities</h2>

      <button onClick={loadAuthorities}>
        Load Authorities
      </button>

      <p><b>Owner:</b> {data.owner}</p>
      <p><b>Surveyor:</b> {data.surveyor}</p>
      <p><b>BIR:</b> {data.bir}</p>
      <p><b>City Treasury:</b> {data.cityTreasury}</p>
      <p><b>Assessor:</b> {data.assessor}</p>
      <p><b>RD:</b> {data.rd}</p>

    </div>

  );
}