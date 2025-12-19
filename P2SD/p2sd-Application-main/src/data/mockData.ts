export interface PipeData {
  assetId: string;
  Pipe_Size_mm: number;
  Thickness_mm: number;
  Material: string;
  Grade: string;
  Max_Pressure_psi: number;
  Temperature_C: number;
  Corrosion_Impact_Percent: number;
  Thickness_Loss_mm: number;
  Material_Loss_Percent: number;
  Time_Years: number;
  timestamp: string;
}

export interface ThresholdAlert {
  id: string;
  metric: string;
  previousValue: number;
  currentValue: number;
  threshold: number;
  timestamp: string;
  severity: "warning" | "critical";
  emailSent: boolean;
  recipients: string[];
}

export const allPipeData: PipeData[] = [
  {
    assetId: "PIPE-201",
    Pipe_Size_mm: 508,
    Thickness_mm: 12.5,
    Material: "Carbon Steel",
    Grade: "API 5L X65",
    Max_Pressure_psi: 1450,
    Temperature_C: 85,
    Corrosion_Impact_Percent: 15,
    Thickness_Loss_mm: 1.8,
    Material_Loss_Percent: 14.4,
    Time_Years: 8,
    timestamp: new Date().toISOString(),
  },
  {
    assetId: "PIPE-202",
    Pipe_Size_mm: 406,
    Thickness_mm: 10.0,
    Material: "Stainless Steel",
    Grade: "ASTM A106 Grade B",
    Max_Pressure_psi: 1200,
    Temperature_C: 72,
    Corrosion_Impact_Percent: 8,
    Thickness_Loss_mm: 1.2,
    Material_Loss_Percent: 12.0,
    Time_Years: 5,
    timestamp: new Date().toISOString(),
  },
  {
    assetId: "PIPE-203",
    Pipe_Size_mm: 610,
    Thickness_mm: 15.0,
    Material: "Carbon Steel",
    Grade: "API 5L X52",
    Max_Pressure_psi: 1350,
    Temperature_C: 78,
    Corrosion_Impact_Percent: 12,
    Thickness_Loss_mm: 1.5,
    Material_Loss_Percent: 10.0,
    Time_Years: 6,
    timestamp: new Date().toISOString(),
  },
  {
    assetId: "PIPE-204",
    Pipe_Size_mm: 305,
    Thickness_mm: 8.0,
    Material: "PVC",
    Grade: "ASTM A333 Grade 6",
    Max_Pressure_psi: 800,
    Temperature_C: 55,
    Corrosion_Impact_Percent: 5,
    Thickness_Loss_mm: 0.8,
    Material_Loss_Percent: 10.0,
    Time_Years: 3,
    timestamp: new Date().toISOString(),
  },
  {
    assetId: "PIPE-205",
    Pipe_Size_mm: 254,
    Thickness_mm: 6.5,
    Material: "HDPE",
    Grade: "API 5L X42",
    Max_Pressure_psi: 650,
    Temperature_C: 48,
    Corrosion_Impact_Percent: 3,
    Thickness_Loss_mm: 0.5,
    Material_Loss_Percent: 7.7,
    Time_Years: 2,
    timestamp: new Date().toISOString(),
  },
];

export const currentPipeData = allPipeData[0];

export const historicalData = Array.from({ length: 50 }, (_, i) => ({
  timestamp: new Date(Date.now() - (49 - i) * 3600000).toISOString(),
  Max_Pressure_psi: 1200 + Math.random() * 400,
  Temperature_C: 70 + Math.random() * 30,
}));

export const thresholdAlerts: ThresholdAlert[] = [
  {
    id: "alert-1",
    metric: "Max_Pressure_psi",
    previousValue: 1380,
    currentValue: 1450,
    threshold: 1400,
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    severity: "critical",
    emailSent: true,
    recipients: ["safety@company.com", "ops@company.com"],
  },
  {
    id: "alert-2",
    metric: "Temperature_C",
    previousValue: 78,
    currentValue: 85,
    threshold: 80,
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    severity: "warning",
    emailSent: true,
    recipients: ["safety@company.com"],
  },
  {
    id: "alert-3",
    metric: "Corrosion_Impact_Percent",
    previousValue: 12,
    currentValue: 15,
    threshold: 14,
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    severity: "warning",
    emailSent: true,
    recipients: ["safety@company.com", "ops@company.com", "maintenance@company.com"],
  },
];

export const defaultThresholds = {
  Max_Pressure_psi: 1400,
  Temperature_C: 80,
  Corrosion_Impact_Percent: 14,
  Thickness_Loss_mm: 2.0,
  Material_Loss_Percent: 15,
};

export const defaultRecipients = [
  "safety@company.com",
  "ops@company.com",
  "maintenance@company.com",
];
