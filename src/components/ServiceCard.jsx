function ServiceCard({ service }) {
  const Icon = service.icon;

  return (
    <article className="service-card">

      <div className="service-icon">
        <Icon size={25} />
      </div>

      <h3>{service.title}</h3>

      <p>{service.description}</p>

      <a href="/contact" className="text-link">
        Book this service →
      </a>

    </article>
  );
}

export default ServiceCard;
