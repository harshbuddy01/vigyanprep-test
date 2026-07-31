import React, { useState } from 'react';
import { X, Calculator as CalcIcon } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ScientificCalculator: React.FC<Props> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [isRad, setIsRad] = useState(true);

  const handleNum = (n: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(n);
    } else {
      setDisplay(display + n);
    }
  };

  const handleOp = (op: string) => {
    setDisplay(display + ' ' + op + ' ');
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
    <div className="fixed top-20 right-80 z-50 bg-[#1b365d] border-2 border-amber-400 rounded-2xl shadow-2xl w-80 p-4 text-white font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
          <CalcIcon size={16} /> NTA Official Scientific Calculator
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRad(!isRad)}
            className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-amber-200 font-bold"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X size={16} />
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
        <button onClick={() => handleMathFunc('sin')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">sin</button>
        <button onClick={() => handleMathFunc('cos')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">cos</button>
        <button onClick={() => handleMathFunc('tan')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">tan</button>
        <button onClick={handleClear} className="p-2 bg-red-600 text-white rounded hover:bg-red-700">C</button>
        <button onClick={handleBack} className="p-2 bg-amber-600 text-white rounded hover:bg-amber-700">⌫</button>

        {/* Row 2 */}
        <button onClick={() => handleMathFunc('asin')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">sin⁻¹</button>
        <button onClick={() => handleMathFunc('acos')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">cos⁻¹</button>
        <button onClick={() => handleMathFunc('atan')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">tan⁻¹</button>
        <button onClick={() => handleNum('(')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">(</button>
        <button onClick={() => handleNum(')')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">)</button>

        {/* Row 3 */}
        <button onClick={() => handleMathFunc('sqrt')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">√</button>
        <button onClick={() => handleNum('7')} className="p-2 bg-white rounded hover:bg-gray-100">7</button>
        <button onClick={() => handleNum('8')} className="p-2 bg-white rounded hover:bg-gray-100">8</button>
        <button onClick={() => handleNum('9')} className="p-2 bg-white rounded hover:bg-gray-100">9</button>
        <button onClick={() => handleOp('÷')} className="p-2 bg-[#e0a800] text-[#1b365d] rounded hover:bg-[#d39e00]">÷</button>

        {/* Row 4 */}
        <button onClick={() => handleMathFunc('sqr')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">x²</button>
        <button onClick={() => handleNum('4')} className="p-2 bg-white rounded hover:bg-gray-100">4</button>
        <button onClick={() => handleNum('5')} className="p-2 bg-white rounded hover:bg-gray-100">5</button>
        <button onClick={() => handleNum('6')} className="p-2 bg-white rounded hover:bg-gray-100">6</button>
        <button onClick={() => handleOp('×')} className="p-2 bg-[#e0a800] text-[#1b365d] rounded hover:bg-[#d39e00]">×</button>

        {/* Row 5 */}
        <button onClick={() => handleMathFunc('log')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">log</button>
        <button onClick={() => handleNum('1')} className="p-2 bg-white rounded hover:bg-gray-100">1</button>
        <button onClick={() => handleNum('2')} className="p-2 bg-white rounded hover:bg-gray-100">2</button>
        <button onClick={() => handleNum('3')} className="p-2 bg-white rounded hover:bg-gray-100">3</button>
        <button onClick={() => handleOp('-')} className="p-2 bg-[#e0a800] text-[#1b365d] rounded hover:bg-[#d39e00]">-</button>

        {/* Row 6 */}
        <button onClick={() => handleMathFunc('ln')} className="p-2 bg-[#2d4d7a] text-white rounded hover:bg-[#3a6096]">ln</button>
        <button onClick={() => handleNum('0')} className="p-2 bg-white rounded hover:bg-gray-100">0</button>
        <button onClick={() => handleNum('.')} className="p-2 bg-white rounded hover:bg-gray-100">.</button>
        <button onClick={handleEquals} className="p-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-bold">=</button>
        <button onClick={() => handleOp('+')} className="p-2 bg-[#e0a800] text-[#1b365d] rounded hover:bg-[#d39e00]">+</button>
      </div>
    </div>
  );
};
