import type { FC } from 'react'

interface Props {
  className?: string
}

// ── Beaver (Trees) ────────────────────────────────────────────────────────
const Beaver: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* flat paddle tail */}
    <ellipse cx="50" cy="88" rx="16" ry="5.5" />
    <ellipse cx="50" cy="84" rx="9" ry="4.5" />
    {/* tail texture lines */}
    <line x1="38" y1="88" x2="62" y2="88" stroke="var(--background)" strokeWidth="0.8" opacity="0.35" />
    <line x1="40" y1="86" x2="60" y2="86" stroke="var(--background)" strokeWidth="0.8" opacity="0.35" />
    {/* body */}
    <ellipse cx="48" cy="62" rx="22" ry="18" />
    {/* hunchback / shoulder hump */}
    <ellipse cx="40" cy="52" rx="14" ry="10" />
    {/* belly */}
    <ellipse cx="48" cy="66" rx="12" ry="8" fill="var(--background)" opacity="0.12" />
    {/* head */}
    <path d="M34 44 Q32 28 42 22 Q52 18 60 24 Q66 30 64 44 Q62 52 56 52 Q44 52 34 44" />
    {/* small rounded ears */}
    <circle cx="38" cy="24" r="4" />
    <circle cx="60" cy="24" r="4" />
    {/* inner ears */}
    <circle cx="38" cy="24" r="2.2" fill="var(--background)" opacity="0.5" />
    <circle cx="60" cy="24" r="2.2" fill="var(--background)" opacity="0.5" />
    {/* eyes — beady and prominent, blink animation */}
    <circle cx="42" cy="33" r="4.5" fill="black" className="animal-blink" />
    <circle cx="56" cy="33" r="4.5" fill="black" className="animal-blink" />
    <circle cx="42" cy="33" r="2.8" />
    <circle cx="56" cy="33" r="2.8" />
    <circle cx="43" cy="32" r="1.2" fill="white" />
    <circle cx="57" cy="32" r="1.2" fill="white" />
    {/* muzzle / nose area */}
    <ellipse cx="49" cy="40" rx="9" ry="6" fill="var(--background)" opacity="0.2" />
    <ellipse cx="49" cy="38" r="3" />
    {/* buck teeth — large and visible */}
    <rect x="45" y="43" width="4" height="7" rx="1.5" fill="var(--background)" />
    <rect x="49.5" y="43" width="4" height="7" rx="1.5" fill="var(--background)" />
    {/* front paws */}
    <ellipse cx="32" cy="68" rx="5.5" ry="3.5" />
    <ellipse cx="64" cy="68" rx="5.5" ry="3.5" />
    {/* whiskers — thick and visible */}
    <line x1="32" y1="38" x2="20" y2="34" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    <line x1="32" y1="42" x2="20" y2="44" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    <line x1="32" y1="46" x2="22" y2="50" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    <line x1="66" y1="38" x2="78" y2="34" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    <line x1="66" y1="42" x2="78" y2="44" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    <line x1="66" y1="46" x2="78" y2="50" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
  </svg>
)

// ── Spider (Graphs) ───────────────────────────────────────────────────────
const Spider: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* abdomen — large and bulbous */}
    <ellipse cx="50" cy="58" rx="18" ry="16" />
    {/* abdomen pattern */}
    <ellipse cx="50" cy="56" rx="10" ry="8" fill="var(--background)" opacity="0.15" />
    {/* cephalothorax */}
    <ellipse cx="50" cy="36" rx="13" ry="12" />
    {/* chelicerae (fangs) */}
    <ellipse cx="43" cy="46" rx="3.5" ry="5" />
    <ellipse cx="57" cy="46" rx="3.5" ry="5" />
    {/* 8 eyes — 4 pairs, very visible */}
    <circle cx="40" cy="30" r="3.5" fill="black" />
    <circle cx="50" cy="28" r="3" fill="black" />
    <circle cx="60" cy="30" r="3.5" fill="black" />
    <circle cx="43" cy="35" r="2.5" fill="black" />
    <circle cx="57" cy="35" r="2.5" fill="black" />
    <circle cx="50" cy="32" r="2" fill="black" />
    {/* pupils */}
    <circle cx="40.8" cy="29" r="1.6" fill="white" />
    <circle cx="50.8" cy="27" r="1.3" fill="white" />
    <circle cx="60.8" cy="29" r="1.6" fill="white" />
    <circle cx="43.5" cy="34" r="1" fill="white" />
    <circle cx="57.5" cy="34" r="1" fill="white" />
    {/* 8 jointed legs — thick and visible */}
    <path d="M38 34 Q18 16 8 12" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M62 34 Q82 16 92 12" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M36 42 Q12 32 4 24" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M64 42 Q88 32 96 24" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M34 54 Q10 60 2 68" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M66 54 Q90 60 98 68" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M36 66 Q16 80 8 92" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M64 66 Q84 80 92 92" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    {/* leg joints — dots */}
    <circle cx="22" cy="22" r="2" opacity="0.4" />
    <circle cx="78" cy="22" r="2" opacity="0.4" />
    <circle cx="16" cy="38" r="2" opacity="0.4" />
    <circle cx="84" cy="38" r="2" opacity="0.4" />
    <circle cx="14" cy="58" r="2" opacity="0.4" />
    <circle cx="86" cy="58" r="2" opacity="0.4" />
  </svg>
)

// ── Bee (Dynamic Programming) ─────────────────────────────────────────────
const Bee: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* wings — translucent with veins */}
    <ellipse cx="28" cy="30" rx="20" ry="12" opacity="0.22" />
    <ellipse cx="72" cy="30" rx="20" ry="12" opacity="0.22" />
    <ellipse cx="26" cy="36" rx="13" ry="8" opacity="0.18" />
    <ellipse cx="74" cy="36" rx="13" ry="8" opacity="0.18" />
    {/* wing vein lines */}
    <line x1="14" y1="28" x2="36" y2="28" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
    <line x1="64" y1="28" x2="86" y2="28" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
    {/* body — oval abdomen */}
    <ellipse cx="50" cy="60" rx="20" ry="22" />
    {/* stripes — thick and visible */}
    <rect x="30" y="48" width="40" height="5" rx="2.5" fill="var(--background)" />
    <rect x="30" y="58" width="40" height="5" rx="2.5" fill="var(--background)" />
    <rect x="30" y="68" width="40" height="4.5" rx="2.2" fill="var(--background)" />
    {/* thorax fuzz */}
    <ellipse cx="50" cy="38" rx="14" ry="10" opacity="0.85" />
    {/* head */}
    <circle cx="50" cy="22" r="11" />
    {/* antennae — prominent */}
    <path d="M44 14 Q36 2 28 0" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M56 14 Q64 2 72 0" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <circle cx="28" cy="0" r="2.2" />
    <circle cx="72" cy="0" r="2.2" />
    {/* eyes — big compound eyes */}
    <circle cx="43" cy="20" r="4.5" fill="black" className="animal-blink" />
    <circle cx="57" cy="20" r="4.5" fill="black" className="animal-blink" />
    <circle cx="43" cy="20" r="2.8" />
    <circle cx="57" cy="20" r="2.8" />
    <circle cx="44" cy="19" r="1.2" fill="white" />
    <circle cx="58" cy="19" r="1.2" fill="white" />
    {/* stinger */}
    <path d="M50 82 L47 90 L53 90 Z" />
  </svg>
)

