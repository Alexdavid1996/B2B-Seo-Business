import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wrench } from "lucide-react";

export default function MaintenancePage() {
  const { data: settings } = useQuery<{maintenanceMessage: string}>({
    queryKey: ["/api/settings/public"],
  });

  const maintenanceMessage = settings?.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Site Under Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {maintenanceMessage}
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              We apologize for any inconvenience. Our team is working to improve your experience.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Thank you for your patience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}