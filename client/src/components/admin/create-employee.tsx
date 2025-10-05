import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Eye, EyeOff } from "lucide-react";

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function CreateEmployee() {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await apiRequest("/api/admin/users/create-employee", {
        method: "POST",
        body: data
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Employee Created Successfully",
        description: `${data.firstName} ${data.lastName} has been created with employee role.`
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Employee",
        description: error.message || "An error occurred while creating the employee account.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    createEmployeeMutation.mutate(formData);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Create Employee Account</span>
        </CardTitle>
        <CardDescription>
          Create a new employee account with limited admin access to Support, Finances, and Guest Posts domains.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                disabled={createEmployeeMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                disabled={createEmployeeMutation.isPending}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="employee@example.com"
              disabled={createEmployeeMutation.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter password (min 6 characters)"
                disabled={createEmployeeMutation.isPending}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 w-8 p-0"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generatePassword}
              disabled={createEmployeeMutation.isPending}
              className="mt-2"
            >
              Generate Random Password
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Employee Access Level</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Support:</strong> Full access to support chat and tickets</li>
              <li>• <strong>Finances:</strong> Limited to deposit and withdrawal requests only</li>
              <li>• <strong>Domains:</strong> Access to guest posts & placements only</li>
              <li>• <strong>No access to:</strong> User management, full finances, or admin settings</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={createEmployeeMutation.isPending}
              className="flex-1"
            >
              {createEmployeeMutation.isPending ? "Creating..." : "Create Employee Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: ""
              })}
              disabled={createEmployeeMutation.isPending}
            >
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}