// ── Snake (Linked Lists) ──────────────────────────────────────────────────
const Snake: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* body — smooth coiled S-curve, tapering */}
    <path
      d="M18 82 C16 72 26 66 38 64 C50 62 42 52 54 48 C66 44 58 34 68 30 C74 28 82 30 84 36"
      stroke="currentColor"
      strokeWidth="11"
      strokeLinecap="round"
    />
    {/* belly — lighter underside */}
    <path
      d="M20 82 C18 74 28 68 38 66 C48 64 44 54 54 50"
      stroke="var(--background)"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.2"
    />
    {/* head — wider triangle */}
    <path d="M78 28 Q88 18 96 24 Q98 34 88 40 Q80 44 74 38 Q72 28 78 28" fill="currentColor" />
    {/* eye — prominent */}
    <circle cx="88" cy="28" r="4" fill="black" className="animal-blink" />
    <circle cx="88" cy="28" r="2.4" fill="white" />
    <circle cx="89" cy="27" r="1" fill="white" />
    {/* nostril */}
    <circle cx="94" cy="26" r="1.5" fill="var(--background)" opacity="0.5" />
    {/* forked tongue — red/visible */}
    <path d="M96 32 L102 28 M102 28 L104 24 M102 28 L104 32" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    {/* scale pattern along spine */}
    <circle cx="38" cy="64" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="54" cy="48" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="68" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="28" cy="72" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="46" cy="56" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="62" cy="38" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="34" cy="68" r="1.2" fill="currentColor" opacity="0.3" />
    <circle cx="50" cy="52" r="1.2" fill="currentColor" opacity="0.3" />
  </svg>
)

// ── Parrot (Strings) ──────────────────────────────────────────────────────
const Parrot: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* tail feathers — long and layered */}
    <path d="M34 70 L18 98 L32 88 L24 98 L40 86 L36 70" opacity="0.65" />
    <path d="M40 72 L30 96 L42 88" opacity="0.5" />
    <path d="M44 74 L38 94 L48 86" opacity="0.45" />
    {/* body */}
    <ellipse cx="48" cy="55" rx="18" ry="24" />
    {/* wing — detailed feathers */}
    <path d="M32 42 Q14 50 12 70 Q14 82 30 78 Q38 68 36 48" opacity="0.55" />
    <path d="M34 48 Q22 54 20 68" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.3" />
    <path d="M34 54 Q24 60 22 70" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.3" />
    {/* chest */}
    <ellipse cx="46" cy="58" rx="10" ry="14" fill="var(--background)" opacity="0.15" />
    {/* head */}
    <circle cx="52" cy="28" r="15" />
    {/* crest feathers — tall */}
    <path d="M46 14 Q48 0 56 10" stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <path d="M42 18 Q44 4 52 14" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M52 12 Q58 -2 62 10" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    {/* eye ring — large and bright */}
    <circle cx="58" cy="26" r="6.5" fill="var(--background)" opacity="0.5" />
    <circle cx="58" cy="26" r="4.5" fill="black" />
    <circle cx="58" cy="26" r="2.8" fill="white" />
    <circle cx="59" cy="25" r="1.2" fill="white" />
    {/* large hooked beak */}
    <path d="M62 28 Q76 22 80 30 Q82 40 72 44 Q66 46 62 40 Q60 32 62 28" />
    {/* beak nostril */}
    <circle cx="72" cy="28" r="1.8" fill="var(--background)" opacity="0.4" />
    {/* beak line */}
    <path d="M62 34 Q72 36 74 40" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.4" />
  </svg>
)

// ── Owl (Math) ────────────────────────────────────────────────────────────
const Owl: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* ear tufts — tall */}
    <path d="M26 10 L34 34 L18 28 Z" />
    <path d="M74 10 L66 34 L82 28 Z" />
    {/* inner ear tufts */}
    <path d="M28 14 L33 30 L22 26 Z" fill="var(--background)" opacity="0.2" />
    <path d="M72 14 L67 30 L78 26 Z" fill="var(--background)" opacity="0.2" />
    {/* head — wide with facial disc */}
    <circle cx="50" cy="40" r="24" />
    {/* facial disc — lighter */}
    <ellipse cx="50" cy="42" rx="18" ry="16" fill="var(--background)" opacity="0.2" />
    {/* facial disc outline */}
    <ellipse cx="50" cy="42" rx="18" ry="16" fill="none" stroke="var(--background)" strokeWidth="0.8" opacity="0.2" />
    {/* large forward-facing eyes — HUGE */}
    <circle cx="38" cy="38" r="10" fill="black" className="animal-blink" />
    <circle cx="62" cy="38" r="10" fill="black" className="animal-blink" />
    <circle cx="38" cy="38" r="7" fill="white" />
    <circle cx="62" cy="38" r="7" fill="white" />
    <circle cx="38" cy="38" r="4" fill="black" opacity="0.6" />
    <circle cx="62" cy="38" r="4" fill="black" opacity="0.6" />
    <circle cx="40" cy="36" r="2.5" fill="white" />
    <circle cx="64" cy="36" r="2.5" fill="white" />
    {/* beak — downward hook */}
    <path d="M46 48 L50 56 L54 48 Z" />
    {/* beak line */}
    <line x1="48" y1="50" x2="52" y2="50" stroke="var(--background)" strokeWidth="0.8" opacity="0.3" />
    {/* body */}
    <ellipse cx="50" cy="72" rx="22" ry="18" />
    {/* layered wing feathers */}
    <path d="M28 58 Q18 70 24 86 Q28 92 36 88 Q42 78 32 62" opacity="0.4" />
    <path d="M72 58 Q82 70 76 86 Q72 92 64 88 Q58 78 68 62" opacity="0.4" />
    {/* chest feather pattern — V shapes */}
    <path d="M40 62 L50 58 L60 62" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.35" />
    <path d="M38 68 L50 64 L62 68" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.35" />
    <path d="M40 74 L50 70 L60 74" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.35" />
    <path d="M42 80 L50 76 L58 80" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.3" />
    {/* feet/talons */}
    <path d="M38 88 L32 98 M38 88 L38 98 M38 88 L44 96" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M62 88 L56 96 M62 88 L62 98 M62 88 L68 98" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

