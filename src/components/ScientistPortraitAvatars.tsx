// ============================================================================
// VIGYANPREP SCIENTIST EDITORIAL SKETCH AVATARS
// Indian Express / Wall Street Journal Hedcut & Pen-and-Ink Editorial Portraits
// ============================================================================

export interface ScientistAvatarMeta {
  id: string;
  name: string;
  shortName: string;
  field: string;
  bio: string;
  era: string;
  bgGradient: string;
  borderTint: string;
  accentColor: string;
}

export const SCIENTIST_PERSONAS: ScientistAvatarMeta[] = [
  {
    id: 'ramanujan',
    name: 'Srinivasa Ramanujan',
    shortName: 'Ramanujan',
    field: 'Pure Mathematics',
    bio: 'Number Theory, Modular Equations & Infinite Series Genius',
    era: '1887 – 1920',
    bgGradient: 'from-amber-100 to-orange-100',
    borderTint: 'border-amber-700/30',
    accentColor: '#9a3412'
  },
  {
    id: 'kalam',
    name: 'A. P. J. Abdul Kalam',
    shortName: 'Dr. Kalam',
    field: 'Aerospace & Defence',
    bio: 'Missile Pioneer, Indian Space Visionary & People\'s President',
    era: '1931 – 2015',
    bgGradient: 'from-blue-100 to-cyan-100',
    borderTint: 'border-blue-700/30',
    accentColor: '#0369a1'
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    shortName: 'Einstein',
    field: 'Theoretical Physics',
    bio: 'General Relativity, Photoelectric Effect & Quantum Foundations',
    era: '1879 – 1955',
    bgGradient: 'from-indigo-100 to-violet-100',
    borderTint: 'border-indigo-700/30',
    accentColor: '#4338ca'
  },
  {
    id: 'curie',
    name: 'Marie Curie',
    shortName: 'Marie Curie',
    field: 'Radioactivity & Chemistry',
    bio: 'Discoverer of Polonium & Radium, 2x Nobel Laureate',
    era: '1867 – 1934',
    bgGradient: 'from-emerald-100 to-teal-100',
    borderTint: 'border-emerald-700/30',
    accentColor: '#047857'
  },
  {
    id: 'raman',
    name: 'C. V. Raman',
    shortName: 'C. V. Raman',
    field: 'Optics & Spectroscopy',
    bio: 'Discoverer of the Raman Scattering Effect & Nobel Laureate',
    era: '1888 – 1970',
    bgGradient: 'from-yellow-100 to-amber-100',
    borderTint: 'border-yellow-700/30',
    accentColor: '#b45309'
  },
  {
    id: 'feynman',
    name: 'Richard Feynman',
    shortName: 'Feynman',
    field: 'Quantum Electrodynamics',
    bio: 'Path Integrals, Quantum Diagrams & Physics Storyteller',
    era: '1918 – 1988',
    bgGradient: 'from-purple-100 to-pink-100',
    borderTint: 'border-purple-700/30',
    accentColor: '#7e22ce'
  },
  {
    id: 'franklin',
    name: 'Rosalind Franklin',
    shortName: 'R. Franklin',
    field: 'Biophysics & DNA',
    bio: 'X-ray Crystallography & Photo 51 DNA Double Helix',
    era: '1920 – 1958',
    bgGradient: 'from-rose-100 to-pink-100',
    borderTint: 'border-rose-700/30',
    accentColor: '#be123c'
  },
  {
    id: 'bose',
    name: 'J. C. Bose',
    shortName: 'J. C. Bose',
    field: 'Microwaves & Plant Biology',
    bio: 'Father of Millimeter Waves, Radio Science & Crescograph',
    era: '1858 – 1937',
    bgGradient: 'from-emerald-100 to-lime-100',
    borderTint: 'border-emerald-700/30',
    accentColor: '#15803d'
  },
  {
    id: 'newton',
    name: 'Isaac Newton',
    shortName: 'Newton',
    field: 'Classical Mechanics & Calculus',
    bio: 'Universal Gravitation, Laws of Motion & Optics',
    era: '1643 – 1727',
    bgGradient: 'from-slate-200 to-stone-200',
    borderTint: 'border-slate-700/30',
    accentColor: '#334155'
  },
  {
    id: 'galileo',
    name: 'Galileo Galilei',
    shortName: 'Galileo',
    field: 'Observational Astronomy',
    bio: 'Father of Modern Physics, Telescopic Astronomy & Kinematics',
    era: '1564 – 1642',
    bgGradient: 'from-sky-100 to-slate-100',
    borderTint: 'border-sky-700/30',
    accentColor: '#0284c7'
  },
  {
    id: 'bhabha',
    name: 'Homi J. Bhabha',
    shortName: 'Homi Bhabha',
    field: 'Cosmic Rays & Nuclear Physics',
    bio: 'Architect of India\'s Atomic Energy Programme & TIFR Founder',
    era: '1909 – 1966',
    bgGradient: 'from-amber-100 to-stone-100',
    borderTint: 'border-amber-800/30',
    accentColor: '#78350f'
  },
  {
    id: 'chandra',
    name: 'S. Chandrasekhar',
    shortName: 'Chandrasekhar',
    field: 'Astrophysics & Black Holes',
    bio: 'Chandrasekhar Limit & Stellar Structure Nobel Laureate',
    era: '1910 – 1995',
    bgGradient: 'from-violet-100 to-indigo-100',
    borderTint: 'border-violet-800/30',
    accentColor: '#5b21b6'
  }
];

