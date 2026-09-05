import Link from "next/link";

/**
 * Redesign notes (why each change was made):
 *
 * - Hero is left-aligned with an asymmetric illustration, not centered
 *   with two pill buttons. The illustration is a hand-built route-map
 *   (the same dispatch-line + pin motif from the deck/one-pager) rather
 *   than a generic gradient or floating icon — it's the one thing that's
 *   actually specific to what this product does.
 * - "Live in Nairobi — 2 doctors online" is a plain sentence with a
 *   small dot, not a bordered pill with a middle-dot meta string.
 * - Teleconsult and Home Visit are a real asymmetric pair (Teleconsult
 *   is the faster/cheaper default, so it's visually primary). Ambulance
 *   is pulled out into its own urgent strip instead of a third identical
 *   card — it's a different kind of request, not another pricing tier.
 * - Bullets are real check-icon rows, not markdown asterisks.
 * - Trust section is three short paragraphs with a quiet icon each,
 *   not a badge grid.
 * - Footer is organised into calm columns, no pipe/middle-dot chains.
 */

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg
        viewBox="0 0 20 20"
        className="w-[18px] h-[18px] mt-0.5 shrink-0 text-leaf"
        fill="none"
      >
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M6.2 10.3l2.4 2.4 5.2-5.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[15px] leading-snug text-ink/80">{children}</span>
    </li>
  );
}

