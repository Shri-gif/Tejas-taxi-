import SectionTitle from "../components/SectionTitle";
import BookingForm from "../components/BookingForm";
import ContactSection from "../components/ContactSection";

function Contact() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">BOOKING & CONTACT</span>
          <h1>Book your taxi</h1>
          <p>
            Send us your journey details and we'll get back to you.
          </p>
        </div>
      </section>

      <section className="section">

        <div className="container">

          <SectionTitle
            eyebrow="BOOKING FORM"
            title="Tell us about your journey"
          />

          <BookingForm />

        </div>

      </section>

      <ContactSection />
    </>
  );
}

export default Contact;
