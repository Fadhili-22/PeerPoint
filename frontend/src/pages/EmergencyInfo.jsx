import StaticContentPage from "../components/landing/StaticContentPage";

const crisisLines = [
  {
    name: "Befrienders Kenya",
    number: "+254 722 178 177",
    detail: "Mon–Fri, 9am–5pm — confidential emotional support",
  },
  {
    name: "EMKF Suicide Prevention & Crisis Helpline",
    number: "0800 723 253",
    detail: "Toll-free",
  },
  {
    name: "NACADA Toll-Free Helpline",
    number: "1192",
    detail: "Distress and substance use support",
  },
];

export default function EmergencyInfo() {
  return (
    <StaticContentPage title="Emergency Info">
      {/* Numbers sourced from public directories in July 2026 — verify against the Mental Health Club's official list before production launch. */}
      <h2 className="font-heading text-xl font-semibold text-on-surface">
        If you are in immediate danger, call 999 or 112.
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
            <span className="font-medium text-primary">{line.number}</span>
            {line.detail ? ` (${line.detail})` : null}
          </li>
        ))}
      </ul>
    </StaticContentPage>
  );
}
