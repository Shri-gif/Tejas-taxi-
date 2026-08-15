import SectionTitle from "../components/SectionTitle";
import ServiceCard from "../components/ServiceCard";

import { services } from "../data/services";

function Services() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">TAXI SERVICES</span>
          <h1>Taxi services designed around you</h1>
          <p>
            Flexible options for local, airport and outstation travel.
          </p>
        </div>
      </section>

      <section className="section">

        <div className="container">

          <SectionTitle
            eyebrow="WHAT WE OFFER"
            title="Choose your travel service"
          />

          <div className="service-grid service-grid-large">

            {services.map((service) => (
              <ServiceCard
                key={service.title}
                service={service}
              />
            ))}

          </div>

        </div>

      </section>
    </>
  );
}

export default Services;
