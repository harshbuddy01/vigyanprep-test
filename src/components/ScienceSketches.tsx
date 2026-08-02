/**
 * 🔬 Hand-Drawn Technical Physics Ray Optics Sketch
 */
export function RayOpticsSketch({ className = "w-24 h-24 text-amber-400/60" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Principal Axis */}
      <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
      {/* Concave Mirror Arc */}
      <path d="M 140,30 Q 110,100 140,170" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Mirror Backing Lines (Technical Hatching) */}
      <path d="M 142,32 L 148,28 M 138,50 L 145,45 M 132,70 L 139,65 M 130,90 L 137,85 M 130,110 L 137,105 M 132,130 L 139,125 M 138,150 L 145,145 M 142,168 L 148,164" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* Incident Parallel Light Ray 1 */}
      <line x1="20" y1="50" x2="135" y2="50" stroke="currentColor" strokeWidth="2" />
      <polygon points="75,46 85,50 75,54" fill="currentColor" />
      {/* Reflected Ray through Focus F */}
      <line x1="135" y1="50" x2="20" y2="150" stroke="currentColor" strokeWidth="2" />
      <polygon points="80,95 72,105 85,103" fill="currentColor" />
      {/* Incident Parallel Light Ray 2 */}
      <line x1="20" y1="150" x2="135" y2="150" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* Focal Point F & Center of Curvature C */}
      <circle cx="80" cy="100" r="3" fill="currentColor" />
      <text x="76" y="120" fill="currentColor" fontSize="12" fontFamily="serif" fontStyle="italic">F</text>
      <circle cx="20" cy="100" r="3" fill="currentColor" />
      <text x="16" y="120" fill="currentColor" fontSize="12" fontFamily="serif" fontStyle="italic">C</text>
    </svg>
  );
}

/**
 * 🧪 Hand-Drawn Technical Chemistry Benzene Molecular Orbital Sketch
 */
export function BenzeneOrbitalSketch({ className = "w-24 h-24 text-orange-400/60" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Hexagon Ring Bonds */}
      <polygon points="100,25 160,60 160,130 100,165 40,130 40,60" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Inner Resonance Circle (Dashed Technical Line) */}
      <circle cx="100" cy="95" r="42" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
      {/* Alternate Double Bonds Accent Lines */}
      <line x1="95" y1="40" x2="148" y2="70" stroke="currentColor" strokeWidth="1.5" />
      <line x1="148" y1="120" x2="95" y2="150" stroke="currentColor" strokeWidth="1.5" />
      <line x1="52" y1="120" x2="52" y2="70" stroke="currentColor" strokeWidth="1.5" />
      {/* p-Orbital Lobe Nodes Sketch */}
      <ellipse cx="100" cy="25" rx="10" ry="16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="160" cy="60" rx="10" ry="16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="160" cy="130" rx="10" ry="16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="100" cy="165" rx="10" ry="16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="40" cy="130" rx="10" ry="16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="40" cy="60" rx="10" ry="16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* Chemical Formula Subscript Sketch */}
      <text x="82" y="100" fill="currentColor" fontSize="14" fontFamily="serif" fontWeight="bold">C₆H₆</text>
    </svg>
  );
}

/**
 * 📐 Hand-Drawn Technical Mathematics Integral Curve Sketch
 */
export function CalculusIntegralSketch({ className = "w-24 h-24 text-amber-300/60" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Axes */}
      <line x1="20" y1="160" x2="180" y2="160" stroke="currentColor" strokeWidth="1.8" />
      <line x1="40" y1="20" x2="40" y2="180" stroke="currentColor" strokeWidth="1.8" />
      {/* Axis Arrows */}
      <polygon points="180,157 190,160 180,163" fill="currentColor" />
      <polygon points="37,20 40,10 43,20" fill="currentColor" />
      <text x="180" y="180" fill="currentColor" fontSize="12" fontFamily="serif" fontStyle="italic">x</text>
      <text x="22" y="25" fill="currentColor" fontSize="12" fontFamily="serif" fontStyle="italic">y</text>
      {/* Shaded Area under f(x) (Hatching Lines) */}
      <path d="M 60,160 L 60,115 L 75,100 L 75,160 M 75,100 L 90,88 L 90,160 M 90,88 L 105,80 L 105,160 M 105,80 L 120,78 L 120,160 M 120,78 L 135,85 L 135,160 M 135,85 L 150,102 L 150,160" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
      {/* Continuous Curve f(x) */}
      <path d="M 45,140 Q 80,60 120,75 T 170,120" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Integration Boundaries a & b */}
      <line x1="60" y1="160" x2="60" y2="165" stroke="currentColor" strokeWidth="2" />
      <text x="56" y="180" fill="currentColor" fontSize="12" fontFamily="serif" fontStyle="italic">a</text>
      <line x1="150" y1="160" x2="150" y2="165" stroke="currentColor" strokeWidth="2" />
      <text x="146" y="180" fill="currentColor" fontSize="12" fontFamily="serif" fontStyle="italic">b</text>
      {/* Integral Symbol Sketch */}
      <text x="100" y="45" fill="currentColor" fontSize="22" fontFamily="serif" fontStyle="italic">∫ f(x) dx</text>
    </svg>
  );
}

/**
 * 🧬 Hand-Drawn Technical Biology DNA Helix Sketch
 */
