import React, { useState, useMemo, useEffect } from "react";
// Assuming KPICard, Card, Label, Button are correctly imported from shadcn/ui or custom components
import KPICard from "@/components/Dashboard/KPICard"; 
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; 
import {
  Tag, 
  Clock, 
  Thermometer, 
  Activity, 
  Zap, 
  Gauge, 
  Settings, 
  RefreshCw,
  Calendar,
  Waves, // For Vibration
  Hammer, // For Maintenance
  ChevronDown,
} from "lucide-react";

// ---------------- 1. API COLUMN DEFINITIONS ----------------
const apiColumnNames = [
  "AssetId", "_ingest_ts", "_record_id", "alarm_triggered", "compressor_state", 
  "energy_consumption", "flow_rate", "pressure", "pump_speed", "pump_state", 
  "segment_id", "temperature", "timestamp", "valve_status"
];

const numericColumns = [
  "energy_consumption", "flow_rate", "pressure", "pump_speed", "temperature"
];

const mapData = (dataArray, columnNames) => {
  return dataArray.map(row => {
    const rowObject = {};
    columnNames.forEach((colName, index) => {
      let value = row[index];
      if (numericColumns.includes(colName)) value = Number(value);
      rowObject[colName] = value;
    });
    return rowObject;
  });
};

// ---------------- Thresholds ----------------
const thresholds = {
  Pressure: 80,
  Temperature: 60,
  Vibration: 5.0,
  Energy: 40,
  FlowRate: 1000,
  Alarms: 50,
  MaintenanceDue: 30,
};

// --- Custom Components ---
const DateTimeFilter = ({ date, time, onDateChange, onTimeChange }) => (
  <div className="flex space-x-1.5 items-center flex-shrink-0">
    <div className="relative flex-shrink-0">
      <input 
        type="date" 
        value={date} 
        onChange={(e) => onDateChange(e.target.value)} 
        className="p-1 border rounded text-xs w-[110px] min-w-[110px]" 
      />
    </div>
    <div className="flex items-center space-x-1 flex-shrink-0">
      <span className="text-muted-foreground">—</span>
      <div className="relative flex-shrink-0">
        <input 
          type="time" 
          value={time} 
          onChange={(e) => onTimeChange(e.target.value)} 
          className="p-1 border rounded text-xs w-[75px] min-w-[75px]" 
        />
      </div>
    </div>
  </div>
);

const ConditionBadge = ({ condition }) => {
  const color = condition === 'CRITICAL' ? 'bg-red-600' : 
                condition === 'WARNING' ? 'bg-yellow-500' : 'bg-green-600';
  return (
    <div className={`p-1 px-3 text-xs font-semibold text-white rounded-md ${color} shadow-sm`}>
      {condition.toUpperCase()}
    </div>
  );
}

