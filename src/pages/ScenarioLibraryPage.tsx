import { Head } from "vite-react-ssg";
import { scenarios } from "@/data/scenarios";
import { ScenarioCard } from "@/components/scenario";

export default function ScenarioLibraryPage() {
  return (
    <>
      <Head>
        <title>Scenarios – MITRE ATT&CK KQL Explorer</title>
        <meta
          name="description"
          content="Real-world attacker scenarios with honest detection maturity and correlation logic for Microsoft Sentinel and Defender XDR."
        />
      </Head>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-8 md:mb-10">
          <h1 className="font-display text-2xl font-semibold text-scn-text md:text-3xl">
            Scenarios
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-scn-dim md:text-base">
            Atomic KQL is vocabulary. A scenario is the grammar that chains
            primitives into one defensible incident. Each step is labelled with
            honest detection maturity — what is theorized, what is
            static-reviewed, what has been lab-tested or field-observed.
          </p>
        </header>

        {scenarios.length === 0 ? (
          <p className="rounded border border-scn-border bg-scn-bg-2 p-6 text-sm text-scn-dim">
            No scenarios yet. Drop a JSON file into{" "}
            <code className="font-mono">src/data/scenarios/</code>.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((s) => (
              <li key={s.id}>
                <ScenarioCard scenario={s} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
