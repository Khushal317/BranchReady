import { NavLink, Route, Routes } from "react-router-dom";

import { AdminPage } from "./pages/AdminPage.jsx";
import { CustomerAssistantPage } from "./pages/CustomerAssistantPage.jsx";
import { EmployeeCopilotPage } from "./pages/EmployeeCopilotPage.jsx";
import { FeedbackPage } from "./pages/FeedbackPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/customer", label: "Customer Assistant" },
  { to: "/employee", label: "Employee Copilot" },
  { to: "/feedback", label: "Feedback" },
  { to: "/admin", label: "Admin" },
];

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand">
          BranchReady
        </NavLink>
        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/customer" element={<CustomerAssistantPage />} />
          <Route path="/employee" element={<EmployeeCopilotPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
