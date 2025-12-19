import { useState, useMemo } from "react";
import KPICard from "@/components/Dashboard/KPICard";
import { allPipeData, defaultThresholds } from "@/data/mockData";
import {
  Gauge,
  Ruler,
  Package,
  Award,
  Activity,
  Thermometer,
  AlertTriangle,
  TrendingDown,
  Percent,
  Clock,
  Calendar,
  Tag,
  RefreshCw, // For Reload button
  ChevronDown, // For Dropdown icon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; 

// Placeholder for a date/time picker component
const DateTimeFilter = ({ date, time, onDateChange, onTimeChange }: any) => (
  <div className="flex space-x-1.5 items-center">
    {/* Date Input */}
    <div className="relative">
      <input 
          type="date" 
          value={date} 
          onChange={(e) => onDateChange(e.target.value)} 
          className="p-1 border rounded text-xs w-[110px]" 
      />
    </div>
    {/* Time Input */}
    <div className="flex items-center space-x-1">
        <span className="text-muted-foreground">—</span>
        <div className="relative">
            <input 
                type="time" 
                value={time} 
                onChange={(e) => onTimeChange(e.target.value)} 
                className="p-1 border rounded text-xs w-[75px]" 
            />
        </div>
    </div>
  </div>
);

// Single-Select Dropdown Component - SIZES REDUCED AND ALIGNED FOR FILTER BAR
const SingleSelectDropdown = ({ label, options, selected, onChange, widthClass = "w-[150px]" }: { label: string, options: string[], selected: string, onChange: (value: string) => void, widthClass?: string }) => (
    <div className="space-y-0.5"> 
        <Label className="text-xs font-normal text-muted-foreground">{label}</Label> 
        <div className="relative">
            <select 
                value={selected} 
                onChange={(e) => onChange(e.target.value)} 
                className={`p-1 border rounded text-xs appearance-none bg-white ${widthClass}`} // Adjusted styling for filter bar
            >
                <option value="">Select an option</option>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
    </div>
);


// Placeholder for a Badge/Pill component for Predicted Condition
const ConditionBadge = ({ condition }: { condition: string }) => {
    const color = condition === 'CRITICAL' ? 'bg-red-600' : 'bg-green-600';
    return (
        <div className={`p-1 px-3 text-xs font-semibold text-white rounded-md ${color} shadow-sm`}>
            {condition.toUpperCase()}
        </div>
    );
}

const materialOptions = ["Carbon Steel", "Stainless Steel", "PVC", "HDPE"];
const gradeOptions = [
  "API 5L X42",
  "API 5L X52",
  "API 5L X65",
  "ASTM A106 Grade B",
  "ASTM A333 Grade 6",
];

const Dashboard = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<string>(""); 
  const [selectedGrade, setSelectedGrade] = useState<string>("");
    
  const [selectedDate, setSelectedDate] = useState<string>('2025-11-14'); 
  const [selectedTime, setSelectedTime] = useState<string>('17:44'); 
  const [assetIdFilter, setAssetIdFilter] = useState<string>('PIPE-201'); 

  const [lastReload, setLastReload] = useState(Date.now()); 
  const handleReload = () => setLastReload(Date.now());
  
  const handleClear = () => {
    setSelectedMaterial("");
    setSelectedGrade("");
    setSelectedDate('');
    setSelectedTime('');
  }
  
  const handleGoBack = handleClear; 

  const filteredPipeData = useMemo(() => {
    let filtered = allPipeData.filter(pipe => pipe.assetId === assetIdFilter); 
    
    if (selectedMaterial) {
      filtered = filtered.filter((pipe) => pipe.Material === selectedMaterial);
    }
    
    if (selectedGrade) {
      filtered = filtered.filter((pipe) => pipe.Grade === selectedGrade);
    }
    
    return filtered;
  }, [selectedMaterial, selectedGrade, assetIdFilter, lastReload]); 

  const aggregatedData = useMemo(() => {
    if (filteredPipeData.length === 0) return null;

    const avg = (key: keyof typeof filteredPipeData[0]) => {
      const values = filteredPipeData.map((p) => p[key] as number).filter((v) => typeof v === "number");
      return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
    };

    const assetIdValue = filteredPipeData.length === 1 ? filteredPipeData[0].assetId : `${filteredPipeData.length} Assets`;
    const timestamp = filteredPipeData.length > 0 ? filteredPipeData[0].timestamp : new Date().toISOString(); 
    const lastUpdatedDate = '2025-11-14';
    const lastUpdatedTime = '17:44:02';

    return {
      assetId: assetIdValue,
      Pipe_Size_mm: Math.round(avg("Pipe_Size_mm") * 10) / 10 || 764,
      Thickness_mm: Math.round(avg("Thickness_mm") * 10) / 10 || 26,
      Material: filteredPipeData.length === 1 ? filteredPipeData[0].Material : "PVC",
      Grade: filteredPipeData.length === 1 ? filteredPipeData[0].Grade : "API 5L X52",
      Max_Pressure_psi: Math.round(avg("Max_Pressure_psi")) || 1308,
      Temperature_C: Math.round(avg("Temperature_C")) || 49,
      Corrosion_Impact_Percent: Math.round(avg("Corrosion_Impact_Percent")) || 10,
      Thickness_Loss_mm: Math.round(avg("Thickness_Loss_mm") * 10) / 10 || 5,
      Material_Loss_Percent: Math.round(avg("Material_Loss_Percent") * 10) / 10 || 48.6,
      Time_Years: Math.round(avg("Time_Years")) || 10,
      timestamp: timestamp, 
      lastUpdatedDate: lastUpdatedDate, 
      lastUpdatedTime: lastUpdatedTime, 
    };
  }, [filteredPipeData]); 

  // --- Status Logic ---
  const getDisplayStatus = (metric: string, value: number): "normal" | "warning" | "critical" => {
    if (assetIdFilter !== 'PIPE-201') return "normal"; 

    if (metric === "Material_Loss_Percent" || metric === "Max_Pressure_psi") return "critical"; 
    if (metric === "Temperature_C" || metric === "Corrosion_Impact_Percent" || (metric === "Thickness_Loss_mm" && value > 0)) return "warning"; 
    
    return "normal";
  };
  // --------------------

  if (!aggregatedData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Predictive Intelligence Dashboard</h2>
            <ConditionBadge condition="N/A" />
        </div>
        
        <Card className="p-6 flex flex-col items-center justify-center space-y-4">
          <p className="text-muted-foreground text-center">No data matching selected filters.</p>
          <Button onClick={handleGoBack} variant="default">
             Go Back & Reset Filters
          </Button>
        </Card>
      </div>
    );
  }
  
  const predictedCondition = aggregatedData.assetId === 'PIPE-201' ? 'CRITICAL' : 'NORMAL';

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Predictive Intelligence Dashboard</h1>
        <div className="flex justify-between items-center text-sm">
            <p className="text-muted-foreground">Real-time — **{aggregatedData.assetId}**</p>
            {/* Predicted Condition in a small rectangle box */}
            <div className="flex items-center space-x-2">
                <Label className="font-semibold">Predicted Condition</Label>
                <ConditionBadge condition={predictedCondition} />
            </div>
        </div>

        {/* FILTER BAR SECTION (Date/Time + Material + Grade + Buttons) */}
        <div className="flex items-end flex-wrap gap-4 p-2 border rounded-md bg-gray-50/50">
            
            {/* 1. Date/Time Filter Group */}
            <div className="flex items-center space-x-2">
                <Label htmlFor="date-time-picker" className="text-xs text-muted-foreground">Date</Label>
                <DateTimeFilter 
                    date={selectedDate} 
                    time={selectedTime} 
                    onDateChange={setSelectedDate} 
                    onTimeChange={setSelectedTime} 
                />
            </div>

            {/* 2. Material Filter */}
            <SingleSelectDropdown
                label="Material"
                options={materialOptions}
                selected={selectedMaterial}
                onChange={setSelectedMaterial}
                widthClass="w-[120px]" // Small width
            />

            {/* 3. Grade Filter */}
            <SingleSelectDropdown
                label="Grade"
                options={gradeOptions}
                selected={selectedGrade}
                onChange={setSelectedGrade}
                widthClass="w-[140px]" // Small width
            />
            
            {/* 4. Action Buttons */}
            <div className="flex items-center space-x-2">
                <Button onClick={handleReload} variant="outline" size="sm" className="flex items-center text-xs p-1 h-auto">
                    <RefreshCw className="h-3 w-3 mr-1" /> Reload
                </Button>
                <Button onClick={handleClear} variant="outline" size="sm" className="text-xs p-1 h-auto">
                    Clear
                </Button>
            </div>
        </div>
      </div>
      
      {/* KPI CARD SECTION - 4 COLUMNS PER ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        <KPICard title="Asset ID" value={aggregatedData.assetId} icon={Tag} status="normal"/>
        <KPICard title="Last Updated Time" value={aggregatedData.lastUpdatedTime} icon={Clock} status="normal"/>
        <KPICard title="Last Updated Date" value={aggregatedData.lastUpdatedDate} icon={Calendar} status="normal"/>
        <KPICard title="Pipe Size" value={aggregatedData.Pipe_Size_mm} icon={Ruler} status={getDisplayStatus("Pipe_Size_mm", aggregatedData.Pipe_Size_mm)} unit="mm"/>
        
        <KPICard title="Wall Thickness" value={aggregatedData.Thickness_mm} icon={Gauge} status={getDisplayStatus("Thickness_mm", aggregatedData.Thickness_mm)} unit="mm"/>
        <KPICard title="Material" value={aggregatedData.Material} icon={Package} status={getDisplayStatus("Material", 0)}/>
        <KPICard title="Grade" value={aggregatedData.Grade} icon={Award} status={getDisplayStatus("Grade", 0)}/>
        <KPICard title="Max Pressure" value={aggregatedData.Max_Pressure_psi} icon={Activity} status={getDisplayStatus("Max_Pressure_psi", aggregatedData.Max_Pressure_psi)} unit="psi"/>
        
        <KPICard title="Temperature" value={aggregatedData.Temperature_C} icon={Thermometer} status={getDisplayStatus("Temperature_C", aggregatedData.Temperature_C)} unit="°C"/>
        <KPICard title="Corrosion Impact" value={aggregatedData.Corrosion_Impact_Percent} icon={AlertTriangle} status={getDisplayStatus("Corrosion_Impact_Percent", aggregatedData.Corrosion_Impact_Percent)} unit="%"/>
        <KPICard title="Thickness Loss" value={aggregatedData.Thickness_Loss_mm} icon={TrendingDown} status={getDisplayStatus("Thickness_Loss_mm", aggregatedData.Thickness_Loss_mm)} unit="mm"/>
        <KPICard title="Material Loss" value={aggregatedData.Material_Loss_Percent} icon={Percent} status={getDisplayStatus("Material_Loss_Percent", aggregatedData.Material_Loss_Percent)} unit="%"/>

        <KPICard title="Service Time" value={aggregatedData.Time_Years} icon={Clock} status="normal" unit="years"/>
        
      </div>
    </div>
  );
};

export default Dashboard;