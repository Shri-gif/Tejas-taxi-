import SectionTitle from "../components/SectionTitle";
import CarCard from "../components/CarCard";

import { cars } from "../data/cars";

function Cars() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">OUR FLEET</span>
          <h1>Choose the right car for your journey</h1>
          <p>
            Comfortable vehicles for individuals, families and groups.
          </p>
        </div>
      </section>

      <section className="section">

        <div className="container">

          <SectionTitle
            eyebrow="AVAILABLE CARS"
            title="Our taxi fleet"
          />

          <div className="car-grid">

            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
              />
            ))}

          </div>

        </div>

      </section>
    </>
  );
}

export default Cars;
