document.addEventListener('DOMContentLoaded', () => {
  const f = document.querySelector('#bookingForm');
  if (!f) return;

  f.addEventListener('submit', async e => {
    e.preventDefault();

    const m = document.querySelector('#bookingMsg');

    const d = Object.fromEntries(new FormData(f));

    const booking = {
      name: d.name || '',
      mobile: d.mobile || '',
      pickup: d.pickup || '',
      destination: d.destination || '',
      booking_date: d.booking_date || '',
      pickup_time: d.pickup_time || '',
      trip_type: d.trip_type || 'One Way',
      passengers: Number(d.passengers || 1),
      notes: d.notes || '',
      status: 'new'
    };

    console.log('Booking data:', booking);

    const { data, error } = await supabaseClient
      .from('bookings')
      .insert([booking])
      .select();

    if (error) {
      console.error('SUPABASE BOOKING ERROR:', error);

      // Temporary debugging message
      m.textContent = 'Booking error: ' + error.message;
      return;
    }

    console.log('Booking saved:', data);

    m.textContent = 'Booking received. Opening WhatsApp…';

    const t =
      `New Taxi Booking%0A` +
      `Name: ${encodeURIComponent(booking.name)}%0A` +
      `Mobile: ${encodeURIComponent(booking.mobile)}%0A` +
      `Pickup: ${encodeURIComponent(booking.pickup)}%0A` +
      `Drop: ${encodeURIComponent(booking.destination)}%0A` +
      `Date: ${encodeURIComponent(booking.booking_date)}%0A` +
      `Time: ${encodeURIComponent(booking.pickup_time)}%0A` +
      `Trip: ${encodeURIComponent(booking.trip_type)}%0A` +
      `Passengers: ${booking.passengers}%0A` +
      `Notes: ${encodeURIComponent(booking.notes || 'None')}`;

    window.open(
      'https://wa.me/' + TEJAS.whatsapp + '?text=' + t,
      '_blank'
    );

    f.reset();
  });
});
