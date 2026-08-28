import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ActiveTab, DevPersona } from '../types';
import { 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Users,
  Lock,
  ChevronRight
} from 'lucide-react';

export const DEFAULT_DEV_PERSONAS: DevPersona[] = [
  {
    id: 'jane-doe',
    name: 'Jane Doe',
    email: 'j.doe@forrestlogistics.com',
    role: 'Senior Pricing Analyst',
    teamContext: 'Pricing Team',
    avatarInitials: 'JD',
    avatarColor: '#1769FF',
    description: 'Full rate management, exception adjustments, and data staging.'
  },
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    email: 'a.rivera@forrestlogistics.com',
    role: 'Operations Dispatcher',
    teamContext: 'Operations',
    avatarInitials: 'AR',
    avatarColor: '#D58A16',
    description: 'Carrier rate lookups, issue dispatching, read-only data view.'
  },
  {
    id: 'sarah-miller',
    name: 'Sarah Miller',
    email: 's.miller@forrestlogistics.com',
    role: 'Pricing Director & Admin',
    teamContext: 'Pricing Team',
    avatarInitials: 'SM',
    avatarColor: '#10B981',
    description: 'System parameters, global overrides, and master rate commit.'
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    email: 'm.vance@forrestlogistics.com',
    role: 'Carrier Logistics Specialist',
    teamContext: 'Operations',
    avatarInitials: 'MV',
    avatarColor: '#8B5CF6',
    description: 'Carrier lane matching, spot quote exceptions, and route review.'
  }
];

