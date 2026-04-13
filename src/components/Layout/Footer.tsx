import { useState } from "react";
import { LegalNotice } from "./LegalNotice";

export function Footer() {
  const [showLegalNotice, setShowLegalNotice] = useState(false);

  return (
    <footer className="border-t border-white/10 px-4 py-3 text-xs text-gray-500">
      <div className="text-center">
        <a
          href="https://attack.mitre.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 underline"
        >
          MITRE ATT&CK
        </a>
        {" · "}
        <a
          href="https://learn.microsoft.com/en-us/azure/sentinel/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 underline"
        >
          Microsoft Sentinel
        </a>
        {" · "}
        <a
          href="https://learn.microsoft.com/en-us/defender-xdr/"
          target="_blank"
          rel="noopener noreferrer"
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
