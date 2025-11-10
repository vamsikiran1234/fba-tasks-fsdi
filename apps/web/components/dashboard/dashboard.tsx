"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardView } from "./dashboard-view";
import { ChatView } from "./chat-view";
import { LayoutDashboard, MessageSquare, FileText, Users, Settings, Menu, X } from "lucide-react";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-[220px]" : "w-0"} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}
      >
        <div className="w-[220px]">
          <div className="flex items-center gap-2 px-6 py-2.5 border-b border-gray-200">
            {/* Official LIDL Logo with Rounded Corners */}
            <div className="w-10 h-10 flex items-center justify-center bg-[#0050AA] rounded-[8px] overflow-hidden">
              <img
                src="https://www.lidl.com/assets/images/logo-lidl-header.svg"
                alt="LIDL"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Buchhaltung</h1>
              <p className="text-xs text-gray-500">12 members</p>
            </div>
          </div>

          <div className="mt-6 mb-4 px-4">
            <p className="text-xs font-semibold black uppercase tracking-wider mb-3">General</p>
          </div>

          <nav className="space-y-1.5 px-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === "dashboard"
                  ? "bg-[#E3E6F0] text-[#1B1464] font-semibold"
                  : "text-gray-600 hover:bg-gray-50 font-medium"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === "chat"
                  ? "bg-[#E3E6F0] text-[#1B1464] font-semibold"
                  : "text-gray-600 hover:bg-gray-50 font-medium"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">Chat with Data</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Invoice</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Other files</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              <Users className="w-5 h-5" />
              <span className="text-sm">Departments</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              <Users className="w-5 h-5" />
              <span className="text-sm">Users</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </button>
          </nav>

          {/* Separator Line */}
          <div className="mt-6 pt-6 border-t border-gray-200"></div>
        </div>

        {/* Flowbit AI Logo at bottom */}
        <div className="absolute bottom left-0 w-[220px] px-6 py-3">
          <div className="flex items-center justify-center">
            {/* Flowbit Logo from URL - Larger Size */}
            <img
              src="https://www.flowbitai.com/logo.svg"
              alt="Flowbit AI"
              className="w-32 h-auto"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar with Toggle and User */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button - Panel Icon */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                // Close sidebar icon - Panel with vertical line on left
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                // Open sidebar icon - Panel with vertical line on left
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>

            {/* Dashboard Title */}
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
            <div>
              <p className="text-sm font-medium">Amit Jadhav</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        </div>
        {activeTab === "dashboard" && (
          <div className="flex-1 overflow-auto">
            <DashboardView />
          </div>
        )}
        {activeTab === "chat" && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatView />
          </div>
        )}
      </main>
    </div>
  );
}