// ── Fox (Greedy) ──────────────────────────────────────────────────────────
const Fox: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* bushy tail — large */}
    <path d="M66 56 Q94 30 96 46 Q98 62 82 64 Q72 64 66 58" opacity="0.65" />
    <path d="M86 44 Q98 38 96 48" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
    {/* tail tip — white */}
    <ellipse cx="92" cy="42" rx="5" ry="4" fill="var(--background)" opacity="0.3" />
    {/* body — slender */}
    <ellipse cx="46" cy="62" rx="24" ry="18" />
    {/* chest white */}
    <ellipse cx="38" cy="64" rx="12" ry="12" fill="var(--background)" opacity="0.2" />
    {/* head — triangular face */}
    <path d="M30 38 Q28 18 42 14 Q54 12 62 18 Q68 24 70 38 Q68 48 58 50 Q40 50 30 38" />
    {/* large pointed ears */}
    <path d="M30 8 L36 28 L20 24 Z" />
    <path d="M70 8 L64 28 L80 24 Z" />
    {/* inner ears — pink */}
    <path d="M32 12 L36 26 L24 22 Z" fill="var(--background)" opacity="0.4" />
    <path d="M68 12 L64 26 L76 22 Z" fill="var(--background)" opacity="0.4" />
    {/* narrow snout */}
    <path d="M40 44 Q50 52 60 44" fill="var(--background)" opacity="0.25" />
    {/* eyes — almond-shaped, sly, LARGE */}
    <ellipse cx="40" cy="30" rx="5" ry="6" fill="black" />
    <ellipse cx="60" cy="30" rx="5" ry="6" fill="black" />
    <ellipse cx="40" cy="30" rx="3" ry="5" fill="white" />
    <ellipse cx="60" cy="30" rx="3" ry="5" fill="white" />
    <circle cx="41" cy="29" r="1.8" fill="white" />
    <circle cx="61" cy="29" r="1.8" fill="white" />
    <circle cx="41.5" cy="28.5" r="0.8" fill="white" />
    <circle cx="61.5" cy="28.5" r="0.8" fill="white" />
    {/* nose */}
    <ellipse cx="50" cy="42" rx="3.5" ry="2.8" />
    {/* mouth */}
    <path d="M46 45 Q50 48 54 45" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.35" />
    {/* whiskers — long and visible */}
    <line x1="34" y1="40" x2="18" y2="34" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    <line x1="34" y1="44" x2="18" y2="44" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    <line x1="34" y1="48" x2="20" y2="54" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    <line x1="66" y1="40" x2="82" y2="34" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    <line x1="66" y1="44" x2="82" y2="44" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    <line x1="66" y1="48" x2="80" y2="54" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    {/* front legs */}
    <path d="M34 76 L32 92 L36 92 L38 78" />
    <path d="M54 76 L52 92 L56 92 L58 78" />
    {/* paw details */}
    <circle cx="34" cy="92" r="1.5" fill="var(--background)" opacity="0.2" />
    <circle cx="54" cy="92" r="1.5" fill="var(--background)" opacity="0.2" />
  </svg>
)

// ── Hawk (Binary Search) ──────────────────────────────────────────────────
const Hawk: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* left wing — spread with feathers */}
    <path d="M42 42 Q14 18 2 26 Q6 36 16 40 Q26 42 38 40" opacity="0.7" />
    <path d="M38 38 Q22 24 12 28" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.25" />
    <path d="M36 40 Q20 30 10 32" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.25" />
    {/* right wing */}
    <path d="M58 42 Q86 18 98 26 Q94 36 84 40 Q74 42 62 40" opacity="0.7" />
    <path d="M62 38 Q78 24 88 28" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.25" />
    <path d="M64 40 Q80 30 90 32" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.25" />
    {/* body — streamlined */}
    <ellipse cx="50" cy="50" rx="14" ry="22" />
    {/* breast feathers */}
    <path d="M42 46 Q50 42 58 46" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.25" />
    <path d="M42 52 Q50 48 58 52" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.25" />
    <path d="M42 58 Q50 54 58 58" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.25" />
    {/* head */}
    <circle cx="50" cy="26" r="11" />
    {/* brow ridge — fierce */}
    <path d="M40 22 L50 18 L60 22" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    {/* eyes — sharp and LARGE */}
    <circle cx="43" cy="26" r="4.5" fill="black" />
    <circle cx="57" cy="26" r="4.5" fill="black" />
    <circle cx="43" cy="26" r="2.8" fill="white" />
    <circle cx="57" cy="26" r="2.8" fill="white" />
    <circle cx="44" cy="25" r="1.4" fill="white" />
    <circle cx="58" cy="25" r="1.4" fill="white" />
    <circle cx="44.3" cy="24.5" r="0.6" fill="white" />
    <circle cx="58.3" cy="24.5" r="0.6" fill="white" />
    {/* hooked beak */}
    <path d="M50 30 L46 38 L50 35 L54 38 Z" />
    <path d="M48 34 Q50 37 52 34" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.35" />
    {/* cere (beak base) */}
    <ellipse cx="50" cy="30" rx="3" ry="1.5" fill="var(--background)" opacity="0.2" />
    {/* tail feathers — fanned */}
    <path d="M42 68 L34 92 L44 82 L50 96 L56 82 L66 92 L58 68" opacity="0.6" />
    {/* talons — detailed */}
    <path d="M42 72 L36 82 L38 79" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M42 72 L42 82 L44 79" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M42 72 L48 82 L50 79" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M58 72 L52 82 L54 79" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M58 72 L58 82 L60 79" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M58 72 L64 82 L66 79" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </svg>
)

