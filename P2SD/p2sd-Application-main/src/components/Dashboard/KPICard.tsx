import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  status?: "normal" | "warning" | "critical";
  unit?: string;
}

const KPICard = ({ title, value, icon: Icon, status = "normal", unit }: KPICardProps) => {
  const statusColors = {
    normal: "border-success text-success",
    warning: "border-warning text-warning",
    critical: "border-danger text-danger",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: `hsl(var(--${status === "normal" ? "success" : status === "warning" ? "warning" : "danger"}))` }}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={cn("p-2 rounded-lg", status === "normal" ? "bg-success/10" : status === "warning" ? "bg-warning/10" : "bg-danger/10")}>
          <Icon className={cn("w-5 h-5", statusColors[status])} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", status === "normal" ? "bg-success" : status === "warning" ? "bg-warning animate-pulse" : "bg-danger animate-pulse")} />
        <span className={cn("text-xs font-medium", statusColors[status])}>
          {status === "normal" ? "Normal" : status === "warning" ? "Warning" : "Critical"}
        </span>
      </div>
    </Card>
  );
};

export default KPICard;
