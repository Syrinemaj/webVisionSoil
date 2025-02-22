import DashboardLayout from "@/components/layout/DashboardLayout";
const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your dashboard.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Dashboard;