// ── Rabbit (Hash Tables) ──────────────────────────────────────────────────
const Rabbit: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* long ears */}
    <ellipse cx="38" cy="18" rx="6.5" ry="22" transform="rotate(-5 38 18)" />
    <ellipse cx="62" cy="18" rx="6.5" ry="22" transform="rotate(5 62 18)" />
    {/* inner ears — pink */}
    <ellipse cx="38" cy="18" rx="3.5" ry="16" transform="rotate(-5 38 18)" fill="var(--background)" opacity="0.4" />
    <ellipse cx="62" cy="18" rx="3.5" ry="16" transform="rotate(5 62 18)" fill="var(--background)" opacity="0.4" />
    {/* head — round */}
    <circle cx="50" cy="44" r="20" />
    {/* cheeks — chubby */}
    <circle cx="34" cy="48" r="9" fill="var(--background)" opacity="0.2" />
    <circle cx="66" cy="48" r="9" fill="var(--background)" opacity="0.2" />
    {/* eyes — big and round, VERY visible */}
    <circle cx="40" cy="40" r="6" fill="black" className="animal-blink" />
    <circle cx="60" cy="40" r="6" fill="black" className="animal-blink" />
    <circle cx="40" cy="40" r="3.8" fill="white" />
    <circle cx="60" cy="40" r="3.8" fill="white" />
    <circle cx="41.5" cy="38.5" r="2" fill="white" />
    <circle cx="61.5" cy="38.5" r="2" fill="white" />
    <circle cx="42" cy="38" r="0.8" fill="white" />
    <circle cx="62" cy="38" r="0.8" fill="white" />
    {/* nose — twitchy */}
    <ellipse cx="50" cy="50" rx="4" ry="2.8" />
    {/* nose highlight */}
    <ellipse cx="50" cy="49" rx="2" ry="1" fill="var(--background)" opacity="0.2" />
    {/* mouth */}
    <path d="M46 52 Q50 58 54 52" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.45" />
    {/* whiskers — thick and long */}
    <line x1="26" y1="46" x2="38" y2="50" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
    <line x1="26" y1="52" x2="38" y2="52" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
    <line x1="28" y1="58" x2="38" y2="54" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
    <line x1="62" y1="50" x2="74" y2="46" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
    <line x1="62" y1="52" x2="74" y2="52" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
    <line x1="62" y1="54" x2="72" y2="58" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
    {/* body — round and soft */}
    <ellipse cx="50" cy="72" rx="22" ry="18" />
    {/* fluffy cotton tail */}
    <circle cx="50" cy="90" r="7" opacity="0.75" />
    <circle cx="47" cy="88" r="4.5" opacity="0.45" />
    {/* front paws */}
    <ellipse cx="36" cy="84" rx="5.5" ry="4" />
    <ellipse cx="64" cy="84" rx="5.5" ry="4" />
    {/* toe details */}
    <circle cx="34" cy="83" r="1.2" fill="var(--background)" opacity="0.25" />
    <circle cx="36" cy="82" r="1.2" fill="var(--background)" opacity="0.25" />
    <circle cx="38" cy="83" r="1.2" fill="var(--background)" opacity="0.25" />
  </svg>
)

// ── Squirrel (Stacks) ─────────────────────────────────────────────────────
const Squirrel: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* large bushy tail — curled up prominently */}
    <path d="M66 50 Q86 16 84 34 Q82 48 74 46 Q84 28 78 42 Q76 54 70 50" opacity="0.6" />
    <path d="M72 34 Q88 18 86 36" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
    {/* tail fur texture */}
    <path d="M80 28 Q86 22 84 32" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.25" />
    {/* body — sitting upright */}
    <ellipse cx="44" cy="64" rx="18" ry="20" />
    {/* belly */}
    <ellipse cx="42" cy="66" rx="10" ry="14" fill="var(--background)" opacity="0.18" />
    {/* head */}
    <circle cx="42" cy="38" r="16" />
    {/* small rounded ears */}
    <circle cx="30" cy="24" r="5" />
    <circle cx="54" cy="24" r="5" />
    <circle cx="30" cy="24" r="2.8" fill="var(--background)" opacity="0.4" />
    <circle cx="54" cy="24" r="2.8" fill="var(--background)" opacity="0.4" />
    {/* eyes — bright and big */}
    <circle cx="34" cy="36" r="5" fill="black" />
    <circle cx="50" cy="36" r="5" fill="black" />
    <circle cx="34" cy="36" r="3.2" fill="white" />
    <circle cx="50" cy="36" r="3.2" fill="white" />
    <circle cx="35.5" cy="34.5" r="1.8" fill="white" />
    <circle cx="51.5" cy="34.5" r="1.8" fill="white" />
    <circle cx="36" cy="34" r="0.7" fill="white" />
    <circle cx="52" cy="34" r="0.7" fill="white" />
    {/* nose */}
    <ellipse cx="42" cy="42" rx="2.5" ry="2" />
    {/* mouth */}
    <path d="M39 44 Q42 47 45 44" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.3" />
    {/* whiskers */}
    <line x1="28" y1="40" x2="36" y2="42" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    <line x1="28" y1="44" x2="36" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    <line x1="48" y1="42" x2="56" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    <line x1="48" y1="44" x2="56" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    {/* front paws holding acorn */}
    <ellipse cx="34" cy="60" rx="4" ry="3.5" />
    <ellipse cx="54" cy="60" rx="4" ry="3.5" />
    {/* acorn — visible */}
    <ellipse cx="44" cy="59" rx="4.5" ry="5.5" opacity="0.55" />
    <path d="M39.5 55 Q44 51 48.5 55" opacity="0.45" />
    {/* acorn cap texture */}
    <path d="M41 54 Q44 52 47 54" stroke="var(--background)" strokeWidth="0.6" fill="none" opacity="0.3" />
    {/* hind feet */}
    <ellipse cx="36" cy="84" rx="6" ry="3.5" />
    <ellipse cx="56" cy="84" rx="6" ry="3.5" />
  </svg>
)

// ── Sheep (Queues) ────────────────────────────────────────────────────────
const Sheep: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* fluffy wool body — overlapping circles */}
    <circle cx="30" cy="54" r="16" opacity="0.5" />
    <circle cx="48" cy="50" r="18" opacity="0.5" />
    <circle cx="66" cy="54" r="16" opacity="0.5" />
    <circle cx="38" cy="40" r="14" opacity="0.5" />
    <circle cx="58" cy="40" r="14" opacity="0.5" />
    <circle cx="48" cy="64" r="15" opacity="0.45" />
    <circle cx="48" cy="48" r="12" opacity="0.35" fill="var(--background)" />
    {/* wool texture bumps */}
    <circle cx="36" cy="46" r="4" opacity="0.15" fill="var(--background)" />
    <circle cx="58" cy="46" r="4" opacity="0.15" fill="var(--background)" />
    <circle cx="48" cy="56" r="4" opacity="0.15" fill="var(--background)" />
    {/* legs — thin and dark */}
    <rect x="32" y="72" width="4.5" height="16" rx="2" />
    <rect x="43" y="74" width="4.5" height="14" rx="2" />
    <rect x="55" y="74" width="4.5" height="14" rx="2" />
    <rect x="66" y="72" width="4.5" height="16" rx="2" />
    {/* hooves */}
    <rect x="31" y="86" width="6.5" height="4" rx="2" opacity="0.6" />
    <rect x="42" y="86" width="6.5" height="4" rx="2" opacity="0.6" />
    <rect x="54" y="86" width="6.5" height="4" rx="2" opacity="0.6" />
    <rect x="65" y="86" width="6.5" height="4" rx="2" opacity="0.6" />
    {/* head — dark face */}
    <ellipse cx="48" cy="32" rx="12" ry="14" />
    {/* wool on top of head */}
    <circle cx="42" cy="20" r="5" opacity="0.4" />
    <circle cx="48" cy="18" r="5" opacity="0.4" />
    <circle cx="54" cy="20" r="5" opacity="0.4" />
    {/* droopy ears */}
    <ellipse cx="32" cy="32" rx="7" ry="4.5" transform="rotate(-15 32 32)" opacity="0.85" />
    <ellipse cx="64" cy="32" rx="7" ry="4.5" transform="rotate(15 64 32)" opacity="0.85" />
    {/* inner ears */}
    <ellipse cx="33" cy="32" rx="4" ry="2.5" transform="rotate(-15 33 32)" fill="var(--background)" opacity="0.3" />
    <ellipse cx="63" cy="32" rx="4" ry="2.5" transform="rotate(15 63 32)" fill="var(--background)" opacity="0.3" />
    {/* eyes — gentle, LARGE */}
    <circle cx="42" cy="30" r="4" fill="black" />
    <circle cx="54" cy="30" r="4" fill="black" />
    <circle cx="42" cy="30" r="2.5" fill="white" />
    <circle cx="54" cy="30" r="2.5" fill="white" />
    <circle cx="43" cy="29" r="1.2" fill="white" />
    <circle cx="55" cy="29" r="1.2" fill="white" />
    {/* nose/mouth */}
    <ellipse cx="48" cy="38" rx="3" ry="2" fill="var(--background)" opacity="0.45" />
    <path d="M46 40 Q48 42 50 40" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.35" />
  </svg>
)

