import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Recipients = () => {
  // ✅ Only your email at initial load
  const [recipients, setRecipients] = useState<string[]>(["praptimore78@gmail.com"]);
  const [newEmail, setNewEmail] = useState("");
  const { toast } = useToast();

  const addRecipient = () => {
    if (!newEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (recipients.includes(newEmail)) {
      toast({
        title: "Duplicate Email",
        description: "This email is already added.",
        variant: "destructive",
      });
      return;
    }

    setRecipients([...recipients, newEmail]);
    toast({
      title: "Recipient Added",
      description: `${newEmail} will now receive alerts.`,
    });
    setNewEmail("");
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
    toast({
      title: "Recipient Removed",
      description: `${email} has been removed.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recipients</h1>
        <p className="text-muted-foreground">Manage email notifications for threshold alerts</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Add New Recipient
          </h3>

          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@company.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addRecipient()}
              className="flex-1"
            />
            <Button onClick={addRecipient} className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Active Recipients ({recipients.length})
          </h3>
          <div className="space-y-3">
            {recipients.map((email, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{email}</p>
                    <p className="text-sm text-muted-foreground">Receives alert notifications</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRecipient(email)}
                  className="text-danger hover:text-danger hover:bg-danger/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-secondary/5 border-secondary">
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-secondary-foreground">
          <Mail className="w-5 h-5" />
          How Notifications Work
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Recipients immediately get email alerts when thresholds are exceeded.</li>
          <li>• Email includes metric details and severity level.</li>
          <li>• You can add or remove recipients at any time.</li>
          <li>• All alerts are logged on the Threshold Alerts page.</li>
        </ul>
      </Card>
    </div>
  );
};

export default Recipients;
