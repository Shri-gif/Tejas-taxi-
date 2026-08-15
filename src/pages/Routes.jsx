import SectionTitle from "../components/SectionTitle";
import RouteCard from "../components/RouteCard";

import { routes } from "../data/routes";

function RoutesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">POPULAR ROUTES</span>
          <h1>Plan your next taxi journey</h1>
          <p>
            Browse our popular routes and contact us for current pricing.
          </p>
        </div>
      </section>

      <section className="section">

        <div className="container">

          <SectionTitle
            eyebrow="ROUTES & PRICING"
            title="Popular taxi routes"
            description="Prices shown on the website should be kept updated and confirmed before booking."
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
    </>
  );
}

export default RoutesPage;
