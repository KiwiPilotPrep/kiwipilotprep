/**
 * PPL Meteorology — the free ten-question mock.
 *
 * Every figure here is the figure taught in this subject's own lessons: the
 * lapse rates, the okta bands, the friction layer depth, the Southern
 * Hemisphere deflection. Nothing is carried in from another syllabus.
 */
export const subject = {
  course: "ppl-theory",
  subject: "meteorology",
  questions: [
    {
      section: "The Atmosphere",
      prompt: "The tropopause is:",
      options: [
        "Highest and coldest over the poles",
        "Highest and coldest over the equator",
        "At a constant height of 36,000 ft everywhere",
        "The boundary between the stratosphere and the mesosphere",
      ],
      answer: 1,
      explanation:
        "The tropopause is highest and coldest over the equator, and lowest and warmest over the poles. Because temperature falls with height through the troposphere, the deeper the troposphere the colder its top.",
    },
    {
      section: "Atmospheric Pressure",
      prompt: "In the Southern Hemisphere, the air circulating around an anticyclone flows:",
      options: [
        "Clockwise, with surface convergence into the centre",
        "Anticlockwise, with surface divergence away from the centre",
        "Anticlockwise, with surface convergence into the centre",
        "Directly outward at right angles to the isobars at all levels",
      ],
      answer: 1,
      explanation:
        "In the Southern Hemisphere the wind flows anticlockwise around an anticyclone, and one of the defining characteristics of a high is surface divergence — air moving out and away from the centre at the surface, with subsidence above it.",
    },
    {
      section: "The Wind",
      prompt:
        "Standing with your back to the wind in the Southern Hemisphere, the area of low pressure lies to your:",
      options: ["Left", "Right", "Front", "Rear"],
      answer: 1,
      explanation:
        "Buys Ballot's Law: back to the wind in the Southern Hemisphere puts the low on your right. It has a practical consequence — flying towards a low without resetting the altimeter leaves it over-reading.",
    },
    {
      section: "Water Vapour and Air Density",
      prompt: "Compared with dry air at the same temperature and pressure, moist air is:",
      options: [
        "More dense, because water is heavier than air",
        "Less dense, because a water vapour molecule is lighter than a dry air molecule",
        "Of the same density, because humidity does not affect density",
        "More dense, but only below the freezing level",
      ],
      answer: 1,
      explanation:
        "A water vapour molecule has less mass than the average dry air molecule it displaces, so moist air is less dense than dry air. It is the result most people expect to go the other way, and it matters because lower density means poorer performance.",
    },
    {
      section: "Atmospheric Stability",
      prompt:
        "A parcel of unsaturated air forced to rise cools at the dry adiabatic lapse rate of approximately:",
      options: ["1.5°C per 1000 ft", "2°C per 1000 ft", "3°C per 1000 ft", "6°C per 1000 ft"],
      answer: 2,
      explanation:
        "The dry adiabatic lapse rate is 3°C per 1000 ft. Once the parcel saturates, the latent heat released by condensation slows the cooling to the saturated adiabatic lapse rate, which is why the two rates have to be compared with the environmental lapse rate separately.",
    },
    {
      section: "Cloud",
      prompt: "A cloud layer reported as BKN covers:",
      options: ["1 to 2 oktas", "3 to 4 oktas", "5 to 7 oktas", "8 oktas"],
      answer: 2,
      explanation:
        "Cloud cover is reported in eighths. FEW is 1–2 oktas, SCT is 3–4, BKN is 5–7, and OVC is 8 — the sky completely covered.",
    },
    {
      section: "Fog",
      prompt: "Radiation fog forms when:",
      options: [
        "Warm moist air moves over a colder surface",
        "The ground cools at night by radiation to space and chills the air in contact with it",
        "Air is lifted over rising terrain and cools adiabatically",
        "Cold air moves over a much warmer sea surface",
      ],
      answer: 1,
      explanation:
        "On a clear night the ground radiates its heat to space, cools, and chills the air touching it by conduction. The cooling spreads upward through the lowest layers until saturation. Every kind of fog depends on the air near the surface being cooled to saturation; radiation fog is the way that happens on a clear, calm night.",
    },
    {
      section: "Icing",
      prompt: "Clear ice, as opposed to rime ice, is most associated with:",
      options: [
        "Small supercooled droplets freezing instantly on contact",
        "Large supercooled droplets that spread before freezing",
        "Ice crystals striking a cold airframe",
        "Sublimation of water vapour directly onto the wing",
      ],
      answer: 1,
      explanation:
        "Large supercooled droplets do not freeze on impact; they flow back over the surface and freeze progressively, giving dense, clear, strongly adhering ice. Small droplets freeze on contact and trap air, giving the opaque, brittle deposit called rime.",
    },
    {
      section: "Thunderstorms",
      prompt: "The most serious hazard associated with a thunderstorm is:",
      options: ["Hail", "Lightning", "Turbulence from the updraughts and downdraughts", "Static interference"],
      answer: 2,
      explanation:
        "Turbulence is the most serious hazard. Vertical winds inside a cumulonimbus can exceed 5000 ft per minute, with updraughts and downdraughts side by side, and the overturning motion that produces is violent enough at times to tear an aircraft apart. Icing, hail and lightning are all serious, but they are not what breaks the aeroplane.",
    },
    {
      section: "Meteorological Services, Reports and Forecasts",
      prompt: "A TREND appended to a METAR or SPECI is a landing forecast that:",
      options: [
        "Is valid for two hours and supersedes the applicable TAF",
        "Is valid for six hours and is read alongside the TAF",
        "Describes the weather over the previous hour",
        "Applies only when NOSIG is not reported",
      ],
      answer: 0,
      explanation:
        "A TREND indicates the changes expected to the conditions just reported. It carries a two-hour validity and supersedes the applicable aerodrome forecast for that period. NOSIG within a TREND means no significant change is expected.",
    },
  ],
};
