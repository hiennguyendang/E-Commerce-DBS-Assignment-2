import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout({ user, onLogout }) {
  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-grow-1" style={{ background: "#f8fafc" }}>
        <div className="container py-4">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
