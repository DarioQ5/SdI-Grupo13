"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Truck, Package } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Truck className="h-12 w-12 text-accent" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary">CargoLink</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Plataforma de logística inteligente y sostenible
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/proveedor/login">
            <Card className="p-8 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-primary">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition">
                  <Package className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Soy Proveedor</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Encuentra transportistas disponibles, crea ofertas y gestiona tus envíos
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/transportista/login">
            <Card className="p-8 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-accent">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition">
                  <Truck className="h-10 w-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Soy Transportista</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Recibe ofertas de carga, gestiona tu disponibilidad y optimiza tus rutas
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
