import { ReactNode } from "react";
import { Outlet } from "react-router-dom"; // ✅ Import Outlet
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Outlet /> {/* ✅ This allows nested routes to be rendered inside Layout */}
      </main>
    </div>
  );
};

export default Layout;
