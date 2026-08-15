import {
  Phone,
  MessageCircle,
  Mail,
  MapPin
} from "lucide-react";

import { business } from "../data/business";

function ContactSection() {
  return (
    <section className="contact-section">

      <div className="container contact-grid">

        <div>

          <span className="eyebrow">
            CONTACT US
          </span>

          <h2>
            Ready to plan your journey?
          </h2>

          <p>
            Contact us for availability, pricing and booking
            assistance.
          </p>

          <div className="contact-list">

            <a href={`tel:${business.phone}`}>
              <Phone />
              <span>
                <small>Call us</small>
                {business.phone}
              </span>
            </a>

            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle />
              <span>
                <small>WhatsApp</small>
                {business.whatsapp}
              </span>
            </a>

            <a href={`mailto:${business.email}`}>
              <Mail />
              <span>
                <small>Email</small>
                {business.email}
              </span>
            </a>

            <div>
              <MapPin />
              <span>
                <small>Address</small>
                {business.address}
              </span>
            </div>

          </div>

        </div>

        <div className="map-container">

          {business.mapUrl !== "[GOOGLE_MAPS_URL]" ? (
            <iframe
              src={business.mapUrl}
              title="Business location"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="map-placeholder">
              <MapPin size={42} />
              <h3>Our Location</h3>
              <p>{business.address}</p>
              <small>
                Replace [GOOGLE_MAPS_URL] with your Google Maps
                embed URL.
              </small>
            </div>
          )}

        </div>

      </div>

    </section>
  );
}

export default ContactSection;
