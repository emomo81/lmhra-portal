'use client';
import React, { useState, useEffect } from 'react';
import { ToastHost } from '../components/ui';
import { PersonaBar } from '../components/layout';
import OverviewScreen from './modules/OverviewScreen';
import ClientApp from './modules/ClientApp';
import TransportApp from './modules/TransportApp';
import KokoApp from './modules/KokoApp';
import AdminApp from './modules/AdminApp';

type Role = "overview" | "client" | "transport" | "koko" | "admin";

export default function Home() {
  const [role, setRole] = useState<Role>("overview");
  const [layout, setLayout] = useState("sidebar");
  const [theme, setTheme] = useState("petrol");
  const [density, setDensity] = useState("comfortable");

  useEffect(() => {
    document.body.dataset.theme = theme === "petrol" ? "" : theme;
    document.body.dataset.density = density;
  }, [theme, density]);

  function handleRoleChange(r: string) {
    setRole(r as Role);
  }

  let body: React.ReactNode;
  if (role === "overview") body = <OverviewScreen onEnterRole={handleRoleChange} />;
  else if (role === "client") body = <ClientApp layout={layout} />;
  else if (role === "transport") body = <TransportApp layout={layout} />;
  else if (role === "koko") body = <KokoApp layout={layout} />;
  else if (role === "admin") body = <AdminApp layout={layout} />;

  return (
    <ToastHost>
      <div className="app">
        <PersonaBar active={role} onChange={handleRoleChange} />
        {body}
      </div>
    </ToastHost>
  );
}
