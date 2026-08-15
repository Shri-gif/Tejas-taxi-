import {
  ShieldCheck,
  Clock3,
  CarFront,
  Headphones
} from "lucide-react";

function TrustSection() {
  const reasons = [
    {
      icon: ShieldCheck,
      title: "Trusted Service",
      text: "Professional and customer-focused taxi service."
    },
    {
      icon: Clock3,
      title: "Punctual Pickup",
      text: "We value your time and plan journeys carefully."
    },
    {
      icon: CarFront,
      title: "Comfortable Cars",
      text: "A selection of vehicles for different travel needs."
    },
    {
      icon: Headphones,
      title: "Easy Support",
      text: "Contact us easily by phone or WhatsApp."
    }
  ];

  return (
    <section className="trust-section">

      <div className="container">

        <div className="trust-grid">

          {reasons.map(({ icon: Icon, title, text }) => (
            <div className="trust-item" key={title}>

              <div className="trust-icon">
                <Icon />
              </div>

              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default TrustSection;
