import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Heart, MessageSquare, LogOut, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fabrics } from "@/data/fabrics";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingSocial from "@/components/FloatingSocial";
import FabricCard from "@/components/FabricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Tab = "info" | "favorites" | "chat";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("info");
  const [profile, setProfile] = useState<any>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFavorites();
      fetchChat();
    }
  }, [user]);

  // Realtime chat subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `user_id=eq.${user.id}` }, (payload) => {
        setChatMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
    if (data) {
      setProfile(data);
      setEditName(data.full_name || "");
      setEditPhone(data.phone || "");
    }
  };

  const fetchFavorites = async () => {
    const { data } = await supabase.from("favorites").select("fabric_id").eq("user_id", user!.id);
    setFavoriteIds((data || []).map((f: any) => f.fabric_id));
  };

  const fetchChat = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true });
    setChatMessages(data || []);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ full_name: editName.trim(), phone: editPhone.trim() }).eq("id", user!.id);
    setSaving(false);
    toast({ title: "تم حفظ البيانات ✅" });
    fetchProfile();
  };

  const handleRemoveFavorite = async (fabricId: string) => {
    await supabase.from("favorites").delete().eq("user_id", user!.id).eq("fabric_id", fabricId);
    setFavoriteIds((prev) => prev.filter((id) => id !== fabricId));
    toast({ title: "تمت الإزالة من المفضلة" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setSendingMsg(true);
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      sender_id: user.id,
      message: newMessage.trim(),
    });
    setNewMessage("");
    setSendingMsg(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center font-body text-muted-foreground">جاري التحميل...</div>;
  if (!user) return null;

  const favoriteFabrics = fabrics.filter((f) => favoriteIds.includes(f.id));

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "info", label: "بياناتي", icon: User },
    { id: "favorites", label: `المفضلة (${favoriteIds.length})`, icon: Heart },
    { id: "chat", label: "المحادثات", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl text-foreground">حسابي</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive gap-2 font-body">
            <LogOut size={16} /> خروج
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-body whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {tab === "info" && (
          <motion.div className="max-w-md space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-xl bg-card p-6 shadow-fabric space-y-4">
              <p className="font-body text-xs text-muted-foreground">البريد: {user.email}</p>
              <div className="space-y-2">
                <Label className="font-body text-sm">الاسم الكامل</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="font-body" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">رقم الهاتف</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="font-body" dir="ltr" maxLength={20} />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="gradient-teal text-primary-foreground font-body">
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Favorites Tab */}
        {tab === "favorites" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {favoriteFabrics.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="mx-auto mb-4 text-muted-foreground" size={48} />
                <p className="font-display text-xl text-muted-foreground mb-2">لا توجد أقمشة في المفضلة</p>
                <Link to="/gallery" className="text-primary font-body text-sm hover:underline">تصفح المعرض</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteFabrics.map((f) => (
                  <div key={f.id} className="relative">
                    <FabricCard fabric={f} />
                    <button
                      onClick={() => handleRemoveFavorite(f.id)}
                      className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground p-1.5 rounded-full hover:opacity-80"
                      title="إزالة من المفضلة"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Chat Tab */}
        {tab === "chat" && (
          <motion.div className="max-w-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-xl bg-card shadow-fabric overflow-hidden flex flex-col" style={{ height: "60vh" }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <p className="text-center text-muted-foreground font-body text-sm py-8">ابدأ محادثتك مع فريق آدم</p>
                )}
                {chatMessages.map((msg: any) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${isMe ? "gradient-teal text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p className="font-body text-sm">{msg.message}</p>
                        <span className={`font-body text-[10px] mt-1 block ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Input */}
              <div className="border-t border-border p-3 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="font-body"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  maxLength={1000}
                />
                <Button onClick={handleSendMessage} disabled={sendingMsg || !newMessage.trim()} className="gradient-teal text-primary-foreground font-body">
                  إرسال
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
      <FloatingSocial />
    </div>
  );
};

export default Profile;
