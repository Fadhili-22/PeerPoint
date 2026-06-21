import { Link } from "react-router-dom";
import { BadgeCheck, Globe, Mail, MessageCircle } from "lucide-react";
import ComingSoonText from "../ComingSoonText";

const footerPlatformLinks = [
  { label: "Find Support", to: "/signup" },
  { label: "Knowledge Base", to: "/login" },
  { label: "How it works", to: "/#how-it-works" },
  { label: "Become a Peer", comingSoon: true },
];

const footerSupportLinks = [
  "Privacy Policy",
  "Contact Support",
  "Terms of Service",
  "Emergency Info",
];

export default function LandingFooter() {
  return (
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
                    {link.comingSoon ? (
                      <ComingSoonText className="text-outline-muted">
                        {link.label}
                      </ComingSoonText>
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
                  <li key={link}>
                    <ComingSoonText className="text-outline-muted">{link}</ComingSoonText>
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
  );
}
