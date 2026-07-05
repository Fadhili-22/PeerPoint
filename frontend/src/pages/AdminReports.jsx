import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { downloadAdminReport } from "../api/admin";

function ReportCard({ title, description, reportKey, disabled = false }) {
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState("");

  async function handleDownload(format) {
    setDownloading(format);
    setError("");
    try {
      await downloadAdminReport(reportKey, format);
    } catch (err) {
      setError(err.message || "Unable to download report.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <article className="rounded-[28px] border border-primary/5 bg-surface p-6 shadow-md">
      <div className="mb-2 flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-on-surface">{title}</h3>
          <p className="mt-1 font-body text-sm text-on-surface-muted">{description}</p>
        </div>
      </div>

      {error ? (
        <p className="mb-4 font-body text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={disabled || downloading !== null}
          onClick={() => handleDownload("pdf")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          Download PDF
        </button>
        <button
          type="button"
          disabled={disabled || downloading !== null}
          onClick={() => handleDownload("csv")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-surface px-4 py-2.5 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading === "csv" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          )}
          Download CSV
        </button>
      </div>
    </article>
  );
}

export function AdminReportsSection() {
  return (
    <section aria-label="Reports" className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-on-surface">Reports</h2>
        <p className="mt-1 font-body text-sm text-on-surface-muted">
          Generate live platform snapshots on demand. Each download reflects current database
          state at the moment you click.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard
          reportKey="platform-summary"
          title="Platform Summary Report"
          description="Students, counsellors, monthly active students, session status counts, ratings summary, and top resources."
        />
        <ReportCard
          reportKey="counsellor-performance"
          title="Counsellor Performance Report"
          description="One row per active counsellor with sessions completed, response rate, ratings, and account status."
        />
      </div>
    </section>
  );
}
