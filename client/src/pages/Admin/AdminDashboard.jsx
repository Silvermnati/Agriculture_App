import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdminProvider } from "../../contexts/AdminContext";
import {
  Users,
  Wheat,
  MapPin,
  Tags,
  FileText,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import CropManagement from "../../components/Admin/CropManagement";
import LocationManagement from "../../components/Admin/LocationManagement";
import CategoryManagement from "../../components/Admin/CategoryManagement";
import UserManagement from "./components/UsersManagement";
import PostManagement from "./components/PostsManagement";
import CommunityManagement from "../../components/Admin/CommunityManagement";
import SystemStats from "../../components/Admin/SystemStats";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "crops", label: "Crops", icon: Wheat },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "communities", label: "Communities", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <SystemStats />;
      case "users":
        return <UserManagement />;
      case "crops":
        return <CropManagement />;
      case "locations":
        return <LocationManagement />;
      case "categories":
        return <CategoryManagement />;
      case "posts":
        return <PostManagement />;
      case "communities":
        return <CommunityManagement />;
      case "settings":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <p className="text-gray-600">
              System settings and configuration options will be available here.
            </p>
          </div>
        );
      default:
        return <SystemStats />;
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <AdminProvider setActiveTab={setActiveTab}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-3"
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="hidden sm:block text-sm text-gray-600">
                  Welcome, {user.first_name || user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex relative min-h-[calc(100vh-4rem)]">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden top-16"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <nav
            className={`
            fixed lg:static top-16 lg:top-0 bottom-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          >
            <div className="h-full flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveTab(item.id);
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                            activeTab === item.id
                              ? "bg-green-100 text-green-700"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  Agriculture Admin v1.0
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] bg-gray-100">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
};

export default AdminDashboard;
