
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayoutf";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Thermometer, Droplet, Sun, Leaf } from "lucide-react";

// Mock data - will be replaced with real sensor data
const sensorData = [
  { time: "00:00", temperature: 22, humidity: 45, light: 0, soilPH: 6.5 },
  { time: "04:00", temperature: 20, humidity: 48, light: 0, soilPH: 6.5 },
  { time: "08:00", temperature: 23, humidity: 42, light: 800, soilPH: 6.6 },
  { time: "12:00", temperature: 27, humidity: 38, light: 1200, soilPH: 6.6 },
  { time: "16:00", temperature: 26, humidity: 40, light: 900, soilPH: 6.5 },
  { time: "20:00", temperature: 24, humidity: 43, light: 100, soilPH: 6.5 },
];

const SensorCard = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}) => (
  <Card className="p-6 glass">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-lg ${color} flex-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">
          {value}
          <span className="text-lg text-gray-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  </Card>
);

const FarmerDashboard = () => {
  return (
    <DashboardLayout>
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Farmer Dashboard</h1>
        <p className="text-gray-500">
          Monitor your field conditions and sensor readings in real-time
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SensorCard
          title="Temperature"
          value={24}
          unit="°C"
          icon={Thermometer}
          color="bg-red-500"
        />
        <SensorCard
          title="Humidity"
          value={45}
          unit="%"
          icon={Droplet}
          color="bg-blue-500"
        />
        <SensorCard
          title="Light Intensity"
          value={850}
          unit="lux"
          icon={Sun}
          color="bg-yellow-500"
        />
        <SensorCard
          title="Soil pH"
          value={6.5}
          unit="pH"
          icon={Leaf}
          color="bg-soil-600"
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sensor Readings Timeline</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="light"
                stroke="#eab308"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="soilPH"
                stroke="#34A853"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
