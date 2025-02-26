
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AddFarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddFarmDialog = ({ open, onOpenChange }: AddFarmDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: "",
    longitude: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to create the farm
    console.log("Form submitted:", formData);
    toast.success("Farm created successfully!");
    onOpenChange(false);
    setFormData({ name: "", location: "", latitude: "", longitude: "" });
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
            <label htmlFor="name" className="text-sm font-medium text-soil-700">
              Farm Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter farm name"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-soil-700">
              Location
            </label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter farm location"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="latitude" className="text-sm font-medium text-soil-700">
                Latitude
              </label>
              <Input
                id="latitude"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="Enter latitude"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="longitude" className="text-sm font-medium text-soil-700">
                Longitude
              </label>
              <Input
                id="longitude"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="Enter longitude"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-soil-100 hover:bg-soil-200 text-soil-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-soil-600 hover:bg-soil-700 text-white"
            >
              Add Farm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
