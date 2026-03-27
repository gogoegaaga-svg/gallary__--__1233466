import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SecureInput } from "@/components/ui/secure-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/adam-logo.svg";

interface AuthGateProps {
  onSuccess?: () => void;
}

const sanitize = (v: string) => v.replace(/[<>"'&]/g, "").trim();

const AuthGate = ({ onSuccess }: AuthGateProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      setLoading(false);
      clearForm();
      if (error) {
        toast({ title: "خطأ", description: "البريد الإلكتروني أو كلمة المرور غير صحيحة", variant: "destructive" });
        return;
      }
      toast({ title: "أهلاً بك! 👋" });
      onSuccess?.();
    } else {
      const cleanName = sanitize(fullName);
      if (cleanName.length < 2) {
        setLoading(false);
        toast({ title: "خطأ", description: "يرجى إدخال اسم صحيح", variant: "destructive" });
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: cleanName } },
      });
      setLoading(false);
      clearForm();
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم إنشاء الحساب", description: "تحقق من بريدك الإلكتروني لتأكيد الحساب" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
      <motion.div
        className="w-full max-w-md rounded-2xl bg-card p-8 shadow-fabric-hover"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="mb-6 text-center">
          <img src={logo} alt="ADAM" className="mx-auto mb-3 h-14 w-14" />
          <h2 className="font-display text-2xl text-foreground">
            {mode === "login" ? "سجّل دخولك" : "إنشاء حساب"}
          </h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {mode === "login" ? "سجّل دخولك لتصفح معرض الأقمشة" : "أنشئ حساباً جديداً للوصول للمعرض"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label className="font-body text-sm">الاسم الكامل</Label>
                <SecureInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="اسمك" maxLength={100} autoComplete="name" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 font-body text-sm">
              <Mail size={14} /> البريد الإلكتروني
            </Label>
              <SecureInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr" autoComplete="email" required />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 font-body text-sm">
              <Lock size={14} /> كلمة المرور
            </Label>
              <SecureInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
          </div>
          <Button type="submit" disabled={loading} className="gradient-teal w-full font-body font-semibold text-primary-foreground">
            {loading ? "جاري التحميل..." : mode === "login" ? (
              <><LogIn size={18} /> دخول</>
            ) : (
              <><UserPlus size={18} /> إنشاء حساب</>
            )}
          </Button>
        </form>

        <p className="mt-5 text-center font-body text-sm text-muted-foreground">
          {mode === "login" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); clearForm(); }} className="text-primary hover:underline font-semibold">
            {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthGate;
