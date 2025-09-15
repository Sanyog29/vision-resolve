import { useState } from "react";
import AuthPage from "@/components/AuthPage";
import UserDashboard from "@/components/UserDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = (userType: 'user' | 'employee', userData: any) => {
    setCurrentUser({ ...userData, userType });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentUser.userType === 'employee') {
    return <EmployeeDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <UserDashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;