// ── Shark (Two Pointers) ──────────────────────────────────────────────────
const Shark: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* body — torpedo shape */}
    <path d="M6 50 Q6 34 22 30 Q40 26 60 30 Q82 36 90 44 Q94 48 90 52 Q82 58 60 62 Q40 64 22 60 Q6 56 6 50" />
    {/* belly — lighter */}
    <path d="M10 52 Q40 60 80 50" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.2" />
    <path d="M14 54 Q40 62 76 52" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.15" />
    {/* dorsal fin — tall and angular */}
    <path d="M50 30 L44 8 L64 30 Z" />
    {/* dorsal fin shadow */}
    <path d="M50 30 L46 14 L54 30" fill="var(--background)" opacity="0.15" />
    {/* caudal (tail) fin — crescent */}
    <path d="M88 42 L100 26 L98 44 L100 64 L88 54" />
    {/* upper tail lobe longer */}
    <path d="M88 42 L100 26 L96 42" opacity="0.7" />
    {/* pectoral fin — left */}
    <path d="M30 58 L16 72 L36 60" opacity="0.65" />
    {/* pectoral fin detail */}
    <line x1="30" y1="58" x2="20" y2="68" stroke="var(--background)" strokeWidth="0.6" opacity="0.2" />
    {/* gill slits — prominent */}
    <line x1="24" y1="42" x2="24" y2="56" stroke="var(--background)" strokeWidth="1.2" opacity="0.4" />
    <line x1="28" y1="41" x2="28" y2="57" stroke="var(--background)" strokeWidth="1.2" opacity="0.4" />
    <line x1="32" y1="40" x2="32" y2="56" stroke="var(--background)" strokeWidth="1.2" opacity="0.4" />
    {/* eye — small but clear */}
    <circle cx="18" cy="44" r="4" fill="black" />
    <circle cx="18" cy="44" r="2.5" fill="white" />
    <circle cx="19" cy="43" r="1" fill="white" />
    {/* mouth — under snout, teeth visible */}
    <path d="M8 52 Q16 56 28 52" stroke="var(--background)" strokeWidth="1.4" fill="none" opacity="0.5" />
    {/* teeth row */}
    <path d="M10 52 L12 55 M14 52 L16 55 M18 52 L20 55 M22 52 L24 55 M26 52 L28 55" stroke="var(--background)" strokeWidth="1" opacity="0.45" />
  </svg>
)

// ── Duck (Sorting) ────────────────────────────────────────────────────────
const Duck: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* tail — upturned */}
    <path d="M72 48 L90 38 L88 50 L94 44 L86 58 L72 52" opacity="0.65" />
    {/* body — rounded, buoyant */}
    <ellipse cx="52" cy="62" rx="32" ry="20" />
    {/* wing detail */}
    <path d="M38 48 Q62 42 76 50 Q70 60 52 58 Q40 56 38 48" opacity="0.35" />
    {/* wing feather lines */}
    <path d="M42 50 Q58 46 70 50" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.25" />
    <path d="M44 54 Q58 50 68 54" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.25" />
    {/* neck — graceful curve */}
    <path d="M28 48 Q22 36 24 26 Q26 20 30 18" stroke="currentColor" strokeWidth="14" fill="none" strokeLinecap="round" />
    {/* head */}
    <circle cx="26" cy="18" r="12" />
    {/* flat bill — orange/prominent */}
    <path d="M14 20 L0 18 L0 24 L14 26 Z" />
    {/* bill ridge */}
    <path d="M14 22 L0 20" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.25" />
    {/* bill nostril */}
    <circle cx="6" cy="20" r="1.8" fill="var(--background)" opacity="0.45" />
    {/* eye — big and round */}
    <circle cx="26" cy="16" r="4.5" fill="black" />
    <circle cx="26" cy="16" r="3" fill="white" />
    <circle cx="27" cy="15" r="1.5" fill="white" />
    <circle cx="27.5" cy="14.5" r="0.6" fill="white" />
    {/* cheek */}
    <circle cx="30" cy="22" r="4" fill="var(--background)" opacity="0.15" />
    {/* water line */}
    <path d="M16 78 Q35 72 55 78 Q75 84 92 78" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.18" />
  </svg>
)

