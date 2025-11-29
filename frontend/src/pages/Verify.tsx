import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { PageTransition } from '@/components/PageTransition';
import { PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Verify() {
  const navigate = useNavigate();
  const verify = useAuthStore((state) => state.verify);
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    const success = await verify(code);
    setIsVerifying(false);

    if (success) {
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid code. Please try again.');
      setCode('');
    }
  };

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    toast.success('Verification code sent!');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md glass">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2 self-center group">
              <PenLine className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
              <span className="text-2xl font-bold font-serif">Scribble</span>
            </div>
            <div>
              <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
              <CardDescription className="text-center">
                We sent a 6-digit code to your email
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={isVerifying || code.length !== 6}
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="text-center">
              {canResend ? (
                <Button
                  variant="link"
                  onClick={handleResend}
                  className="text-primary"
                >
                  Resend Code
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend code in {countdown}s
                </p>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Tip: For demo purposes, use code <code className="bg-muted px-2 py-1 rounded">123456</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
