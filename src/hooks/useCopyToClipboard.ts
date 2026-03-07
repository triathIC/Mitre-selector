import { useCallback, useState } from "react";

export function useCopyToClipboard(): {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
} {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copy, copied };
}
