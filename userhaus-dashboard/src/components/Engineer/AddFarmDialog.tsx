import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Farmer {
  id: number; // Ensure id is a number
  first_name: string;
  last_name: string;
}

interface AddFarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFarmAdded: (newFarm: any) => void;
}

export const AddFarmDialog = ({ open, onOpenChange, onFarmAdded }: AddFarmDialogProps) => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: "",
    longitude: "",
    image: null as File | null,
  });

  // Fetch farmers with role "farmer" when the dialog opens
  useEffect(() => {
    if (open) {
      fetch("http://localhost:8081/api/farmers") // Fetch only farmers
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched farmers:", data); // Log the fetched data
          setFarmers(data);
        })
        .catch((err) => console.error("Error fetching farmers:", err));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFarmerId) {
      toast.error("Please select a farmer.");
      return;
    }

    // Convert selectedFarmerId to a number before comparison
    const selectedFarmer = farmers.find((f) => f.id === Number(selectedFarmerId));
    console.log("Selected farmer:", selectedFarmer); // Log the selected farmer

    if (!selectedFarmer) {
      toast.error("Selected farmer not found.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("latitude", formData.latitude);
    formDataToSend.append("longitude", formData.longitude);
    formDataToSend.append("farmer_first_name", selectedFarmer.first_name);
    formDataToSend.append("farmer_last_name", selectedFarmer.last_name);

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      const response = await fetch("http://localhost:8081/api/farm", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text(); // Log the raw response
        console.error("Server error:", errorText);
        throw new Error("Failed to create farm");
      }

      const newFarm = await response.json();
      console.log("Farm created:", newFarm);

      toast.success("Farm created successfully!");
      onFarmAdded(newFarm);
      onOpenChange(false);
      setFormData({ name: "", location: "", latitude: "", longitude: "", image: null });
      setSelectedFarmerId("");
    } catch (error) {
      console.error("Error creating farm:", error);
      toast.error("Failed to create farm");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-soil-800">Add New Farm</DialogTitle>
          <DialogDescription className="text-soil-600">
            Enter the details of your farm below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-soil-700">Farm Name</label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter farm name" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-soil-700">Location</label>
            <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Enter farm location" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="latitude" className="text-sm font-medium text-soil-700">Latitude</label>
              <Input id="latitude" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} placeholder="Enter latitude" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="longitude" className="text-sm font-medium text-soil-700">Longitude</label>
              <Input id="longitude" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} placeholder="Enter longitude" required />
            </div>
          </div>

          {/* Farmer Selection */}
          <div className="space-y-2">
            <label htmlFor="farmer" className="text-sm font-medium text-soil-700">Select Owner</label>
            <Select
              onValueChange={(value) => {
                console.log("Selected farmer ID:", value); // Log the selected value
                setSelectedFarmerId(value); // value is a string
              }}
              value={selectedFarmerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a farmer" />
              </SelectTrigger>
              <SelectContent>
                {farmers.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id.toString()}> {/* Ensure value is a string */}
                    {farmer.first_name} {farmer.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium text-soil-700">Farm Image</label>
            <Input id="image" type="file" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-soil-100 hover:bg-soil-200 text-soil-800">Cancel</Button>
            <Button type="submit" className="bg-soil-600 hover:bg-soil-700 text-white">Add Farm</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};