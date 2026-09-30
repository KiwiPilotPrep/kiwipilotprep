/**
 * CPL Meteorology — the free ten-question mock.
 *
 * Grounded in this subject's own lessons and pitched at the commercial
 * material: lapse rate arithmetic, mountain waves, thunderstorm hazards,
 * volcanic ash and the tropical circulation.
 */
export const subject = {
  course: "cpl-theory",
  subject: "meteorology",
  questions: [
    {
      section: "The Structure of the Atmosphere",
      prompt: "The average height of the tropopause over the equator is approximately:",
      options: ["20,000 ft", "36,000 ft", "45,000 ft", "60,000 ft"],
      answer: 3,
      explanation:
        "About 60,000 ft over the equator, with an average temperature near −80°C, against roughly 20,000 ft over the poles. The deeper the troposphere, the further the temperature has fallen by the time you reach its top.",
    },
    {
      section: "Stability and Lapse Rates",
      prompt: "Absolute instability exists when the environmental lapse rate is:",
      options: [
        "Less than 1.5°C per 1000 ft",
        "Between 1.5°C and 3°C per 1000 ft",
        "Greater than 3°C per 1000 ft",
        "Exactly 2°C per 1000 ft",
      ],
      answer: 2,
      explanation:
        "An ELR steeper than the dry adiabatic lapse rate of 3°C per 1000 ft gives absolute instability: a rising parcel stays warmer than its surroundings whether it is saturated or not. Below the saturated rate of 1.5°C per 1000 ft the air is absolutely stable, and between the two it is conditionally unstable.",
    },
    {
      section: "Föhn Winds and Mountain Waves",
      prompt: "Air arriving on the lee side of a range in a Föhn wind is:",
      options: [
        "Cooler and drier than the air on the windward side",
        "Warmer and drier than the air on the windward side",
        "Warmer and more humid than the air on the windward side",
        "Unchanged in temperature and humidity",
      ],
      answer: 1,
      explanation:
        "Moisture is lost as precipitation on the way up the windward slope, so the descending air warms at the dry rate rather than the saturated one and arrives warmer and drier. The Canterbury nor'wester is the example the course uses.",
    },
    {
      section: "Airframe Icing",
      prompt: "The cloud types that produce the most severe airframe icing are:",
      options: [
        "Cirrus and cirrostratus",
        "Cumulus and cumulonimbus",
        "Stratocumulus and stratus",
        "Altostratus and altocumulus",
      ],
      answer: 1,
      explanation:
        "Heap cloud carries the highest concentration of supercooled water droplets because the up currents holding them are strongest. Cu and Cb give severe icing, nimbostratus moderate to severe, stratocumulus light to moderate, and the high ice-crystal clouds are not an icing problem.",
    },
    {
      section: "Thunderstorm Hazards",
      prompt: "Hail damage from a thunderstorm can be expected within:",
      options: [
        "The cloud only",
        "About 2 nm of the cloud",
        "About 10 nm of the cloud",
        "About 20 nm of the cloud",
      ],
      answer: 1,
      explanation:
        "Hail forms only inside a cumulonimbus, but it can be ejected from the top or the sides, so damage is to be expected within about 2 nm of the cloud. Clear air beside a storm is not the same thing as safe air.",
    },
    {
      section: "Thunderstorm Hazards",
      prompt: "A microburst is:",
      options: [
        "A brief increase in surface wind of at least 16 kt",
        "A severe low-level wind pattern driven by an extremely strong downdraught",
        "The rotating funnel beneath a cumulonimbus",
        "A localised area of clear air turbulence at cruise level",
      ],
      answer: 1,
      explanation:
        "A microburst is driven by an intensely strong downdraught of rain-cooled air, with vertical velocities that can exceed 100 kt. Most come from thunderstorms, but some are produced by cumulus that look benign from the cockpit.",
    },
    {
      section: "Air Masses and Fronts",
      prompt: "Compared with a warm front, a cold front typically shows:",
      options: [
        "Slower movement and an extensive sheet of layer cloud",
        "Rapid movement, a marked temperature drop and convective cloud",
        "A gradual pressure fall behind the front",
        "A wind change from the north-westerly to the easterly quarter",
      ],
      answer: 1,
      explanation:
        "A cold front moves at 15 to 40 kt with a marked temperature drop, a sharp pressure rise behind it in the heavier cold air, and convective cloud along it. A warm front moves at 5 to 15 kt and brings the long, shallow sheet of layer cloud ahead of it.",
    },
    {
      section: "Volcanic Ash",
      prompt: "The principal threat volcanic ash poses to a turbine engine is that the ash:",
      options: [
        "Blocks the fuel filters",
        "Melts in the hot section and re-solidifies on the cooler blades behind it",
        "Causes only gradual abrasive wear over many hours",
        "Reduces the calorific value of the fuel",
      ],
      answer: 1,
      explanation:
        "Ash melts in the hot section and re-solidifies on the cooler turbine blades downstream. That is why the failure is a flameout rather than progressive wear, and why the response is to reduce power and turn back rather than press on.",
    },
    {
      section: "The ITCZ and the SPCZ",
      prompt: "The ITCZ is most active:",
      options: [
        "Over the oceans, at night",
        "Over continental land masses, in summer and during the afternoon",
        "Over the poles, in winter",
        "Uniformly throughout the year",
      ],
      answer: 1,
      explanation:
        "The zone is most active over continental land masses in summer and during the afternoon, and less active over the oceans. At its most active it can be up to 300 nm wide, with cumulonimbus growing to very great heights.",
    },
    {
      section: "Aerodrome Reports and Forecasts",
      prompt: "A SPECI is issued when:",
      options: [
        "The routine half-hourly observation is due",
        "Conditions have changed significantly since the last routine report",
        "A forecast is amended",
        "A pilot reports conditions in flight",
      ],
      answer: 1,
      explanation:
        "A METAR is the routine aerodrome report; a SPECI is the special report issued when conditions change significantly between routine observations. A pilot's own report in flight is a PIREP or AIREP, which is a different product.",
    },
  ],
};
