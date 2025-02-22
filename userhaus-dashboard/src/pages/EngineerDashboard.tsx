
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
import {
  Settings,
  AlertTriangle,
  Check,
  FileDown,
  BarChart2,
  RefreshCcw,
  Activity,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Mock sensor data - would be replaced with real API data


// Mock data - will be replaced with real sensor data
const sensorData = [
  { time: "00:00", temperature: 22, humidity: 45, light: 0, soilPH: 6.5 },
  { time: "04:00", temperature: 20, humidity: 48, light: 0, soilPH: 6.5 },
  { time: "08:00", temperature: 23, humidity: 42, light: 800, soilPH: 6.6 },
  { time: "12:00", temperature: 27, humidity: 38, light: 1200, soilPH: 6.6 },
  { time: "16:00", temperature: 26, humidity: 40, light: 900, soilPH: 6.5 },
  { time: "20:00", temperature: 24, humidity: 43, light: 100, soilPH: 6.5 },
];


// Mock AI analysis results
const aiAnalysis = {
  diseaseDetection: {
    totalScanned: 1250,
    healthyCount: 1180,
    diseasedCount: 70,
    accuracy: 97.5
  },
  soilHealth: {
    status: "Good",
    confidence: 94,
    recommendations: [
      "Maintain current irrigation schedule",
      "Monitor pH levels in sector B",
      "Consider increasing organic matter content"
    ]
  }
};

const statusColors = {
  healthy: "text-green-500 bg-green-50",
  warning: "text-yellow-500 bg-yellow-50",
  critical: "text-red-500 bg-red-50",
};

 
        


const EngineerDashboard = () => {
  const handleGenerateReport = () => {
    // Simulate AI analysis and report generation
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: "AI analyzing data and generating comprehensive report...",
        success: "AI analysis complete. Report has been sent to Bank and Insurance dashboards",
        error: "Failed to generate report",
      }
    );
  };

  return (
    <DashboardLayout>
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Engineer Dashboard</h1>
          <p className="text-gray-500">
            Monitor and manage sensor diagnostics with AI-powered insights
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-soil-600 text-white rounded-lg hover:bg-soil-700 flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Generate AI Report
        </button>
      </div>

      {/* AI Vision Analysis */}
      <Card className="bg-gradient-to-br from-soil-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            360° Camera AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Disease Detection Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Healthy Plants</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {aiAnalysis.diseaseDetection.healthyCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Diseased Plants</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {aiAnalysis.diseaseDetection.diseasedCount}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">AI Accuracy</p>
                  <p className="text-2xl font-semibold text-soil-600">
                    {aiAnalysis.diseaseDetection.accuracy}%
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">AI Soil Analysis</h3>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-2xl font-semibold text-soil-600">{aiAnalysis.soilHealth.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recommendations</p>
                <ul className="mt-2 space-y-2">
                  {aiAnalysis.soilHealth.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
        </CardContent>
      </Card>

      

      {/* Historical Performance Chart */}
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
    </ DashboardLayout>
  );
};

export default EngineerDashboard;
