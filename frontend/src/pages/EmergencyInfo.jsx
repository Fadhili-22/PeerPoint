import StaticContentPage from "../components/landing/StaticContentPage";
import { crisisLines, EMERGENCY_SERVICES_NUMBER } from "../constants/crisisSupport";

export default function EmergencyInfo() {
  return (
    <StaticContentPage title="Emergency Info">
      {/* Numbers sourced from public directories in July 2026 — verify against the Mental Health Club's official list before production launch. */}
      <h2 className="font-heading text-xl font-semibold text-on-surface">
        If you are in immediate danger, call {EMERGENCY_SERVICES_NUMBER} or 112.
      </h2>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        If you are not in immediate danger but need someone to talk to, these
        Kenyan mental health crisis lines may help:
      </p>
      <ul className="space-y-4 font-body text-base leading-relaxed text-on-surface-muted">
        {crisisLines.map((line) => (
          <li key={line.name}>
            <span className="font-semibold text-on-surface">{line.name}</span>
            {" — "}
            <a
              href={`tel:${line.tel}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {line.number}
            </a>
            {line.detail ? ` (${line.detail})` : null}
          </li>
        ))}
      </ul>
    </StaticContentPage>
  );
}
