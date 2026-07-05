import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Globe, Mail, MessageCircle, X } from "lucide-react";
import ComingSoonText from "../ComingSoonText";

const footerPlatformLinks = [
  { label: "Find Support", to: "/signup" },
  { label: "Mental Health Resources", to: "/student/resources" },
  { label: "How it works", to: "/#how-it-works" },
  { label: "Become a Peer Counsellor", opensModal: true },
];

const footerSupportLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Contact Support", to: "/contact-support" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Emergency Info", to: "/emergency-info" },
];

// TODO: replace with the official Mental Health Club email.
const PEER_COUNSELLOR_CONTACT_EMAIL = "TODO_MHC_EMAIL@strathmore.edu";

function BecomePeerCounsellorModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Become a peer counsellor"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            Become a Peer Counsellor
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-on-surface-subtle transition-colors hover:bg-surface-muted hover:text-on-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="font-body text-sm leading-relaxed text-on-surface-muted">
          Interested in becoming a peer counsellor? Reach out to us at{" "}
          <span className="font-semibold text-on-surface">
            {PEER_COUNSELLOR_CONTACT_EMAIL}
          </span>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function LandingFooter() {
  const [peerModalOpen, setPeerModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-surface-dark pb-10 pt-20">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
          <div className="mb-16 flex flex-col items-start justify-between gap-12 md:flex-row">
            <div className="max-w-sm space-y-6">
              <div className="flex items-center gap-2 font-heading text-2xl font-semibold text-on-dark-accent">
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
                PeerPoint
              </div>
              <p className="font-body text-base text-outline-muted">
                Strathmore University&apos;s dedicated peer-to-peer mental health
                support platform. Providing a safe, anonymous sanctuary for student
                well-being.
              </p>
              <div className="flex gap-4">
                <ComingSoonText
                  aria-label="Visit website"
                  className="rounded-lg bg-white/5 p-2 text-outline-muted"
                >
                  <Globe className="h-5 w-5" aria-hidden="true" />
                </ComingSoonText>
                <ComingSoonText
                  aria-label="Send email"
                  className="rounded-lg bg-white/5 p-2 text-outline-muted"
                >
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </ComingSoonText>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-16">
              <div className="space-y-6">
                <h4 className="font-heading text-sm font-semibold uppercase tracking-widest text-on-dark-accent">
                  Platform
                </h4>
                <ul className="space-y-4 font-body text-base text-outline-muted">
                  {footerPlatformLinks.map((link) => (
                    <li key={link.label}>
                      {link.opensModal ? (
                        <button
                          type="button"
                          onClick={() => setPeerModalOpen(true)}
                          className="text-left transition-colors duration-200 hover:text-on-dark-accent"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link
                          to={link.to}
                          className="transition-colors duration-200 hover:text-on-dark-accent"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-heading text-sm font-semibold uppercase tracking-widest text-on-dark-accent">
                  Support
                </h4>
                <ul className="space-y-4 font-body text-base text-outline-muted">
                  {footerSupportLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="transition-colors duration-200 hover:text-on-dark-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-xs font-medium text-outline-muted">
              © 2024 PeerPoint. All rights reserved.
            </p>
            <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-on-dark-accent">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Endorsed by Strathmore University Mental Health Club
              </span>
            </div>
          </div>
        </div>
      </footer>

      {peerModalOpen ? (
        <BecomePeerCounsellorModal onClose={() => setPeerModalOpen(false)} />
      ) : null}
    </>
  );
}
