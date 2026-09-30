/**
 * CPL Flight Navigation General — the free ten-question mock.
 *
 * Grounded in this subject's own lessons, and pitched at the commercial
 * material: projections, time and arc, the point of no return and the
 * equi-time point, rather than the basic plotting the PPL paper covers.
 */
export const subject = {
  course: "cpl-theory",
  subject: "navigation",
  questions: [
    {
      section: "The Shape of the Earth and Position",
      prompt: "With the exception of the equator, all parallels of latitude are:",
      options: ["Great circles", "Small circles", "Rhumb lines that are also great circles", "Meridians"],
      answer: 1,
      explanation:
        "A great circle's plane passes through the centre of the Earth. Only the equator does this among the parallels, so every other parallel of latitude is a small circle. Meridians of longitude are each half of a great circle.",
    },
    {
      section: "Direction: True, Magnetic and Compass",
      prompt: "A magnetic heading of 340°M is flown where the compass deviation is 1°W. The compass heading is:",
      options: ["339°C", "340°C", "341°C", "342°C"],
      answer: 2,
      explanation:
        "Deviation west, compass best: 340 + 1 = 341°C. Deviation east, compass least. The same pair of rules applies to variation when converting between true and magnetic.",
    },
    {
      section: "Speed and the Triangle of Velocities",
      prompt: "The three vectors that make up the triangle of velocities are:",
      options: [
        "Heading/TAS, track/groundspeed and wind velocity",
        "Heading/IAS, track/TAS and drift",
        "Track/TAS, heading/groundspeed and variation",
        "Heading/groundspeed, track/TAS and deviation",
      ],
      answer: 0,
      explanation:
        "Heading with true airspeed, track with groundspeed, and the wind velocity. Each vector carries a direction and a magnitude, and the three must close — which is what makes any one of them solvable from the other two.",
    },
    {
      section: "Altimetry and Cruising Levels",
      prompt: "A flight level is a surface of constant atmospheric pressure related to a datum of:",
      options: ["1000 hPa", "1013.2 hPa", "1024 hPa", "The area QNH"],
      answer: 1,
      explanation:
        "Flight levels are referenced to 1013.2 hPa. Below the transition altitude the subscale carries a real local pressure and the readings are altitudes; above it everyone shares the standard datum, which is what makes vertical separation work between aircraft.",
    },
    {
      section: "Time, Daylight and Twilight",
      prompt: "One degree of longitude corresponds to a time difference of:",
      options: ["1 minute", "4 minutes", "15 minutes", "60 minutes"],
      answer: 1,
      explanation:
        "The Earth turns 360° in 24 hours, so 15° takes one hour and 1° takes 4 minutes. Following the same conversion down, one minute of arc corresponds to four seconds of time.",
    },
    {
      section: "Time, Daylight and Twilight",
      prompt: "Crossing the International Date Line travelling eastwards, you:",
      options: ["Add a day", "Subtract a day", "Add 12 hours", "Make no change to the date"],
      answer: 1,
      explanation:
        "Eastbound across the date line you subtract a day; westbound you add one. The line exists so that the date stays correct once you have travelled right around the globe.",
    },
    {
      section: "Charts and Projections",
      prompt: "On a Mercator projection:",
      options: [
        "Great circles are straight lines and rhumb lines are curved",
        "Rhumb lines are straight lines and the scale is not constant",
        "Both great circles and rhumb lines are straight lines",
        "Scale is constant over the whole sheet",
      ],
      answer: 1,
      explanation:
        "The Mercator is conformal, so bearings are correct and rhumb lines plot as straight lines — but the cylinder gives it an expanding scale, so scale is not constant. That combination makes it useful near the equator and misleading at high latitudes.",
    },
    {
      section: "Track Correction and the 1 in 60 Rule",
      prompt:
        "Track error and closing angle have each been calculated. The total correction to apply to the heading is:",
      options: [
        "The track error alone",
        "The closing angle alone",
        "The track error plus the closing angle",
        "The closing angle minus the track error",
      ],
      answer: 2,
      explanation:
        "Correcting by the track error alone only makes the new track parallel to the planned one. The closing angle is added on top so the aircraft actually regains track at the chosen point. The method holds while each angle is no greater than about 15°.",
    },
    {
      section: "Point of No Return and Equi-Time Point",
      prompt: "The point of no return is the point beyond which:",
      options: [
        "The destination can no longer be reached with reserves",
        "There is insufficient fuel to return to the departure aerodrome and arrive with the required reserves",
        "The time to the destination equals the time back to the departure aerodrome",
        "A diversion to an alternate is no longer legal",
      ],
      answer: 1,
      explanation:
        "The PNR is a fuel consideration: past it, there is no longer enough fuel to get home with reserves intact. The equi-time point is the different idea — the point from which the time home equals the time on, regardless of how much fuel remains.",
    },
    {
      section: "Cruise Performance: Range and Endurance",
      prompt: "Flying for maximum endurance rather than maximum range means flying to:",
      options: [
        "Cover the greatest distance for the fuel available",
        "Stay airborne for the longest time for the fuel available",
        "Reach the destination in the shortest time",
        "Achieve the highest true airspeed",
      ],
      answer: 1,
      explanation:
        "Endurance is time in the air; range is distance over the ground. They are different speeds and different power settings, and choosing the wrong one is a common way to arrive with less fuel than the plan promised.",
    },
  ],
};
