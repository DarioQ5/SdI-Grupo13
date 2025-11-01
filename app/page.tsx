"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Building2 } from "lucide-react"
import { TransportistaApp } from "@/components/transportista-app"
import { EmpresaApp } from "@/components/empresa-app"

type UserType = "transportista" | "empresa" | null

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<UserType>(null)
  const [selectedType, setSelectedType] = useState<UserType>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulación de login - cualquier credencial funciona
    if (email && password && selectedType) {
      setUserType(selectedType)
      setIsLoggedIn(true)
    }
  }

  if (isLoggedIn && userType === "transportista") {
    return <TransportistaApp />
  }

  if (isLoggedIn && userType === "empresa") {
    return <EmpresaApp />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
              <Truck className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">CargoConnect</CardTitle>
          <CardDescription>Corredor Bioceánico - Portal de Logística</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedType ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground mb-4">Selecciona tu tipo de cuenta</p>
              <Button
                onClick={() => setSelectedType("transportista")}
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2"
              >
                <Truck className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Transportista</p>
                  <p className="text-xs text-muted-foreground">Encuentra cargas de retorno</p>
                </div>
              </Button>
              <Button
                onClick={() => setSelectedType("empresa")}
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2"
              >
                <Building2 className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Empresa</p>
                  <p className="text-xs text-muted-foreground">Publica tus cargas</p>
                </div>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {selectedType === "transportista" ? (
                    <Truck className="h-5 w-5 text-primary" />
                  ) : (
                    <Building2 className="h-5 w-5 text-primary" />
                  )}
                  <span className="font-medium">{selectedType === "transportista" ? "Transportista" : "Empresa"}</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedType(null)}>
                  Cambiar
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={selectedType === "transportista" ? "transportista@ejemplo.com" : "empresa@ejemplo.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
              <p className="text-xs text-center text-muted-foreground">Demo: Usa cualquier email y contraseña</p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
