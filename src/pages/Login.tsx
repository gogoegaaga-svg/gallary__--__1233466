import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SecureInput } from "@/components/ui/secure-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/adam-logo.svg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sanitize = (v: string) => v.replace(/[<>"'&]/g, "").trim();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const clearForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitize(email);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast({ title: "خطأ", description: "بريد إلكتروني غير صالح", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور قصيرة جداً", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setLoading(false);
    clearForm();

    if (error) {
      toast({ title: "خطأ", description: "البريد الإلكتروني أو كلمة المرور غير صحيحة", variant: "destructive" });
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: (data.user.user_metadata?.full_name as string | undefined) || null,
        },
        { onConflict: "id" }
      );
    }

    toast({ title: "أهلاً بك! 👋" });
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex items-center justify-center px-4 py-16">
        <motion.div
          className="w-full max-w-md rounded-2xl bg-card p-8 shadow-fabric"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 text-center">
            <img src={logo} alt="ADAM" className="mx-auto mb-4 h-16 w-16" />
            <h1 className="font-display text-2xl text-foreground">تسجيل الدخول</h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">مرحباً بعودتك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 font-body text-sm">
                <Mail size={16} /> البريد الإلكتروني
              </Label>
              <SecureInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr" autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 font-body text-sm">
                <Lock size={16} /> كلمة المرور
              </Label>
              <SecureInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" autoComplete="current-password" required />
            </div>
            <Button type="submit" disabled={loading} className="gradient-teal w-full font-body font-semibold text-primary-foreground">
              {loading ? "جاري الدخول..." : <><LogIn size={18} /> دخول</>}
            </Button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/signup" className="text-primary hover:underline">إنشاء حساب</Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
