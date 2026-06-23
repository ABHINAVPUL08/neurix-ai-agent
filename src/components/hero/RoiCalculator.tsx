"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, Clock, TrendingUp } from "lucide-react";
import {
  calculateRoiSavings,
  formatInr,
  ROI_INDUSTRIES,
  type RoiIndustryId,
} from "@/lib/roi-calculator";

type RoiCalculatorProps = {
  onBookConsultation: () => void;
};

const inputClass =
  "w-full rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus:border-purple-400/60 focus:outline-none focus:shadow-[0_0_20px_rgba(168,85,247,0.15)]";

const labelClass = "mb-2 block text-left text-xs font-semibold text-zinc-400";

export function RoiCalculator({ onBookConsultation }: RoiCalculatorProps) {
  const [industryId, setIndustryId] = useState<RoiIndustryId>("startup");
  const [teamSize, setTeamSize] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(12);

  const result = useMemo(
    () => calculateRoiSavings(industryId, teamSize, hoursPerWeek),
    [industryId, teamSize, hoursPerWeek],
  );

  return (
    <div className="mx-auto w-full max-w-2xl text-left">
      <div className="mb-6 flex items-center justify-center gap-2 text-center sm:justify-start">
        <Calculator className="h-5 w-5 text-purple-400" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-300/80">
            ROI estimator
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            See what automation could save your team each month
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-500/25 bg-black/30 p-5 backdrop-blur-sm sm:p-6">
        <div className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="roi-industry">
              Industry
            </label>
            <select
              id="roi-industry"
              value={industryId}
              onChange={(e) => setIndustryId(e.target.value as RoiIndustryId)}
              className={`${inputClass} appearance-none`}
            >
              {ROI_INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.id} className="bg-zinc-900">
                  {ind.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="roi-team">
              Team size — {teamSize} people
            </label>
            <input
              id="roi-team"
              type="range"
              min={1}
              max={50}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="roi-range w-full"
            />
            <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
              <span>1</span>
              <span>50</span>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="roi-hours">
              Manual / repetitive hours per week — {hoursPerWeek}h
            </label>
            <input
              id="roi-hours"
              type="range"
              min={2}
              max={40}
              step={1}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="roi-range w-full"
            />
            <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
              <span>2h</span>
              <span>40h</span>
            </div>
          </div>
        </div>

        <motion.div
          key={`${industryId}-${teamSize}-${hoursPerWeek}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6 rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-950/50 to-violet-950/30 p-5"
        >
          <p className="text-sm text-zinc-400">Estimated monthly savings</p>
          <p className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            {formatInr(result.monthlySavingsInr)}
            <span className="text-base font-normal text-zinc-500"> /mo</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-green-400" />
              {formatInr(result.yearlySavingsInr)}/year
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-purple-400" />
              ~{result.hoursSavedMonthly}h saved / month
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-600">
            Based on typical AI automation for chat, docs, and workflows. Final
            ROI depends on your stack — Neurix confirms in a free consultation.
          </p>
        </motion.div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBookConsultation}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/40"
        >
          Get my custom plan
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
