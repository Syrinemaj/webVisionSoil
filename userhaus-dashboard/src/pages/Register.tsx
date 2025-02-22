
import DashboardLayout from "@/components/layout/DashboardLayout";
import UserForm from "@/components/users/UserForm";

const Register = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New User</h2>
          <p className="text-muted-foreground">
            Create a new user account by filling out the form below.
          </p>
        </div>
        <UserForm />
      </div>
    </DashboardLayout>
  );
};

export default Register;
