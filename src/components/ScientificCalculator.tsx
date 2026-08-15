import React, { useState } from 'react';
import { X, Calculator as CalcIcon } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ScientificCalculator: React.FC<Props> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [isRad, setIsRad] = useState(true);

  const handleNum = (n: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(n);
    } else {
      setDisplay(display + n);
    }
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleBack = () => {
    if (display.length <= 1) setDisplay('0');
    else setDisplay(display.slice(0, -1).trim());
  };

  const handleMathFunc = (fn: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;
      let res = 0;
      const angle = isRad ? val : (val * Math.PI) / 180;

      switch (fn) {
        case 'sin': res = Math.sin(angle); break;
        case 'cos': res = Math.cos(angle); break;
        case 'tan': res = Math.tan(angle); break;
        case 'asin': res = isRad ? Math.asin(val) : (Math.asin(val) * 180) / Math.PI; break;
        case 'acos': res = isRad ? Math.acos(val) : (Math.acos(val) * 180) / Math.PI; break;
        case 'atan': res = isRad ? Math.atan(val) : (Math.atan(val) * 180) / Math.PI; break;
        case 'sqrt': res = Math.sqrt(val); break;
        case 'sqr': res = val * val; break;
        case 'log': res = Math.log10(val); break;
        case 'ln': res = Math.log(val); break;
        case 'inv': res = 1 / val; break;
        default: break;
      }
      setDisplay(Number(res.toFixed(8)).toString());
    } catch {
      setDisplay('Error');
    }
  };

  const handleEquals = () => {
    try {
      // Evaluate safe mathematical expression
      const expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Sanitize expression
      if (!/^[0-9+\-*/.()\sMath.PIE]+$/.test(expr)) {
        throw new Error('Invalid');
      }

      const res = Function(`"use strict"; return (${expr})`)();
      setDisplay(Number(res.toFixed(8)).toString());
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed top-16 sm:top-20 right-3 sm:right-6 lg:right-84 z-50 bg-[#1b365d] border-2 border-amber-400 rounded-2xl shadow-2xl w-[calc(100vw-1.5rem)] max-w-xs sm:w-80 p-4 text-white font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
          <CalcIcon size={16} /> NTA Scientific Calculator
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRad(!isRad)}
            className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-amber-200 font-bold cursor-pointer"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded cursor-pointer">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="bg-[#0c1a2e] p-3 rounded-xl border border-white/10 text-right mb-4">
        <div className="text-xs text-amber-300/60 h-4 overflow-hidden">{isRad ? 'Radians' : 'Degrees'}</div>
        <div className="text-xl font-bold text-white tracking-wider truncate">{display}</div>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-5 gap-1.5 text-xs font-bold text-gray-800">
        {/* Row 1: Scientific Functions */}
        <button onClick={() => handleMathFunc('sin')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">sin</button>
        <button onClick={() => handleMathFunc('cos')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">cos</button>
        <button onClick={() => handleMathFunc('tan')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">tan</button>
        <button onClick={handleClear} className="min-h-[38px] flex items-center justify-center p-1.5 bg-red-600 text-white rounded hover:bg-red-700 active:scale-95 transition">C</button>
        <button onClick={handleBack} className="min-h-[38px] flex items-center justify-center p-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 active:scale-95 transition">⌫</button>

        {/* Row 2 */}
        <button onClick={() => handleMathFunc('asin')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">sin⁻¹</button>
        <button onClick={() => handleMathFunc('acos')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">cos⁻¹</button>
        <button onClick={() => handleMathFunc('atan')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">tan⁻¹</button>
        <button onClick={() => handleNum('(')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">(</button>
        <button onClick={() => handleNum(')')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">)</button>

        {/* Row 3 */}
        <button onClick={() => handleMathFunc('ln')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">ln</button>
        <button onClick={() => handleMathFunc('log')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">log</button>
        <button onClick={() => handleMathFunc('sqrt')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">√</button>
        <button onClick={() => handleMathFunc('sq')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">x²</button>
        <button onClick={() => handleNum('/')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-amber-500 text-black rounded hover:bg-amber-400 active:scale-95 transition">÷</button>

        {/* Row 4 */}
        <button onClick={() => handleNum('7')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">7</button>
        <button onClick={() => handleNum('8')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">8</button>
        <button onClick={() => handleNum('9')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">9</button>
        <button onClick={() => handleMathFunc('pi')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">π</button>
        <button onClick={() => handleNum('*')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-amber-500 text-black rounded hover:bg-amber-400 active:scale-95 transition">×</button>

        {/* Row 5 */}
        <button onClick={() => handleNum('4')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">4</button>
        <button onClick={() => handleNum('5')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">5</button>
        <button onClick={() => handleNum('6')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">6</button>
        <button onClick={() => handleMathFunc('e')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">e</button>
        <button onClick={() => handleNum('-')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-amber-500 text-black rounded hover:bg-amber-400 active:scale-95 transition">−</button>

        {/* Row 6 */}
        <button onClick={() => handleNum('1')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">1</button>
        <button onClick={() => handleNum('2')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">2</button>
        <button onClick={() => handleNum('3')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">3</button>
        <button onClick={() => handleNum('.')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">.</button>
        <button onClick={() => handleNum('+')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-amber-500 text-black rounded hover:bg-amber-400 active:scale-95 transition">+</button>

        {/* Row 7 */}
        <button onClick={() => handleNum('0')} className="min-h-[38px] col-span-2 flex items-center justify-center p-1.5 bg-white text-black rounded hover:bg-gray-200 active:scale-95 transition">0</button>
        <button onClick={() => handleMathFunc('inv')} className="min-h-[38px] flex items-center justify-center p-1.5 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096] active:scale-95 transition">1/x</button>
        <button onClick={handleEquals} className="min-h-[38px] col-span-2 flex items-center justify-center p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm font-black active:scale-95 transition">=</button>
      </div>
    </div>
  );
};
