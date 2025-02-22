import DashboardLayout from "@/components/layout/DashboardLayout";
import UsersTable from "@/components/users/UsersTable";
const Users = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users List</h2>
          <p className="text-muted-foreground">
            Manage your application users.
          </p>
        </div>
        <UsersTable />
      </div>
    </DashboardLayout>
  );
};
export default Users;