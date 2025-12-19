import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { thresholdAlerts } from "@/data/mockData";
import { TrendingUp, TrendingDown, Mail, Clock } from "lucide-react";

const ThresholdAlerts = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Predictive Intelligence Threshold Alerts</h1>
        <p className="text-muted-foreground">Monitor threshold breaches and notifications</p>
      </div>

      <div className="space-y-4">
        {thresholdAlerts.map((alert) => {
          // Override recipients to always use praptimore78@gmail.com
          const recipients = ["praptimore78@gmail.com"];

          // Only show critical and warning alerts
          if (alert.severity !== "critical" && alert.severity !== "warning") return null;

          return (
            <Card
              key={alert.id}
              className={`p-6 border-l-4 ${
                alert.severity === "critical" ? "border-l-danger" : "border-l-warning"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{alert.metric.replace(/_/g, " ")}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={alert.severity === "critical" ? "destructive" : "secondary"}
                  className={alert.severity === "warning" ? "bg-warning text-warning-foreground" : ""}
                >
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Previous Value</p>
                  <p className="text-2xl font-bold text-foreground">{alert.previousValue}</p>
                </div>
                <div className="flex items-center justify-center">
                  {alert.currentValue > alert.previousValue ? (
                    <TrendingUp className="w-8 h-8 text-danger" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-success" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                  <p className="text-2xl font-bold text-foreground">{alert.currentValue}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {alert.emailSent ? "Email sent to:" : "Notification pending"}
                  </span>
                </div>
                {alert.emailSent && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success">
                    ✓ Email Sent
                  </Badge>
                )}
              </div>

              {alert.emailSent && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {recipients.map((recipient, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {recipient}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Threshold: </span>
                  <span className="text-muted-foreground">{alert.threshold}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Exceeded by {Math.abs(alert.currentValue - alert.threshold).toFixed(1)})
                  </span>
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ThresholdAlerts;
