import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { getMe } from "../api/client";
import logo from "../assets/logo.png";
import { appLayoutStyles as s } from "../assets/dummyStyles";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Profile", to: "/profile" },
  { label: "Services", to: "/services" },
  { label: "Availability", to: "/availability" },
  { label: "Bookings", to: "/bookings" },
  { label: "Payments", to: "/payments" },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const displayName = user?.businessName || user?.name || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className={s.container}>
      {/* ───── Header ───── */}
      <header className={s.header}>
        <div className={s.headerInner}>
          {/* Logo */}
          <Link to="/dashboard" className={s.logoLink}>
            <img src={logo} alt="BookMe" className={s.logoImg} />
            <span className={s.logoText}>BookMe</span>
          </Link>

          {/* Desktop nav */}
          <nav className={s.navDesktop}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? s.navLinkActive : s.navLinkInactive
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: account */}
          <div className={s.rightSection}>
            <div className={s.accountMenu}>
              <button
                className={s.avatarButton}
                onClick={() => setMenuOpen((p) => !p)}
              >
                <span className={s.avatarCircle}>{initial}</span>
                <span className={s.displayName}>{displayName}</span>
                <ChevronDown
                  className={`${s.chevron} ${menuOpen ? s.chevronOpen : ""}`}
                />
              </button>

              {menuOpen && (
                <div className={s.dropdown}>
                  <button className={s.logoutButton} onClick={handleLogout}>
                    <LogOut className={s.logoutIcon} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile burger */}
            <button
              className={s.mobileMenuButton}
              onClick={() => setMobileOpen((p) => !p)}
            >
              <span className={s.srOnly}>Toggle menu</span>
              {mobileOpen ? (
                <X className={s.mobileMenuIcon} />
              ) : (
                <Menu className={s.mobileMenuIcon} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className={s.mobileNav}>
            <div className={s.mobileNavInner}>
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    isActive ? s.mobileNavLinkActive : s.mobileNavLinkInactive
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* ───── Main Content ───── */}
      <main className={s.main}>
        <Outlet context={{ user, setUser }} />
      </main>

      {/* ───── Footer ───── */}
      <footer className={s.footerBrandSection}>
        <div className={s.footerCard}>
          <div className={s.footerCardTop}>
            <div className={s.footerBrandMark}>
              <img src={logo} alt="BookMe" className={s.footerMiniLogo} />
              <span className={s.footerBrandName}>BookMe</span>
            </div>
          </div>
          <div className={s.footerRule} />
          <div className={s.footerBottom}>
            <div className={s.footerLegalGroup}>
              <span className={s.footerCopyright}>
                © {new Date().getFullYear()} BookMe
              </span>
              <div className={s.footerLinks}>
                <span className={s.footerLink}>Privacy</span>
                <span className={s.footerSeparator}>·</span>
                <span className={s.footerLink}>Terms</span>
              </div>
            </div>
          </div>
        </div>
        <div className={s.footerWatermarkWrapper}>
          <span className={s.footerLogoWatermark}>BookMe</span>
        </div>
      </footer>
    </div>
  );
}
