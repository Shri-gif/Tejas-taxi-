import {
  MapPin,
  Clock,
  Route as RouteIcon,
  ArrowRight
} from "lucide-react";

function RouteCard({ route }) {
  return (
    <article className="route-card">

      <div className="route-title">
        <div>
          <small>FROM</small>
          <h3>{route.from}</h3>
        </div>

        <ArrowRight className="route-arrow" />

        <div>
          <small>TO</small>
          <h3>{route.to}</h3>
        </div>
      </div>

      <div className="route-info">

        <span>
          <RouteIcon size={17} />
          {route.distance}
        </span>

        <span>
          <Clock size={17} />
          {route.time}
        </span>

      </div>

      <div className="route-details">
        <p>{route.oneWay}</p>
        <p>{route.roundTrip}</p>
      </div>

      <strong className="route-price">
        {route.price}
      </strong>

      <a href="/contact" className="btn btn-dark full">
        Book Route
      </a>

    </article>
  );
}

export default RouteCard;