function RouteMapArt() {
  return (
    <svg
      viewBox="0 0 460 400"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
          <path
            d="M46 0H0V46"
            fill="none"
            stroke="#16442C"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="460" height="400" rx="28" fill="#EFEDE1" />
      <rect width="460" height="400" rx="28" fill="url(#grid)" />

      {/* neighbourhood blocks */}
      {[
        [40, 46, 70, 54],
        [150, 40, 60, 46],
        [270, 60, 80, 50],
        [40, 260, 66, 60],
        [340, 220, 76, 56],
        [230, 300, 70, 52],
      ].map(([x, y, w, h], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={7}
          fill="#16442C"
          fillOpacity={0.09}
        />
      ))}

      {/* route line */}
      <path
        d="M62 300 C 120 300, 120 190, 190 190 S 260 110, 330 110 S 380 90, 400 70"
        fill="none"
        stroke="#3C7A56"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="1 10"
      />
      <path
        d="M62 300 C 120 300, 120 190, 190 190"
        fill="none"
        stroke="#16442C"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* origin marker (patient) */}
      <circle cx="62" cy="300" r="7" fill="#16442C" />
      <circle cx="62" cy="300" r="12" fill="#16442C" fillOpacity="0.15" />

      {/* current position (doctor en route) */}
      <g transform="translate(190,190)">
        <circle r="15" fill="#C97A3D" fillOpacity="0.18" />
        <circle r="8" fill="#C97A3D" />
        <circle r="8" fill="#C97A3D">
          <animate
            attributeName="r"
            values="8;11;8"
            dur="2.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* destination pin */}
      <g transform="translate(400,70)">
        <path
          d="M0 -22c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16z"
          fill="#16442C"
        />
        <circle cy="-6" r="6" fill="#EFEDE1" />
      </g>

      {/* small "eta" tag near current position */}
      <g transform="translate(212,168)">
        <rect
          width="72"
          height="26"
          rx="13"
          fill="#16442C"
        />
        <text
          x="36"
          y="17"
          textAnchor="middle"
          fontSize="12"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
          fill="#EFEDE1"
        >
          8 min away
        </text>
      </g>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ---------------- Header ---------------- */}
      <header className="px-4 sm:px-6 md:px-10 py-4 sm:py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-[22px] text-canopy">
              Daktari Mtaani
            </span>
            <span className="w-[7px] h-[7px] rounded-full bg-murram mb-[3px]" />
          </div>
          <nav className="flex w-full sm:w-auto items-center gap-2 sm:gap-4 text-sm">
            <Link
              href="/patient/records"
              className="min-h-11 flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg bg-canopy/[0.06] sm:bg-transparent px-3 py-2.5 text-center font-medium text-canopy hover:bg-canopy/[0.1] sm:hover:bg-canopy/[0.06] transition-colors"
            >
              My medical records
            </Link>
            <Link
              href="/patient/request"
              className="min-h-11 flex-1 sm:flex-none inline-flex items-center justify-center bg-canopy text-white text-center font-medium px-4 py-2.5 rounded-lg hover:bg-leaf transition-colors"
            >
              Request a doctor
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="px-4 sm:px-6 md:px-10 pt-10 sm:pt-14 pb-14 sm:pb-20 max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
        <div>
          <h1 className="font-display font-bold text-[2.15rem] sm:text-[2.6rem] lg:text-[3.4rem] leading-[1.05] text-canopy text-balance">
            A doctor, requested like a ride.
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink/75 max-w-md">
            Skip the clinic queue. Talk to a KMPDC-licensed doctor by video in
            under five minutes, or have one sent to wherever you are.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="/patient/request?service=teleconsult"
              className="min-h-11 bg-canopy text-white text-center font-medium px-6 py-3.5 rounded-xl hover:bg-leaf transition-colors"
            >
              Start a video consult
            </Link>
            <Link
              href="/patient/request?service=home_visit"
              className="min-h-11 border border-black/10 bg-white text-canopy text-center font-medium px-6 py-3.5 rounded-xl hover:border-canopy/40 transition-colors"
            >
              Request a home visit
            </Link>
            <Link
              href="/patient/request?service=ambulance"
              className="min-h-11 border border-murram bg-murram text-white text-center font-medium px-6 py-3.5 rounded-xl hover:bg-murram/90 transition-colors"
            >
              Request an ambulance
            </Link>
          </div>

          <p className="mt-7 flex items-center gap-2 text-sm text-ink/60">
            <span className="w-2 h-2 rounded-full bg-leaf" />
            Live in Nairobi now — 2 doctors online
          </p>
        </div>

        <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
          <RouteMapArt />
          <p className="mt-3 text-xs text-ink/45 text-center">
            Dr. Achieng, en route to Kilimani — a real dispatch, tracked live
          </p>
        </div>
      </section>

      {/* ---------------- Two ways to be seen ---------------- */}
      <section className="px-4 sm:px-6 md:px-10 py-12 sm:py-16 max-w-6xl mx-auto">
        <h2 className="font-display font-bold text-2xl md:text-[1.85rem] text-canopy">
          Two ways to be seen
        </h2>
        <p className="mt-2 text-ink/65 max-w-lg">
          One flat fee either way. Pay only once a doctor connects, through
          M-Pesa.
        </p>

        <div className="mt-7 sm:mt-9 grid lg:grid-cols-[1.15fr_1fr] gap-4 sm:gap-6">
          {/* Teleconsult — primary */}
          <div className="bg-canopy text-white rounded-[1.35rem] p-5 sm:p-8 flex flex-col shadow-[0_12px_30px_rgba(22,68,44,0.13)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4 sm:border-0 sm:pb-0">
              <span className="text-sm font-medium text-white/70">
                Under 5 minutes
              </span>
              <span className="font-display font-bold text-xl sm:text-2xl whitespace-nowrap">
                KSh 1,000
              </span>
            </div>
            <h3 className="font-display font-bold text-xl mt-4 sm:mt-5">
              Video consultation
            </h3>
            <p className="mt-2 text-white/75 text-[15px] leading-relaxed">
              A licensed doctor, on camera, from wherever you are — no app
              download, no travel.
            </p>
            <ul className="mt-5 sm:mt-6 space-y-3 flex-1">
              <li className="flex items-start gap-2.5">
                <svg viewBox="0 0 20 20" className="w-[18px] h-[18px] mt-0.5 shrink-0 text-leaf" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M6.2 10.3l2.4 2.4 5.2-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[15px] leading-snug text-white/85">Encrypted video call, right in your browser</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg viewBox="0 0 20 20" className="w-[18px] h-[18px] mt-0.5 shrink-0 text-leaf" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M6.2 10.3l2.4 2.4 5.2-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[15px] leading-snug text-white/85">Digital prescription and referral note included</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg viewBox="0 0 20 20" className="w-[18px] h-[18px] mt-0.5 shrink-0 text-leaf" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M6.2 10.3l2.4 2.4 5.2-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[15px] leading-snug text-white/85">You pay only once the doctor picks up</span>
              </li>
            </ul>
            <Link
              href="/patient/request?service=teleconsult"
              className="mt-6 sm:mt-7 min-h-12 bg-white text-canopy text-center font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              Start instant teleconsult
            </Link>
          </div>

          {/* Home visit — secondary */}
          <div className="bg-white border border-black/[0.08] rounded-[1.35rem] p-5 sm:p-8 flex flex-col shadow-[0_8px_24px_rgba(32,28,22,0.04)]">
            <div className="flex items-center justify-between gap-4 border-b border-black/[0.07] pb-4 sm:border-0 sm:pb-0">
              <span className="text-sm font-medium text-ink/55">
                Under 45 minutes
              </span>
              <span className="font-display font-bold text-xl sm:text-2xl text-canopy whitespace-nowrap">
                KSh 2,500
              </span>
            </div>
            <h3 className="font-display font-bold text-xl mt-4 sm:mt-5 text-canopy">
              Home visit
            </h3>
            <p className="mt-2 text-ink/65 text-[15px] leading-relaxed">
              A doctor or clinical officer comes to your home or office for a
              proper physical exam.
            </p>
            <ul className="mt-5 sm:mt-6 space-y-3 flex-1">
              <CheckRow>Vitals checked on-site — BP, glucose, pulse ox</CheckRow>
              <CheckRow>Live GPS tracking as the doctor makes their way to you</CheckRow>
              <CheckRow>Wound care, injections, and urgent paediatric checks</CheckRow>
            </ul>
            <Link
              href="/patient/request?service=home_visit"
              className="mt-6 sm:mt-7 min-h-12 border border-canopy text-canopy text-center font-semibold py-3 rounded-xl hover:bg-canopy hover:text-white transition-colors"
            >
              Request a home visit
            </Link>
          </div>
        </div>

        {/* Ambulance — urgent strip, not a third card */}
        <div className="mt-4 sm:mt-6 rounded-[1.35rem] bg-murram/10 border border-murram/25 px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3.5">
            <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0 text-murram" fill="none">
              <rect x="4" y="14" width="24" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
              <path d="M28 19h6l4 5v4h-10v-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="13" cy="30" r="3.2" stroke="currentColor" strokeWidth="2" />
              <circle cx="30" cy="30" r="3.2" stroke="currentColor" strokeWidth="2" />
              <path d="M13 17v8M9 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <p className="font-semibold text-canopy">
                Need urgent transport instead?
              </p>
              <p className="text-sm text-ink/65">
                Ambulance dispatch with live tracking — KSh 4,200, under 20 minutes.
              </p>
            </div>
          </div>
          <Link
            href="/patient/request?service=ambulance"
            className="min-h-11 w-full sm:w-auto shrink-0 inline-flex items-center justify-center rounded-xl bg-murram px-5 py-3 text-center text-sm font-semibold text-white hover:bg-murram/90 transition-colors"
          >
            Request ambulance
          </Link>
        </div>
      </section>

      {/* ---------------- Trust ---------------- */}
      <section className="px-4 sm:px-6 md:px-10 py-12 sm:py-16 bg-canopy/[0.04]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-canopy max-w-md">
            Why you can trust who shows up
          </h2>

          <div className="mt-9 grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <div>
              <svg viewBox="0 0 32 32" className="w-7 h-7 text-leaf mb-3" fill="none">
                <path d="M16 3l11 5v7c0 7.5-4.7 12.9-11 15-6.3-2.1-11-7.5-11-15V8l11-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M11 16l3.3 3.3L21.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[15px] leading-relaxed text-ink/75">
                Every doctor on the platform holds an active KMPDC licence,
                checked against the council register before they ever go
                online.
              </p>
            </div>
            <div>
              <svg viewBox="0 0 32 32" className="w-7 h-7 text-leaf mb-3" fill="none">
                <rect x="7" y="14" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M11 14v-3a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="20" r="1.6" fill="currentColor" />
              </svg>
              <p className="text-[15px] leading-relaxed text-ink/75">
                Your records are encrypted and access is logged, in line with
                the Data Protection Act — only your doctor can open your
                file.
              </p>
            </div>
            <div>
              <svg viewBox="0 0 32 32" className="w-7 h-7 text-leaf mb-3" fill="none">
                <rect x="4" y="8" width="24" height="17" rx="2.5" stroke="currentColor" strokeWidth="2" />
                <path d="M4 13h24" stroke="currentColor" strokeWidth="2" />
                <path d="M8 19h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-[15px] leading-relaxed text-ink/75">
                Pay by M-Pesa when the doctor connects — nothing is charged
                upfront, and nothing changes hands in cash.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="px-4 sm:px-6 md:px-10 pt-12 sm:pt-14 pb-8 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-[1.4fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-lg text-canopy">
                Daktari Mtaani
              </span>
              <span className="w-[6px] h-[6px] rounded-full bg-murram mb-[2px]" />
            </div>
            <p className="mt-3 text-sm text-ink/60 max-w-xs leading-relaxed">
              A KMPDC-registered virtual health facility. Currently piloting
              in Nairobi.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink mb-3">For clinicians</p>
            <ul className="space-y-2 text-sm text-ink/65">
              <li><Link href="/doctor/login" className="hover:text-canopy">Doctor login</Link></li>
              <li><Link href="/doctor/signup" className="hover:text-canopy">Register with KMPDC</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink mb-3">Operations</p>
            <ul className="space-y-2 text-sm text-ink/65">
              <li><Link href="/admin/login" className="hover:text-canopy">Clinical ops & admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-black/[0.06] text-xs text-ink/45">
          © 2026 Daktari Mtaani Kenya. Data handled under the Data Protection
          Act, 2019.
        </div>
      </footer>
    </div>
  );
}
