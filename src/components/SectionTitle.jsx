function SectionTitle({
  eyebrow,
  title,
  description,
  center = true
}) {
  return (
    <div className={`section-title ${center ? "center" : ""}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}

      <h2>{title}</h2>

      {description && <p>{description}</p>}
    </div>
  );
}

export default SectionTitle;
