export default function WalletHeader({ account, connectWallet }) {
  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-header-box">
      <button onClick={connectWallet} className="wallet-header-btn">
        {account ? shortenAddress(account) : "Connect Wallet"}
      </button>

      {account && (
        <p className="wallet-header-address">
          Connected: {account}
        </p>
      )}
    </div>
  );
}