// ── Octopus (Backtracking) ────────────────────────────────────────────────
const Octopus: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* head — large dome */}
    <ellipse cx="50" cy="28" rx="26" ry="24" />
    {/* head texture spots */}
    <circle cx="36" cy="22" r="3" fill="var(--background)" opacity="0.1" />
    <circle cx="50" cy="18" r="2.5" fill="var(--background)" opacity="0.1" />
    <circle cx="64" cy="22" r="3" fill="var(--background)" opacity="0.1" />
    {/* brow ridges */}
    <path d="M28 26 Q38 22 48 26" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.25" />
    <path d="M52 26 Q62 22 72 26" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.25" />
    {/* large eyes — VERY prominent */}
    <circle cx="36" cy="32" r="8" fill="black" />
    <circle cx="64" cy="32" r="8" fill="black" />
    <circle cx="36" cy="32" r="5.5" fill="white" />
    <circle cx="64" cy="32" r="5.5" fill="white" />
    <circle cx="36" cy="32" r="3" fill="black" opacity="0.6" />
    <circle cx="64" cy="32" r="3" fill="black" opacity="0.6" />
    <circle cx="38" cy="30" r="2.2" fill="white" />
    <circle cx="66" cy="30" r="2.2" fill="white" />
    <circle cx="38.5" cy="29.5" r="0.9" fill="white" />
    <circle cx="66.5" cy="29.5" r="0.9" fill="white" />
    {/* 8 tentacles — thick and flowing */}
    <path d="M26 48 Q12 62 16 80 Q20 92 14 100" stroke="currentColor" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M32 52 Q20 70 26 88 Q30 98 24 100" stroke="currentColor" strokeWidth="6.5" fill="none" strokeLinecap="round" />
    <path d="M40 54 Q34 74 38 90 Q40 98 36 100" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M50 56 Q48 78 50 92 Q52 100 50 100" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M60 54 Q66 74 62 90 Q60 98 64 100" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M68 52 Q80 70 74 88 Q70 98 76 100" stroke="currentColor" strokeWidth="6.5" fill="none" strokeLinecap="round" />
    <path d="M74 48 Q88 62 84 80 Q80 92 86 100" stroke="currentColor" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M50 56 Q64 68 70 82 Q74 92 78 98" stroke="currentColor" strokeWidth="5.5" fill="none" strokeLinecap="round" opacity="0.5" />
    {/* suckers — visible dots along tentacles */}
    <circle cx="16" cy="68" r="2" fill="var(--background)" opacity="0.35" />
    <circle cx="26" cy="80" r="2" fill="var(--background)" opacity="0.35" />
    <circle cx="38" cy="82" r="2" fill="var(--background)" opacity="0.35" />
    <circle cx="50" cy="84" r="2" fill="var(--background)" opacity="0.35" />
    <circle cx="62" cy="82" r="2" fill="var(--background)" opacity="0.35" />
    <circle cx="74" cy="80" r="2" fill="var(--background)" opacity="0.35" />
    <circle cx="84" cy="68" r="2" fill="var(--background)" opacity="0.35" />
    <circle cx="20" cy="88" r="1.5" fill="var(--background)" opacity="0.25" />
    <circle cx="70" cy="88" r="1.5" fill="var(--background)" opacity="0.25" />
  </svg>
)

// ── Crab (Bit Manipulation) ───────────────────────────────────────────────
const Crab: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* body — wide and flat */}
    <ellipse cx="50" cy="48" rx="26" ry="18" />
    {/* shell texture */}
    <ellipse cx="50" cy="46" rx="16" ry="10" fill="var(--background)" opacity="0.18" />
    {/* shell bumps */}
    <circle cx="42" cy="42" r="3" fill="var(--background)" opacity="0.12" />
    <circle cx="58" cy="42" r="3" fill="var(--background)" opacity="0.12" />
    <circle cx="50" cy="38" r="2.5" fill="var(--background)" opacity="0.12" />
    {/* prominent claws — large */}
    <path d="M24 44 L10 30 L4 24 L2 32 L8 34 L4 42 L14 38 L22 44" />
    <path d="M76 44 L90 30 L96 24 L98 32 L92 34 L96 42 L86 38 L78 44" />
    {/* claw tips */}
    <ellipse cx="4" cy="28" rx="5" ry="4" transform="rotate(-15 4 28)" opacity="0.75" />
    <ellipse cx="96" cy="28" rx="5" ry="4" transform="rotate(15 96 28)" opacity="0.75" />
    {/* 6 walking legs — jointed, thick */}
    <path d="M26 60 L14 70 L8 68" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M30 66 L20 78 L14 76" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M36 70 L28 82 L22 80" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M64 70 L72 82 L78 80" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M70 66 L80 78 L86 76" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M74 60 L86 70 L92 68" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    {/* leg joints */}
    <circle cx="14" cy="70" r="2" opacity="0.45" />
    <circle cx="20" cy="78" r="2" opacity="0.45" />
    <circle cx="28" cy="82" r="2" opacity="0.45" />
    <circle cx="72" cy="82" r="2" opacity="0.45" />
    <circle cx="80" cy="78" r="2" opacity="0.45" />
    <circle cx="86" cy="70" r="2" opacity="0.45" />
    {/* eyes on stalks — prominent */}
    <line x1="38" y1="36" x2="32" y2="18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="62" y1="36" x2="68" y2="18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="32" cy="16" r="6" />
    <circle cx="68" cy="16" r="6" />
    <circle cx="32" cy="16" r="3.5" fill="black" />
    <circle cx="68" cy="16" r="3.5" fill="black" />
    <circle cx="33" cy="15" r="1.8" fill="white" />
    <circle cx="69" cy="15" r="1.8" fill="white" />
    <circle cx="33.5" cy="14.5" r="0.7" fill="white" />
    <circle cx="69.5" cy="14.5" r="0.7" fill="white" />
    {/* mouth */}
    <path d="M46 54 Q50 58 54 54" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.4" />
  </svg>
)

// ── Turtle (Recursion) ────────────────────────────────────────────────────
const Turtle: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* shell — domed with hex pattern */}
    <ellipse cx="52" cy="48" rx="32" ry="24" />
    {/* shell hex pattern — more visible */}
    <ellipse cx="52" cy="46" rx="20" ry="14" fill="var(--background)" opacity="0.22" />
    <path d="M52 32 L52 60" stroke="var(--background)" strokeWidth="1.4" opacity="0.25" />
    <path d="M32 46 L72 46" stroke="var(--background)" strokeWidth="1.4" opacity="0.25" />
    <path d="M36 34 L68 58" stroke="var(--background)" strokeWidth="1.2" opacity="0.2" />
    <path d="M36 58 L68 34" stroke="var(--background)" strokeWidth="1.2" opacity="0.2" />
    {/* shell ridge */}
    <path d="M22 48 Q52 28 82 48" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
    {/* shell rim */}
    <path d="M22 50 Q52 72 82 50" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2" />
    {/* head — extended neck */}
    <path d="M22 48 Q12 42 8 38 Q4 34 8 32 Q14 30 20 36" />
    <circle cx="8" cy="36" r="8" />
    {/* eye — clear */}
    <circle cx="4" cy="34" r="3.5" fill="black" />
    <circle cx="4" cy="34" r="2.2" fill="white" />
    <circle cx="5" cy="33" r="1" fill="white" />
    {/* mouth */}
    <path d="M2 38 Q6 41 10 38" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.4" />
    {/* nostril */}
    <circle cx="2" cy="34" r="1" fill="var(--background)" opacity="0.4" />
    {/* front flippers */}
    <ellipse cx="26" cy="68" rx="10" ry="5" transform="rotate(-25 26 68)" />
    <ellipse cx="78" cy="68" rx="10" ry="5" transform="rotate(25 78 68)" />
    {/* flipper texture */}
    <line x1="22" y1="66" x2="18" y2="72" stroke="var(--background)" strokeWidth="0.8" opacity="0.2" />
    <line x1="28" y1="66" x2="24" y2="72" stroke="var(--background)" strokeWidth="0.8" opacity="0.2" />
    {/* back legs */}
    <ellipse cx="30" cy="74" rx="7" ry="4" transform="rotate(-15 30 74)" />
    <ellipse cx="74" cy="74" rx="7" ry="4" transform="rotate(15 74 74)" />
    {/* tail */}
    <path d="M84 50 L94 52 L92 48" />
  </svg>
)