interface AvatarProps {
  id?: string;
  size?: number | string;
  className?: string;
  showBadge?: boolean;
}

/**
 * 🖋️ Indian Express / Wall Street Journal Hedcut Editorial Sketch Avatar
 */
export function ScientistAvatar({ id = 'ramanujan', size = 48, className = '', showBadge = false }: AvatarProps) {
  const persona = SCIENTIST_PERSONAS.find(p => p.id === id) || SCIENTIST_PERSONAS[0];

  const renderSketch = () => {
    switch (persona.id) {
      case 'ramanujan':
        return (
          <g>
            {/* Mathematical background motif (Infinite Partition Formula & Pi) */}
            <path d="M 20,25 Q 35,20 45,30 T 70,22" stroke="#b45309" strokeWidth="0.75" strokeDasharray="1.5 1.5" opacity="0.4" fill="none" />
            <text x="65" y="24" fontSize="6.5" fontFamily="serif" fontStyle="italic" fill="#b45309" opacity="0.6">p(n) ~ e^{`\\pi\\sqrt{n}`}</text>
            <text x="14" y="86" fontSize="7" fontFamily="serif" fontStyle="italic" fill="#b45309" opacity="0.5">1/π = ∑...</text>
            {/* Head & Hair (Traditional slicked black hair) */}
            <path d="M 32,46 Q 30,26 50,24 Q 70,26 68,46 Q 70,68 50,72 Q 30,68 32,46 Z" fill="#fff7ed" stroke="#431407" strokeWidth="1.6" />
            <path d="M 31,38 Q 33,23 50,23 Q 67,23 69,38 Q 60,26 50,28 Q 38,26 31,38 Z" fill="#292524" />
            {/* Forehead caste mark (Tilak / Namam subtle etching) */}
            <line x1="50" y1="31" x2="50" y2="40" stroke="#b91c1c" strokeWidth="1.2" />
            <circle cx="50" cy="42" r="0.8" fill="#b45309" />
            {/* Intense, penetrating Genius Eyes */}
            <ellipse cx="42" cy="44" rx="3.5" ry="2.2" fill="#fff" stroke="#1c1917" strokeWidth="1" />
            <circle cx="42" cy="44" r="1.6" fill="#1c1917" />
            <ellipse cx="58" cy="44" rx="3.5" ry="2.2" fill="#fff" stroke="#1c1917" strokeWidth="1" />
            <circle cx="58" cy="44" r="1.6" fill="#1c1917" />
            {/* Thick expressive Eyebrows */}
            <path d="M 37,40 Q 42,37 47,40" stroke="#1c1917" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M 53,40 Q 58,37 63,40" stroke="#1c1917" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            {/* Sharp Indian features: Nose & Calm focused lips */}
            <path d="M 50,42 L 50,52 L 47,54 L 53,54" stroke="#431407" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <path d="M 44,61 Q 50,64 56,61" stroke="#78350f" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M 46,64 Q 50,66 54,64" stroke="#78350f" strokeWidth="0.8" fill="none" />
            {/* High collar Cambridge/Madras formal black blazer */}
            <path d="M 28,73 L 38,66 L 50,71 L 62,66 L 72,73 L 78,92 L 22,92 Z" fill="#292524" stroke="#1c1917" strokeWidth="1.5" />
            <path d="M 44,68 L 50,78 L 56,68" stroke="#fef3c7" strokeWidth="1.2" fill="#fff" />
            {/* Stipple & Cross-hatching shadow */}
            <path d="M 33,52 L 35,56 M 34,50 L 36,54 M 64,50 L 66,54 M 65,52 L 67,56" stroke="#b45309" strokeWidth="0.6" />
          </g>
        );

      case 'kalam':
        return (
          <g>
            {/* Aerospace rocket & SLV trajectory background */}
            <path d="M 18,85 Q 35,60 82,18" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.4" />
            <polygon points="82,18 76,21 80,25" fill="#0284c7" opacity="0.6" />
            <text x="14" y="24" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold" fill="#0284c7" opacity="0.6">SLV-3 · AGNI</text>
            {/* Head Contour */}
            <path d="M 33,46 Q 32,28 50,26 Q 68,28 67,46 Q 68,70 50,72 Q 32,70 33,46 Z" fill="#fef2f2" stroke="#1e293b" strokeWidth="1.6" />
            {/* Iconic parted silver-grey hair framing face */}
            <path d="M 28,34 Q 30,20 50,20 Q 70,20 72,34 Q 67,24 50,25 Q 33,24 28,34 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
            <path d="M 28,34 Q 26,48 31,56 Q 30,42 34,36 Z" fill="#cbd5e1" />
            <path d="M 72,34 Q 74,48 69,56 Q 70,42 66,36 Z" fill="#cbd5e1" />
            {/* Warm, inspiring smile & spectacles */}
            <rect x="36" y="39" width="11" height="8" rx="2" fill="none" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="53" y="39" width="11" height="8" rx="2" fill="none" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="47" y1="42" x2="53" y2="42" stroke="#0f172a" strokeWidth="1.2" />
            {/* Kind twinkle in eyes */}
            <circle cx="41.5" cy="43" r="1.4" fill="#0f172a" />
            <circle cx="58.5" cy="43" r="1.4" fill="#0f172a" />
            {/* Nose & Warm Gentle Smile */}
            <path d="M 50,43 L 50,53 L 47,54 L 53,54" stroke="#475569" strokeWidth="1" fill="none" />
            <path d="M 42,61 Q 50,67 58,61" stroke="#0f172a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            {/* Bandhgala / Presidential Nehru Suit */}
            <path d="M 26,74 L 38,67 L 50,71 L 62,67 L 74,74 L 80,92 L 20,92 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="50" y1="71" x2="50" y2="92" stroke="#64748b" strokeWidth="1" />
            <circle cx="50" cy="76" r="1" fill="#e2e8f0" />
            <circle cx="50" cy="83" r="1" fill="#e2e8f0" />
          </g>
        );

      case 'einstein':
        return (
          <g>
            {/* E = mc^2 chalk background */}
            <text x="14" y="24" fontSize="7.5" fontFamily="serif" fontStyle="italic" fontWeight="bold" fill="#4338ca" opacity="0.45">E = mc²</text>
            <text x="68" y="86" fontSize="6.5" fontFamily="serif" fontStyle="italic" fill="#4338ca" opacity="0.4">hν = K + Φ</text>
            {/* Iconic wild fluffy hair */}
            <path d="M 22,46 Q 16,28 32,18 Q 50,14 68,18 Q 84,28 78,46 Q 84,62 76,70 Q 64,80 50,76 Q 36,80 24,70 Q 16,60 22,46 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
            {/* Face */}
            <path d="M 33,44 Q 32,32 50,30 Q 68,32 67,44 Q 68,68 50,70 Q 32,68 33,44 Z" fill="#fffbeb" stroke="#334155" strokeWidth="1.4" />
            {/* Forehead wrinkles (Deep thinker) */}
            <path d="M 40,34 Q 50,32 60,34" stroke="#64748b" strokeWidth="0.8" fill="none" />
            <path d="M 42,37 Q 50,35 58,37" stroke="#64748b" strokeWidth="0.8" fill="none" />
            {/* Deep soulful eyes */}
            <ellipse cx="42" cy="45" rx="3.5" ry="2.2" fill="#fff" stroke="#1e293b" strokeWidth="1" />
            <circle cx="42" cy="45" r="1.5" fill="#1e293b" />
            <ellipse cx="58" cy="45" rx="3.5" ry="2.2" fill="#fff" stroke="#1e293b" strokeWidth="1" />
            <circle cx="58" cy="45" r="1.5" fill="#1e293b" />
            {/* Iconic bushy mustache */}
            <path d="M 38,58 Q 45,55 50,57 Q 55,55 62,58 Q 56,64 50,62 Q 44,64 38,58 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            {/* Tweed coat & open collar */}
            <path d="M 26,74 L 38,68 L 50,74 L 62,68 L 74,74 L 80,92 L 20,92 Z" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 44,70 L 50,80 L 56,70" fill="#f8fafc" />
          </g>
        );

      case 'curie':
        return (
          <g>
            {/* Radioactivity radiation rays & 226Ra */}
            <circle cx="50" cy="50" r="42" stroke="#059669" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.35" fill="none" />
            <text x="14" y="24" fontSize="7" fontFamily="serif" fontWeight="bold" fill="#059669" opacity="0.5">²²⁶Ra · ²¹⁰Po</text>
            {/* Victorian hair updo */}
            <ellipse cx="50" cy="28" rx="16" ry="12" fill="#334155" />
            {/* Serene, resolute face profile */}
            <path d="M 34,46 Q 33,32 50,30 Q 67,32 66,46 Q 66,68 50,70 Q 34,68 34,46 Z" fill="#ecfdf5" stroke="#1e293b" strokeWidth="1.5" />
            {/* Focused, brilliant eyes */}
            <ellipse cx="43" cy="44" rx="3.2" ry="2" fill="#fff" stroke="#0f172a" strokeWidth="1" />
            <circle cx="43" cy="44" r="1.4" fill="#0f172a" />
            <ellipse cx="57" cy="44" rx="3.2" ry="2" fill="#fff" stroke="#0f172a" strokeWidth="1" />
            <circle cx="57" cy="44" r="1.4" fill="#0f172a" />
            {/* Gentle composed mouth */}
            <path d="M 45,61 Q 50,63 55,61" stroke="#0f172a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Black laboratory robe */}
            <path d="M 28,73 L 40,66 L 50,70 L 60,66 L 72,73 L 78,92 L 22,92 Z" fill="#0f172a" stroke="#047857" strokeWidth="1.2" />
            <path d="M 44,67 L 50,76 L 56,67" stroke="#6ee7b7" strokeWidth="1" fill="#fff" />
          </g>
        );

      case 'raman':
        return (
          <g>
            {/* Raman Scattering Ray Diagram */}
            <line x1="16" y1="24" x2="38" y2="40" stroke="#d97706" strokeWidth="1.2" opacity="0.6" />
            <line x1="38" y1="40" x2="20" y2="70" stroke="#d97706" strokeWidth="1" opacity="0.4" />
            <line x1="38" y1="40" x2="80" y2="28" stroke="#2563eb" strokeWidth="1.4" opacity="0.6" />
            <text x="60" y="24" fontSize="6.5" fontFamily="serif" fontStyle="italic" fill="#d97706" opacity="0.6">ν₀ ± νₘ</text>
            {/* Royal Mysore Turban */}
            <path d="M 28,34 Q 30,16 50,14 Q 70,16 72,34 Q 68,26 50,28 Q 32,26 28,34 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <path d="M 28,34 Q 50,22 72,34 Q 60,38 50,38 Q 40,38 28,34 Z" fill="#d97706" />
            <circle cx="50" cy="22" r="2.5" fill="#fef3c7" stroke="#78350f" strokeWidth="1" />
            {/* Noble face */}
            <path d="M 34,44 Q 33,34 50,34 Q 67,34 66,44 Q 67,68 50,70 Q 33,68 34,44 Z" fill="#fffbeb" stroke="#451a03" strokeWidth="1.5" />
            {/* Penetrating gaze */}
            <ellipse cx="43" cy="44" rx="3.5" ry="2.2" fill="#fff" stroke="#1c1917" strokeWidth="1" />
            <circle cx="43" cy="44" r="1.6" fill="#1c1917" />
            <ellipse cx="57" cy="44" rx="3.5" ry="2.2" fill="#fff" stroke="#1c1917" strokeWidth="1" />
            <circle cx="57" cy="44" r="1.6" fill="#1c1917" />
            {/* Clean mustache & strong jaw */}
            <path d="M 42,56 Q 50,54 58,56 Q 54,60 50,59 Q 46,60 42,56 Z" fill="#292524" />
            {/* Formal coat and collar */}
            <path d="M 26,73 L 38,66 L 50,71 L 62,66 L 74,73 L 80,92 L 20,92 Z" fill="#1c1917" stroke="#451a03" strokeWidth="1.4" />
            <polygon points="46,67 50,74 54,67" fill="#fff" />
          </g>
        );

      case 'feynman':
        return (
          <g>
            {/* Feynman Diagram (Electron-Positron Annihilation) */}
            <path d="M 16,22 L 36,36 L 16,50" stroke="#7e22ce" strokeWidth="1.2" fill="none" opacity="0.45" />
            <path d="M 36,36 Q 50,32 60,36 T 84,36" stroke="#7e22ce" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.5" />
            <text x="64" y="24" fontSize="6.5" fontFamily="serif" fontStyle="italic" fill="#7e22ce" opacity="0.5">⟨f|e⁻ⁱᴴᵗ|i⟩</text>
            {/* Playful charismatic hair */}
            <path d="M 30,38 Q 32,20 50,20 Q 68,20 70,38 Q 66,28 50,29 Q 34,28 30,38 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
            {/* Face */}
            <path d="M 34,44 Q 33,32 50,30 Q 67,32 66,44 Q 67,68 50,70 Q 33,68 34,44 Z" fill="#fdf4ff" stroke="#3b0764" strokeWidth="1.4" />
            {/* Curious, sparkling eyes */}
            <ellipse cx="43" cy="43" rx="3.4" ry="2.2" fill="#fff" stroke="#1e293b" strokeWidth="1" />
            <circle cx="43" cy="43" r="1.5" fill="#1e293b" />
            <ellipse cx="57" cy="43" rx="3.4" ry="2.2" fill="#fff" stroke="#1e293b" strokeWidth="1" />
            <circle cx="57" cy="43" r="1.5" fill="#1e293b" />
            {/* Trademark witty grin */}
            <path d="M 43,59 Q 50,65 58,58" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Open collar shirt */}
            <path d="M 28,73 L 42,66 L 50,74 L 58,66 L 72,73 L 78,92 L 22,92 Z" fill="#581c87" stroke="#3b0764" strokeWidth="1.2" />
          </g>
        );

      case 'franklin':
        return (
          <g>
            {/* Photo 51 X-ray diffraction cross pattern */}
            <line x1="20" y1="20" x2="80" y2="80" stroke="#be123c" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#be123c" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="50" cy="50" r="18" stroke="#be123c" strokeWidth="0.75" opacity="0.3" fill="none" />
            {/* 1950s stylish wavy hair */}
            <path d="M 30,42 Q 32,24 50,22 Q 68,24 70,42 Q 66,30 50,30 Q 34,30 30,42 Z" fill="#3f3f46" stroke="#18181b" strokeWidth="1.2" />
            {/* Sharp, observant face */}
            <path d="M 34,44 Q 33,32 50,30 Q 67,32 66,44 Q 66,68 50,70 Q 34,68 34,44 Z" fill="#fff1f2" stroke="#18181b" strokeWidth="1.4" />
            {/* Focused scientific gaze */}
            <ellipse cx="43" cy="43" rx="3.3" ry="2.1" fill="#fff" stroke="#18181b" strokeWidth="1" />
            <circle cx="43" cy="43" r="1.4" fill="#18181b" />
            <ellipse cx="57" cy="43" rx="3.3" ry="2.1" fill="#fff" stroke="#18181b" strokeWidth="1" />
            <circle cx="57" cy="43" r="1.4" fill="#18181b" />
            {/* Composed expression */}
            <path d="M 45,60 Q 50,62 55,60" stroke="#18181b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Laboratory coat with collar */}
            <path d="M 28,73 L 40,66 L 50,72 L 60,66 L 72,73 L 78,92 L 22,92 Z" fill="#881337" stroke="#4c0519" strokeWidth="1.2" />
          </g>
        );

      case 'bose':
        return (
          <g>
            {/* Millimeter Wave horn antenna & Plant stimulus waves */}
            <path d="M 18,30 Q 30,22 45,35" stroke="#15803d" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.4" />
            <text x="14" y="24" fontSize="6.5" fontFamily="serif" fontStyle="italic" fill="#15803d" opacity="0.5">60 GHz · Crescograph</text>
            {/* Distinguished Bengali scholar hair */}
            <path d="M 30,40 Q 32,22 50,22 Q 68,22 70,40 Q 64,28 50,28 Q 36,28 30,40 Z" fill="#1f2937" stroke="#111827" strokeWidth="1.2" />
            {/* Regal scholarly face */}
            <path d="M 34,44 Q 33,32 50,30 Q 67,32 66,44 Q 67,68 50,70 Q 33,68 34,44 Z" fill="#f0fdf4" stroke="#14532d" strokeWidth="1.5" />
            {/* Visionary eyes */}
            <ellipse cx="43" cy="43" rx="3.5" ry="2.2" fill="#fff" stroke="#111827" strokeWidth="1" />
            <circle cx="43" cy="43" r="1.5" fill="#111827" />
            <ellipse cx="57" cy="43" rx="3.5" ry="2.2" fill="#fff" stroke="#111827" strokeWidth="1" />
            <circle cx="57" cy="43" r="1.5" fill="#111827" />
            {/* Formal Bengali closed-neck Achkan coat */}
            <path d="M 28,73 L 40,66 L 50,70 L 60,66 L 72,73 L 78,92 L 22,92 Z" fill="#14532d" stroke="#052e16" strokeWidth="1.4" />
            <line x1="50" y1="70" x2="50" y2="92" stroke="#86efac" strokeWidth="0.8" />
          </g>
        );

      case 'newton':
        return (
          <g>
            {/* Prism spectrum light ray & F = G(m1m2)/r^2 */}
            <polygon points="18,22 36,44 18,66" stroke="#475569" strokeWidth="1" fill="none" opacity="0.4" />
            <line x1="36" y1="44" x2="84" y2="26" stroke="#e11d48" strokeWidth="1" opacity="0.5" />
            <line x1="36" y1="44" x2="84" y2="34" stroke="#2563eb" strokeWidth="1" opacity="0.5" />
            {/* 17th century baroque long wavy hair */}
            <path d="M 24,48 Q 20,24 50,18 Q 80,24 76,48 Q 84,68 76,78 Q 66,82 50,78 Q 34,82 24,78 Q 16,68 24,48 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.2" />
            {/* Austere, intense face */}
            <path d="M 35,44 Q 34,30 50,28 Q 66,30 65,44 Q 66,66 50,68 Q 34,66 35,44 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.4" />
            {/* Deep-set piercing eyes */}
            <ellipse cx="43" cy="43" rx="3.3" ry="2.1" fill="#fff" stroke="#0f172a" strokeWidth="1" />
            <circle cx="43" cy="43" r="1.5" fill="#0f172a" />
            <ellipse cx="57" cy="43" rx="3.3" ry="2.1" fill="#fff" stroke="#0f172a" strokeWidth="1" />
            <circle cx="57" cy="43" r="1.5" fill="#0f172a" />
            {/* 17th Century ruff collar & dark robe */}
            <path d="M 26,74 L 38,68 L 50,74 L 62,68 L 74,74 L 80,92 L 20,92 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.4" />
            <path d="M 42,70 Q 50,78 58,70" stroke="#f1f5f9" strokeWidth="1.5" fill="#fff" />
          </g>
        );

      case 'galileo':
        return (
          <g>
            {/* Telescope pointing to Jupiter & moons */}
            <line x1="20" y1="75" x2="75" y2="20" stroke="#0284c7" strokeWidth="1.5" opacity="0.4" />
            <circle cx="78" cy="18" r="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" opacity="0.6" />
            <circle cx="84" cy="14" r="1" fill="#0284c7" opacity="0.6" />
            {/* Renaissance beard & furrowed brow */}
            <path d="M 28,42 Q 32,24 50,24 Q 68,24 72,42 Q 70,30 50,30 Q 30,30 28,42 Z" fill="#94a3b8" />
            <path d="M 34,44 Q 33,32 50,30 Q 67,32 66,44 Q 68,68 50,70 Q 32,68 34,44 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.4" />
            {/* Stately full beard */}
            <path d="M 36,54 Q 50,78 64,54 Q 58,74 50,76 Q 42,74 36,54 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
            {/* Stargazer eyes */}
            <ellipse cx="43" cy="42" rx="3.3" ry="2.1" fill="#fff" stroke="#0f172a" strokeWidth="1" />
            <circle cx="43" cy="42" r="1.4" fill="#0f172a" />
            <ellipse cx="57" cy="42" rx="3.3" ry="2.1" fill="#fff" stroke="#0f172a" strokeWidth="1" />
            <circle cx="57" cy="42" r="1.4" fill="#0f172a" />
            {/* Renaissance scholar robe with ruff */}
            <path d="M 28,74 L 40,68 L 50,72 L 60,68 L 72,74 L 78,92 L 22,92 Z" fill="#0369a1" stroke="#075985" strokeWidth="1.2" />
          </g>
        );

      case 'bhabha':
        return (
          <g>
            {/* Atomic orbits & TIFR architecture */}
            <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#78350f" strokeWidth="0.8" strokeDasharray="3 2" transform="rotate(30 50 50)" opacity="0.4" fill="none" />
            <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#78350f" strokeWidth="0.8" strokeDasharray="3 2" transform="rotate(-30 50 50)" opacity="0.4" fill="none" />
            {/* Sleek groomed hair */}
            <path d="M 32,40 Q 34,22 50,22 Q 66,22 68,40 Q 64,28 50,29 Q 36,28 32,40 Z" fill="#1c1917" />
            {/* Refined aristocratic face */}
            <path d="M 34,44 Q 33,32 50,30 Q 67,32 66,44 Q 67,68 50,70 Q 33,68 34,44 Z" fill="#fefce8" stroke="#451a03" strokeWidth="1.4" />
            {/* Sharp commanding eyes */}
            <ellipse cx="43" cy="43" rx="3.3" ry="2.1" fill="#fff" stroke="#1c1917" strokeWidth="1" />
            <circle cx="43" cy="43" r="1.5" fill="#1c1917" />
            <ellipse cx="57" cy="43" rx="3.3" ry="2.1" fill="#fff" stroke="#1c1917" strokeWidth="1" />
            <circle cx="57" cy="43" r="1.5" fill="#1c1917" />
            {/* Tailored three-piece suit & necktie */}
            <path d="M 28,73 L 38,66 L 50,72 L 62,66 L 72,73 L 78,92 L 22,92 Z" fill="#1c1917" stroke="#451a03" strokeWidth="1.4" />
            <polygon points="48,72 50,88 52,72" fill="#78350f" />
          </g>
        );

      case 'chandra':
      default:
        return (
          <g>
            {/* White dwarf collapse limit (1.44 M_sun) */}
            <circle cx="50" cy="50" r="38" stroke="#5b21b6" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" fill="none" />
            <text x="14" y="24" fontSize="6.5" fontFamily="serif" fontStyle="italic" fill="#5b21b6" opacity="0.6">M ≤ 1.44 M☉</text>
            {/* Classic parted hair */}
            <path d="M 32,40 Q 34,24 50,23 Q 66,24 68,40 Q 62,30 50,30 Q 38,30 32,40 Z" fill="#1e1b4b" />
            {/* Scholarly face */}
            <path d="M 34,44 Q 33,32 50,30 Q 67,32 66,44 Q 67,68 50,70 Q 33,68 34,44 Z" fill="#faf5ff" stroke="#312e81" strokeWidth="1.4" />
            {/* Round academic spectacles */}
            <circle cx="43" cy="43" r="5" fill="none" stroke="#1e1b4b" strokeWidth="1.2" />
            <circle cx="57" cy="43" r="5" fill="none" stroke="#1e1b4b" strokeWidth="1.2" />
            <line x1="48" y1="43" x2="52" y2="43" stroke="#1e1b4b" strokeWidth="1.2" />
            <circle cx="43" cy="43" r="1.5" fill="#1e1b4b" />
            <circle cx="57" cy="43" r="1.5" fill="#1e1b4b" />
            {/* Formal University suit */}
            <path d="M 28,73 L 40,66 L 50,72 L 60,66 L 72,73 L 78,92 L 22,92 Z" fill="#312e81" stroke="#1e1b4b" strokeWidth="1.4" />
          </g>
        );
    }
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-2xl overflow-hidden shrink-0 shadow-xs border bg-gradient-to-br ${persona.bgGradient} ${persona.borderTint} ${className}`}
      title={`${persona.name} (${persona.field})`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Editorial Lithograph Stipple Background Border Frame */}
        <rect x="2" y="2" width="96" height="96" rx="14" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 1.5" opacity="0.3" style={{ color: persona.accentColor }} />
        {renderSketch()}
      </svg>

      {showBadge && (
        <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/70 text-white font-mono text-[8px] font-bold">
          {persona.shortName}
        </span>
      )}
    </div>
  );
}

export default ScientistAvatar;
