import DashboardLayout from "@/components/layout/DashboardLayout";
const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application settings.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Settings;