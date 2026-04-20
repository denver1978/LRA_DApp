import { useEffect, useState } from "react";
import ExplorerLink from "./ExplorerLink";
import CopyButton from "./CopyButton";

export default function WalletRoleStatus({ contract, account }) {

  const [roles, setRoles] = useState({
    owner: "",
    surveyor: "",
    bir: "",
    cityTreasury: "",
    assessor: "",
    rd: ""
  });

  const [detectedRole, setDetectedRole] = useState("Unknown");

  useEffect(() => {

    const loadRoles = async () => {

      try {

        if (!contract || !account) return;

        const owner = await contract.owner();
        const surveyor = await contract.surveyor();
        const bir = await contract.bir();
        const cityTreasury = await contract.cityTreasury();
        const assessor = await contract.assessor();
        const rd = await contract.rd();

        const wallet = account.toLowerCase();

        let role = "Unassigned";

        if (wallet === owner.toLowerCase()) role = "Owner / Admin";
        else if (wallet === surveyor.toLowerCase()) role = "Surveyor";
        else if (wallet === bir.toLowerCase()) role = "BIR";
        else if (wallet === cityTreasury.toLowerCase()) role = "City Treasury";
        else if (wallet === assessor.toLowerCase()) role = "Assessor";
        else if (wallet === rd.toLowerCase()) role = "Registry of Deeds";

        setRoles({
          owner,
          surveyor,
          bir,
          cityTreasury,
          assessor,
          rd
        });

        setDetectedRole(role);

      } catch (error) {

        console.error(error);

      }

    };

    loadRoles();

  }, [contract, account]);


  const roleStyle = (role) => {

    const styles = {

      "Owner / Admin": {
        background: "#dbeafe",
        color: "#1d4ed8"
      },

      "Registry of Deeds": {
        background: "#ede9fe",
        color: "#7c3aed"
      },

      "Surveyor": {
        background: "#fef3c7",
        color: "#92400e"
      },

      "BIR": {
        background: "#ffedd5",
        color: "#c2410c"
      },

      "City Treasury": {
        background: "#cffafe",
        color: "#0e7490"
      },

      "Assessor": {
        background: "#fce7f3",
        color: "#be185d"
      },

      "Unassigned": {
        background: "#e5e7eb",
        color: "#374151"
      }

    };

    return {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "600",
      marginLeft: "10px",
      ...(styles[role] || styles["Unassigned"])
    };

  };


  return (

  <div className="card">

    <h2>Wallet Role Status</h2>

    <p>
      <strong>Connected Wallet:</strong> {account || "Not Connected"}
      {account && <CopyButton text={account} />}
      {account && <ExplorerLink type="address" value={account} />}
    </p>

    <p>
      <strong>Detected Role:</strong>
      <span style={roleStyle(detectedRole)}>
        {detectedRole}
      </span>
    </p>

    <hr />

    <p>
      <strong>Owner:</strong> {roles.owner}
      {roles.owner && <CopyButton text={roles.owner} />}
      {roles.owner && <ExplorerLink type="address" value={roles.owner} />}
    </p>

    <p>
      <strong>Surveyor:</strong> {roles.surveyor}
      {roles.surveyor && <CopyButton text={roles.surveyor} />}
      {roles.surveyor && <ExplorerLink type="address" value={roles.surveyor} />}
    </p>

    <p>
      <strong>BIR:</strong> {roles.bir}
      {roles.bir && <CopyButton text={roles.bir} />}
      {roles.bir && <ExplorerLink type="address" value={roles.bir} />}
    </p>

    <p>
      <strong>City Treasury:</strong> {roles.cityTreasury}
      {roles.cityTreasury && <CopyButton text={roles.cityTreasury} />}
      {roles.cityTreasury && <ExplorerLink type="address" value={roles.cityTreasury} />}
    </p>

    <p>
      <strong>Assessor:</strong> {roles.assessor}
      {roles.assessor && <CopyButton text={roles.assessor} />}
      {roles.assessor && <ExplorerLink type="address" value={roles.assessor} />}
    </p>

    <p>
      <strong>RD:</strong> {roles.rd}
      {roles.rd && <CopyButton text={roles.rd} />}
      {roles.rd && <ExplorerLink type="address" value={roles.rd} />}
    </p>

  </div>

  );

}