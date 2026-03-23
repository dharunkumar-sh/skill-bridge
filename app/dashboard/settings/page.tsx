"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Bell, Shield, Wallet, Github } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-slate-400">Manage your profile, preferences, and payment billing details.</p>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        
        {/* Settings Navigation */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 font-medium rounded-xl border border-blue-500/20">
            <User size={18} /> Profile Details
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 font-medium rounded-xl transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 font-medium rounded-xl transition-colors">
            <Shield size={18} /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 font-medium rounded-xl transition-colors">
            <Wallet size={18} /> Billing & Plan
          </button>
        </div>

        {/* Form Area */}
        <div className="bg-midnight-900 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
          
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.picture ? (
                <img src={user.picture} alt="Profile" className="w-24 h-24 rounded-full border-4 border-midnight-950 object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl text-white font-bold border-4 border-midnight-950">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-midnight-800 border border-midnight-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                +
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Profile Picture</h3>
              <p className="text-sm text-slate-400 mb-2">PNG, JPG up to 5MB</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Upload new</Button>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Remove</Button>
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.name || ""}
                  className="w-full px-4 py-2.5 bg-midnight-950 border border-midnight-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 bg-midnight-950/50 border border-midnight-800 rounded-xl text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">To change your email, contact support.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Professional Title</label>
              <input 
                type="text" 
                placeholder="e.g. Frontend Developer"
                className="w-full px-4 py-2.5 bg-midnight-950 border border-midnight-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <hr className="border-white/5" />

          <div>
            <h3 className="font-bold text-white mb-4">Connected Accounts</h3>
            <div className="flex items-center justify-between p-4 bg-midnight-950 border border-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Github size={20} className="text-white" />
                <div>
                  <div className="text-slate-200 font-medium text-sm">GitHub Profile</div>
                  <div className="text-slate-500 text-xs">Used to import projects to your portfolio</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button>Save Changes</Button>
          </div>

        </div>
      </div>
    </div>
  );
}
