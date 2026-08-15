import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";

import { business } from "../data/business";

function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    ["Home", "/"],
    ["About", "/about"],
    ["Services", "/services"],
    ["Cars", "/cars"],
    ["Routes", "/routes"],
    ["Contact", "/contact"]
  ];

  return (
    <header className="navbar">
      <div className="container nav-inner">

        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-icon">🚕</span>

          <span>
            <strong>{business.name}</strong>
            <small>Taxi Services</small>
          </span>
        </Link>

        <nav className={`desktop-nav ${open ? "mobile-open" : ""}`}>
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {label}
            </NavLink>
          ))}

          <a
            className="nav-call"
            href={`tel:${business.phone}`}
          >
            <Phone size={17} />
            Call Now
          </a>
        </nav>

        <button
          className="menu-button"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
