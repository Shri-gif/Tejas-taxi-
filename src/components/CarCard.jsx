import {
  Users,
  Briefcase,
  Snowflake,
  ArrowRight
} from "lucide-react";

function CarCard({ car }) {
  return (
    <article className="car-card">

      <div className="car-image">
        <img
          src={car.image}
          alt={car.name}
          loading="lazy"
        />
      </div>

      <div className="car-content">

        <div className="car-heading">
          <h3>{car.name}</h3>
          <span className="price">{car.price}</span>
        </div>

        <div className="car-specs">

          <span>
            <Users size={16} />
            {car.seats}
          </span>

          <span>
            <Briefcase size={16} />
            {car.luggage}
          </span>

          <span>
            <Snowflake size={16} />
            {car.ac}
          </span>

        </div>

        <div className="availability">

          {car.oneWay && (
            <span className="available">
              ✓ One Way
            </span>
          )}

          {car.roundTrip && (
            <span className="available">
              ✓ Round Trip
            </span>
          )}

        </div>

        <a href="/contact" className="btn btn-dark full">
          Book This Car
          <ArrowRight size={17} />
        </a>

      </div>
    </article>
  );
}

export default CarCard;
