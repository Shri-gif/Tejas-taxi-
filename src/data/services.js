import {
  ArrowRight,
  Plane,
  MapPin,
  Navigation,
  Train,
  RefreshCcw
} from "lucide-react";

export const services = [
  {
    title: "One Way Taxi",
    description:
      "Convenient one-way taxi service for intercity and long-distance journeys.",
    icon: ArrowRight
  },

  {
    title: "Round Trip Taxi",
    description:
      "Comfortable return-trip taxi service with flexible travel arrangements.",
    icon: RefreshCcw
  },

  {
    title: "Airport Transfer",
    description:
      "Reliable airport pickup and drop services designed around your flight schedule.",
    icon: Plane
  },

  {
    title: "Local Taxi",
    description:
      "Convenient local taxi service for meetings, shopping, sightseeing and daily travel.",
    icon: MapPin
  },

  {
    title: "Outstation Taxi",
    description:
      "Comfortable outstation travel for family trips, business journeys and vacations.",
    icon: Navigation
  },

  {
    title: "Railway Station Transfer",
    description:
      "Easy railway station pickup and drop service with scheduled assistance.",
    icon: Train
  }
];
