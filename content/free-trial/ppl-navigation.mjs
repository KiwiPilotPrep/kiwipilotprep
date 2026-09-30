/**
 * PPL Air Navigation and Flight Planning — the free ten-question mock.
 *
 * Written from this subject's own lessons. The worked answers use the same
 * methods the course teaches — the 1 in 60 rule, the navigation computer,
 * variation applied east-least and west-best — so a student who has read the
 * material recognises the working, not just the answer.
 */
export const subject = {
  course: "ppl-theory",
  subject: "navigation",
  questions: [
    {
      section: "The Shape of the Earth",
      prompt: "A rhumb line between two points on the Earth's surface:",
      options: [
        "Is always the shortest distance between them",
        "Cuts every meridian at a constant angle, but is not the shortest distance",
        "Passes through the centre of the Earth",
        "Can only be drawn along the equator",
      ],
      answer: 1,
      explanation:
        "A rhumb line cuts each meridian of longitude at a constant angle, which is why it is the line you fly when you hold a constant direction. The shortest distance between two points is the great circle, and a great circle is not a constant direction.",
    },
    {
      section: "Direction",
      prompt: "A true track of 220° is measured on the chart where the variation is 17°W. The magnetic track is:",
      options: ["203°M", "220°M", "237°M", "254°M"],
      answer: 2,
      explanation:
        "Variation west, magnetic best: 220 + 17 = 237°M. Variation east, magnetic least, so an easterly variation would have been subtracted instead.",
    },
    {
      section: "Speed",
      prompt:
        "An aircraft climbs while holding a constant indicated airspeed. As altitude increases, the true airspeed will:",
      options: [
        "Decrease, because the air is colder",
        "Increase, because the air is less dense",
        "Remain the same, because indicated airspeed is unchanged",
        "Vary only with the wind component",
      ],
      answer: 1,
      explanation:
        "True airspeed depends on air density. As the aircraft climbs the air becomes less dense, so the aeroplane must travel faster through it to force the same number of air molecules into the pitot system. The indicated airspeed stays put while the true airspeed rises.",
    },
    {
      section: "Altimetry",
      prompt:
        "An aircraft is flown from an area of high pressure towards an area of low pressure without resetting the altimeter subscale. The altimeter will:",
      options: [
        "Over-read, so the aircraft is lower than indicated",
        "Under-read, so the aircraft is higher than indicated",
        "Read correctly, because the subscale was set before departure",
        "Read correctly, because pressure change affects only the vertical speed indicator",
      ],
      answer: 0,
      explanation:
        "Flying from high pressure to low pressure on an old subscale setting leaves the altimeter over-reading, so the aeroplane is lower than the instrument says. It is a terrain clearance problem, which is why the setting is updated as the flight progresses.",
    },
    {
      section: "Time and Twilight",
      prompt: "Morning civil twilight begins when the centre of the rising sun is:",
      options: [
        "On the visible horizon",
        "6° below the sensible horizon",
        "12° below the sensible horizon",
        "6° above the visible horizon",
      ],
      answer: 1,
      explanation:
        "Morning civil twilight begins when the centre of the rising sun is 6° below the sensible horizon. Sunrise itself is when the upper limb of the sun appears on the visible horizon, which is a later moment and a different reference.",
    },
    {
      section: "Aeronautical Charts",
      prompt: "The Visual Planning Chart (VPC) for New Zealand is drawn at a scale of:",
      options: ["1:250,000", "1:500,000", "1:1,000,000", "1:2,000,000"],
      answer: 2,
      explanation:
        "The VPC covers the whole country at 1:1,000,000 and is used for pre-flight planning. The Visual Navigation Charts, used in flight, are larger scale and break the country into separate sheets, so they carry more detail over less ground.",
    },
    {
      section: "The Navigation Computer",
      prompt:
        "Avgas has a specific gravity of 0.72. The weight of 140 litres of Avgas is approximately:",
      options: ["72 kg", "101 kg", "140 kg", "194 kg"],
      answer: 1,
      explanation:
        "Specific gravity 0.72 means one litre weighs 0.72 kg, so 140 × 0.72 = 100.8 kg, near enough 101 kg. Converting a volume to a weight always needs the specific gravity — a volume alone tells you nothing about what it does to the loading.",
    },
    {
      section: "Wind, Climb and Descent Calculations",
      prompt:
        "On the navigation computer, the headwind and crosswind components for a runway are found by setting the wind direction under the true index, marking the wind speed above the grommet, and then:",
      options: [
        "Setting the runway heading under the true index",
        "Setting the true airspeed under the true index",
        "Setting the track under the true index",
        "Rotating the disc until the mark sits on the grommet",
      ],
      answer: 0,
      explanation:
        "After the wind is plotted, the runway heading goes under the true index. The horizontal distance from the mark to the centreline is then the crosswind component and the vertical distance is the headwind component.",
    },
    {
      section: "Track Corrections and the 1 in 60 Rule",
      prompt:
        "After 50 nm of a leg an aircraft is found to be 10 nm off track. The track error is approximately:",
      options: ["5°", "10°", "12°", "20°"],
      answer: 2,
      explanation:
        "Track error = distance off × 60 ÷ distance gone = 10 × 60 ÷ 50 = 12°. Turning 12° would only make the new track parallel to the planned one; a closing angle must be added on top to regain track by a chosen point.",
    },
    {
      section: "Flight Planning",
      prompt: "A SARTIME is:",
      options: [
        "The estimated time of arrival at the destination",
        "The time at which a search for the aircraft will begin if it has not been cancelled",
        "The latest time at which a flight plan may be lodged",
        "The time the aircraft is expected to enter controlled airspace",
      ],
      answer: 1,
      explanation:
        "A SARTIME is the time at which somebody starts looking for you. It is distinct from an ETA, and it is the part of a flight plan that still works when everything else has failed — which is why terminating or updating it matters as much as lodging it.",
    },
  ],
};
