'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Home, BarChart2, Users, Trash2, MapPin, ShoppingCart, Coins, ShoppingBag } from 'lucide-react';

interface User {
  id: string;
  nama: string;
  email: string;
  role: string;
  fotoProfil?: string;
  poin?: { jumlahPoin: number };
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const [userRes, poinRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/poin'),
        ]);
        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data);
        }
        if (poinRes.ok) {
          const poinData = await poinRes.json();
          setUser(prev => prev ? { ...prev, poin: poinData } : prev);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['ADMIN', 'USER'] },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
    { href: '/dashboard/admin/laporan', label: 'Laporan', icon: Trash2, roles: ['ADMIN'] },
    { href: '/dashboard/admin/jenis-sampah', label: 'Jenis Sampah', icon: BarChart2, roles: ['ADMIN'] },
    { href: '/dashboard/admin/transaksi', label: 'Transaksi', icon: ShoppingCart, roles: ['ADMIN'] },
    { href: '/dashboard/admin/rewards', label: 'Reward', icon: ShoppingBag, roles: ['ADMIN'] },
    { href: '/dashboard/admin/redeem', label: 'Penukaran', icon: Coins, roles: ['ADMIN'] },
    { href: '/dashboard/user/laporan', label: 'Laporan Saya', icon: Trash2, roles: ['USER'] },
    { href: '/dashboard/user/laporan/baru', label: 'Laporan Baru', icon: MapPin, roles: ['USER'] },
    { href: '/dashboard/user/rewards', label: 'Reward', icon: ShoppingBag, roles: ['USER'] },
    { href: '/dashboard/user/transaksi', label: 'Transaksi Saya', icon: ShoppingBag, roles: ['USER'] },
    { href: '/dashboard/user/redeem', label: 'Penukaran Saya', icon: Coins, roles: ['USER'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-green-600">
                RecycleHub
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.href
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <span className="sr-only">Open user menu</span>
                {user?.fotoProfil ? (
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={user.fotoProfil}
                    alt={user.nama}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    {user?.nama?.charAt(0) || 'U'}
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <p className="font-medium">{user?.nama}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-green-600">{user?.role}</p>
                    {user?.poin && (
                      <div className="flex items-center gap-1 mt-1 text-yellow-600">
                        <Coins className="w-3 h-3" />
                        <span className="text-xs font-medium">{user.poin.jumlahPoin} poin</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/dashboard/user/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === item.href
                      ? 'border-green-500 text-green-700 bg-green-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              {user?.fotoProfil ? (
                <Image
                  className="h-10 w-10 rounded-full"
                  src={user.fotoProfil}
                  alt={user.nama}
                  width={40}
                  height={40}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  {user?.nama?.charAt(0) || 'U'}
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.nama}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/dashboard/user/profile"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}