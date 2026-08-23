import { useState } from "react";

import Navbar from "./components/Navbar";
import HubPortal from "./components/HubPortal";
import CorporatePortal from "./components/CorporatePortal";
import AdminAuditor from "./components/AdminAuditor";

import type { Role } from "./types";

function App() {
  const [role, setRole] = useState<Role>("hub");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar
        role={role}
        setRole={setRole}
      />

      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] px-4 py-3 text-sm text-slate-400">
          <span className="font-semibold text-emerald-300">
            Demo Ecosystem:
          </span>{" "}
          This prototype simulates real-time plastic recovery,
          AI batch verification, EPR credit generation, corporate
          compliance tracking and government-level monitoring.
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {role === "hub" && (
          <HubPortal />
        )}

        {role === "corporate" && (
          <CorporatePortal />
        )}

        {role === "auditor" && (
          <AdminAuditor />
        )}
      </main>
    </div>
  );
}

export default App;