export interface LoginProps {
  onBypass?: (persona: DevPersona, initialTab?: ActiveTab) => void;
  onLoginSuccess?: (email?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onBypass, onLoginSuccess }) => {
  // Tabs: 'dev_bypass' | 'supabase_login'
  const [authMode, setAuthMode] = useState<'dev_bypass' | 'supabase_login'>('dev_bypass');
  const [selectedPersona, setSelectedPersona] = useState<DevPersona>(DEFAULT_DEV_PERSONAS[0]);
  const [selectedTab, setSelectedTab] = useState<ActiveTab>('target_control_tower');

  // Supabase Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInstantBypass = () => {
    if (onBypass) {
      onBypass(DEFAULT_DEV_PERSONAS[0], 'target_control_tower');
    }
  };

  const handlePersonaBypass = () => {
    if (onBypass) {
      onBypass(selectedPersona, selectedTab);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (onLoginSuccess) {
          onLoginSuccess(data?.user?.email || email);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        if (onLoginSuccess) {
          onLoginSuccess(data?.user?.email || email);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070F1E] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1769FF]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1769FF] rounded-2xl shadow-lg shadow-[#1769FF]/30 mb-3 transform hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[32px] text-white">local_shipping</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Pricing Control Tower</span>
            <span className="text-[#1769FF]">Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-md mx-auto">
            Forrest Logistics dynamic carrier rate analytics & decision intelligence platform
          </p>

          {/* Dev Mode Banner */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#1E293B] border border-[#334155] rounded-full text-[11px] font-semibold text-[#38BDF8]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Development & Preview Environment Active</span>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#0D1A30] border border-[#1E3050] shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-[#1E3050] bg-[#091322]">
            <button
              onClick={() => {
                setAuthMode('dev_bypass');
                setError(null);
              }}
              className={`flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                authMode === 'dev_bypass'
                  ? 'border-[#1769FF] text-white bg-[#0D1A30] shadow-inner'
                  : 'border-transparent text-[#64748B] hover:text-[#94A3B8] hover:bg-[#0E1E36]'
              }`}
            >
              <Zap className={`w-4 h-4 ${authMode === 'dev_bypass' ? 'text-[#1769FF]' : 'text-[#64748B]'}`} />
              <span>Development Bypass Screen</span>
              <span className="hidden sm:inline-block bg-[#1769FF]/20 text-[#38BDF8] text-[9px] px-1.5 py-0.5 rounded font-black">
                DEV
              </span>
            </button>

            <button
              onClick={() => {
                setAuthMode('supabase_login');
                setError(null);
              }}
              className={`flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                authMode === 'supabase_login'
                  ? 'border-[#1769FF] text-white bg-[#0D1A30] shadow-inner'
                  : 'border-transparent text-[#64748B] hover:text-[#94A3B8] hover:bg-[#0E1E36]'
              }`}
            >
              <Lock className={`w-4 h-4 ${authMode === 'supabase_login' ? 'text-[#1769FF]' : 'text-[#64748B]'}`} />
              <span>Standard Supabase Login</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* DEVELOPMENT BYPASS SCREEN */}
          {/* ========================================================= */}
          {authMode === 'dev_bypass' && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Primary 1-Click Fast Bypass Button */}
              <div className="bg-gradient-to-r from-[#1769FF]/20 via-[#0E2F6D]/40 to-[#10B981]/15 border border-[#1769FF]/40 rounded-xl p-4 sm:p-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                        1-Click Instant Bypass
                      </h3>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Directly enter the Pricing Control Tower as Senior Analyst with full administrative permissions.
                    </p>
                  </div>

                  <button
                    id="instant-dev-bypass-btn"
                    onClick={handleInstantBypass}
                    className="shrink-0 px-5 py-2.5 bg-[#1769FF] hover:bg-[#1255D4] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#1769FF]/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 group"
                  >
                    <span>Instant Dev Bypass</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Persona Selector Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1769FF]" />
                    <span>Select Test Persona & Role</span>
                  </label>
                  <span className="text-[11px] text-[#64748B]">Click a profile to simulate role permissions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEFAULT_DEV_PERSONAS.map((persona) => {
                    const isSelected = selectedPersona.id === persona.id;
                    return (
                      <div
                        key={persona.id}
                        onClick={() => setSelectedPersona(persona)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#13274A] border-[#1769FF] ring-1 ring-[#1769FF] shadow-md'
                            : 'bg-[#0A1628] border-[#1E3050] hover:border-[#334E78] hover:bg-[#0E1E36]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: persona.avatarColor }}
                          >
                            {persona.avatarInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-white truncate">{persona.name}</h4>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                  persona.teamContext === 'Operations'
                                    ? 'bg-[#D58A16]/20 text-[#F59E0B]'
                                    : 'bg-[#1769FF]/20 text-[#60A5FA]'
                                }`}
                              >
                                {persona.teamContext}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-[#94A3B8] truncate">{persona.role}</p>
                            <p className="text-[10px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                              {persona.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#1E3050] flex items-center justify-between text-[10px]">
                          <span className="text-[#64748B] truncate">{persona.email}</span>
                          {isSelected ? (
                            <span className="text-[#10B981] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Selected
                            </span>
                          ) : (
                            <span className="text-[#64748B] group-hover:text-white">Click to choose</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Initial Landing Destination Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">
                  Initial Workspace Destination
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'target_control_tower', label: 'Target Control Tower', icon: 'dashboard' },
                    { id: 'rate_directory', label: 'Rate Directory', icon: 'analytics' },
                    { id: 'data_management', label: 'Data Management', icon: 'database' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTab(tab.id as ActiveTab)}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        selectedTab === tab.id
                          ? 'bg-[#1769FF]/15 border-[#1769FF] text-white font-bold'
                          : 'bg-[#0A1628] border-[#1E3050] text-[#94A3B8] hover:text-white hover:bg-[#0E1E36]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#1769FF]">{tab.icon}</span>
                      <span className="text-xs truncate">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona Launch CTA */}
              <button
                id="launch-persona-bypass-btn"
                onClick={handlePersonaBypass}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#1769FF] to-[#2563EB] hover:from-[#155BE0] hover:to-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#1769FF]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Launch Hub as {selectedPersona.name} ({selectedPersona.role})</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Feature info footer */}
              <div className="bg-[#0A1628] border border-[#1E3050]/80 rounded-xl p-3 flex items-center gap-3 text-[11px] text-[#94A3B8]">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  <strong>Developer Notice:</strong> Bypass mode operates with complete local sandbox datasets and full simulation tools. You can return to this screen or switch roles anytime via the top navigation avatar.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STANDARD SUPABASE CREDENTIALS LOGIN */}
          {/* ========================================================= */}
          {authMode === 'supabase_login' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-base text-white">
                  {isLogin ? 'Sign In with Supabase Account' : 'Create a New Account'}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Connect to your Supabase PostgreSQL authentication backend
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleAuth}>
                {error && (
                  <div className="bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl p-3.5 flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 text-[#EF4444] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#FCA5A5] leading-relaxed">{error}</div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@forrestlogistics.com"
                    className="block w-full px-3.5 py-2.5 bg-[#0A1628] border border-[#1E3050] rounded-xl text-white text-xs placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full px-3.5 py-2.5 bg-[#0A1628] border border-[#1E3050] rounded-xl text-white text-xs placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#1769FF] hover:bg-[#1255D4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1769FF] disabled:opacity-50 transition-all shadow-md shadow-[#1769FF]/20"
                >
                  {loading ? (
                    'Connecting...'
                  ) : isLogin ? (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Sign in to Account
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-[#1E3050] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="text-[#38BDF8] hover:underline font-semibold"
                >
                  {isLogin ? 'Need an account? Sign up' : 'Already registered? Sign in'}
                </button>

                <button
                  onClick={() => {
                    setAuthMode('dev_bypass');
                    setError(null);
                  }}
                  className="text-[#94A3B8] hover:text-white flex items-center gap-1 font-semibold"
                >
                  <Zap className="w-3.5 h-3.5 text-[#1769FF]" />
                  <span>Switch to Dev Bypass</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-[#64748B]">
          Forrest Logistics Pricing Control Tower &copy; {new Date().getFullYear()} &middot; Internal Pricing Operations
        </div>
      </div>
    </div>
  );
};

