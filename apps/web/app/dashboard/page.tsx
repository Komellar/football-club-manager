"use client";

import { Button } from "@/components/ui/button";
import { LogoutButton, AuthGuard, useAuthStore } from "@/features/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">⚽</span>
              </div>
            </div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-green-200 rounded-full animate-ping" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-green-700">
              Loading Dashboard...
            </h2>
            <p className="text-green-600">Preparing your football club</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthGuard will handle redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">⚽</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Club Manager
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Players
                  </p>
                  <p className="text-3xl font-bold">25</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  👥
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Matches Won
                  </p>
                  <p className="text-3xl font-bold">18</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  🏆
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Budget</p>
                  <p className="text-3xl font-bold">$2.5M</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  💰
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Next Match
                  </p>
                  <p className="text-2xl font-bold">3 Days</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  📅
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">👤</span>
                </div>
              </div>
              <CardTitle className="text-xl text-gray-800">
                Manager Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Name
                  </span>
                  <span className="font-semibold text-gray-800">
                    {user?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Email
                  </span>
                  <span className="font-semibold text-gray-800">
                    {user?.email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Role
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                    {user?.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 flex items-center space-x-2">
                <span>⚡</span>
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Manage your football club</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg transition-all duration-200 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-2xl mb-1">👥</div>
                    <div className="font-semibold">Manage Players</div>
                    <div className="text-xs opacity-90">
                      View and edit team roster
                    </div>
                  </div>
                </Button>

                <Button className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg transition-all duration-200 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="font-semibold">Match Results</div>
                    <div className="text-xs opacity-90">
                      View past and upcoming matches
                    </div>
                  </div>
                </Button>

                <Button className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg transition-all duration-200 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-2xl mb-1">💰</div>
                    <div className="font-semibold">Finances</div>
                    <div className="text-xs opacity-90">
                      Track club budget and transfers
                    </div>
                  </div>
                </Button>

                <Button className="h-20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg transition-all duration-200 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-2xl mb-1">📈</div>
                    <div className="font-semibold">Analytics</div>
                    <div className="text-xs opacity-90">
                      Performance insights
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center space-x-2">
              <span>📋</span>
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest updates from your club</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  ⚽
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Match scheduled</p>
                  <p className="text-sm text-gray-600">
                    vs. City United - Saturday 3:00 PM
                  </p>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">New player signed</p>
                  <p className="text-sm text-gray-600">
                    Welcome John Smith to the team
                  </p>
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  💰
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Budget updated</p>
                  <p className="text-sm text-gray-600">
                    Transfer budget increased to $2.5M
                  </p>
                </div>
                <span className="text-xs text-gray-500">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
