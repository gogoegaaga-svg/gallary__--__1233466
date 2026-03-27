import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/adam-logo.svg";

const navItems: { label: string; path: string; external?: boolean }[] = [
  { label: "الرئيسية", path: "/" },
  { label: "عن آدم", path: "/about" },
  { label: "المعرض", path: "/gallery" },
  { label: "تواصل معنا", path: "https://wa.me/201016694946", external: true },
];

const isActivePath = (pathname: string, path: string) => pathname === path;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between md:h-20">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground md:hidden" aria-label="القائمة">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {/* User/Auth icon */}
            {user ? (
              <Link to="/profile" className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="حسابي">
                <User size={20} />
              </Link>
            ) : (
              <Link to="/login" className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="دخول">
                <LogIn size={20} />
              </Link>
            )}
          </div>

          <div className="hidden items-center gap-8 font-body text-sm md:flex">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors duration-200 hover:text-primary ${
                    isActivePath(location.pathname, item.path) ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          <Link to="/" className="flex items-center">
            <img src={logo} alt="ADAM Fabrics" className="h-12 w-12 md:h-14 md:w-14" />
          </Link>

          <Link to="/gallery" className="p-2 text-muted-foreground transition-colors hover:text-primary" aria-label="ابحث في المعرض">
            <Search size={20} />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-background md:hidden"
          >
            <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
              {navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="py-2 text-sm text-muted-foreground"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`py-2 text-sm ${
                      isActivePath(location.pathname, item.path) ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
              {user ? (
                <Link to="/profile" onClick={() => setIsOpen(false)} className="py-2 text-sm text-primary font-semibold">
                  حسابي
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="py-2 text-sm text-primary font-semibold">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
