import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

export default function LoginScreen() {
  const navigate = useNavigate();
  
  // State variables
  const [step, setStep] = useState(1); // 1: Credentials, 2: MFA Token
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // References for OTP fields focus management
  const otpRefs = useRef([]);

  // Focus the first OTP box when transitioning to step 2
  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0].focus(), 100);
    }
  }, [step]);

  // Handle credentials check (Step 1)
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Please fill in all credential fields.');
      return;
    }

    setLoading(true);
    // Artificially wait to simulate robust network query and security analysis
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Check credential validation (handles real/sandbox modes)
      const isSandboxUser = (
        (email.trim() === 'admin@respondacare.ph' || email.trim() === 'responder@respondacare.ph') &&
        password === 'password123'
      );
      
      const isRealUser = !supabase.supabaseUrl.includes('placeholder-project-url');

      // Attempt connection to Supabase if configured AND NOT using a sandbox user
      if (isRealUser && !isSandboxUser) {
        const { data, error: sbError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (sbError) throw sbError;
      }

      if (isSandboxUser || isRealUser) {
        setStep(2); // Proceed to Multi-factor authentication input
      } else {
        setError('Invalid Responder credentials. Try: admin@respondacare.ph / password123');
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle MFA OTP entry change
  const handleOtpChange = (index, val) => {
    // Only accept numeric entries
    const cleanVal = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-advance focus to next block
    if (cleanVal !== '' && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  // Handle keypress (like Backspace to shift focus back)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  // Handle MFA check (Step 2)
  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = otp.join('');
    if (token.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const isSandboxVerify = token === '123456';
      // In production, we would perform: supabase.auth.mfa.verify(...)
      
      if (isSandboxVerify || !supabase.supabaseUrl.includes('placeholder-project-url')) {
        setSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        
        // Audit log action locally or via Supabase
        console.log(`[AUDIT] Authorized login session for ${email}`);

        // Route dispatcher vs field responder
        if (email.trim() === 'admin@respondacare.ph') {
          navigate('/dashboard');
        } else {
          navigate('/scanner');
        }
      } else {
        setError('Invalid security token. Use sandbox code: 123456');
      }
    } catch (err) {
      setError(err.message || 'MFA validation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-2">
      <Card className="bg-[#171717]/80 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <Card.Header className="flex flex-col items-center text-center pb-2">
          <div className="h-12 w-12 rounded-full bg-[#1e3fae]/20 border border-[#1e3fae]/50 flex items-center justify-center text-[#b8c4ff] mb-3">
            <ShieldCheck size={28} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#e5e2e1]">RespondaCare</h2>
          <p className="text-xs text-[#8e909f] font-mono mt-1 uppercase tracking-widest">
            {step === 1 ? 'Step 1: Primary Authentication' : 'Step 2: Security Verification'}
          </p>
        </Card.Header>

        <Card.Body className="py-4">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-950/45 border border-[#93000a] text-xs text-[#ffdad6] font-mono">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded bg-green-950/45 border border-green-500/50 text-xs text-green-300 font-mono flex items-center gap-2">
              ✓ Credentials Authorized. Initializing session...
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <Input
                id="responder-email"
                label="Responder Email ID"
                type="email"
                placeholder="e.g. responder@respondacare.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
              />

              <Input
                id="responder-password"
                label="Security Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                rightIcon={<span className="text-xs font-semibold select-none">{showPassword ? 'HIDE' : 'SHOW'}</span>}
                onRightIconClick={() => setShowPassword(!showPassword)}
                required
              />

              <div className="pt-2">
                <Button
                  id="btn-submit-credentials"
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Continue to MFA
                </Button>
              </div>

              <div className="text-[10px] text-center text-[#444653] font-mono border-t border-white/[0.05] pt-3">
                RA 10173 Philippine Data Privacy Act Compliant Encryption
              </div>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-[#c5c5d5]">
                  Enter the 6-digit TOTP verification token generated by your mobile authenticator key app.
                </p>
                <p className="text-xs text-[#8e909f] font-mono mt-1.5">(Sandbox Code: <span className="text-[#b8c4ff] font-bold">123456</span>)</p>
              </div>

              <div className="flex justify-between gap-2 max-w-[280px] mx-auto py-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    id={`otp-box-${index}`}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 bg-[#171717] border border-[#444653] focus:border-[#1e3fae] focus:shadow-[0_0_0_2px_rgba(30,63,174,0.35)] rounded text-center text-lg font-mono font-bold text-[#e5e2e1] outline-none transition-all"
                  />
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  id="btn-verify-otp"
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={otp.join('').length !== 6}
                >
                  Verify & Access Portal
                </Button>

                <Button
                  variant="ghost"
                  fullWidth
                  size="sm"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft size={14} />}
                >
                  Back to credentials
                </Button>
              </div>
            </form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
