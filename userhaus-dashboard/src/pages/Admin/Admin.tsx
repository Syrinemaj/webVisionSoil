
import { useState, useEffect } from "react";
import {  TreePine, Bot, Droplet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api";
import { DashboardStats } from "@/lib/types";
import { StatCard } from "@/components/dashboard/StatCard";

import { Leaf, Users, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

const COLORS = ["#2D9596", "#9AD0C2", "#4BB543", "#FFA500", "#FF0033"];

// Sample data for additional analytics
const monthlySensorData = [
  { name: 'Jan', temperature: 25, humidity: 62, soil_ph: 6.5 },
  { name: 'Feb', temperature: 26, humidity: 60, soil_ph: 6.4 },
  { name: 'Mar', temperature: 27, humidity: 58, soil_ph: 6.3 },
  { name: 'Apr', temperature: 28, humidity: 55, soil_ph: 6.2 },
  { name: 'May', temperature: 30, humidity: 52, soil_ph: 6.0 },
  { name: 'Jun', temperature: 32, humidity: 50, soil_ph: 5.9 },
  { name: 'Jul', temperature: 33, humidity: 48, soil_ph: 5.8 },
  { name: 'Aug', temperature: 32, humidity: 52, soil_ph: 6.0 },
  { name: 'Sep', temperature: 30, humidity: 55, soil_ph: 6.2 },
  { name: 'Oct', temperature: 28, humidity: 58, soil_ph: 6.4 },
  { name: 'Nov', temperature: 26, humidity: 60, soil_ph: 6.5 },
  { name: 'Dec', temperature: 25, humidity: 62, soil_ph: 6.6 },
];

const farmPerformance = [
  { name: 'Green Valley Farm', efficiency: 85, productivity: 92 },
  { name: 'Sunset Fields', efficiency: 78, productivity: 85 },
  { name: 'Golden Acre Farm', efficiency: 70, productivity: 75 },
];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [robotDistribution, setRobotDistribution] = useState<any[]>([]);
  const [robotStatus, setRobotStatus] = useState<any[]>([]);
  const [farmStatus, setFarmStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, robotDist, robotStat, farmStat] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRobotDistributionByFarm(),
          dashboardApi.getRobotStatusOverview(),
          dashboardApi.getFarmStatusDistribution()
        ]);
        
        setStats(statsData);
        setRobotDistribution(robotDist);
        setRobotStatus(robotStat);
        setFarmStatus(farmStat);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border border-soil-200 glass-card">
          <CardContent className="p-6">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Welcome to VisionSoil Admin. Here's an overview of your system."
      />

      
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Farmers"
            value="124"
            icon={Users}
           
          />
          <StatCard
            title="Active Farms"
            value="48"
            icon={TreePine}
           
          />
          <StatCard
            title="Deployed Robots"
            value="96"
            icon={Bot}
          
          />
          <StatCard
            title="Total engineers"
            value="15"
            icon={Users}
           
          />
        </div>
      
        <>
          <div className="grid grid-cols-1 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border border-soil-200 overflow-hidden glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-soil-800">Robot Deployment by Farm</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={robotDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        tick={{ fontSize: 12 }}
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          borderRadius: "8px", 
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          border: "none"
                        }} 
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#2D9596" 
                        radius={[4, 4, 0, 0]}
                        name="Robots" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Tabs defaultValue="robotStatus" className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border border-soil-200 glass-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium text-soil-800">System Analytics</CardTitle>
                      <TabsList className="bg-soil-100">
                        <TabsTrigger value="robotStatus" className="text-xs">Robot Status</TabsTrigger>
                        <TabsTrigger value="farmStatus" className="text-xs">Farm Status</TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 h-80">
                    <TabsContent value="robotStatus" className="h-full mt-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={robotStatus}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {robotStatus.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.name === "Available" ? "#4BB543" : 
                                  entry.name === "In Use" ? "#FFA500" : 
                                  "#FF0033"
                                } 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "white", 
                              borderRadius: "8px", 
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              border: "none"
                            }} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="farmStatus" className="h-full mt-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={farmStatus}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {farmStatus.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.name === "Active" ? "#4BB543" : "#FF0033"} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "white", 
                              borderRadius: "8px", 
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              border: "none"
                            }} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  </CardContent>
                </Card>
              </motion.div>
            </Tabs>

          
          </div>

          
        </>
    
    </>
  );
};

export default Dashboard;
