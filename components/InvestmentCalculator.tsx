
import React, { useState, useMemo } from 'react';
import GrowthChart from './charts/GrowthChart';
import { DollarSignIcon, TrendingUpIcon, ZapIcon } from '../constants';

const InvestmentCalculator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [apy, setApy] = useState(12);
  const [years, setYears] = useState(5);
  const [isCompounding, setIsCompounding] = useState(true);

  const { chartData, finalBalance, totalPrincipal, totalInterest } = useMemo(() => {
    const data = [];
    let currentBalance = initialAmount;
    let currentPrincipal = initialAmount;
    let accumulatedSimpleInterest = 0;

    data.push({ year: 'Start', principal: initialAmount, interest: 0, total: initialAmount });

    for (let i = 1; i <= years; i++) {
      for (let m = 0; m < 12; m++) {
        currentPrincipal += monthlyContribution;
        if (isCompounding) {
          currentBalance += monthlyContribution;
          currentBalance *= (1 + (apy / 100) / 12);
        } else {
          // Simple interest calculation: interest is calculated on balance but not added to the principal for the next period
          accumulatedSimpleInterest += (currentPrincipal * (apy / 100) / 12);
          currentBalance = currentPrincipal + accumulatedSimpleInterest;
        }
      }

      data.push({
        year: `Year ${i}`,
        principal: Math.round(currentPrincipal),
        interest: Math.round(currentBalance - currentPrincipal),
        total: Math.round(currentBalance)
      });
    }

    return {
      chartData: data,
      finalBalance: currentBalance,
      totalPrincipal: currentPrincipal,
      totalInterest: currentBalance - currentPrincipal
    };
  }, [initialAmount, monthlyContribution, apy, years, isCompounding]);

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700 bg-gray-800/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
        <div>
            <h3 className="text-xl font-bold text-white flex items-center">
                <TrendingUpIcon className="w-6 h-6 text-brand-primary mr-2" />
                Investment ROI Calculator
            </h3>
            <p className="text-gray-400 text-sm">Visualize your future portfolio growth.</p>
        </div>
        <div className="flex bg-gray-700 p-1 rounded-lg">
            <button 
                onClick={() => setIsCompounding(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isCompounding ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                Compound
            </button>
            <button 
                onClick={() => setIsCompounding(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isCompounding ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                Simple
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Controls */}
        <div className="p-6 space-y-6 border-r border-gray-700 bg-gray-900/20">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Initial Deposit</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">$</div>
              <input
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                className="w-full bg-gray-700/50 text-white rounded-lg pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-brand-primary outline-none transition-all border border-gray-600"
              />
            </div>
            <input type="range" min="100" max="100000" step="100" value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))} className="w-full mt-3 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Monthly Additions</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">$</div>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full bg-gray-700/50 text-white rounded-lg pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-brand-primary outline-none transition-all border border-gray-600"
              />
            </div>
            <input type="range" min="0" max="10000" step="100" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} className="w-full mt-3 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Yield %</label>
                <input
                    type="number"
                    value={apy}
                    onChange={(e) => setApy(Number(e.target.value))}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-secondary outline-none border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Years</label>
                <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                />
              </div>
          </div>
          
          <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg flex items-start space-x-3">
              <ZapIcon className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <p className="text-xs text-brand-primary leading-relaxed">
                  {isCompounding 
                    ? "Compounding reinvests your daily profits back into the principal automatically." 
                    : "Simple interest assumes you withdraw your profits daily, keeping principal flat."}
              </p>
          </div>
        </div>

        {/* Results */}
        <div className="col-span-2 p-8 flex flex-col bg-gray-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-white">${totalPrincipal.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl border border-green-900/30 shadow-sm">
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-1">Interest Earned</p>
              <p className="text-2xl font-bold text-green-400">+${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-brand-primary p-5 rounded-xl shadow-lg shadow-brand-primary/20">
              <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Future Worth</p>
              <p className="text-2xl font-bold text-white">${finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          
          <div className="flex-grow min-h-[350px]">
            <GrowthChart data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;
