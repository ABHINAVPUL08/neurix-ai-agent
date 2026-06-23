export type RoiIndustryId =
  | "startup"
  | "hotel"
  | "law"
  | "healthcare"
  | "ecommerce"
  | "agency"
  | "saas"
  | "enterprise";

export type RoiIndustry = {
  id: RoiIndustryId;
  label: string;
  multiplier: number;
};

export const ROI_INDUSTRIES: RoiIndustry[] = [
  { id: "startup", label: "Startup / SMB", multiplier: 1 },
  { id: "hotel", label: "Hotel & hospitality", multiplier: 1.12 },
  { id: "law", label: "Law firm", multiplier: 1.28 },
  { id: "healthcare", label: "Healthcare clinic", multiplier: 1.2 },
  { id: "ecommerce", label: "E-commerce", multiplier: 1.15 },
  { id: "agency", label: "Marketing agency", multiplier: 1.1 },
  { id: "saas", label: "SaaS company", multiplier: 1.18 },
  { id: "enterprise", label: "Enterprise team", multiplier: 1.35 },
];

const BASE_HOURLY_INR = 650;
const WEEKS_PER_MONTH = 4.33;
/** Typical ops time reclaimed with AI automation workflows */
const AUTOMATION_SAVE_RATE = 0.48;

export type RoiResult = {
  monthlySavingsInr: number;
  yearlySavingsInr: number;
  hoursSavedMonthly: number;
  monthlyWasteInr: number;
};

export function calculateRoiSavings(
  industryId: RoiIndustryId,
  teamSize: number,
  hoursPerWeek: number,
): RoiResult {
  const industry =
    ROI_INDUSTRIES.find((i) => i.id === industryId) ?? ROI_INDUSTRIES[0];
  const teamFactor = 1 + Math.log10(Math.max(teamSize, 1)) * 0.38;
  const monthlyWasteInr =
    hoursPerWeek *
    WEEKS_PER_MONTH *
    BASE_HOURLY_INR *
    teamFactor *
    industry.multiplier;
  const monthlySavingsInr = Math.round(monthlyWasteInr * AUTOMATION_SAVE_RATE);
  const hoursSavedMonthly = Math.round(
    hoursPerWeek * WEEKS_PER_MONTH * AUTOMATION_SAVE_RATE,
  );

  return {
    monthlySavingsInr,
    yearlySavingsInr: monthlySavingsInr * 12,
    hoursSavedMonthly,
    monthlyWasteInr: Math.round(monthlyWasteInr),
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
