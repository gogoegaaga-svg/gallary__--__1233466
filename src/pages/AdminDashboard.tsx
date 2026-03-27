import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Package, MessageSquare, Tag, LogOut, BarChart3, Plus, Trash2, Eye, EyeOff,
  Star, Sparkles, Upload, Image as ImageIcon, Share2, Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/adam-logo.svg";

type Tab = "stats" | "fabrics" | "users" | "brands" | "chats" | "social";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const getPublicUrl = (bucket: string, path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

const AdminDashboard = () => {
  const [tab, setTab] = useState<Tab>("stats");
  const [customers, setCustomers] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdmin();
  }, []);

  // Realtime subscriptions for live updates
  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "fabrics_db" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "brands" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "social_links" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin-login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) { navigate("/admin-login"); return; }
    fetchAll();
  };

  const fetchAll = async () => {
    setLoading(true);
    const [c, p, m, b, f, s] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, phone, created_at, updated_at").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
      supabase.from("brands").select("*").order("created_at", { ascending: false }),
      supabase.from("fabrics_db").select("*").order("created_at", { ascending: false }),
      supabase.from("social_links").select("*").order("platform"),
    ]);
    setCustomers(c.data || []);
    setRegisteredUsers(p.data || []);
    setMessages(m.data || []);
    setBrands(b.data || []);
    setFabrics(f.data || []);
    setSocialLinks(s.data || []);

    // Fetch unique chat users
    const { data: chatMsgs } = await supabase.from("chat_messages").select("user_id").order("created_at", { ascending: false });
    if (chatMsgs) {
      const uniqueUserIds = [...new Set(chatMsgs.map((cm: any) => cm.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", uniqueUserIds);
      setChatUsers(profiles || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "stats", label: "إحصائيات", icon: BarChart3 },
    { id: "fabrics", label: "الأقمشة", icon: Package, count: fabrics.length },
    { id: "users", label: "المستخدمين", icon: Users, count: registeredUsers.length },
    { id: "brands", label: "الماركات", icon: Tag, count: brands.length },
    { id: "chats", label: "المحادثات", icon: MessageSquare, count: chatUsers.length },
    { id: "social", label: "التواصل الاجتماعي", icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ADAM" className="w-10 h-10" />
          <h1 className="font-display text-xl text-foreground hidden sm:block">لوحة تحكم المشرف</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive gap-2 font-body">
          <LogOut size={16} /> خروج
        </Button>
      </header>

      <div className="bg-background border-b border-border overflow-x-auto">
        <div className="container mx-auto px-4 flex gap-1">
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
              {t.count !== undefined && t.count > 0 && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 font-body text-muted-foreground">جاري التحميل...</div>
        ) : (
          <>
            {tab === "stats" && <StatsTab users={registeredUsers} messages={messages} fabrics={fabrics} brands={brands} chatMessages={chatUsers} />}
            {tab === "fabrics" && <FabricsTab fabrics={fabrics} brands={brands} onRefresh={fetchAll} />}
            {tab === "users" && <UsersTab users={registeredUsers} />}
            {tab === "brands" && <BrandsTab brands={brands} onRefresh={fetchAll} />}
            {tab === "chats" && <AdminChatsTab chatUsers={chatUsers} />}
            {tab === "social" && <SocialLinksTab links={socialLinks} onRefresh={fetchAll} />}
          </>
        )}
      </div>
    </div>
  );
};

// Stats Tab
const StatsTab = ({ users, messages, fabrics, brands, chatMessages }: any) => {
  const stats = [
    { label: "إجمالي المستخدمين", value: users.length, icon: Users, color: "text-primary" },
    { label: "إجمالي الأقمشة", value: fabrics.length, icon: Package, color: "text-accent" },
    { label: "الماركات", value: brands.length, icon: Tag, color: "text-gold" },
    { label: "رسائل من المستخدمين", value: messages.length, icon: MessageSquare, color: "text-destructive" },
    { label: "أقمشة مميزة", value: fabrics.filter((f: any) => f.is_featured).length, icon: Star, color: "text-accent" },
    { label: "وصل حديثاً", value: fabrics.filter((f: any) => f.is_new).length, icon: Sparkles, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bg-card rounded-xl p-6 shadow-fabric"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <s.icon className={`${s.color} mb-2`} size={24} />
          <div className="font-display text-3xl text-foreground">{s.value}</div>
          <div className="font-body text-sm text-muted-foreground">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// Users Tab
const UsersTab = ({ users }: { users: any[] }) => {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-foreground">مستخدمو الحساب ({users.length})</h2>
      <div className="bg-card rounded-xl shadow-fabric overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right">#</th>
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">الهاتف</th>
                <th className="px-4 py-3 text-right">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any, i: number) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">{u.full_name || "بدون اسم"}</td>
                  <td className="px-4 py-3 dir-ltr" dir="ltr">{u.phone || "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">لا يوجد مستخدمون مسجلون بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Image Upload Component
const ImageUploader = ({ bucket, onUploaded, currentUrl }: { bucket: string; onUploaded: (url: string) => void; currentUrl?: string }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Resolve signed URL for private buckets on mount
  useEffect(() => {
    if (!currentUrl) return;
    if (bucket === 'customer-images') {
      // Extract path from full URL or use as-is if it's just a path
      const path = currentUrl.includes('/storage/') 
        ? currentUrl.split('/').pop() || currentUrl 
        : currentUrl;
      supabase.storage.from(bucket).createSignedUrl(path, 3600).then(({ data }) => {
        setPreview(data?.signedUrl || null);
      });
    } else {
      setPreview(currentUrl);
    }
  }, [currentUrl, bucket]);


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      setUploading(false);
      return;
    }
    // Use signed URL for private buckets, public URL for public ones
    if (bucket === 'customer-images') {
      const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
      const url = signedData?.signedUrl || '';
      setPreview(url);
      onUploaded(path); // Store the path, not the URL, for private buckets
    } else {
      const url = getPublicUrl(bucket, path);
      setPreview(url);
      onUploaded(url);
    }
    setUploading(false);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      {preview ? (
        <div className="relative group">
          <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-border" />
          <button
            onClick={() => { setPreview(null); fileRef.current?.click(); }}
            className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
          >
            <Upload className="text-primary-foreground" size={20} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
        >
          {uploading ? (
            <span className="font-body text-sm">جاري الرفع...</span>
          ) : (
            <>
              <ImageIcon size={24} />
              <span className="font-body text-xs">اضغط لرفع صورة</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Fabrics Tab
const FabricsTab = ({ fabrics, brands, onRefresh }: { fabrics: any[]; brands: any[]; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", name_en: "", type: "cotton", category: "upholstery", brand: "",
    origin: "", composition: "", gsm: "", price: "اطلب السعر",
    is_featured: false, is_new: false, is_popular: false, coming_soon: false,
    image_url: "",
  });
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!form.name.trim() || !form.brand.trim()) {
      toast({ title: "خطأ", description: "يرجى ملء الاسم والماركة", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("fabrics_db").insert({
      name: form.name.trim(),
      name_en: form.name_en.trim() || null,
      type: form.type,
      category: form.category,
      brand: form.brand.trim(),
      origin: form.origin.trim() || null,
      composition: form.composition.trim() || null,
      gsm: form.gsm ? parseInt(form.gsm) : null,
      price: form.price || "اطلب السعر",
      is_featured: form.is_featured,
      is_new: form.is_new,
      is_popular: form.is_popular,
      coming_soon: form.coming_soon,
      image_url: form.image_url || null,
    });
    if (error) {
      toast({ title: "خطأ", description: "فشل في إضافة القماش", variant: "destructive" });
    } else {
      toast({ title: "تم بنجاح", description: "تم إضافة القماش" });
      setShowForm(false);
      setForm({ name: "", name_en: "", type: "cotton", category: "upholstery", brand: "", origin: "", composition: "", gsm: "", price: "اطلب السعر", is_featured: false, is_new: false, is_popular: false, coming_soon: false, image_url: "" });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("fabrics_db").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground">إدارة الأقمشة</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-teal text-primary-foreground gap-2 font-body">
          <Plus size={16} /> إضافة قماش
        </Button>
      </div>

      {showForm && (
        <motion.div className="bg-card rounded-xl p-6 shadow-fabric space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="font-body text-sm">الاسم بالعربي *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="font-body" /></div>
            <div><Label className="font-body text-sm">الاسم بالإنجليزي</Label><Input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} dir="ltr" /></div>
            <div>
              <Label className="font-body text-sm">النوع</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["cotton","linen","polyester","silk","velvet","satin","chiffon","denim"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-body text-sm">الفئة</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upholstery">قماش تنجيد</SelectItem>
                  <SelectItem value="curtains">مقاس ستائر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="font-body text-sm">الماركة *</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="font-body" /></div>
            <div><Label className="font-body text-sm">بلد المنشأ</Label><Input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className="font-body" /></div>
            <div><Label className="font-body text-sm">التركيب</Label><Input value={form.composition} onChange={e => setForm({...form, composition: e.target.value})} className="font-body" /></div>
            <div><Label className="font-body text-sm">GSM</Label><Input type="number" value={form.gsm} onChange={e => setForm({...form, gsm: e.target.value})} dir="ltr" /></div>
            <div><Label className="font-body text-sm">السعر</Label><Input value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="font-body" /></div>
            <div>
              <Label className="font-body text-sm">صورة المنتج</Label>
              <ImageUploader bucket="product-images" onUploaded={(url) => setForm({...form, image_url: url})} currentUrl={form.image_url || undefined} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="sm" variant={form.is_featured ? "default" : "outline"} onClick={() => setForm({...form, is_featured: !form.is_featured})} className={`font-body text-sm ${form.is_featured ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}>
              {form.is_featured ? "✓ مميز" : "مميز"}
            </Button>
            <Button type="button" size="sm" variant={form.is_new ? "default" : "outline"} onClick={() => setForm({...form, is_new: !form.is_new})} className={`font-body text-sm ${form.is_new ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}>
              {form.is_new ? "✓ جديد" : "جديد"}
            </Button>
            <Button type="button" size="sm" variant={form.is_popular ? "default" : "outline"} onClick={() => setForm({...form, is_popular: !form.is_popular})} className={`font-body text-sm ${form.is_popular ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}>
              {form.is_popular ? "✓ شائع" : "شائع"}
            </Button>
            <Button type="button" size="sm" variant={form.coming_soon ? "default" : "outline"} onClick={() => setForm({...form, coming_soon: !form.coming_soon})} className={`font-body text-sm ${form.coming_soon ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}>
              {form.coming_soon ? "✓ قريباً" : "قريباً"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="gradient-teal text-primary-foreground font-body">حفظ</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-body">إلغاء</Button>
          </div>
        </motion.div>
      )}

      <div className="bg-card rounded-xl shadow-fabric overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right">الصورة</th>
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">النوع</th>
                <th className="px-4 py-3 text-right">الفئة</th>
                <th className="px-4 py-3 text-right">الماركة</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {fabrics.map((f: any) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3">
                    {f.image_url ? (
                      <img src={f.image_url} alt={f.name} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center"><ImageIcon size={16} className="text-muted-foreground" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3">{f.type}</td>
                  <td className="px-4 py-3">{f.category === "upholstery" ? "قماش تنجيد" : f.category === "curtains" ? "مقاس ستائر" : f.category}</td>
                  <td className="px-4 py-3">{f.brand}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {f.is_featured && <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded">مميز</span>}
                      {f.is_new && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">جديد</span>}
                      {f.is_popular && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">شائع</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)} className="text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {fabrics.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد أقمشة بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Customers Tab
const CustomersTab = ({ customers, onRefresh }: { customers: any[]; onRefresh: () => void }) => {
  const { toast } = useToast();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleImageUpload = async (customerId: string, url: string) => {
    setUploadingId(customerId);
    const { error } = await supabase.from("customers").update({ image_url: url }).eq("id", customerId);
    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الصورة", variant: "destructive" });
    } else {
      toast({ title: "تم تحديث الصورة" });
      onRefresh();
    }
    setUploadingId(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-foreground">العملاء المسجلين ({customers.length})</h2>
      <div className="bg-card rounded-xl shadow-fabric overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-right">#</th>
                <th className="px-4 py-3 text-right">الصورة</th>
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">الهاتف</th>
                <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any, i: number) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="w-12">
                      <ImageUploader
                        bucket="customer-images"
                        onUploaded={(url) => handleImageUpload(c.id, url)}
                        currentUrl={c.image_url || undefined}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 dir-ltr" dir="ltr">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">لا يوجد عملاء مسجلين بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Brands Tab
const BrandsTab = ({ brands, onRefresh }: { brands: any[]; onRefresh: () => void }) => {
  const [newBrand, setNewBrand] = useState("");
  const [newBrandImage, setNewBrandImage] = useState("");
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newBrand.trim()) return;
    const { error } = await supabase.from("brands").insert({ name: newBrand.trim(), image_url: newBrandImage || null });
    if (error) {
      toast({ title: "خطأ", description: "فشل في إضافة الماركة", variant: "destructive" });
    } else {
      setNewBrand("");
      setNewBrandImage("");
      toast({ title: "تم إضافة الماركة" });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("brands").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-foreground">إدارة الماركات</h2>
      <div className="bg-card rounded-xl p-4 shadow-fabric space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="font-body text-sm">اسم الماركة *</Label>
            <Input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="اسم الماركة الجديدة" className="font-body" />
          </div>
          <div>
            <Label className="font-body text-sm">صورة الماركة</Label>
            <ImageUploader bucket="product-images" onUploaded={(url) => setNewBrandImage(url)} currentUrl={newBrandImage || undefined} />
          </div>
        </div>
        <Button onClick={handleAdd} className="gradient-teal text-primary-foreground gap-2 font-body"><Plus size={16} /> إضافة</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((b: any) => (
          <motion.div key={b.id} className="bg-card rounded-xl shadow-fabric p-4 flex items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {b.image_url ? (
              <img src={b.image_url} alt={b.name} className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <ImageIcon size={20} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-foreground truncate">{b.name}</p>
              <p className="font-body text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString("ar-EG")}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} className="text-destructive flex-shrink-0"><Trash2 size={14} /></Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Messages Tab
const MessagesTab = ({ messages, onRefresh }: { messages: any[]; onRefresh: () => void }) => {
  const { toast } = useToast();

  const toggleRead = async (id: string, current: boolean) => {
    await supabase.from("messages").update({ is_read: !current }).eq("id", id);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    toast({ title: "تم حذف الرسالة" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-foreground">الرسائل ({messages.length})</h2>
      <div className="space-y-3">
        {messages.map((m: any) => (
          <motion.div
            key={m.id}
            className={`bg-card rounded-xl p-4 shadow-fabric border-r-4 ${m.is_read ? "border-border" : "border-primary"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body font-semibold text-foreground">{m.name}</span>
                  {m.phone && <span className="text-xs text-muted-foreground" dir="ltr">{m.phone}</span>}
                  {!m.is_read && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">جديد</span>}
                </div>
                <p className="font-body text-sm text-muted-foreground">{m.message}</p>
                <span className="font-body text-xs text-muted-foreground/60 mt-1 block">
                  {new Date(m.created_at).toLocaleDateString("ar-EG")} - {new Date(m.created_at).toLocaleTimeString("ar-EG")}
                </span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => toggleRead(m.id, m.is_read)}>
                  {m.is_read ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-body">لا توجد رسائل</div>
        )}
      </div>
    </div>
  );
};

// Admin Chats Tab
const AdminChatsTab = ({ chatUsers }: { chatUsers: any[] }) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const loadChat = async (userId: string) => {
    const user = chatUsers.find((u: any) => u.id === userId);
    setSelectedUser(user);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    setChatMessages(data || []);
  };

  useEffect(() => {
    if (!selectedUser) return;
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `user_id=eq.${selectedUser.id}` }, (payload) => {
        setChatMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedUser]);

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedUser) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("chat_messages").insert({
        user_id: selectedUser.id,
        sender_id: user.id,
        message: reply.trim(),
      });
    }
    setReply("");
    setSending(false);
  };

  if (!selectedUser) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-xl text-foreground">محادثات المستخدمين</h2>
        {chatUsers.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground font-body">لا توجد محادثات بعد</p>
        ) : (
          <div className="space-y-2">
            {chatUsers.map((u: any) => (
              <button
                key={u.id}
                onClick={() => loadChat(u.id)}
                className="w-full bg-card rounded-xl p-4 shadow-fabric text-right hover:bg-muted/50 transition-colors flex items-center gap-3"
              >
                <Users size={20} className="text-primary flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-foreground">{u.full_name || "مستخدم"}</p>
                  <p className="font-body text-xs text-muted-foreground">{u.phone || "بدون رقم"}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="font-body">← رجوع</Button>
        <h2 className="font-display text-lg text-foreground">محادثة مع {selectedUser.full_name || "مستخدم"}</h2>
      </div>
      <div className="bg-card rounded-xl shadow-fabric overflow-hidden flex flex-col" style={{ height: "60vh" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((msg: any) => {
            const isAdmin = msg.sender_id !== selectedUser.id;
            return (
              <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${isAdmin ? "gradient-teal text-primary-foreground" : "bg-muted text-foreground"}`}>
                  <p className="font-body text-sm">{msg.message}</p>
                  <span className={`font-body text-[10px] mt-1 block ${isAdmin ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border p-3 flex gap-2">
          <Input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="اكتب ردك..."
            className="font-body"
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReply()}
            maxLength={1000}
          />
          <Button onClick={handleSendReply} disabled={sending || !reply.trim()} className="gradient-teal text-primary-foreground font-body">
            إرسال
          </Button>
        </div>
      </div>
    </div>
  );
};

// Social Links Tab
const platformMeta: Record<string, { name: string; color: string }> = {
  whatsapp: { name: "WhatsApp", color: "#25D366" },
  facebook: { name: "Facebook", color: "#1877F2" },
  instagram: { name: "Instagram", color: "#E4405F" },
  tiktok: { name: "TikTok", color: "#000000" },
};

const SocialLinksTab = ({ links, onRefresh }: { links: any[]; onRefresh: () => void }) => {
  const [editedLinks, setEditedLinks] = useState<any[]>(links);
  const [saving, setSaving] = useState(false);
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => { setEditedLinks(links); }, [links]);

  const updateField = (id: string, field: string, value: any) => {
    setEditedLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const link of editedLinks) {
      await supabase.from("social_links").update({ url: link.url, is_active: link.is_active }).eq("id", link.id);
    }
    toast({ title: "تم الحفظ", description: "تم تحديث روابط التواصل الاجتماعي" });
    setSaving(false);
    onRefresh();
  };

  const handleAdd = async () => {
    if (!newPlatform.trim() || !newUrl.trim()) {
      toast({ title: "خطأ", description: "يرجى اختيار المنصة وإدخال الرابط", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("social_links").insert({ platform: newPlatform, url: newUrl.trim(), is_active: true });
    if (error) {
      toast({ title: "خطأ", description: "فشل في إضافة الرابط", variant: "destructive" });
    } else {
      setNewPlatform("");
      setNewUrl("");
      toast({ title: "تم الإضافة" });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("social_links").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    onRefresh();
  };

  const availablePlatforms = Object.keys(platformMeta).filter(
    p => !editedLinks.some(l => l.platform === p)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground">إدارة روابط التواصل الاجتماعي</h2>
        {editedLinks.length > 0 && (
          <Button onClick={handleSave} disabled={saving} className="gradient-teal text-primary-foreground gap-2 font-body">
            <Save size={16} /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        )}
      </div>

      {availablePlatforms.length > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-fabric space-y-3">
          <h3 className="font-body font-semibold text-foreground text-sm">إضافة منصة جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <Label className="font-body text-sm">المنصة</Label>
              <Select value={newPlatform} onValueChange={setNewPlatform}>
                <SelectTrigger><SelectValue placeholder="اختر المنصة" /></SelectTrigger>
                <SelectContent>
                  {availablePlatforms.map(p => (
                    <SelectItem key={p} value={p}>{platformMeta[p].name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-body text-sm">الرابط</Label>
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." dir="ltr" className="font-body text-sm" />
            </div>
            <Button onClick={handleAdd} className="gradient-teal text-primary-foreground gap-2 font-body">
              <Plus size={16} /> إضافة
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {editedLinks.map((link) => {
          const meta = platformMeta[link.platform] || { name: link.platform, color: "#666" };
          return (
            <motion.div
              key={link.id}
              className="bg-card rounded-xl p-4 shadow-fabric flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: meta.color }}>
                <Share2 size={18} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-foreground">{meta.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={link.is_active ? "default" : "outline"}
                      onClick={() => updateField(link.id, "is_active", !link.is_active)}
                      className={`font-body text-xs ${link.is_active ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-destructive border-destructive/30"}`}
                    >
                      {link.is_active ? "مفعّل" : "معطّل"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)} className="text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <Input
                  value={link.url}
                  onChange={(e) => updateField(link.id, "url", e.target.value)}
                  dir="ltr"
                  placeholder={`رابط ${meta.name}`}
                  className="font-body text-sm"
                />
              </div>
            </motion.div>
          );
        })}
        {editedLinks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-body">لا توجد روابط بعد، أضف منصة جديدة من الأعلى</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
