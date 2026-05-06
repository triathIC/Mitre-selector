import { useState } from "react";
import { LegalNotice } from "./LegalNotice";
import { trackExternalClick } from "@/lib/analytics";

const MITRE_URL = "https://attack.mitre.org/";
const SENTINEL_URL = "https://learn.microsoft.com/en-us/azure/sentinel/";
const DEFENDER_URL = "https://learn.microsoft.com/en-us/defender-xdr/";

export function Footer() {
  const [showLegalNotice, setShowLegalNotice] = useState(false);

  return (
    <footer className="border-t border-white/10 px-4 py-3 text-xs text-gray-500">
      <div className="text-center">
        <a
          href={MITRE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackExternalClick(MITRE_URL);
          }}
          className="hover:text-gray-400 underline"
        >
          MITRE ATT&CK
        </a>
        {" · "}
        <a
          href={SENTINEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackExternalClick(SENTINEL_URL);
          }}
          className="hover:text-gray-400 underline"
        >
          Microsoft Sentinel
        </a>
        {" · "}
        <a
          href={DEFENDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackExternalClick(DEFENDER_URL);
          }}
          className="hover:text-gray-400 underline"
        >
          Defender XDR
        </a>
        {" · "}
        <a
          href="#impressum"
          className="hover:text-gray-400 underline"
          onClick={() => {
            setShowLegalNotice(true);
          }}
        >
          Impressum
        </a>
      </div>
      {showLegalNotice && (
        <div className="mt-4 flex justify-center text-left">
          <LegalNotice />
        </div>
      )}
    </footer>
  );
}
