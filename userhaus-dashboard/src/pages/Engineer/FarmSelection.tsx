import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AddFarmDialog } from "@/components/Engineer/AddFarmDialog";

const MOCK_FARMS = [
  {
    id: 1,
    name: "Green Valley Farm",
    owner: "John Smith",
    location: {
      city: "Sacramento",
      country: "USA",
      coordinates: "38.5816° N, 121.4944° W",
    },
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Sunrise Orchards",
    owner: "Emma Johnson",
    location: {
      city: "Portland",
      country: "USA",
      coordinates: "45.5155° N, 122.6789° W",
    },
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Golden Fields",
    owner: "Michael Brown",
    location: {
      city: "Denver",
      country: "USA",
      coordinates: "39.7392° N, 104.9903° W",
    },
    image: "/placeholder.svg",
  },
];

const FarmSelection = () => {
  const navigate = useNavigate();
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleFarmSelect = (farmId: number) => {
    setSelectedFarm(farmId);
    toast.success("Farm selected successfully");
    navigate(`/dashboard/${farmId}`);
  };

  // Handle the "Back" button click
  const handleBack = () => {
    navigate(-1); // This will navigate back to the previous page
  };

  return (
    <div className="space-y-8 p-6">
      {/* Back Button */}
      <div className="flex items-center">
        <button
          onClick={handleBack}  // Corrected this to use the handleBack function
          className="p-2 hover:bg-soil-500/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-soil-700" />
        </button>
      </div>

      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
          Select a Farm
        </h1>
        <p className="text-gray-600">Choose a farm to begin monitoring</p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soil-400" size={20} />
        <Input
          type="text"
          placeholder="Search farms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Farm Button (aligned to the right) */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Farm
        </Button>
      </div>

      {/* Farm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_FARMS.map((farm) => (
          <div
            key={farm.id}
            className="bg-white shadow-md rounded-lg p-6 cursor-pointer transition-transform duration-300 hover:scale-105 border border-gray-200"
            onClick={() => handleFarmSelect(farm.id)}
          >
            <img
              src={farm.image}
              alt={farm.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{farm.name}</h3>
            <p className="text-gray-600 mb-4">Owned by {farm.owner}</p>
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin size={16} className="mt-1 flex-shrink-0" />
              <div>
                <p>{farm.location.city}, {farm.location.country}</p>
                <p className="text-xs">{farm.location.coordinates}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Farm Dialog */}
      <AddFarmDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
};

export default FarmSelection;
