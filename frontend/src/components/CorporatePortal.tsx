import { useEffect, useState } from "react";

import {
  BrainCircuit,
  CheckCircle2,
  Coins,
  Loader2,
  ShieldAlert,
  Target,
} from "lucide-react";

import {
  generateESGInsight,
  getCorporates,
  getDashboard,
  purchaseCredit,
} from "../api";

import type {
  CorporateBrand,
  EPRCredit,
  ESGInsight,
} from "../types";

export default function CorporatePortal() {
  const [corporates, setCorporates] = useState<CorporateBrand[]>([]);
  const [credits, setCredits] = useState<EPRCredit[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [insight, setInsight] = useState<ESGInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [corporateData, dashboard] = await Promise.all([
        getCorporates(),
        getDashboard(),
      ]);

      const safeCorporates: CorporateBrand[] = Array.isArray(corporateData)
        ? corporateData
        : Array.isArray((corporateData as any)?.corporates)
          ? (corporateData as any).corporates
          : [];

      setCorporates(safeCorporates);

      setCredits(
        Array.isArray(dashboard?.available_credits)
          ? dashboard.available_credits
          : []
      );

      if (!selectedCompany && safeCorporates.length > 0) {
        setSelectedCompany(safeCorporates[0].id);
      }
    } catch (error) {
      console.error(error);

      setMessage("Unable to connect to backend.");
    }
  }

  useEffect(() => {
    load();

    const timer = setInterval(load, 5000);

    return () => clearInterval(timer);
  }, []);

  const company = corporates.find(
    (item) => item.id === selectedCompany
  );

  async function buyCredit(creditId: string) {
    if (!company) return;

    setLoading(true);
    setMessage("");

    try {
      await purchaseCredit(company.id, creditId);

      setMessage(
        "EPR Certificate purchased successfully."
      );

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Purchase failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function getAIAdvice() {
    if (!company) return;

    setLoading(true);
    setMessage("");

    try {
      const result = await generateESGInsight({
        company_name: company.company_name,

        annual_target_tons:
          company.annual_plastic_target_tons,

        credits_purchased_tons:
          company.credits_purchased_tons,

        available_market_credits_tons:
          credits.reduce(
            (sum, credit) =>
              sum + credit.weight_kg / 1000,
            0
          ),

        preferred_regions: [
          "Karnataka",
          "Tamil Nadu",
          "Telangana",
        ],

        industry: company.industry,
      });

      setInsight(result);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "AI insight failed."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!company) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 text-white">
        Loading corporate data...
      </main>
    );
  }

  const progress = Math.min(
    company.compliance_percentage,
    100
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <Target size={18} />

            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Corporate EPR Command
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Compliance Dashboard
          </h2>
        </div>

        <select
          value={company.id}
          onChange={(e) =>
            setSelectedCompany(e.target.value)
          }
          className="rounded-xl border border-emerald-900/50 bg-[#0a1b13] px-4 py-3 text-sm text-white outline-none"
        >
          {corporates.map((c) => (
            <option
              key={c.id}
              value={c.id}
            >
              {c.company_name}
            </option>
          ))}
        </select>

      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <Metric
          icon={<Target size={19} />}
          label="Annual Target"
          value={`${company.annual_plastic_target_tons.toLocaleString()} t`}
        />

        <Metric
          icon={<Coins size={19} />}
          label="Credits Purchased"
          value={`${company.credits_purchased_tons.toLocaleString()} t`}
        />

        <Metric
          icon={<CheckCircle2 size={19} />}
          label="Compliance"
          value={`${progress}%`}
        />

      </div>

      <section className="mt-6 rounded-2xl border border-emerald-900/50 bg-[#0a1b13] p-5">

        <div className="mb-3 flex justify-between">

          <div>
            <h3 className="font-semibold text-white">
              Legal Compliance Progress
            </h3>

            <p className="text-xs text-emerald-100/40">
              EPR recovery obligation coverage
            </p>
          </div>

          <span className="text-xl font-bold text-emerald-400">
            {progress}%
          </span>

        </div>

        <div className="h-4 overflow-hidden rounded-full bg-emerald-950">

          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

        <section className="rounded-2xl border border-emerald-900/50 bg-[#0a1b13] p-5">

          <div className="mb-5">

            <h3 className="font-semibold text-white">
              Verified EPR Credit Market
            </h3>

            <p className="text-xs text-emerald-100/40">
              Ground-level batches verified by EcoTrace
            </p>

          </div>

          <div className="space-y-3">

            {credits.slice(0, 12).map((credit) => (

              <div
                key={credit.id}
                className="flex flex-col gap-4 rounded-xl border border-emerald-900/40 bg-[#06120d] p-4 sm:flex-row sm:items-center sm:justify-between"
              >

                <div>

                  <div className="flex items-center gap-2">

                    <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">
                      VERIFIED
                    </span>

                    <span className="text-xs text-emerald-100/35">
                      {credit.id}
                    </span>

                  </div>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {credit.plastic_category}
                  </p>

                  <p className="mt-1 text-xs text-emerald-100/40">
                    {credit.weight_kg.toFixed(1)} kg · ₹
                    {credit.credit_value.toLocaleString()}
                  </p>

                </div>

                <button
                  disabled={loading}
                  onClick={() =>
                    buyCredit(credit.id)
                  }
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  Buy EPR Certificate
                </button>

              </div>

            ))}

          </div>

        </section>

        <section className="rounded-2xl border border-emerald-900/50 bg-[#0a1b13] p-5">

          <div className="mb-5 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <BrainCircuit size={19} />
              </div>

              <div>

                <h3 className="font-semibold text-white">
                  AI ESG Advisor
                </h3>

                <p className="text-xs text-emerald-100/40">
                  Gemini-powered recommendations
                </p>

              </div>

            </div>

            <button
              onClick={getAIAdvice}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-300"
            >

              {loading && (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              )}

              Generate

            </button>

          </div>

          {!insight ? (

            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-emerald-900/50 text-center">

              <div>

                <BrainCircuit
                  size={34}
                  className="mx-auto mb-4 text-emerald-500/30"
                />

                <p className="text-sm text-emerald-100/40">
                  Generate an AI-powered EPR
                  sourcing strategy.
                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-4">

              <div className="flex items-center justify-between rounded-xl border border-emerald-900/50 bg-[#06120d] p-4">

                <span className="text-xs text-emerald-100/50">
                  Compliance Risk
                </span>

                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                  {insight.risk_level}
                </span>

              </div>

              <div className="rounded-xl bg-emerald-500/5 p-4">

                <p className="text-xs leading-6 text-emerald-100/65">
                  {insight.executive_summary}
                </p>

              </div>

              <div>

                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-100/35">
                  Sourcing Recommendations
                </p>

                <ul className="space-y-2">

                  {insight.sourcing_recommendations.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-xs leading-5 text-emerald-100/60"
                      >

                        <span className="text-emerald-400">
                          •
                        </span>

                        {item}

                      </li>
                    )
                  )}

                </ul>

              </div>

              <div className="rounded-xl border border-emerald-900/50 p-4">

                <p className="text-xs font-bold text-white">
                  Remaining target
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {insight.remaining_target_tons.toFixed(1)} t
                </p>

                <p className="mt-1 text-xs text-emerald-100/40">
                  Estimated completion:{" "}
                  {insight.estimated_completion_timeline}
                </p>

              </div>

            </div>

          )}

          {message && (

            <div className="mt-4 flex gap-2 rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-3 text-xs text-emerald-300">

              <ShieldAlert size={15} />

              {message}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-900/50 bg-[#0a1b13] p-5">

      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
        {icon}
      </div>

      <p className="text-xs text-emerald-100/40">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}