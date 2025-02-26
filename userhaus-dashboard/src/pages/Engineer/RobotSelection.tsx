
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Wifi, Signal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MOCK_ROBOTS = [
  {
    id: 1,
    name: "AgriBot-X1",
    image: "/placeholder.svg",
    status: "available",
    connectivity: { wifi: true, cellular: true },
  },
  {
    id: 2,
    name: "FarmDrone-2000",
    image: "/placeholder.svg",
    status: "in-use",
    connectivity: { wifi: true, cellular: false },
  },
  {
    id: 3,
    name: "CropScanner-Pro",
    image: "/placeholder.svg",
    status: "maintenance",
    connectivity: { wifi: false, cellular: true },
  },
];

const RobotSelection = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedRobot, setSelectedRobot] = useState<number | null>(null);

  const filteredRobots = MOCK_ROBOTS.filter((robot) =>
    robot.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRobotSelect = (robotId: number) => {
    const robot = MOCK_ROBOTS.find(r => r.id === robotId);
    if (robot?.status !== "available") {
      toast.error("This robot is not available for selection");
      return;
    }
    setSelectedRobot(robotId);
    toast.success("Robot selected successfully");
    navigate("/farm-selection");
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient">Select Robot</h1>
        <p className="text-soil-600">Choose a robot to deploy for farm scanning</p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soil-400" size={20} />
        <Input
          type="text"
          placeholder="Search robots..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRobots.map((robot) => (
          <div
            key={robot.id}
            onClick={() => handleRobotSelect(robot.id)}
            className={`glass-morphism p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 
              ${selectedRobot === robot.id ? "ring-2 ring-soil-500" : ""}
              ${robot.status !== "available" ? "opacity-60" : ""}`}
          >
            <img
              src={robot.image}
              alt={robot.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold text-soil-800 mb-2">{robot.name}</h3>
            <div className="flex justify-between items-center">
              <span
                className={`status-badge status-${robot.status}`}
              >
                {robot.status.charAt(0).toUpperCase() + robot.status.slice(1)}
              </span>
              <div className="flex gap-2">
                <Wifi
                  size={20}
                  className={robot.connectivity.wifi ? "text-success" : "text-soil-300"}
                />
                <Signal
                  size={20}
                  className={robot.connectivity.cellular ? "text-success" : "text-soil-300"}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RobotSelection;