type SingleSelectDropdownProps = {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  widthClass?: string;
};
const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({ label, options, selected, onChange, widthClass = "w-[120px]" }) => (
  <div className="space-y-0.5 flex-shrink-0">
    <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
    <div className="relative flex-shrink-0">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className={`p-1 border rounded text-xs appearance-none bg-white ${widthClass}`}
      >
        <option value="">Select All</option>
        {[...new Set(options)].map((option: string) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
    </div>
  </div>
);

const getStatus = (value, threshold, isCriticalHigh) => {
  const numValue = Number(value) || 0;
  if (isCriticalHigh) {
    if (numValue >= threshold * 1.1) return "critical";
    if (numValue >= threshold) return "warning";
  } else {
    if (numValue <= threshold * 0.5) return "critical";
    if (numValue <= threshold) return "warning";
  }
  return "normal";
};

// --- Main Component ---
const OperationMaintenanceDashboard = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastReload, setLastReload] = useState(Date.now()); 
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  
  // Temporary state for date/time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const ADX_DASHBOARD_URL = "https://dataexplorer.azure.com/dashboards/34af0426-4cc4-4586-9926-73095bf25d2b?p-_startTime=1hours&p-_endTime=now&p-_DeviceName=all#fa0a6423-2d22-4628-a602-5c9db09d810d";

  const handleReload = () => setLastReload(Date.now());
  const handleClear = () => {
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDeviceId('');
  }

  const deviceOptions = useMemo(() => {
    const ids = dataList
      .map(d => (d.segment_id || d.SegmentId || d.segmentId || d.AssetId || d.assetId))
      .filter(Boolean)
      .map(String);
    return Array.from(new Set(ids));
  }, [dataList]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch("http://localhost:7071/api/GetDatabricksData")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        const rawData = json.result?.data_array || [];
        const mappedList = mapData(rawData, apiColumnNames);
        setDataList(mappedList);
        if (!selectedDeviceId && mappedList.length) {
          const firstSeg = mappedList[0].segment_id || mappedList[0].SegmentId || mappedList[0].segmentId || mappedList[0].AssetId || mappedList[0].assetId;
          if (firstSeg) setSelectedDeviceId(firstSeg);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("API Fetch Error:", err);
        setError(err?.message || "Failed to fetch data");
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [lastReload, selectedDeviceId]);
const currentDeviceData = useMemo(() => {
  if (!selectedDeviceId || !dataList.length) return null;

  // Filter by selected device
  const deviceData = dataList.filter((d) => {
    const devId = d.segment_id || d.SegmentId || d.segmentId || d.AssetId || d.assetId;
    return devId === selectedDeviceId;
  });
  if (!deviceData.length) return null;

  // Filter by date if selected
  let filteredData = selectedDate
    ? deviceData.filter((d) => {
        const ts = d.timestamp || d._ingest_ts || "";
        const datePart = ts.split("T")[0]; // YYYY-MM-DD
        return datePart === selectedDate;
      })
    : deviceData;

  if (!filteredData.length) return null;

  // Filter by time string if selected
  if (selectedTime) {
    const timePart = selectedTime.length === 5 ? selectedTime : selectedTime.slice(0, 5);

    // Try exact match first (match HH:MM)
    const exactMatch = filteredData.find((d) => {
      const ts = d.timestamp || d._ingest_ts || "";
      const tsTime = ts.split("T")[1]?.slice(0, 5); // get HH:MM
      return tsTime === timePart;
    });
    if (exactMatch) return buildDeviceObject(exactMatch);

    // If exact not found → pick latest available reading for that date
    const latest = filteredData.reduce((prev, curr) =>
      (curr.timestamp || curr._ingest_ts) > (prev.timestamp || prev._ingest_ts) ? curr : prev
    );
    return buildDeviceObject(latest);
  }

  // If no time selected, return latest reading
  const latest = filteredData.reduce((prev, curr) =>
    (curr.timestamp || curr._ingest_ts) > (prev.timestamp || prev._ingest_ts) ? curr : prev
  );
  return buildDeviceObject(latest);
}, [selectedDeviceId, dataList, selectedDate, selectedTime]);



  // ---------- Helper: Convert HH:MM:SS to seconds ----------
  function convertTimeToSeconds(t) {
    const [h, m, s] = t.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  }

  // ---------- Helper: Build Final Device Object ----------
  function buildDeviceObject(data) {
    const pressureVal = data.pressure || 0;
    const tempVal = data.temperature || 0;
    const flowVal = data.flow_rate || 0;
    const energyVal = data.energy_consumption || 0;
    const valveStatusVal = data.valve_status || "UNKNOWN";

    const vibrationVal = 3.5;
    const runTimeVal = 874;
    const maintenanceDueVal = 15;
    const alarmsTriggeredVal = data.alarm_triggered === "true" ? 1 : 0;

    const predictedCondition =
      pressureVal > thresholds.Pressure * 1.1 ||
      tempVal > thresholds.Temperature * 1.1
        ? "CRITICAL"
        : pressureVal > thresholds.Pressure * 0.95 ||
          tempVal > thresholds.Temperature * 0.95
        ? "WARNING"
        : "NORMAL";

    const lastTs = new Date(data.timestamp || data._ingest_ts);
    const lastDate = lastTs.toISOString().split("T")[0];
    const lastTime = lastTs.toISOString().split("T")[1].slice(0, 8);

    return {
      assetId: data.AssetId,
      LastTimestamp: {
        full: lastTs.toISOString(),
        date: lastDate,
        time: lastTime,
      },
      Pressure: {
        value: pressureVal.toFixed(2),
        status: getStatus(pressureVal, thresholds.Pressure, true),
      },
      FlowRate: {
        value: flowVal.toFixed(2),
        status: getStatus(flowVal, thresholds.FlowRate, true),
      },
      Temperature: {
        value: tempVal.toFixed(2),
        status: getStatus(tempVal, thresholds.Temperature, true),
      },
      Vibration: {
        value: vibrationVal.toFixed(2),
        status: getStatus(vibrationVal, thresholds.Vibration, true),
      },
      EnergyConsumption: {
        value: energyVal.toFixed(2),
        status: getStatus(energyVal, thresholds.Energy, true),
      },
      ValveStatus: {
        value: valveStatusVal,
        status:
          valveStatusVal.toUpperCase() === "OPEN" ? "normal" : "warning",
      },
      RunTime: { value: runTimeVal.toFixed(0), status: "normal" },
      MaintenanceDue: {
        value: maintenanceDueVal.toFixed(0),
        status: getStatus(
          maintenanceDueVal,
          thresholds.MaintenanceDue,
          false
        ),
      },
      AlarmsTriggered: {
        value: alarmsTriggeredVal,
        status: getStatus(alarmsTriggeredVal, thresholds.Alarms, true),
      },
      PredictedCondition: predictedCondition,
    };
  }

  const handleOpenADX = () => {
    window.open(ADX_DASHBOARD_URL, '_blank');
  };

  if (loading) return <div className="p-6"><h2 className="text-xl font-bold">Operation & Maintenance Dashboard</h2><p className="text-muted-foreground mt-2">Loading data...</p></div>;
  if (error) return <div className="p-6"><h2 className="text-xl font-bold">Operation & Maintenance Dashboard</h2><Card className="p-6 mt-4"><p className="text-destructive">Data Fetch Error: {error}. Check your API status.</p><div className="mt-4"><Button onClick={handleReload}>Retry</Button></div></Card></div>;
  if (!currentDeviceData) return <div className="space-y-6 p-4"><div className="flex justify-between items-center"><h2 className="text-xl font-bold">Operation & Maintenance Dashboard</h2><ConditionBadge condition="N/A" /></div><Card className="p-6 flex flex-col items-center justify-center space-y-4"><p className="text-muted-foreground text-center">{dataList.length === 0 ? "Data loaded successfully but is empty. Check your API payload." : `No data found for the selected Device ID: ${selectedDeviceId}.`}</p><Button onClick={handleClear} variant="default">Reset Filters</Button></Card></div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operation & Maintenance Dashboard</h1>
            <p className="text-muted-foreground text-sm">Real-time — **{currentDeviceData.assetId}**</p>
          </div>
          <ConditionBadge condition={currentDeviceData.PredictedCondition} />
        </div>

        <div className="flex flex-wrap items-center justify-start gap-1.5 p-2 border rounded-md bg-gray-50/50">
          <DateTimeFilter 
            date={selectedDate} 
            time={selectedTime} 
            onDateChange={setSelectedDate} 
            onTimeChange={setSelectedTime} 
          />
          <SingleSelectDropdown
            label="Device ID"
            options={deviceOptions}
            selected={selectedDeviceId}
            onChange={setSelectedDeviceId}
            widthClass="w-[140px]"
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleReload} variant="outline" size="sm" className="flex items-center text-xs p-1 h-auto">
              <RefreshCw className="h-3 w-3 mr-1" /> Reload
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm" className="text-xs p-1 h-auto">Clear</Button>
            <Button onClick={handleOpenADX} variant="default" size="sm" className="text-xs p-1 h-auto bg-blue-600 hover:bg-blue-700">ADX Dashboard</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr w-full">
        <KPICard title="Asset ID" value={currentDeviceData.assetId} icon={Tag} />
        <KPICard title=" Date (UTC)" value={currentDeviceData.LastTimestamp.date}  icon={Calendar} />
        <KPICard title=" Time (UTC)" value={currentDeviceData.LastTimestamp.time} icon={Clock}/>
        <KPICard title="Pressure" value={currentDeviceData.Pressure.value} icon={Activity} status={currentDeviceData.Pressure.status as "normal"|"warning"|"critical"} unit="psi"/>
        <KPICard title="Flow Rate" value={currentDeviceData.FlowRate.value} icon={Gauge} status={currentDeviceData.FlowRate.status as "normal"|"warning"|"critical"} unit="m³/h"/>
        <KPICard title="Temperature" value={currentDeviceData.Temperature.value} icon={Thermometer} status={currentDeviceData.Temperature.status as "normal"|"warning"|"critical"} unit="°C"/>
        <KPICard title="Vibration Level" value={currentDeviceData.Vibration.value} icon={Waves} status={currentDeviceData.Vibration.status as "normal"|"warning"|"critical"} unit="mm/s"/>
        <KPICard title="Energy Consumption" value={currentDeviceData.EnergyConsumption.value} icon={Zap} status={currentDeviceData.EnergyConsumption.status as "normal"|"warning"|"critical"} unit="kWh"/>
         <KPICard title="Valve Status" value={currentDeviceData.ValveStatus.value} icon={Settings} />
        <KPICard title="Run Time" value={currentDeviceData.RunTime.value} icon={Clock} status={(currentDeviceData.RunTime.status as unknown) as "normal"|"warning"|"critical"} unit="Hours"/>
        <KPICard title="Maintenance Due" value={currentDeviceData.MaintenanceDue.value} icon={Hammer} status={currentDeviceData.MaintenanceDue.status as "normal"|"warning"|"critical"} unit="Days"/>
        <KPICard title="Alarms Triggered" value={currentDeviceData.AlarmsTriggered.value} icon={Activity} status={currentDeviceData.AlarmsTriggered.status as "normal"|"warning"|"critical"} />
      </div>
    </div>
  );
};

export default OperationMaintenanceDashboard;
