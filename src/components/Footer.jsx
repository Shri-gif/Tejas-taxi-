import { Link } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin
} from "lucide-react";

import { business } from "../data/business";

function Footer() {
  return (
    <footer className="footer">

      <div className="container footer-grid">

        <div className="footer-brand">

          <Link to="/" className="logo footer-logo">
            <span className="logo-icon">🚕</span>

            <span>
              <strong>{business.name}</strong>
              <small>Taxi Services</small>
            </span>
          </Link>

          <p>
            {business.description}
          </p>

        </div>

        <div>
          <h3>Quick Links</h3>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/services">Services</Link>
            <Link to="/cars">Our Cars</Link>
            <Link to="/routes">Routes</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <h3>Services</h3>

          <div className="footer-links">
            <Link to="/services">One Way Taxi</Link>
            <Link to="/services">Round Trip Taxi</Link>
            <Link to="/services">Airport Transfer</Link>
            <Link to="/services">Local Taxi</Link>
            <Link to="/services">Outstation Taxi</Link>
            <Link to="/services">Railway Transfer</Link>
          </div>
        </div>

        <div>
          <h3>Contact</h3>

          <div className="footer-contact">

            <a href={`tel:${business.phone}`}>
              <Phone size={16} />
              {business.phone}
            </a>

            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>

            <a href={`mailto:${business.email}`}>
              <Mail size={16} />
              {business.email}
            </a>

            <span>
              <MapPin size={16} />
              {business.address}
            </span>

          </div>
        </div>

      </div>

      <div className="footer-bottom">

        <div className="container">

          <p>
            © {new Date().getFullYear()} {business.name}.
            All rights reserved.
          </p>

          <div className="social-links">
            <a href={business.social.facebook}>Facebook</a>
            <a href={business.social.instagram}>Instagram</a>
            <a href={business.social.youtube}>YouTube</a>
          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
