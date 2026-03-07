export function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-14 max-w-full items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-gray-100">MITRE ATT&CK KQL Explorer</h1>
        <p className="text-xs text-gray-500">
          Sentinel & Defender XDR detections
        </p>
      </div>
    </header>
  );
}
