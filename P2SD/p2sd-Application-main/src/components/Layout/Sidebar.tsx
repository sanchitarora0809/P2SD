import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, LineChart, Bell, Users, MessageSquare } from "lucide-react";

const menuItems = [
  //{ to: "/", icon: LayoutDashboard, label: "Predictive Intelligence Dashboard" },
  //{ to: "/graphs", icon: LineChart, label: "Predictive Intelligence Graphs" },
  //{ to: "/alerts", icon: Bell, label: "Predictive Intelligence Threshold Alerts" },
  { to: "/operation-dashboard", icon: LayoutDashboard, label: "Operation & Maintanace Dashboard" },
  { to: "/operation-graph", icon: LineChart, label: "Operation & Maintanace Graphs"},
  { to: "/operation-alerts", icon: MessageSquare, label: "Operation & Maintanace Alerts"},
 // { to: "/recipients", icon: Users, label: "Recipients" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
