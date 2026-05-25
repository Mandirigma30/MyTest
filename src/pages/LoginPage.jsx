import React from 'react';
import LoginScreen from '../components/auth/LoginScreen';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#111111] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,63,174,0.22),rgba(255,255,255,0))] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Branding */}
      <div className="absolute top-6 left-6 flex items-center gap-2 select-none">
        <span className="text-xl">🚑</span>
        <span className="font-extrabold text-sm tracking-widest text-[#e5e2e1] font-mono uppercase">
          RespondaCare
        </span>
      </div>
      
      {/* Central Login Layout */}
      <LoginScreen />
    </div>
  );
}
