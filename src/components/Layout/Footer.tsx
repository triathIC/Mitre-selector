export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-white/10 px-4 py-3 text-center text-xs text-gray-500">
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
    </footer>
  );
}
