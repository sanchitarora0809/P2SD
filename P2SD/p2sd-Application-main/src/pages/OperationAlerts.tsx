import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Clock, Mail, TrendingUp } from "lucide-react";

// --- API Column mapping ---
const apiColumnNames = [
    "AssetId", "_ingest_ts", "_record_id", "alarm_triggered", "compressor_state",
    "energy_consumption", "flow_rate", "pressure", "pump_speed", "pump_state",
    "segment_id", "temperature", "timestamp", "valve_status"
];

const numericColumns = ["energy_consumption", "flow_rate", "pressure", "pump_speed", "temperature"];

const mapData = (dataArray: any[], columnNames: string[]) => {
    return dataArray.map((row: any[]) => {
        const obj: any = {};
        columnNames.forEach((col, i) => {
            let v = row[i];
            if (v === null || v === undefined) v = "";
            if (numericColumns.includes(col)) v = Number(String(v).replace(/,/g, "")) || 0;
            obj[col] = v;
        });
        return obj;
    });
};

// ---------------- Monitored Metrics ----------------
const monitoredMetrics = [
    { metric: "pressure", title: "Pressure (psi)", threshold: 80 },
    { metric: "temperature", title: "Temperature (°C)", threshold: 60 },
    { metric: "flow_rate", title: "Flow Rate (m³/h)", threshold: 1000 },
    { metric: "energy_consumption", title: "Energy Consumption (kWh)", threshold: 40 },
];

// ---------------- ALERT CARD (NO PENDING / SUCCESS UI) ----------------
const AlertCard = ({ alert }: { alert: any }) => {
    let statusClass =
        alert.status === "CRITICAL"
            ? "bg-red-600"
            : alert.status === "WARNING"
            ? "bg-yellow-500"
            : "bg-green-600";

    let valueTextColor =
        alert.status === "CRITICAL"
            ? "text-red-600"
            : alert.status === "WARNING"
            ? "text-yellow-600"
            : "text-foreground";

    const recipients = ["praptimore78@gmail.com","sanchitarora0809@gmail.com"];

    return (
        <Card className="p-6 space-y-4 shadow-md border">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold">{alert.title}</h2>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{alert.timestamp}</span>
                    </div>
                </div>
                <div className={`text-xs font-bold text-white px-3 py-1 rounded ${statusClass}`}>
                    {alert.status}
                </div>
            </div>

            <div className="grid grid-cols-3 items-center">
                <div>
                    <p className="text-sm text-muted-foreground">Previous Value</p>
                    <p className="text-2xl font-semibold">{alert.previousValue}</p>
                </div>

                <div className="h-12 flex items-center">
                    <TrendingUp className={`w-5 h-5 ml-2 ${valueTextColor}`} />
                </div>

                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className={`text-2xl font-semibold ${valueTextColor}`}>{alert.currentValue}</p>
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* ONLY EMAIL SENT TO SECTION - NO STATUS */}
            <div className="space-y-2 text-sm">
                <div className="flex gap-2 items-center">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span>Email sent to:</span>
                    {recipients.map((e, i) => (
                        <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                            {e}
                        </span>
                    ))}
                </div>

                <div className="text-muted-foreground">
                    Threshold: <span className="font-semibold">{alert.threshold}</span> (Current Value: {alert.currentValue})
                </div>
            </div>
        </Card>
    );
};

// ---------------- MAIN PAGE ----------------
const OperationAlerts = () => {
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [dataList, setDataList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const emailedAlerts = useRef<Set<string>>(new Set());

    // fetch data
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
                const raw = json?.result?.data_array || [];
                const list = Array.isArray(raw) ? mapData(raw, apiColumnNames) : [];
                setDataList(list);
            })
            .catch((err: any) => { if (!mounted) return; setError(err?.message || "Failed to fetch data"); })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, []);

    // generate alerts
    const generatedAlerts = useMemo(() => {
        if (!dataList || dataList.length === 0) return [];

        const bySegment = dataList.reduce((acc: Record<string, any[]>, row: any) => {
            const id = row.segment_id || row.AssetId || "unknown";
            acc[id] = acc[id] || [];
            acc[id].push(row);
            return acc;
        }, {} as Record<string, any[]>);

        const alerts: any[] = [];
        let nextId = 1;

        Object.entries(bySegment).forEach(([segmentId, rows]: [string, any[]]) => {
            monitoredMetrics.forEach((m) => {
                const key = m.metric;
                const history = rows.filter(d => d[key] !== undefined && d[key] !== "");
                if (history.length === 0) return;

                const last = history[history.length - 1] || {};
                const prev = history[history.length - 2] || last;
                const currentValue = Number(last[key] ?? 0);
                const previousValue = Number(prev[key] ?? 0);
                const threshold = m.threshold;
                const status =
                    currentValue > threshold
                        ? "CRITICAL"
                        : currentValue > threshold * 0.95
                        ? "WARNING"
                        : "NORMAL";

                alerts.push({
                    id: `${segmentId}-${m.metric}-${nextId++}`,
                    segmentId,
                    metric: m.metric,
                    title: `${segmentId} — ${m.title}`,
                    previousValue,
                    currentValue,
                    threshold,
                    status,
                    timestamp: last.timestamp || new Date().toISOString()
                });
            });
        });

        return alerts;
    }, [dataList]);

    // ---- SEND EMAIL (FIXED JSON BUG) ----
    const sendEmailAlert = async (alert: any) => {
        if (emailedAlerts.current.has(alert.id)) return;

        const payload = {
            to: ["praptimore78@gmail.com","sanchitarora0809@gmail.com"],
            subject: `⚠ Threshold Breach: ${alert.title}`,
            body:
                `An anomaly has been detected.
                Segment: ${alert.segmentId}
                Metric: ${alert.metric}
                Previous Value: ${alert.previousValue}
                Current Value: ${alert.currentValue}
                Threshold: ${alert.threshold}
                Severity: ${alert.status}
                Timestamp: ${alert.timestamp}`
        };

        try {
            await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: JSON.stringify(payload)
            });

            emailedAlerts.current.add(alert.id);
        } catch (err) {
            console.error("Email error:", err);
        }
    };

    // send emails for critical/warning
    useEffect(() => {
        generatedAlerts.forEach(alert => {
            if ((alert.status === "CRITICAL" || alert.status === "WARNING") &&
                !emailedAlerts.current.has(alert.id)) {
                sendEmailAlert(alert);
            }
        });
    }, [generatedAlerts]);

    const filtered = useMemo(() => {
        return filterStatus === "ALL"
            ? generatedAlerts.filter((a) => a.status === "CRITICAL" || a.status === "WARNING")
            : generatedAlerts.filter((a) => a.status === filterStatus);
    }, [filterStatus, generatedAlerts]);

    const options = ["ALL", "CRITICAL", "WARNING"];

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Operation Threshold Alerts</h1>
                    <p className="text-muted-foreground">Monitor threshold breaches and notifications</p>
                </div>

                <div className="flex items-center gap-2">
                    <Label htmlFor="status">Status Filter:</Label>
                    <select
                        id="status"
                        className="border rounded p-2 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filtered.length ? (
                    filtered.map(alert => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))
                ) : (
                    <Card className="p-6 text-center text-muted-foreground">No alerts found for this filter.</Card>
                )}
            </div>
        </div>
    );
};

export default OperationAlerts;
