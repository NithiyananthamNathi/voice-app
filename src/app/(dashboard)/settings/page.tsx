"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Shield, CreditCard, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            Profile
          </CardTitle>
          <CardDescription className="text-gray-500">
            Your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-gray-200">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gray-900 text-white text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-100">
              Change Avatar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Name</Label>
              <Input
                id="name"
                defaultValue={session?.user?.name || ""}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={session?.user?.email || ""}
                className="bg-white border-gray-300 text-gray-900"
                disabled
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            Notifications
          </CardTitle>
          <CardDescription className="text-gray-500">
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Email notifications</p>
              <p className="text-sm text-gray-500">Receive updates about your agents via email</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Weekly reports</p>
              <p className="text-sm text-gray-500">Get a weekly summary of agent performance</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Usage alerts</p>
              <p className="text-sm text-gray-500">Notify when approaching usage limits</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-600" />
            Security
          </CardTitle>
          <CardDescription className="text-gray-500">
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Change Password</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                type="password"
                placeholder="Current password"
                className="bg-white border-gray-300 text-gray-900"
              />
              <Input
                type="password"
                placeholder="New password"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>
          <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-100">
            Update Password
          </Button>

          <Separator className="bg-gray-200" />

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Two-factor authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-100">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-600" />
            Billing
          </CardTitle>
          <CardDescription className="text-gray-500">
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Free Plan</p>
                <p className="text-sm text-gray-500">10,000 characters/month</p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Upgrade
              </Button>
            </div>
          </div>

          <div className="text-center py-4 text-gray-500">
            <p>No payment method on file</p>
            <Button variant="link" className="text-gray-600">
              Add payment method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white border-red-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription className="text-gray-500">
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200">
            <div>
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
