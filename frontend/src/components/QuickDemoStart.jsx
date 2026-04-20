import { Link } from "react-router-dom";
import { ShieldCheck, FileText, Wallet, ArrowRight } from "lucide-react";

export default function QuickDemoStart() {
  const items = [
    {
      to: "/admin",
      icon: ShieldCheck,
      title: "1. Set Authorities",
      text: "Start with Owner / Admin to assign all authority wallets."
    },
    {
      to: "/rd",
      icon: FileText,
      title: "2. Register Land",
      text: "Use Registry of Deeds to upload metadata and register land."
    },
    {
      to: "/buyer",
      icon: Wallet,
      title: "3. Continue Demo Flow",
      text: "Move through Seller, Buyer, and approval dashboards."
    }
  ];

  return (
    <div className="card">
      <h2 className="section-title">Quick Start</h2>
      <p className="section-note">
        Use these shortcuts when presenting the system live.
      </p>

      <div className="quick-demo-grid">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link key={index} to={item.to} className="quick-demo-card">
              <div className="quick-demo-top">
                <div className="quick-demo-icon-wrap">
                  <Icon className="quick-demo-icon" size={22} />
                </div>

                <div className="quick-demo-arrow">
                  <ArrowRight size={18} />
                </div>
              </div>

              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}