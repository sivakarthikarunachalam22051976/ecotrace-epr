<div className="flex items-center gap-2 text-xs text-slate-400">
  <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
  </span>

  Live Mock Ecosystem
</div>



import {
  Building2,
  Factory,
  ShieldCheck,
  Recycle,
} from "lucide-react";

import type { Role } from "../types";


interface NavbarProps {
  role: Role;
  setRole: (role: Role) => void;
}


export default function Navbar({
  role,
  setRole,
}: NavbarProps) {

  const tabs = [
    {
      id: "hub" as Role,
      label: "Hub Portal",
      icon: Recycle,
    },
    {
      id: "corporate" as Role,
      label: "Brand Portal",
      icon: Building2,
    },
    {
      id: "auditor" as Role,
      label: "Government Auditor",
      icon: ShieldCheck,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#06120d]/95 backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black">
            <Factory size={21} />
          </div>

          <div>
            <h1 className="font-bold tracking-tight text-white">
              EcoTrace<span className="text-emerald-400">-EPR</span>
            </h1>

            <p className="hidden text-[10px] uppercase tracking-widest text-emerald-500/70 sm:block">
              Plastic Traceability Network
            </p>
          </div>

        </div>


        <nav className="flex rounded-xl border border-emerald-900/50 bg-[#0a1b13] p-1">

          {tabs.map((tab) => {

            const Icon = tab.icon;

            const active =
              role === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setRole(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 ${
                  active
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                    : "text-emerald-100/60 hover:bg-emerald-900/30 hover:text-white"
                }`}
              >
                <Icon size={15} />

                <span className="hidden md:inline">
                  {tab.label}
                </span>

                <span className="md:hidden">
                  {tab.id === "hub"
                    ? "Hub"
                    : tab.id === "corporate"
                    ? "Brand"
                    : "Audit"}
                </span>
              </button>
            );
          })}

        </nav>

      </div>

    </header>
  );
}