import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, Shield, Mail, Lock, User } from "lucide-react";

interface AuthPageProps {
  onLogin: (userType: 'user' | 'employee', userData: any) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'user' | 'employee'>('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    employeeId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for demo purposes
    onLogin(userType, { ...formData, userType });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-surface mb-2">ComplaintFlow</h1>
          <p className="text-surface/80">Modern complaint management system</p>
        </div>

        <Card className="shadow-large border-0">
          <CardHeader className="space-y-4">
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'user' | 'employee')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  User
                </TabsTrigger>
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Employee
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div>
              <CardTitle className="text-2xl text-center">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin 
                  ? `Sign in to your ${userType} account`
                  : `Create a new ${userType} account`
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {!isLogin && userType === 'employee' && (
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="Enter your employee ID"
                      className="pl-10"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      required={!isLogin && userType === 'employee'}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" variant="gradient" size="lg">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}