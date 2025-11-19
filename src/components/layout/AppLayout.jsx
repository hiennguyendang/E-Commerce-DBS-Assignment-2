import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout({ user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="app-shell">
      <Header user={user} onLogout={onLogout} onSearch={setSearchTerm} />
      <main className="flex-grow-1 bg-light">
        <div className="container py-4">
          {/* Truyền searchTerm xuống tất cả trang con */}
          <Outlet context={{ searchTerm }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}