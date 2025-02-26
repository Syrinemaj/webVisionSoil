
import { Droplets, Thermometer, Activity } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

export const SoilHealthCard = () => {
  return (
    <DashboardCard title="Soil Health">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-soil-600" />
            <span className="text-sm">Moisture</span>
          </div>
          <span className="font-semibold">65%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-soil-600" />
            <span className="text-sm">Temperature</span>
          </div>
          <span className="font-semibold">22°C</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-soil-600" />
            <span className="text-sm">pH Level</span>
          </div>
          <span className="font-semibold">6.8</span>
        </div>
      </div>
    </DashboardCard>
  );
};
