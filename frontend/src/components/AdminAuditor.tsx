import {
  useEffect,
  useState,
} from "react";

import {
  getDashboard,
  getRecentTransactions,
} from "../api";

import type {
  DashboardData,
} from "../types";

export default function AdminAuditor() {
  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadDashboard();

    const interval =
      window.setInterval(
        loadDashboard,
        5000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  async function loadDashboard() {
    try {
      const dashboard =
        await getDashboard();

      setData(dashboard);

    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="text-slate-400">
        Loading central monitoring data...
      </div>
    );
  }

  const metrics =
    data.auditor_metrics;

  return (
    <div className="space-y-6">

      <div>
        <p className="text-sm text-amber-400">
          GOVERNMENT AUDITOR PORTAL
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          National EPR Command View
        </h1>

        <p className="mt-2 text-slate-400">
          Real-time monitoring of the
          EcoTrace-EPR plastic recovery
          ecosystem.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <Metric
          label="Plastic Recovered"
          value={`${metrics.total_plastic_recovered_tons} T`}
        />

        <Metric
          label="Active Hubs"
          value={`${metrics.verified_hubs}/${metrics.total_hubs}`}
        />

        <Metric
          label="Verified Transactions"
          value={metrics.verified_transactions.toLocaleString()}
        />

        <Metric
          label="Ledger Integrity"
          value={`${metrics.ledger_integrity_percentage}%`}
        />

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            Ecosystem Status
          </h2>

          <div className="mt-5 space-y-4">

            <StatusRow
              label="Total Ragpickers"
              value={metrics.total_ragpickers}
            />

            <StatusRow
              label="Total Transactions"
              value={metrics.total_transactions}
            />

            <StatusRow
              label="Total EPR Credits"
              value={metrics.total_epr_credits}
            />

            <StatusRow
              label="Purchased Credits"
              value={
                metrics.purchased_epr_credits
              }
            />

            <StatusRow
              label="Fraud Alerts"
              value={metrics.fraud_alerts}
            />

          </div>

        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            Ledger Verification
          </h2>

          <p className="mt-4 text-slate-400">
            Every transaction displayed in
            this prototype is linked to a
            traceable collection batch and
            its corresponding EPR credit
            lifecycle.
          </p>

          <div className="mt-6 rounded-xl bg-slate-800 p-5">

            <p className="text-sm text-slate-400">
              System Status
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              Ecosystem Operational
            </p>

          </div>

        </div>

      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="text-xl font-semibold">
          Recent Ground-Level Transactions
        </h2>

        <div className="mt-5 overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="text-slate-400">

              <tr>
                <th className="pb-3">
                  Transaction
                </th>

                <th className="pb-3">
                  Category
                </th>

                <th className="pb-3">
                  Weight
                </th>

                <th className="pb-3">
                  Status
                </th>
              </tr>

            </thead>

            <tbody>

              {data.recent_transactions.map(
                (transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-t border-slate-800"
                  >
                    <td className="py-4">
                      {transaction.id}
                    </td>

                    <td>
                      {transaction.category}
                    </td>

                    <td>
                      {transaction.weight_kg} kg
                    </td>

                    <td className="text-emerald-400">
                      {
                        transaction.transaction_status
                      }
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">

      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-semibold">
        {value.toLocaleString()}
      </span>

    </div>
  );
}