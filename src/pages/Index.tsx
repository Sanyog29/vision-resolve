import { useState } from "react";
import AuthPage from "@/components/AuthPage";
import UserDashboard from "@/components/UserDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const Index = () => {
  const { user, loading, signOut } = useSupabaseAuth();

  const handleLogin = (userType: 'user' | 'employee', userData: any) => {
    // This is handled by the useSupabaseAuth hook
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (user.user_type === 'employee') {
    return <EmployeeDashboard user={user} onLogout={handleLogout} />;
  }

  return <UserDashboard user={user} onLogout={handleLogout} />;
};

export default Index;