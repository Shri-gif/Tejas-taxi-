import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { business } from "../data/business";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-overlay" />

      <div className="container hero-content">

        <span className="hero-badge">
          Reliable • Comfortable • Professional
        </span>

        <h1>
          Your Journey,
          <br />
          <span>Our Responsibility.</span>
        </h1>

        <p>
          {business.description}
        </p>

        <div className="hero-actions">

          <Link to="/contact" className="btn btn-primary">
            Book Now
            <ArrowRight size={18} />
          </Link>

          <a
            href={`tel:${business.phone}`}
            className="btn btn-light"
          >
            <Phone size={18} />
            Call Now
          </a>

          <a
            href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>

        </div>

      </div>
    </section>
  );
}

export default Hero;
