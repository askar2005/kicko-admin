import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


export function Login() {
    const { login, verify2fa } = useStore();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [adminName, setAdminName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Forgot password states
    const [forgotStep, setForgotStep] = useState<'none' | 'email' | 'reset'>('none');
    const [forgotOtp, setForgotOtp] = useState(["", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        if (!isLogin && (!adminName || !mobileNumber)) {
            setError("All fields are required for registration.");
            return;
        }

        try {
            setLoading(true);
            const url = isLogin ? "http://localhost:5000/api/auth/admin/login" : "http://localhost:5000/api/auth/admin/register";
            const body = isLogin ? { email, password } : { name: adminName, email, phone: mobileNumber, password };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Authentication failed");
            }

            // Success, update store
            login(data.email);
            verify2fa(data.token);
            navigate("/app/dashboard", { replace: true });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendForgotOtp = async () => {
        setError("");
        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/auth/forgot-password/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role: "admin" })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");
            setForgotStep("reset");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setError("");
        const enteredOtp = forgotOtp.join('');
        if (enteredOtp.length < 4 || !newPassword.trim()) {
            setError("Please fill all details");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: enteredOtp, newPassword, role: "admin" })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reset password");
            
            // Success
            setForgotStep("none");
            setIsLogin(true);
            setPassword("");
            setError("Password reset successfully. Please login.");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 p-40 bg-blue-500/5 rounded-full blur-3xl" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? "login" : "register"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md z-10"
                >
                    <Card className="shadow-soft backdrop-blur-xl bg-card/90">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
                                {forgotStep !== 'none' ? "Reset Password" : "Kicko Admin"}
                            </CardTitle>
                            <CardDescription>
                                {forgotStep === 'email' ? "Enter your email to receive a reset code" : 
                                 forgotStep === 'reset' ? "Enter the verification code and new password" : 
                                 isLogin ? "Enter your credentials to access the console" : "Register a new admin account"}
                            </CardDescription>
                        </CardHeader>
                        {forgotStep === 'email' ? (
                            <div className="p-6 pt-0 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="forgot-email">Email</Label>
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="admin@kicko.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}
                                <Button className="w-full h-11 text-base font-semibold" onClick={handleSendForgotOtp} disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Code"}
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={() => setForgotStep('none')}>
                                    Back to Login
                                </Button>
                            </div>
                        ) : forgotStep === 'reset' ? (
                            <div className="p-6 pt-0 space-y-4">
                                <p className="text-sm font-medium text-center text-muted-foreground mb-4">
                                    We've sent a code to <span className="font-bold text-foreground">{email}</span>.
                                </p>
                                <div className="flex justify-center gap-3">
                                    {forgotOtp.map((digit, idx) => (
                                        <Input
                                            key={idx}
                                            id={`admin-forgot-otp-${idx}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            className="w-12 h-14 text-2xl font-bold text-center"
                                            value={digit}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.length > 1) return;
                                                const newOtp = [...forgotOtp];
                                                newOtp[idx] = val;
                                                setForgotOtp(newOtp);
                                                if (val && idx < 3) document.getElementById(`admin-forgot-otp-${idx + 1}`)?.focus();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !forgotOtp[idx] && idx > 0) {
                                                    document.getElementById(`admin-forgot-otp-${idx - 1}`)?.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}
                                <Button className="w-full h-11 text-base font-semibold mt-4" onClick={handleResetPassword} disabled={loading || forgotOtp.some(d => !d)}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={() => setForgotStep('email')}>
                                    Back
                                </Button>
                            </div>
                        ) : (
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-4">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="adminName">Admin Name</Label>
                                        <Input
                                            id="adminName"
                                            type="text"
                                            placeholder="John Doe"
                                            value={adminName}
                                            onChange={(e) => setAdminName(e.target.value)}
                                            required={!isLogin}
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@kicko.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="mobileNumber">Mobile Number</Label>
                                        <Input
                                            id="mobileNumber"
                                            type="tel"
                                            placeholder="+1 234 567 8900"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value)}
                                            required={!isLogin}
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="password">Password</Label>
                                        {isLogin && (
                                            <Button variant="link" className="p-0 h-auto text-xs" type="button" onClick={() => setForgotStep('email')}>
                                                Forgot Password?
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && (
                                    <p className={`text-sm text-center font-medium ${error.includes('successfully') ? 'text-primary' : 'text-destructive'}`}>
                                        {error}
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                                    {loading ? "Processing..." : isLogin ? "Login" : "Register"}
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => { setIsLogin(!isLogin); setError(""); }} className="w-full">
                                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                                </Button>
                            </CardFooter>
                        </form>
                        )}
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
