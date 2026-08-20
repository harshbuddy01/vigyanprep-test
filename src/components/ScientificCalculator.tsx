import React, { useState } from 'react';
import { X, Calculator as CalcIcon } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ScientificCalculator: React.FC<Props> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isRad, setIsRad] = useState(false); // Default to Degrees for Indian school entrance exams
  const [isInv, setIsInv] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Helper: Factorial
  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= Math.min(n, 170); i++) res *= i;
    return res;
  };

  // Helper: Format result
  const formatResult = (val: number): string => {
    if (isNaN(val) || !isFinite(val)) return 'Error';
    // Round floating point precision inaccuracies (e.g. 0.1 + 0.2)
    const rounded = Number(Math.round(Number(val + 'e+10')) + 'e-10');
    if (Math.abs(rounded) > 1e12 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
      return rounded.toExponential(6);
    }
    return rounded.toString();
  };

  // Input numbers
  const handleNum = (n: string) => {
    if (hasCalculated) {
      setDisplay(n);
      setExpression('');
      setHasCalculated(false);
    } else {
      if (display === '0' || display === 'Error') {
        setDisplay(n);
      } else {
        setDisplay(display + n);
      }
    }
  };

  // Input decimal
  const handleDecimal = () => {
    if (hasCalculated) {
      setDisplay('0.');
      setExpression('');
      setHasCalculated(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Input operators (+, -, *, /)
  const handleOperator = (op: string) => {
    setHasCalculated(false);
    const symbolMap: Record<string, string> = { '+': '+', '-': '-', '*': '×', '/': '÷', '^': '^' };
    const displaySymbol = symbolMap[op] || op;

    if (display === 'Error') {
      setDisplay('0');
      setExpression('');
      return;
    }

    setExpression((prev) => {
      if (prev.endsWith('+') || prev.endsWith('-') || prev.endsWith('×') || prev.endsWith('÷') || prev.endsWith('^')) {
        return prev.slice(0, -1) + displaySymbol;
      }
      return `${prev} ${display} ${displaySymbol}`.trim();
    });
    setDisplay('0');
  };

  // Clear
  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setHasCalculated(false);
  };

  // Clear Entry (CE)
  const handleClearEntry = () => {
    setDisplay('0');
  };

  // Backspace
  const handleBack = () => {
    if (hasCalculated || display === 'Error') {
      handleClear();
      return;
    }
    if (display.length <= 1) setDisplay('0');
    else setDisplay(display.slice(0, -1));
  };

  // Toggle +/-
  const handleNegate = () => {
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) setDisplay(display.slice(1));
    else setDisplay('-' + display);
  };

  // Immediate Math Functions (sin, cos, tan, sqrt, ln, log, x^2, 1/x, etc.)
  const handleInstantMath = (fn: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;
      let res = 0;
      const angle = isRad ? val : (val * Math.PI) / 180;

      switch (fn) {
        // Trigonometry
        case 'sin':
          res = isInv
            ? (isRad ? Math.asin(val) : (Math.asin(val) * 180) / Math.PI)
            : Math.sin(angle);
          break;
        case 'cos':
          res = isInv
            ? (isRad ? Math.acos(val) : (Math.acos(val) * 180) / Math.PI)
            : Math.cos(angle);
          break;
        case 'tan':
          res = isInv
            ? (isRad ? Math.atan(val) : (Math.atan(val) * 180) / Math.PI)
            : Math.tan(angle);
          break;

        // Logarithms & Exponential
        case 'ln': res = isInv ? Math.exp(val) : Math.log(val); break;
        case 'log': res = isInv ? Math.pow(10, val) : Math.log10(val); break;
        case 'exp': res = Math.exp(val); break;

        // Powers & Roots
        case 'sqrt': res = Math.sqrt(val); break;
        case 'cbrt': res = Math.cbrt(val); break;
        case 'sqr': res = Math.pow(val, 2); break;
        case 'cube': res = Math.pow(val, 3); break;
        case 'inv': res = 1 / val; break;
        case 'fact': res = factorial(Math.floor(val)); break;
        case 'pct': res = val / 100; break;

        // Constants
        case 'pi': res = Math.PI; break;
        case 'e': res = Math.E; break;
        default: break;
      }

      const formatted = formatResult(res);
      setDisplay(formatted);
      setHasCalculated(true);
    } catch {
      setDisplay('Error');
    }
  };

  // Evaluate Expression
  const handleEquals = () => {
    try {
      let fullExpr = `${expression} ${display}`.trim();
      if (!fullExpr || fullExpr === 'Error') return;

      // Sanitize & replace display symbols with standard operators
      let evalExpr = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Validate expression safety
      if (!/^[0-9+\-*/().\s*Math.PIE**]+$/.test(evalExpr)) {
        throw new Error('Invalid expression');
      }

      // Safe JS evaluation
      const res = Function(`"use strict"; return (${evalExpr})`)();
      const formatted = formatResult(res);

      setExpression(fullExpr + ' =');
      setDisplay(formatted);
      setHasCalculated(true);
    } catch {
      setDisplay('Error');
    }
  };

  // Memory Actions
  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-') => {
    const val = parseFloat(display) || 0;
    switch (action) {
      case 'MC': setMemory(0); break;
      case 'MR': setDisplay(formatResult(memory)); setHasCalculated(true); break;
      case 'M+': setMemory(prev => prev + val); break;
      case 'M-': setMemory(prev => prev - val); break;
    }
  };

  return (
    <div className="fixed top-14 sm:top-16 right-2 sm:right-6 lg:right-72 z-50 bg-[#0f172a] border-2 border-amber-400/90 rounded-2xl shadow-2xl w-[calc(100vw-1rem)] max-w-[340px] sm:w-[350px] p-3.5 text-white font-mono select-none backdrop-blur-xl">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
          <CalcIcon size={15} />
          <span>NTA Scientific Calculator</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsRad(!isRad)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition cursor-pointer border ${
              isRad ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-amber-500/20 border-amber-400 text-amber-300'
            }`}
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title="Close Calculator"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="bg-[#020617] p-3 rounded-xl border border-slate-700 text-right mb-3 shadow-inner">
        <div className="text-[11px] text-amber-400/80 h-4 overflow-hidden truncate font-medium">
          {expression || (isRad ? 'Radians Mode' : 'Degrees Mode')}
        </div>
        <div className="text-2xl font-black text-white tracking-wider truncate mt-0.5">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-5 gap-1 text-[11px] font-bold">
        
        {/* Row 1: Memory & Modes */}
        <button type="button" onClick={() => handleMemory('MC')} className="h-8 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded transition">MC</button>
        <button type="button" onClick={() => handleMemory('MR')} className="h-8 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded transition">MR</button>
        <button type="button" onClick={() => handleMemory('M+')} className="h-8 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded transition">M+</button>
        <button type="button" onClick={() => handleMemory('M-')} className="h-8 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded transition">M-</button>
        <button type="button" onClick={() => setIsInv(!isInv)} className={`h-8 rounded transition ${isInv ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>2nd</button>

        {/* Row 2: Trig Functions */}
        <button type="button" onClick={() => handleInstantMath('sin')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">{isInv ? 'sin⁻¹' : 'sin'}</button>
        <button type="button" onClick={() => handleInstantMath('cos')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">{isInv ? 'cos⁻¹' : 'cos'}</button>
        <button type="button" onClick={() => handleInstantMath('tan')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">{isInv ? 'tan⁻¹' : 'tan'}</button>
        <button type="button" onClick={handleClearEntry} className="h-9 bg-amber-600/90 hover:bg-amber-600 text-white rounded transition">CE</button>
        <button type="button" onClick={handleClear} className="h-9 bg-rose-600 hover:bg-rose-700 text-white rounded font-black transition">C</button>

        {/* Row 3: Log & Power */}
        <button type="button" onClick={() => handleInstantMath('ln')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">{isInv ? 'eˣ' : 'ln'}</button>
        <button type="button" onClick={() => handleInstantMath('log')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">{isInv ? '10ˣ' : 'log'}</button>
        <button type="button" onClick={() => handleInstantMath('sqrt')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">√</button>
        <button type="button" onClick={() => handleInstantMath('sqr')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">x²</button>
        <button type="button" onClick={handleBack} className="h-9 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded transition">⌫</button>

        {/* Row 4: Power, Roots & Divide */}
        <button type="button" onClick={() => handleOperator('^')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">xʸ</button>
        <button type="button" onClick={() => handleInstantMath('cbrt')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">∛</button>
        <button type="button" onClick={() => handleInstantMath('pi')} className="h-9 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded transition">π</button>
        <button type="button" onClick={() => handleInstantMath('e')} className="h-9 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded transition">e</button>
        <button type="button" onClick={() => handleOperator('/')} className="h-9 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded transition">÷</button>

        {/* Row 5: 7 8 9 & Multiply */}
        <button type="button" onClick={() => handleInstantMath('fact')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">n!</button>
        <button type="button" onClick={() => handleNum('7')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">7</button>
        <button type="button" onClick={() => handleNum('8')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">8</button>
        <button type="button" onClick={() => handleNum('9')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">9</button>
        <button type="button" onClick={() => handleOperator('*')} className="h-9 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded transition">×</button>

        {/* Row 6: 4 5 6 & Minus */}
        <button type="button" onClick={() => handleInstantMath('inv')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">1/x</button>
        <button type="button" onClick={() => handleNum('4')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">4</button>
        <button type="button" onClick={() => handleNum('5')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">5</button>
        <button type="button" onClick={() => handleNum('6')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">6</button>
        <button type="button" onClick={() => handleOperator('-')} className="h-9 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded transition">−</button>

        {/* Row 7: 1 2 3 & Plus */}
        <button type="button" onClick={() => handleInstantMath('pct')} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">%</button>
        <button type="button" onClick={() => handleNum('1')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">1</button>
        <button type="button" onClick={() => handleNum('2')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">2</button>
        <button type="button" onClick={() => handleNum('3')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">3</button>
        <button type="button" onClick={() => handleOperator('+')} className="h-9 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded transition">+</button>

        {/* Row 8: 0 . +/- and Equals */}
        <button type="button" onClick={handleNegate} className="h-9 bg-slate-700 hover:bg-slate-600 text-white rounded transition">±</button>
        <button type="button" onClick={() => handleNum('0')} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">0</button>
        <button type="button" onClick={handleDecimal} className="h-9 bg-white text-slate-900 hover:bg-slate-200 text-sm font-black rounded transition">.</button>
        <button type="button" onClick={handleEquals} className="h-9 col-span-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded shadow-md transition cursor-pointer">=</button>
      </div>

      <div className="mt-2.5 text-[9px] text-slate-400 text-center flex items-center justify-between border-t border-slate-800 pt-1.5">
        <span>TCS iON Standard</span>
        <span>Keyboard input enabled</span>
      </div>
    </div>
  );
};
