import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Settings, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId"); // Récupérer l'ID stocké

    if (userId) {
      axios
        .get(`http://localhost:8081/api/user/profile/${userId}`)
        .then((response) => setUser(response.data))
        .catch((error) => console.error("Erreur de chargement du profil", error));
    }
  }, []);
  console.log(localStorage.getItem("userId"));

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white/70 backdrop-blur-sm border-b border-soil-200 fixed top-0 right-0 left-0 z-20">
      <div className="flex items-center justify-between h-full px-6 max-w-6xl mx-auto">
        
        {/* Logo */}
        <img src="/logoVision.png" alt="VisionSoil Logo" className="h-10" />

        <div className="flex items-center space-x-4">
          <button className="p-2 text-soil-600 hover:text-soil-800 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-soil-600 hover:text-soil-800 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-soil-600 text-white flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user ? user.first_name.charAt(0) + user.last_name.charAt(0) : "JD"}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-soil-800">
                    {user ? `${user.first_name} ${user.last_name}` : "John Doe"}
                  </p>
                  <p className="text-soil-600">{user ? user.role : "Farm Manager"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
