import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import useWallet from "./hooks/useWallet";
import useContract from "./hooks/useContract";

import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import RDPage from "./pages/RDPage";
import SellerPage from "./pages/SellerPage";
import BuyerPage from "./pages/BuyerPage";
import SurveyorPage from "./pages/SurveyorPage";
import BIRPage from "./pages/BIRPage";
import TreasuryPage from "./pages/TreasuryPage";
import AssessorPage from "./pages/AssessorPage";

export default function App() {
  const { account, signer, connectWallet, disconnectWallet } = useWallet();
  const contract = useContract(signer);

  const [latestCID, setLatestCID] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [registrationResetKey, setRegistrationResetKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const triggerRegistrationReset = () => {
    setRegistrationResetKey((prev) => prev + 1);
    setLatestCID("");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            account={account}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
            contract={contract}
          />
        }
      />

      <Route
        path="/admin"
        element={
          <AdminPage
            account={account}
            connectWallet={connectWallet}
            contract={contract}
          />
        }
      />

      <Route
        path="/rd"
        element={
          <RDPage
            account={account}
            connectWallet={connectWallet}
            contract={contract}
            latestCID={latestCID}
            setLatestCID={setLatestCID}
            refreshKey={refreshKey}
            triggerRefresh={triggerRefresh}
            registrationResetKey={registrationResetKey}
            triggerRegistrationReset={triggerRegistrationReset}
          />
        }
      />

      <Route
        path="/seller"
        element={
          <SellerPage
            account={account}
            connectWallet={connectWallet}
            contract={contract}
            latestCID={latestCID}
            setLatestCID={setLatestCID}
            refreshKey={refreshKey}
            triggerRefresh={triggerRefresh}
            registrationResetKey={registrationResetKey}
          />
        }
      />

      <Route
        path="/buyer"
        element={
          <BuyerPage
            account={account}
            connectWallet={connectWallet}
            contract={contract}
            refreshKey={refreshKey}
            triggerRefresh={triggerRefresh}
          />
        }
      />

      <Route
        path="/surveyor"
        element={
          <SurveyorPage
            account={account}
            connectWallet={connectWallet}
            contract={contract}
            refreshKey={refreshKey}
            triggerRefresh={triggerRefresh}
          />
        }
      />

      <Route
        path="/bir"
        element={
          <BIRPage
            account={account}
            connectWallet={connectWallet}
            contract={contract}
            refreshKey={refreshKey}
            triggerRefresh={triggerRefresh}
          />
        }
      />

      <Route
        path="/treasury"
        element={
          <TreasuryPage
            account={account}
            connectWallet={connectWallet}
            contract={contract}
            refreshKey={refreshKey}
            triggerRefresh={triggerRefresh}
          />
        }
      />

      <Route
        path="/assessor"
        element={
          <AssessorPage
            account={account}
            connectWallet={connectWallet}
            contract={contract}
            refreshKey={refreshKey}
            triggerRefresh={triggerRefresh}
          />
        }
      />
    </Routes>
  );
}