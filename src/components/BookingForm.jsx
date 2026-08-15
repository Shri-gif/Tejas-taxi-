import { useState } from "react";

import { cars } from "../data/cars";
import { business } from "../data/business";

function BookingForm() {
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    pickup: "",
    drop: "",
    date: "",
    time: "",
    trip: "One Way",
    passengers: "1",
    car: "",
    message: ""
  });

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const text = `
Taxi Booking Request

Name: ${form.name}
Mobile: ${form.phone}
Pickup: ${form.pickup}
Drop: ${form.drop}
Date: ${form.date}
Time: ${form.time}
Trip: ${form.trip}
Passengers: ${form.passengers}
Car: ${form.car}
Message: ${form.message}
    `.trim();

    const whatsappNumber = business.whatsapp.replace(/\D/g, "");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank"
    );

    setSubmitted(true);
  }

  return (
    <div className="booking-form-wrapper">

      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >

        <div className="form-grid">

          <label>
            Customer Name
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </label>

          <label>
            Mobile Number
            <input
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
            />
          </label>

          <label>
            Pickup Location
            <input
              name="pickup"
              required
              value={form.pickup}
              onChange={handleChange}
              placeholder="Pickup location"
            />
          </label>

          <label>
            Drop Location
            <input
              name="drop"
              required
              value={form.drop}
              onChange={handleChange}
              placeholder="Drop location"
            />
          </label>

          <label>
            Travel Date
            <input
              name="date"
              type="date"
              required
              value={form.date}
              onChange={handleChange}
            />
          </label>

          <label>
            Pickup Time
            <input
              name="time"
              type="time"
              required
              value={form.time}
              onChange={handleChange}
            />
          </label>

          <label>
            Trip Type
            <select
              name="trip"
              value={form.trip}
              onChange={handleChange}
            >
              <option>One Way</option>
              <option>Round Trip</option>
            </select>
          </label>

          <label>
            Passengers
            <select
              name="passengers"
              value={form.passengers}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((number) => (
                <option key={number} value={number}>
                  {number} Passenger{number > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Select Car
            <select
              name="car"
              value={form.car}
              onChange={handleChange}
            >
              <option value="">Select a car</option>

              {cars.map((car) => (
                <option key={car.id} value={car.name}>
                  {car.name}
                </option>
              ))}
            </select>
          </label>

          <label className="full-field">
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Any special requirements?"
              rows="4"
            />
          </label>

        </div>

        <button
          type="submit"
          className="btn btn-primary submit-button"
        >
          Send Booking Request
        </button>

        {submitted && (
          <p className="form-success">
            Your booking request has been prepared for WhatsApp.
          </p>
        )}

      </form>
    </div>
  );
}

export default BookingForm;
