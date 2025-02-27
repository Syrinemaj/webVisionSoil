
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { robotsApi, farmsApi, usersApi } from "@/lib/api";
import { Robot, Farm, User } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Zap, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  BatteryMedium, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  User as UserIcon,
  MapPin
} from "lucide-react";

// Validation schema for robot form
const robotSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  farmId: z.string().nullable(),
  engineerId: z.string().nullable(),
  status: z.enum(["available", "in-use", "maintenance"]),
  connectivity: z.enum(["online", "offline"]),
});

type RobotFormValues = z.infer<typeof robotSchema>;

// Validation schema for engineer assignment
const assignEngineerSchema = z.object({
  engineerId: z.string().min(1, { message: "Please select an engineer" }),
  robotIds: z.array(z.string()).min(1, { message: "Please select at least one robot" }),
});

type AssignEngineerFormValues = z.infer<typeof assignEngineerSchema>;

const RobotManagement = () => {
  const [activeTab, setActiveTab] = useState("grid-view");
  const [robots, setRobots] = useState<Robot[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [selectedRobotIds, setSelectedRobotIds] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forms
  const addForm = useForm<RobotFormValues>({
    resolver: zodResolver(robotSchema),
    defaultValues: {
      name: "",
      farmId: null,
      engineerId: null,
      status: "available",
      connectivity: "online",
    },
  });

  const editForm = useForm<RobotFormValues>({
    resolver: zodResolver(robotSchema),
    defaultValues: {
      name: "",
      farmId: null,
      engineerId: null,
      status: "available",
      connectivity: "online",
    },
  });

  const assignForm = useForm<AssignEngineerFormValues>({
    resolver: zodResolver(assignEngineerSchema),
    defaultValues: {
      engineerId: "",
      robotIds: [],
    },
  });

  // Set edit form values when a robot is selected
  useEffect(() => {
    if (selectedRobot) {
      editForm.reset({
        name: selectedRobot.name,
        farmId: selectedRobot.farmId,
        engineerId: selectedRobot.engineerId,
        status: selectedRobot.status,
        connectivity: selectedRobot.connectivity,
      });
    }
  }, [selectedRobot, editForm]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [robotsData, farmsData, engineersData] = await Promise.all([
        robotsApi.getAll(),
        farmsApi.getAll(),
        usersApi.getByRole("engineer"),
      ]);
      
      setRobots(robotsData);
      setFarms(farmsData);
      setEngineers(engineersData.filter(eng => eng.status === "active"));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRobot = async (values: RobotFormValues) => {
    try {
      setLoading(true);
      
      // Get farm and engineer names if IDs are provided
      let farmName = null;
      let engineerName = null;
      
      if (values.farmId) {
        const farm = farms.find(f => f.id === values.farmId);
        farmName = farm ? farm.name : null;
      }
      
      if (values.engineerId) {
        const engineer = engineers.find(e => e.id === values.engineerId);
        engineerName = engineer ? `${engineer.firstName} ${engineer.lastName}` : null;
      }
      
      const robotData = {
        name: values.name,
        farmId: values.farmId,
        farmName: farmName,
        engineerId: values.engineerId,
        engineerName: engineerName,
        status: values.status,
        connectivity: values.connectivity,
        batteryLevel: Math.floor(Math.random() * 100), // Random battery level for new robot
      };
      
      const newRobot = await robotsApi.create(robotData);
      setRobots([...robots, newRobot]);
      setIsAddDialogOpen(false);
      addForm.reset();
      
      toast.success(`Robot ${newRobot.name} added successfully`);
    } catch (error) {
      console.error("Error creating robot:", error);
      toast.error("Failed to create robot");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRobot = async (values: RobotFormValues) => {
    if (!selectedRobot) return;

    try {
      setLoading(true);
      
      // Get farm and engineer names if IDs are provided
      let farmName = null;
      let engineerName = null;
      
      if (values.farmId) {
        const farm = farms.find(f => f.id === values.farmId);
        farmName = farm ? farm.name : null;
      }
      
      if (values.engineerId) {
        const engineer = engineers.find(e => e.id === values.engineerId);
        engineerName = engineer ? `${engineer.firstName} ${engineer.lastName}` : null;
      }
      
      const updateData = {
        name: values.name,
        farmId: values.farmId,
        farmName: farmName,
        engineerId: values.engineerId,
        engineerName: engineerName,
        status: values.status,
        connectivity: values.connectivity,
      };
      
      const updatedRobot = await robotsApi.update(selectedRobot.id, updateData);
      
      setRobots(robots.map(robot => 
        robot.id === selectedRobot.id ? updatedRobot : robot
      ));
      
      setIsEditDialogOpen(false);
      toast.success(`Robot ${updatedRobot.name} updated successfully`);
    } catch (error) {
      console.error("Error updating robot:", error);
      toast.error("Failed to update robot");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRobot = async () => {
    if (!selectedRobot) return;

    try {
      setLoading(true);
      await robotsApi.delete(selectedRobot.id);
      
      setRobots(robots.filter(robot => robot.id !== selectedRobot.id));
      
      setIsDeleteDialogOpen(false);
      toast.success(`Robot ${selectedRobot.name} deleted successfully`);
    } catch (error) {
      console.error("Error deleting robot:", error);
      toast.error("Failed to delete robot");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEngineer = async (values: AssignEngineerFormValues) => {
    try {
      setLoading(true);
      
      const updatedRobots = await robotsApi.assignToEngineer(values.robotIds, values.engineerId);
      
      // Update the robots list with the assigned robots
      setRobots(robots.map(robot => {
        const updatedRobot = updatedRobots.find(r => r.id === robot.id);
        return updatedRobot || robot;
      }));
      
      setIsAssignDialogOpen(false);
      assignForm.reset();
      setSelectedRobotIds([]);
      
      // Get engineer name for the toast message
      const engineer = engineers.find(e => e.id === values.engineerId);
      const engineerName = engineer ? `${engineer.firstName} ${engineer.lastName}` : "Engineer";
      
      toast.success(`${updatedRobots.length} robots assigned to ${engineerName}`);
    } catch (error) {
      console.error("Error assigning engineer:", error);
      toast.error("Failed to assign engineer");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns: ColumnDef<Robot>[] = [
    {
      accessorKey: "name",
      header: "Robot Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <StatusBadge 
            variant={status}
          >
            {status === "available" ? "Available" : 
             status === "in-use" ? "In Use" : 
             "Maintenance"}
          </StatusBadge>
        );
      },
    },
    {
      accessorKey: "connectivity",
      header: "Connectivity",
      cell: ({ row }) => {
        const connectivity = row.original.connectivity;
        return (
          <div className="flex items-center">
            {connectivity === "online" ? (
              <>
                <Wifi size={14} className="text-success mr-1" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-soil-400 mr-1" />
                <span>Offline</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "batteryLevel",
      header: "Battery",
      cell: ({ row }) => {
        const batteryLevel = row.original.batteryLevel;
        return (
          <div className="flex items-center">
            <BatteryMedium size={14} className={
              batteryLevel > 70 ? "text-success mr-1" :
              batteryLevel > 30 ? "text-warning mr-1" :
              "text-error mr-1"
            } />
            <span>{batteryLevel}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "farmName",
      header: "Farm",
      cell: ({ row }) => row.original.farmName || "-",
    },
    {
      accessorKey: "engineerName",
      header: "Engineer",
      cell: ({ row }) => row.original.engineerName || "-",
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.lastActive), "MMM d, yyyy HH:mm");
        } catch (e) {
          return row.original.lastActive;
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-soil-200 shadow-md">
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedRobot(row.original);
                  setIsEditDialogOpen(true);
                }}
                className="flex items-center gap-2 text-soil-700 cursor-pointer"
              >
                <Edit size={14} /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedRobot(row.original);
                  setIsDeleteDialogOpen(true);
                }}
                className="flex items-center gap-2 text-error cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader 
        title="Robot Management" 
        description="Manage your VisionSoil robots, assign them to farms and engineers."
      >
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              addForm.reset();
              setIsAddDialogOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <Zap size={16} />
            <span>Add Robot</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              assignForm.reset();
              setIsAssignDialogOpen(true);
            }}
            className="flex items-center gap-1"
            disabled={robots.filter(r => !r.engineerId).length === 0}
          >
            <UserIcon size={16} />
            <span>Assign Engineer</span>
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-soil-100">
          <TabsTrigger value="grid-view">Card View</TabsTrigger>
          <TabsTrigger value="table-view">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid-view" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="border-soil-200 glass-card">
                  <CardContent className="p-6">
                    <div className="h-48 animate-pulse bg-soil-100 rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : robots.length === 0 ? (
            <Card className="border-soil-200 glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Zap size={48} className="text-soil-400 mb-4" />
                  <h3 className="text-xl font-medium text-soil-700 mb-2">No Robots Found</h3>
                  <p className="text-soil-500 max-w-md">
                    You haven't added any robots yet. Click the "Add Robot" button to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {robots.map((robot) => (
                  <motion.div
                    key={robot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-soil-200 overflow-hidden h-full glass-card">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium">
                            {robot.name}
                          </CardTitle>
                          <StatusBadge 
                            variant={robot.status}
                          >
                            {robot.status === "available" ? "Available" : 
                            robot.status === "in-use" ? "In Use" : 
                            "Maintenance"}
                          </StatusBadge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {robot.connectivity === "online" ? (
                                <Wifi size={18} className="text-success" />
                              ) : (
                                <WifiOff size={18} className="text-soil-400" />
                              )}
                              <span className="text-sm">
                                {robot.connectivity === "online" ? "Online" : "Offline"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BatteryMedium size={18} className={
                                robot.batteryLevel > 70 ? "text-success" :
                                robot.batteryLevel > 30 ? "text-warning" :
                                "text-error"
                              } />
                              <span className="text-sm">{robot.batteryLevel}%</span>
                            </div>
                          </div>
                          
                          <Separator className="bg-soil-100" />
                          
                          <div className="space-y-2">
                            {robot.farmName && (
                              <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-soil-500 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium">Farm</div>
                                  <div className="text-xs text-soil-500">{robot.farmName}</div>
                                </div>
                              </div>
                            )}
                            
                            {robot.engineerName && (
                              <div className="flex items-start gap-2">
                                <UserIcon size={16} className="text-soil-500 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium">Engineer</div>
                                  <div className="text-xs text-soil-500">{robot.engineerName}</div>
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs text-soil-500 mt-2">
                              Last active: {format(new Date(robot.lastActive), "MMM d, yyyy HH:mm")}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2 border-t border-soil-100">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-soil-700"
                          onClick={() => {
                            setSelectedRobot(robot);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-error"
                          onClick={() => {
                            setSelectedRobot(robot);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="table-view" className="space-y-4">
          <Card className="border-soil-200 glass-card">
            <CardContent className="p-6">
              <DataTable 
                columns={columns} 
                data={robots} 
                searchPlaceholder="Search robots..." 
                searchKey="name" 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Robot Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Add New Robot</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new robot to the system.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleCreateRobot)} className="space-y-5">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Robot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter robot name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="connectivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connectivity</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select connectivity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Farm (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a farm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Engineer (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.firstName} {engineer.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-soil-200"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Robot"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Robot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Edit Robot</DialogTitle>
            <DialogDescription>
              Update robot information and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateRobot)} className="space-y-5">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Robot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter robot name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="connectivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connectivity</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select connectivity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Farm</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a farm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Engineer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.firstName} {engineer.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-soil-200"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Robot"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Robot Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Delete Robot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this robot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRobot && (
            <div className="p-4 mb-4 border border-soil-200 rounded-md bg-soil-50">
              <div className="font-medium text-lg">{selectedRobot.name}</div>
              <div className="mt-3 pt-3 border-t border-soil-200 grid grid-cols-2 gap-2 text-sm">
                <div className="text-soil-600">Status:</div>
                <div className="capitalize">{selectedRobot.status.replace('-', ' ')}</div>
                <div className="text-soil-600">Connectivity:</div>
                <div className="capitalize">{selectedRobot.connectivity}</div>
                {selectedRobot.farmName && (
                  <>
                    <div className="text-soil-600">Farm:</div>
                    <div>{selectedRobot.farmName}</div>
                  </>
                )}
                {selectedRobot.engineerName && (
                  <>
                    <div className="text-soil-600">Engineer:</div>
                    <div>{selectedRobot.engineerName}</div>
                  </>
                )}
                <div className="text-soil-600">Last Active:</div>
                <div>{format(new Date(selectedRobot.lastActive), "MMM d, yyyy HH:mm")}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-soil-200"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteRobot}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Robot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Engineer Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card">
          <DialogHeader>
            <DialogTitle>Assign Engineer to Robots</DialogTitle>
            <DialogDescription>
              Select an engineer and the robots you want to assign to them.
            </DialogDescription>
          </DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(handleAssignEngineer)} className="space-y-5">
              <FormField
                control={assignForm.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Engineer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.firstName} {engineer.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={assignForm.control}
                name="robotIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Robots</FormLabel>
                    <FormControl>
                      <div className="border border-input rounded-md p-4 space-y-3">
                        {robots
                          .filter(robot => robot.status !== "maintenance")
                          .map(robot => (
                            <div key={robot.id} className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                id={`robot-${robot.id}`}
                                value={robot.id}
                                checked={selectedRobotIds.includes(robot.id)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  const newSelected = isChecked
                                    ? [...selectedRobotIds, robot.id]
                                    : selectedRobotIds.filter(id => id !== robot.id);
                                  
                                  setSelectedRobotIds(newSelected);
                                  field.onChange(newSelected);
                                }}
                                className="h-4 w-4 rounded border-soil-300 text-primary focus:ring-primary"
                              />
                              <label 
                                htmlFor={`robot-${robot.id}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {robot.name} 
                                {robot.engineerName && (
                                  <span className="text-xs text-soil-500 ml-2">
                                    (Currently assigned to {robot.engineerName})
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        {robots.filter(robot => robot.status !== "maintenance").length === 0 && (
                          <div className="text-sm text-soil-500">
                            No available robots to assign.
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select one or more robots to assign to the engineer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAssignDialogOpen(false)}
                  className="border-soil-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || selectedRobotIds.length === 0}
                >
                  {loading ? "Assigning..." : "Assign Engineer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RobotManagement;
