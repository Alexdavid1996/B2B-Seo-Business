import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "../../hooks/use-auth";
import { AuthUser } from "../../types";
import { UserAvatar } from "@/components/ui/user-avatar";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be 50 characters or less").refine(
    (name) => !/[<>\"'&]/.test(name),
    "First name contains invalid characters"
  ),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be 50 characters or less").refine(
    (name) => !/[<>\"'&]/.test(name),
    "Last name contains invalid characters"
  ),
  company: z.string().max(100, "Company must be 100 characters or less").refine(
    (company) => !company || !/[<>\"'&]/.test(company),
    "Company contains invalid characters"
  ).optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").refine(
    (bio) => !bio || !/[<>\"'&]/.test(bio),
    "Bio contains invalid characters"
  ).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: AuthUser | null;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      company: user?.company || "",
      bio: user?.bio || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      console.log("Sending profile update to:", `/api/users/${user?.id}`, data);
      return await apiRequest(`/api/users/${user?.id}`, {
        method: "PUT",
        body: data
      });
    },
    onSuccess: (updatedUser) => {
      console.log("Profile update successful:", updatedUser);
      // Update the auth context with new user data
      login(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Profile form submission:", data);
    updateProfileMutation.mutate(data);
  };

  const handleReset = () => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      company: user?.company || "",
      bio: user?.bio || "",
    });
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed for security reasons</p>
          </div>
          
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              {...form.register("company")}
            />
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell us about yourself and your expertise..."
              {...form.register("bio")}
            />
          </div>
          

          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
