import { LEGAL_INFO } from "@/utils/legal";

export function LegalNotice() {
  return (
    <section
      id="impressum"
      aria-labelledby="impressum-heading"
      className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl"
    >
      <div className="text-sm text-gray-300 leading-relaxed">
        <h2 id="impressum-heading" className="text-base font-semibold text-gray-100 mt-4 mb-2 first:mt-0">
          Impressum
        </h2>
        <p>Angaben gemäß § 5 DDG</p>

        <address className="not-italic mt-4">
          <p>{LEGAL_INFO.name}</p>
          <p>{LEGAL_INFO.addressLine1}</p>
          <p>{LEGAL_INFO.addressLine2}</p>
          <p>{LEGAL_INFO.addressLine3}</p>
        </address>

        <p className="mt-4">Vertreten durch: {LEGAL_INFO.representative}</p>

        <div className="mt-4">
          <p>Kontakt:</p>
          <p>Telefon: {LEGAL_INFO.phone}</p>
          <p>
            E-Mail:{" "}
            <a href={`mailto:${LEGAL_INFO.email}`} className="text-cyan-400 hover:text-cyan-300">
              {LEGAL_INFO.email}
            </a>
          </p>
        </div>

        <h3 className="text-base font-semibold text-gray-100 mt-4 mb-2">
          Verbraucherstreitbeilegung / Universalschlichtungsstelle
        </h3>
        <p>
          Wir nehmen nicht an Streitbeilegungsverfahren vor einer Verbraucher-schlichtungsstelle teil und sind dazu
          auch nicht verpflichtet.
        </p>
      </div>
    </section>
  );
}