export function DNAHelixSketch({ className = "w-24 h-24 text-emerald-400/60" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Strand 1 */}
      <path d="M 40,20 Q 160,60 40,100 T 160,180" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Strand 2 */}
      <path d="M 160,20 Q 40,60 160,100 T 40,180" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" fill="none" opacity="0.8" />
      {/* Base Pair Horizontal Bridges */}
      <line x1="70" y1="32" x2="130" y2="32" stroke="currentColor" strokeWidth="1.5" />
      <line x1="95" y1="50" x2="105" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="70" y1="72" x2="130" y2="72" stroke="currentColor" strokeWidth="1.5" />
      <line x1="50" y1="95" x2="150" y2="95" stroke="currentColor" strokeWidth="1.5" />
      <line x1="70" y1="120" x2="130" y2="120" stroke="currentColor" strokeWidth="1.5" />
      <line x1="95" y1="145" x2="105" y2="145" stroke="currentColor" strokeWidth="1.5" />
      <line x1="70" y1="168" x2="130" y2="168" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * 🏛️ Handcrafted Vector SVG Line Art of University Campus Arches, Clock Tower & Observatory Dome
 * Matches Imagica Taj Mahal / Hawa Mahal Line Art Watermark Style
 */
export function UniversityCampusSketch({ className = "w-full h-full text-amber-900/20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* University Library Main Facade with Arches */}
      <rect x="50" y="240" width="380" height="260" stroke="currentColor" strokeWidth="1.8" />
      <path d="M 50,240 L 240,140 L 430,240 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="210" y="160" width="60" height="40" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Grand Arches */}
      <path d="M 70,500 L 70,380 Q 115,330 160,380 L 160,500" stroke="currentColor" strokeWidth="1.8" />
      <path d="M 185,500 L 185,380 Q 230,330 275,380 L 275,500" stroke="currentColor" strokeWidth="1.8" />
      <path d="M 300,500 L 300,380 Q 345,330 390,380 L 390,500" stroke="currentColor" strokeWidth="1.8" />

      {/* Arched Windows Upper Level */}
      <path d="M 85,320 L 85,270 Q 110,250 135,270 L 135,320 Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M 165,320 L 165,270 Q 190,250 215,270 L 215,320 Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M 245,320 L 245,270 Q 270,250 295,270 L 295,320 Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M 325,320 L 325,270 Q 350,250 375,270 L 375,320 Z" stroke="currentColor" strokeWidth="1.2" />

      {/* Science Center Clock Tower */}
      <rect x="520" y="100" width="120" height="400" stroke="currentColor" strokeWidth="2" />
      <path d="M 520,100 L 580,20 L 640,100 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="580" cy="180" r="30" stroke="currentColor" strokeWidth="2" />
      <line x1="580" y1="180" x2="580" y2="162" stroke="currentColor" strokeWidth="2" />
      <line x1="580" y1="180" x2="594" y2="180" stroke="currentColor" strokeWidth="2" />

      {/* Astronomical Observatory Dome */}
      <path d="M 850,500 L 850,300 C 850,180 1050,180 1050,300 L 1050,500" stroke="currentColor" strokeWidth="2" />
      {/* Dome Slit */}
      <line x1="950" y1="190" x2="950" y2="340" stroke="currentColor" strokeWidth="2.5" />
      {/* Telescope Mounting */}
      <line x1="950" y1="280" x2="1020" y2="230" stroke="currentColor" strokeWidth="3" />
      <circle cx="1020" cy="230" r="8" stroke="currentColor" strokeWidth="2" />

      {/* Science Equations & Constellation Overlay */}
      <text x="470" y="260" fill="currentColor" fontSize="22" fontFamily="serif" fontStyle="italic" opacity="0.7">E = mc²</text>
      <text x="690" y="220" fill="currentColor" fontSize="20" fontFamily="serif" fontStyle="italic" opacity="0.7">∫ f(x) dx</text>
      <text x="710" y="380" fill="currentColor" fontSize="18" fontFamily="serif" fontStyle="italic" opacity="0.7">λ = h / mv</text>

      {/* Chemical Molecular Ring Accent */}
      <polygon points="760,420 790,440 790,470 760,490 730,470 730,440" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="760" cy="455" r="18" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />

      {/* Ground Line */}
      <line x1="20" y1="500" x2="1180" y2="500" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/**
 * ✏️ Handcrafted Pure Vector SVG Line Art of Student Studying at Desk
 * No JPG/PNG images, no box borders, clean line drawing
 */
export function StudentDeskSketch({ className = "w-72 h-56 text-[#1c1815]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Desk Lamp */}
      <path d="M 320,230 L 310,140 Q 290,110 260,120 L 250,135" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 240,145 L 265,125 L 255,110 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="320" cy="230" r="10" stroke="currentColor" strokeWidth="1.5" />

      {/* Stack of Textbooks on Desk */}
      <rect x="280" y="218" width="70" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="275" y="206" width="75" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="282" y="194" width="65" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />

      {/* Open Science Textbook */}
      <path d="M 120,225 Q 180,210 240,225 L 245,255 Q 180,240 115,255 Z" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="180" y1="217" x2="180" y2="247" stroke="currentColor" strokeWidth="1.5" />
      <line x1="135" y1="229" x2="170" y2="225" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="135" y1="237" x2="170" y2="233" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="190" y1="225" x2="225" y2="229" stroke="currentColor" strokeWidth="1" opacity="0.6" />

      {/* Student Head & Hair */}
      <path d="M 160,110 C 145,110 135,125 135,145 C 135,160 145,175 165,175 C 185,175 195,160 195,145 C 195,125 180,110 160,110 Z" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M 140,135 Q 155,115 175,120 Q 190,130 192,145 Q 170,130 145,140 Z" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />

      {/* Shoulders & Torso */}
      <path d="M 135,170 Q 110,210 90,240 L 250,240 Q 230,210 195,170 Z" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M 155,175 L 165,195 L 175,175" stroke="currentColor" strokeWidth="1.5" />

      {/* Desk Edge */}
      <line x1="40" y1="240" x2="360" y2="240" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
