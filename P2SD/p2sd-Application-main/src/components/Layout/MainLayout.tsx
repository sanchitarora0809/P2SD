import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
