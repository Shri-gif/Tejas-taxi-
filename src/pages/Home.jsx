import { Link } from "react-router-dom";

import Hero from "../components/Hero";
import SectionTitle from "../components/SectionTitle";
import ServiceCard from "../components/ServiceCard";
import CarCard from "../components/CarCard";
import RouteCard from "../components/RouteCard";
import TrustSection from "../components/TrustSection";
import ContactSection from "../components/ContactSection";

import { services } from "../data/services";
import { cars } from "../data/cars";
import { routes } from "../data/routes";

function Home() {
  return (
    <>
      <Hero />

      <section className="section">
        <div className="container">

          <SectionTitle
            eyebrow="OUR SERVICES"
            title="Taxi services for every journey"
            description="Choose the service that best fits your travel requirements."
          />

          <div className="service-grid">
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                service={service}
              />
            ))}
          </div>

        </div>
      </section>

      <TrustSection />

      <section className="section light-bg">

        <div className="container">

          <SectionTitle
            eyebrow="OUR FLEET"
            title="Comfortable cars for your journey"
            description="Choose a vehicle according to your passenger and luggage requirements."
          />

          <div className="car-grid">

            {cars.slice(0, 3).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}

          </div>

          <div className="center-button">
            <Link to="/cars" className="btn btn-outline">
              View All Cars
            </Link>
          </div>

        </div>

      </section>

      <section className="section">

        <div className="container">

          <SectionTitle
            eyebrow="POPULAR ROUTES"
            title="Travel with confidence"
            description="Explore some of our frequently requested routes."
          />

          <div className="route-grid">

            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
              />
            ))}

          </div>

        </div>

      </section>

      <section className="reviews-section">

        <div className="container">

          <SectionTitle
            eyebrow="CUSTOMER TRUST"
            title="Built around customer satisfaction"
            description="Replace these sample review placeholders with your genuine customer reviews."
          />

          <div className="review-grid">

            <article className="review-card">
              <div className="stars">★★★★★</div>
              <p>
                "[CUSTOMER_REVIEW_1]"
              </p>
              <strong>[CUSTOMER_NAME_1]</strong>
            </article>

            <article className="review-card">
              <div className="stars">★★★★★</div>
              <p>
                "[CUSTOMER_REVIEW_2]"
              </p>
              <strong>[CUSTOMER_NAME_2]</strong>
            </article>

            <article className="review-card">
              <div className="stars">★★★★★</div>
              <p>
                "[CUSTOMER_REVIEW_3]"
              </p>
              <strong>[CUSTOMER_NAME_3]</strong>
            </article>

          </div>

        </div>

      </section>

      <section className="cta-section">

        <div className="container cta-content">

          <span className="eyebrow">
            PLAN YOUR NEXT JOURNEY
          </span>

          <h2>
            Need a reliable taxi?
          </h2>

          <p>
            Get in touch with us for availability and booking details.
          </p>

          <Link to="/contact" className="btn btn-primary">
            Book Your Taxi
          </Link>

        </div>

      </section>

      <ContactSection />
    </>
  );
}

export default Home;
