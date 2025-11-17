"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MapPin, Package, User, BarChart3, PlusCircle, Bell } from 'lucide-react';

export function MobileNav({ tipo }) {
  const pathname = usePathname();

  const proveedorLinks = [
    { href: '/proveedor/mapa', icon: MapPin, label: 'Mapa' },
    { href: '/proveedor/oferta/nueva', icon: PlusCircle, label: 'Nueva' },
    { href: '/proveedor/ofertas', icon: Package, label: 'Ofertas' },
  ];

  const transportistaLinks = [
    { href: '/transportista/perfil', icon: Home, label: 'Inicio' },
    { href: '/transportista/ofertas', icon: Package, label: 'Ofertas' },
    { href: '/transportista/viajes', icon: MapPin, label: 'Viajes' },
    { href: '/transportista/estadisticas', icon: BarChart3, label: 'Stats' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/admin/usuarios', icon: User, label: 'Usuarios' },
    { href: '/admin/actividad', icon: Bell, label: 'Actividad' },
  ];

  const links = tipo === 'proveedor' 
    ? proveedorLinks 
    : tipo === 'admin'
    ? adminLinks
    : transportistaLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