// ── Whale (Heaps) ─────────────────────────────────────────────────────────
const Whale: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* body — large and curved */}
    <path d="M6 50 Q4 32 18 26 Q34 20 54 24 Q74 30 86 40 Q94 46 90 52 Q86 58 72 60 Q52 64 32 62 Q14 60 6 54" />
    {/* tail flukes — large */}
    <path d="M86 42 L100 28 L98 44 L100 60 L86 52" opacity="0.85" />
    {/* tail fluke detail */}
    <path d="M90 44 L98 34" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.2" />
    <path d="M90 50 L98 58" stroke="var(--background)" strokeWidth="0.8" fill="none" opacity="0.2" />
    {/* dorsal ridge */}
    <path d="M62 26 L64 18 L68 26" opacity="0.55" />
    {/* eye — small but clear */}
    <circle cx="14" cy="42" r="4" fill="black" />
    <circle cx="14" cy="42" r="2.5" fill="white" />
    <circle cx="15" cy="41" r="1.2" fill="white" />
    {/* mouth — baleen line, prominent */}
    <path d="M6 50 Q20 56 42 52 Q64 48 82 44" stroke="var(--background)" strokeWidth="1.4" fill="none" opacity="0.4" />
    {/* ventral pleats — throat grooves */}
    <path d="M10 52 Q24 60 42 56" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.22" />
    <path d="M12 54 Q26 62 44 58" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.22" />
    <path d="M14 56 Q28 64 46 60" stroke="var(--background)" strokeWidth="1" fill="none" opacity="0.2" />
    {/* pectoral fin */}
    <path d="M26 54 Q18 64 20 74 Q24 80 32 72 Q36 62 30 54" opacity="0.55" />
    {/* fin detail */}
    <line x1="26" y1="56" x2="22" y2="68" stroke="var(--background)" strokeWidth="0.8" opacity="0.2" />
    <line x1="28" y1="58" x2="24" y2="70" stroke="var(--background)" strokeWidth="0.8" opacity="0.2" />
    {/* blowhole spout */}
    <path d="M28 24 L22 8 M28 24 L28 4 M28 24 L34 8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.28" strokeLinecap="round" />
    <circle cx="22" cy="6" r="3" opacity="0.18" />
    <circle cx="28" cy="2" r="4" opacity="0.18" />
    <circle cx="34" cy="6" r="3" opacity="0.18" />
    {/* belly */}
    <ellipse cx="34" cy="56" rx="22" ry="7" fill="var(--background)" opacity="0.12" />
  </svg>
)

// ── Frog (Divide & Conquer) ───────────────────────────────────────────────
const Frog: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* body — crouching, low and wide */}
    <ellipse cx="50" cy="62" rx="30" ry="16" />
    {/* throat/chest */}
    <ellipse cx="50" cy="66" rx="18" ry="10" fill="var(--background)" opacity="0.18" />
    {/* big bulging eyes on top — HUGE */}
    <circle cx="30" cy="30" r="14" className="animal-blink" />
    <circle cx="70" cy="30" r="14" className="animal-blink" />
    {/* eye whites */}
    <circle cx="30" cy="28" r="10" fill="var(--background)" />
    <circle cx="70" cy="28" r="10" fill="var(--background)" />
    {/* pupils — vertical slits, very visible (black) */}
    <ellipse cx="30" cy="28" rx="4" ry="8.5" fill="black" />
    <ellipse cx="70" cy="28" rx="4" ry="8.5" fill="black" />
    {/* pupil highlight */}
    <circle cx="32" cy="24" r="2.5" fill="var(--background)" />
    <circle cx="72" cy="24" r="2.5" fill="var(--background)" />
    <circle cx="31" cy="26" r="1" />
    <circle cx="71" cy="26" r="1" />
    {/* eyelid line */}
    <path d="M18 26 Q30 18 42 26" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
    <path d="M58 26 Q70 18 82 26" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
    {/* wide mouth — very visible */}
    <path d="M18 54 Q34 62 50 58 Q66 62 82 54" stroke="var(--background)" strokeWidth="2" fill="none" opacity="0.45" />
    {/* nostrils */}
    <circle cx="40" cy="50" r="2.5" fill="var(--background)" opacity="0.45" />
    <circle cx="60" cy="50" r="2.5" fill="var(--background)" opacity="0.45" />
    {/* powerful hind legs — folded */}
    <path d="M24 70 Q12 78 6 90 L10 94 Q20 86 28 74" />
    <path d="M76 70 Q88 78 94 90 L90 94 Q80 86 72 74" />
    {/* hind feet — webbed, large */}
    <path d="M6 90 L0 98 M6 90 L4 100 M6 90 L10 100" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M94 90 L100 98 M94 90 L96 100 M94 90 L90 100" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* front legs */}
    <ellipse cx="26" cy="74" rx="5" ry="4" />
    <ellipse cx="74" cy="74" rx="5" ry="4" />
    {/* front feet — webbed */}
    <path d="M24 76 L18 84 M24 76 L22 86 M24 76 L28 84" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M76 76 L82 84 M76 76 L78 86 M76 76 L72 84" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* skin texture */}
    <circle cx="40" cy="58" r="2" fill="var(--background)" opacity="0.1" />
    <circle cx="60" cy="58" r="2" fill="var(--background)" opacity="0.1" />
    <circle cx="50" cy="64" r="2" fill="var(--background)" opacity="0.1" />
  </svg>
)

