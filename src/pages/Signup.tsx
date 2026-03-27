import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SecureInput } from "@/components/ui/secure-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/adam-logo.svg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sanitize = (v: string) => v.replace(/[<>"'&]/g, "").trim();

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const clearForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitize(fullName);
    const cleanEmail = sanitize(email);

    if (cleanName.length < 2 || cleanName.length > 100) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم صحيح", variant: "destructive" });
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast({ title: "خطأ", description: "بريد إلكتروني غير صالح", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      clearForm();
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    setSubmittedEmail(cleanEmail);
    clearForm();
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-16">
          <motion.div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-fabric text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-5xl mb-4">📧</div>
            <h2 className="font-display text-2xl text-foreground mb-2">تحقق من بريدك الإلكتروني</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              أرسلنا رابط التفعيل إلى <strong dir="ltr">{submittedEmail}</strong>. يرجى الضغط عليه لتفعيل حسابك.
            </p>
            <Link to="/login">
              <Button className="gradient-teal text-primary-foreground font-body">الذهاب لتسجيل الدخول</Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <h1 className="font-display text-2xl text-foreground">إنشاء حساب جديد</h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">انضم إلى عائلة آدم للأقمشة</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 font-body text-sm">
                <User size={16} /> الاسم الكامل
              </Label>
              <SecureInput id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="أدخل اسمك" maxLength={100} className="font-body" autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 font-body text-sm">
                <Mail size={16} /> البريد الإلكتروني
              </Label>
              <SecureInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 font-body text-sm">
                <Lock size={16} /> كلمة المرور
              </Label>
              <SecureInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" dir="ltr" minLength={6} autoComplete="new-password" required />
            </div>
            <Button type="submit" disabled={loading} className="gradient-teal w-full font-body font-semibold text-primary-foreground">
              {loading ? "جاري التسجيل..." : <><UserPlus size={18} /> إنشاء حساب</>}
            </Button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-muted-foreground">
            لديك حساب؟{" "}
            <Link to="/login" className="text-primary hover:underline">تسجيل الدخول</Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
