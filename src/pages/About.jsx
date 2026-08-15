import SectionTitle from "../components/SectionTitle";
import { business } from "../data/business";

function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">ABOUT US</span>
          <h1>Our story, values and commitment</h1>
          <p>
            Learn more about {business.name}.
          </p>
        </div>
      </section>

      <section className="section">

        <div className="container about-grid">

          <div className="about-image">
            <img
              src="/images/hero-taxi.jpg"
              alt="Taxi service"
            />
          </div>

          <div>

            <span className="eyebrow">
              OUR STORY
            </span>

            <h2>
              A taxi service built around people
            </h2>

            <p className="large-text">
              {business.about}
            </p>

            <p>
              We believe that a good taxi service is more than
              simply getting from one place to another. It is
              about punctuality, communication, comfort and
              treating every passenger with respect.
            </p>

            <p>
              Established: {business.established}
            </p>

          </div>

        </div>

      </section>

      <section className="section light-bg">

        <div className="container">

          <SectionTitle
            eyebrow="OUR MISSION"
            title={business.mission}
          />

          <div className="values-grid">

            {business.values.map((value, index) => (
              <div className="value-card" key={value}>
                <span>0{index + 1}</span>
                <h3>{value}</h3>
              </div>
            ))}

          </div>

        </div>

      </section>
    </>
  );
}

export default About;