// ── Cat (Implementation) ──────────────────────────────────────────────────
const Cat: FC<Props> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    {/* tail — long and curved */}
    <path d="M72 58 Q96 38 98 52 Q100 66 88 62 Q82 58 78 60" strokeWidth="6" stroke="currentColor" fill="none" strokeLinecap="round" />
    {/* tail tip curl */}
    <circle cx="88" cy="58" r="3" opacity="0.6" />
    {/* body — sitting */}
    <ellipse cx="50" cy="66" rx="22" ry="20" />
    {/* chest — lighter */}
    <ellipse cx="46" cy="62" rx="12" ry="14" fill="var(--background)" opacity="0.18" />
    {/* belly */}
    <ellipse cx="50" cy="72" rx="14" ry="10" fill="var(--background)" opacity="0.1" />
    {/* head — round */}
    <circle cx="50" cy="34" r="18" />
    {/* pointed ears — tall */}
    <path d="M32 10 L38 30 L22 26 Z" />
    <path d="M68 10 L62 30 L78 26 Z" />
    {/* inner ears — pink, visible */}
    <path d="M34 14 L38 28 L26 24 Z" fill="var(--background)" opacity="0.4" />
    <path d="M66 14 L62 28 L74 24 Z" fill="var(--background)" opacity="0.4" />
    {/* eyes — almond shaped, large and alert */}
    <ellipse cx="40" cy="32" rx="6" ry="7.5" fill="black" className="animal-blink" />
    <ellipse cx="60" cy="32" rx="6" ry="7.5" fill="black" className="animal-blink" />
    {/* green/light iris ring */}
    <ellipse cx="40" cy="32" rx="5" ry="6.5" fill="#4ade80" />
    <ellipse cx="60" cy="32" rx="5" ry="6.5" fill="#4ade80" />
    {/* vertical slit pupils (black) */}
    <ellipse cx="40" cy="32" rx="2.5" ry="7" fill="black" />
    <ellipse cx="60" cy="32" rx="2.5" ry="7" fill="black" />
    <circle cx="41.5" cy="29" r="2.5" fill="white" />
    <circle cx="61.5" cy="29" r="2.5" fill="white" />
    <circle cx="42" cy="28" r="1" />
    <circle cx="62" cy="28" r="1" />
    {/* nose — small pink triangle */}
    <path d="M47 40 L50 44 L53 40 Z" />
    {/* nose highlight */}
    <path d="M48 41 L50 43 L52 41" fill="var(--background)" opacity="0.2" />
    {/* mouth */}
    <path d="M45 44 Q50 48 55 44" stroke="var(--background)" strokeWidth="1.2" fill="none" opacity="0.45" />
    {/* whiskers — long and prominent */}
    <line x1="24" y1="36" x2="38" y2="40" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    <line x1="24" y1="42" x2="38" y2="42" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    <line x1="24" y1="48" x2="38" y2="44" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    <line x1="62" y1="40" x2="76" y2="36" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    <line x1="62" y1="42" x2="76" y2="42" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    <line x1="62" y1="44" x2="76" y2="48" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    {/* front paws */}
    <ellipse cx="36" cy="84" rx="6.5" ry="4.5" />
    <ellipse cx="64" cy="84" rx="6.5" ry="4.5" />
    {/* paw pads */}
    <circle cx="33" cy="83" r="1.8" fill="var(--background)" opacity="0.3" />
    <circle cx="36" cy="81.5" r="1.8" fill="var(--background)" opacity="0.3" />
    <circle cx="39" cy="83" r="1.8" fill="var(--background)" opacity="0.3" />
    <circle cx="36" cy="86" r="2.2" fill="var(--background)" opacity="0.2" />
    <circle cx="61" cy="83" r="1.8" fill="var(--background)" opacity="0.3" />
    <circle cx="64" cy="81.5" r="1.8" fill="var(--background)" opacity="0.3" />
    <circle cx="67" cy="83" r="1.8" fill="var(--background)" opacity="0.3" />
    <circle cx="64" cy="86" r="2.2" fill="var(--background)" opacity="0.2" />
  </svg>
)
// ── Map: badge ID → animal SVG component ──────────────────────────────────
const ANIMAL_SVG: Record<string, FC<Props>> = {
  trees: Beaver,
  graphs: Spider,
  dp: Bee,
  'linked-list': Snake,
  strings: Parrot,
  math: Owl,
  greedy: Fox,
  'binary-search': Hawk,
  'hash-table': Rabbit,
  stack: Squirrel,
  queue: Sheep,
  'two-pointers': Shark,
  sorting: Duck,
  backtracking: Octopus,
  'bit-manipulation': Crab,

  recursion: Turtle,
  heap: Whale,
  'divide-conquer': Frog,
  implementation: Cat,
}

// ── Per-animal ambient effect ──────────────────────────────────────────────
const ANIMAL_EFFECTS: Record<string, string> = {
  trees: 'leaf',
  graphs: 'bubble',
  dp: 'sparkle',
  'linked-list': 'dust',
  strings: 'bubble',
  math: 'pulse-ring',
  greedy: 'none',
  'binary-search': 'none',
  'hash-table': 'dust',
  stack: 'leaf',
  queue: 'none',
  'two-pointers': 'bubble',
  sorting: 'leaf',
  backtracking: 'sparkle',
  'bit-manipulation': 'dust',
  recursion: 'leaf',
  heap: 'bubble',
  'divide-conquer': 'leaf',
  implementation: 'none',
}

// ── CSS animation per animal theme ────────────────────────────────────────
const ANIMATIONS: Record<string, string> = {
  trees: 'animal-rock',
  graphs: 'animal-spin-slow',
  dp: 'animal-buzz',
  'linked-list': 'animal-slither',
  strings: 'animal-bob',
  math: 'animal-head-tilt',
  greedy: 'animal-dart',
  'binary-search': 'animal-pulse',
  'hash-table': 'animal-hop',
  stack: 'animal-bob',
  queue: 'animal-march',
  'two-pointers': 'animal-swim',
  sorting: 'animal-float',
  backtracking: 'animal-wave',
  'bit-manipulation': 'animal-scuttle',
  recursion: 'animal-crawl',
  heap: 'animal-dive',
  'divide-conquer': 'animal-spring',
  implementation: 'animal-wiggle',
}

export function AnimalAvatar({
  badgeId,
  size = 64,
  className = '',
}: {
  badgeId: string
  size?: number
  className?: string
}) {
  const AnimalSvg = ANIMAL_SVG[badgeId]
  const anim = ANIMATIONS[badgeId] ?? 'animal-float'
  const effect = ANIMAL_EFFECTS[badgeId] ?? 'none'

  if (!AnimalSvg) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-primary/15 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xl font-bold">?</span>
      </div>
    )
  }

  const effectComponent = effect === 'sparkle' ? (
    <div className="animal-sparkle" style={{ left: '20%', top: '20%' }} />
  ) : effect === 'bubble' ? (
    <div className="animal-bubble" style={{ left: '60%', bottom: '10%' }} />
  ) : effect === 'dust' ? (
    <div className="animal-dust" style={{ left: '10%', top: '50%' }} />
  ) : effect === 'leaf' ? (
    <div className="animal-leaf" style={{ left: '70%', top: '15%' }} />
  ) : effect === 'pulse-ring' ? (
    <div className="animal-pulse-ring" />
  ) : null

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary/15 text-primary ${className} animal-wrapper`}
      style={{ width: size, height: size }}
    >
      <div className={anim} style={{ width: size * 0.75, height: size * 0.75 }}>
        <AnimalSvg className="h-full w-full" />
      </div>
      {effectComponent}
    </div>
  )
}