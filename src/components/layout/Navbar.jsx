// components/layout/Navbar.jsx — With auth state
import { useState, useEffect } from 'react';
import { ShoppingCart, X, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { NAV_LINKS } from '@/constants/artist';
import { useAuth }   from '@/contexts/AuthContext';

export default function Navbar({ cartCount = 0, onCartClick }) {
  const { user, isLoggedIn, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Initials avatar
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-3' : 'py-5'
      }`}
      style={scrolled ? { borderBottom: '1px solid rgba(201,169,110,0.1)' } : {}}>

      {/* Rainbow top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, var(--gold), var(--rose), var(--violet), var(--teal), var(--gold))' }} />

      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <a href="/#home" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm tracking-widest transition-all group-hover:scale-110 group-hover:rotate-3"
            style={{
              background: 'linear-gradient(135deg, #c9a96e, #e8c98a)',
              color: '#07060d',
              boxShadow: '0 0 20px rgba(201,169,110,0.4)',
            }}>
            BAT
          </div>
          <div className="hidden sm:block">
            <div className="text-gold font-display text-base italic leading-tight">Bùi Anh Tú</div>
            <div className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(167,139,202,0.6)' }}>
              Producer
            </div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="nav-link">{label}</a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            id="cart-btn"
            onClick={onCartClick}
            className="relative p-2 rounded-xl transition-all hover:bg-white/5"
            style={{ color: 'rgba(232,224,213,0.6)' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a78bca, #d4756b)', color: '#fff' }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth button / user avatar */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 transition-all hover:scale-105"
                title={user.name}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name}
                    className="w-9 h-9 rounded-full object-cover"
                    style={{ border: '2px solid rgba(201,169,110,0.4)' }} />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #a78bca, #7ab8a0)',
                      color: '#fff',
                      border: '2px solid rgba(255,255,255,0.15)',
                    }}>
                    {initials}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-12 w-56 rounded-2xl glass overflow-hidden"
                  style={{ border: '1px solid rgba(201,169,110,0.15)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="font-semibold text-sm text-white truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">{user.email}</div>
                    {user.provider !== 'local' && (
                      <div className="text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block"
                        style={{
                          background: user.provider === 'google' ? 'rgba(66,133,244,0.15)' : 'rgba(24,119,242,0.15)',
                          color: user.provider === 'google' ? '#4285F4' : '#1877F2',
                        }}>
                        via {user.provider === 'google' ? 'Google' : 'Facebook'}
                      </div>
                    )}
                  </div>
                  <a
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex' }}>
                    <UserIcon size={15} /> Trang cá nhân
                  </a>
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-red-400 hover:bg-white/[0.03] transition-all">
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(167,139,202,0.08))',
                border: '1px solid rgba(201,169,110,0.25)',
                color: '#c9a96e',
              }}>
              <UserIcon size={15} /> Đăng nhập
            </a>
          )}

          <button
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden glass mt-2 mx-4 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(201,169,110,0.15)' }}>
          {NAV_LINKS.map(({ label, href }, i) => {
            const colors = ['#c9a96e', '#e88fa0', '#a78bca', '#7ab8a0', '#74b8d4'];
            return (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all border-b border-white/5 last:border-0 hover:bg-white/[0.04]"
                style={{ color: 'rgba(232,224,213,0.7)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors[i % colors.length] }} />
                {label}
              </a>
            );
          })}
          {!isLoggedIn && (
            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold"
              style={{ color: '#c9a96e', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <UserIcon size={14} /> Đăng nhập / Đăng ký
            </a>
          )}
        </div>
      )}
    </header>
  );
}
