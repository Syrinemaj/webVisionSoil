
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Separator } from "@/components/ui/separator";
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
import { usersApi } from "@/lib/api";
import { User } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Users, Plus, MoreVertical, Edit, Trash2, CheckCircle, XCircle, UserPlus, Mail, Phone } from "lucide-react";

// Validation schema for user form
const userSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["admin", "engineer", "farmer"]),
  status: z.enum(["active", "pending_approval", "rejected"]),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("all-users");
  const [users, setUsers] = useState<User[]>([]);
  const [pendingEngineers, setPendingEngineers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forms
  const addForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "farmer",
      status: "active",
    },
  });

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "farmer",
      status: "active",
    },
  });

  // Set edit form values when a user is selected
  useEffect(() => {
    if (selectedUser) {
      editForm.reset({
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        phone: selectedUser.phone,
        password: "******", // Placeholder for display
        role: selectedUser.role,
        status: selectedUser.status,
      });
    }
  }, [selectedUser, editForm]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersData = await usersApi.getAll();
      setUsers(usersData);
      
      const pendingEngineersData = await usersApi.getByRole("engineer");
      setPendingEngineers(
        pendingEngineersData.filter(engineer => engineer.status === "pending_approval")
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values: UserFormValues) => {
    try {
      setLoading(true);
      
      // Make sure all required fields are present and not optional
      const userData: Omit<User, "id" | "createdAt"> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        // Override status for engineers to be pending_approval
        status: values.role === "engineer" ? "pending_approval" : values.status,
        profileImage: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
      };
      
      const newUser = await usersApi.create(userData);
      setUsers([...users, newUser]);
      setIsAddDialogOpen(false);
      addForm.reset();
      
      toast.success("User created successfully");
      
      // If it's an engineer, we need to update the pending engineers list
      if (newUser.role === "engineer" && newUser.status === "pending_approval") {
        setPendingEngineers([...pendingEngineers, newUser]);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (values: UserFormValues) => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      
      // Only update password if it's changed
      const updateData: Partial<Omit<User, "id" | "createdAt">> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        status: values.status,
      };
      
      // Add password only if it's changed
      if (values.password !== "******") {
        (updateData as any).password = values.password;
      }
      
      const updatedUser = await usersApi.update(selectedUser.id, updateData);
      
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      
      // Update pending engineers list if needed
      if (updatedUser.role === "engineer") {
        if (updatedUser.status === "pending_approval") {
          if (!pendingEngineers.some(eng => eng.id === updatedUser.id)) {
            setPendingEngineers([...pendingEngineers, updatedUser]);
          }
        } else {
          setPendingEngineers(pendingEngineers.filter(eng => eng.id !== updatedUser.id));
        }
      }
      
      setIsEditDialogOpen(false);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await usersApi.delete(selectedUser.id);
      
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setPendingEngineers(pendingEngineers.filter(eng => eng.id !== selectedUser.id));
      
      setIsDeleteDialogOpen(false);
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEngineer = async (id: string) => {
    try {
      setLoading(true);
      const approvedEngineer = await usersApi.approveEngineer(id);
      
      // Update both lists
      setUsers(users.map(user => 
        user.id === id ? approvedEngineer : user
      ));
      setPendingEngineers(pendingEngineers.filter(eng => eng.id !== id));
      
      toast.success(`Engineer ${approvedEngineer.firstName} ${approvedEngineer.lastName} approved successfully`);
    } catch (error) {
      console.error("Error approving engineer:", error);
      toast.error("Failed to approve engineer");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEngineer = async (id: string) => {
    try {
      setLoading(true);
      const rejectedEngineer = await usersApi.rejectEngineer(id);
      
      // Update both lists
      setUsers(users.map(user => 
        user.id === id ? rejectedEngineer : user
      ));
      setPendingEngineers(pendingEngineers.filter(eng => eng.id !== id));
      
      toast.success(`Engineer ${rejectedEngineer.firstName} ${rejectedEngineer.lastName} rejected`);
    } catch (error) {
      console.error("Error rejecting engineer:", error);
      toast.error("Failed to reject engineer");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img 
            src={row.original.profileImage} 
            alt={`${row.original.firstName} ${row.original.lastName}`} 
            className="w-8 h-8 rounded-full object-cover border border-soil-200"
          />
          <div>
            <div className="font-medium">{row.original.firstName} {row.original.lastName}</div>
            <div className="text-xs text-soil-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <div className="capitalize">{role}</div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <StatusBadge 
            variant={
              status === "active" ? "active" : 
              status === "pending_approval" ? "pending" : 
              "rejected"
            }
          >
            {status === "active" ? "Active" : 
             status === "pending_approval" ? "Pending Approval" : 
             "Rejected"}
          </StatusBadge>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone,
    },
    {
      accessorKey: "createdAt",
      header: "Joined Date",
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.createdAt), "MMM d, yyyy");
        } catch (e) {
          return row.original.createdAt;
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
                  setSelectedUser(row.original);
                  setIsEditDialogOpen(true);
                }}
                className="flex items-center gap-2 text-soil-700 cursor-pointer"
              >
                <Edit size={14} /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedUser(row.original);
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
        title="User Management" 
        description="Manage users, engineers, and farmers for your platform."
      >
        <Button 
  onClick={() => {
    addForm.reset();
    setIsAddDialogOpen(true);
  }}
  className="flex items-center gap-1"
>
  <UserPlus size={16} />
  <span>Add User</span>
</Button>

      </PageHeader> 

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-soil-100">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="pending-engineers" className="relative">
            Pending Engineers
            {pendingEngineers.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingEngineers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-4">
          <Card className="border-soil-200">
            <CardContent className="p-6">
              <DataTable 
                columns={columns} 
                data={users} 
                searchPlaceholder="Search users..." 
                searchKey="firstName" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-engineers" className="space-y-4">
          <Card className="border-soil-200">
            <CardContent className="p-6">
              {pendingEngineers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users size={48} className="text-soil-400 mb-4" />
                  <h3 className="text-xl font-medium text-soil-700 mb-2">No Pending Engineers</h3>
                  <p className="text-soil-500 max-w-md">
                    There are no engineers waiting for approval at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {pendingEngineers.map((engineer) => (
                      <motion.div
                        key={engineer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="border border-soil-200 overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={engineer.profileImage} 
                                  alt={`${engineer.firstName} ${engineer.lastName}`} 
                                  className="w-10 h-10 rounded-full object-cover border border-soil-200"
                                />
                                <div>
                                  <CardTitle className="text-lg font-medium">
                                    {engineer.firstName} {engineer.lastName}
                                  </CardTitle>
                                  <CardDescription>
                                    Engineer
                                  </CardDescription>
                                </div>
                              </div>
                              <StatusBadge variant="pending">
                                Pending Approval
                              </StatusBadge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-soil-500" />
                                <span className="text-sm">{engineer.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-soil-500" />
                                <span className="text-sm">{engineer.phone}</span>
                              </div>
                              <div className="text-xs text-soil-500 mt-2">
                                Joined {format(new Date(engineer.createdAt), "MMMM d, yyyy")}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-2 border-t border-soil-100">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="w-[48%]"
                              onClick={() => handleRejectEngineer(engineer.id)}
                              disabled={loading}
                            >
                              <XCircle size={14} className="mr-1" /> Reject
                            </Button>
                            <Button 
                              size="sm"
                              className="w-[48%]"
                              onClick={() => handleApproveEngineer(engineer.id)}
                              disabled={loading}
                            >
                              <CheckCircle size={14} className="mr-1" /> Approve
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new user to the platform.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleCreateUser)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="engineer">Engineer</SelectItem>
                        <SelectItem value="farmer">Farmer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value === "engineer" && "Engineers will be pending approval by default."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {addForm.watch("role") !== "engineer" && (
                <FormField
                  control={addForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={addForm.watch("role") === "engineer"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
                  {loading ? "Adding..." : "Add User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave unchanged to keep current password" type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave unchanged to keep current password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="engineer">Engineer</SelectItem>
                        <SelectItem value="farmer">Farmer</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
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
                  {loading ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="p-4 mb-4 border border-soil-200 rounded-md bg-soil-50">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedUser.profileImage} 
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`} 
                  className="w-10 h-10 rounded-full object-cover border border-soil-200"
                />
                <div>
                  <div className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="text-xs text-soil-500">{selectedUser.email}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-soil-200 grid grid-cols-2 gap-2 text-sm">
                <div className="text-soil-600">Role:</div>
                <div className="capitalize">{selectedUser.role}</div>
                <div className="text-soil-600">Status:</div>
                <div className="capitalize">{selectedUser.status.replace('_', ' ')}</div>
                <div className="text-soil-600">Joined:</div>
                <div>{format(new Date(selectedUser.createdAt), "MMM d, yyyy")}</div>
              </div>
              
              {selectedUser.role === "engineer" && (
                <div className="mt-4 p-3 bg-error/10 text-error rounded-md text-sm">
                  Warning: Deleting an engineer will remove all their robot assignments.
                </div>
              )}
              
              {selectedUser.role === "farmer" && (
                <div className="mt-4 p-3 bg-error/10 text-error rounded-md text-sm">
                  Warning: Deleting a farmer will mark their farms as inactive.
                </div>
              )}
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
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagement;
