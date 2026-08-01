/**
 * ✏️ Hand-Drawn Pencil Sketch of Student Studying at Desk
 * Matches exact academic illustration style from student test portal reference layout
 */
export function StudentStudyingSketch({ className = "w-72 h-56 text-[#241e12]/80" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background Math & Science Doodles */}
      {/* Coordinate Plane y = sin x */}
      <line x1="20" y1="120" x2="110" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <line x1="40" y1="70" x2="40" y2="160" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <path d="M 25,120 Q 40,80 55,120 T 85,120" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
      <text x="60" y="90" fill="currentColor" fontSize="10" fontFamily="serif" fontStyle="italic" opacity="0.7">sin x</text>
      
      {/* Paper Airplane Sketch */}
      <path d="M 120,60 L 160,40 L 140,75 L 132,62 Z" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" />
      <line x1="160" y1="40" x2="132" y2="62" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      
      {/* Light Bulb Doodled Idea */}
      <circle cx="280" cy="50" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <path d="M 276,58 L 284,58 M 277,61 L 283,61" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="280" y1="35" x2="280" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="292" y1="42" x2="297" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="268" y1="42" x2="263" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.5" />

      {/* Desk Lamp */}
      <path d="M 330,220 L 320,130 Q 300,100 270,110 L 260,125" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 250,135 L 275,115 L 265,100 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15" />
      <circle cx="330" cy="220" r="12" stroke="currentColor" strokeWidth="2" />

      {/* Stack of Textbooks on Desk */}
      <rect x="290" y="210" width="70" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="285" y="196" width="75" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="292" y="182" width="65" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />

      {/* Open Book in Front of Student */}
      <path d="M 120,230 Q 180,215 240,230 L 245,260 Q 180,245 115,260 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="180" y1="222" x2="180" y2="252" stroke="currentColor" strokeWidth="1.5" />
      {/* Book Lines */}
      <line x1="135" y1="234" x2="170" y2="230" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="135" y1="242" x2="170" y2="238" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="190" y1="230" x2="225" y2="234" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="190" y1="238" x2="225" y2="242" stroke="currentColor" strokeWidth="1" opacity="0.6" />

      {/* Student Head & Hair (Pencil Hatching) */}
      <path d="M 160,110 C 145,110 135,125 135,145 C 135,160 145,175 165,175 C 185,175 195,160 195,145 C 195,125 180,110 160,110 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Hair Hatching Lines */}
      <path d="M 140,135 Q 155,115 175,120 Q 190,130 192,145 Q 170,130 145,140 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
      <path d="M 142,125 Q 160,105 182,118 M 148,118 Q 165,100 186,112" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />

      {/* Shoulders & Torso */}
      <path d="M 135,170 Q 110,210 90,240 L 250,240 Q 230,210 195,170 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
      {/* Shirt Collar / Fold Hatching */}
      <path d="M 155,175 L 165,195 L 175,175" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 110,210 L 155,200 M 220,210 L 175,200" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />

      {/* Arms & Hands writing with Pen */}
      <path d="M 100,230 Q 130,225 160,235" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M 230,230 Q 200,225 175,235" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* Pen Sketch */}
      <line x1="168" y1="230" x2="158" y2="242" stroke="currentColor" strokeWidth="2" />

      {/* Desk Horizontal Edge */}
      <line x1="40" y1="245" x2="360" y2="245" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
