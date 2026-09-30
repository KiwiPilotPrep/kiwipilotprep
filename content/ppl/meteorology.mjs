/**
 * PPL Meteorology — the curriculum.
 *
 * 531 slides, the largest of the five decks, with eighteen section dividers
 * that run in exactly the order the subject should be taught: the atmosphere,
 * then heat, then pressure, then wind, then moisture, then stability — and
 * only after all six the things a pilot actually sees, which are cloud, rain,
 * fog, ice and thunderstorms. That order is kept, because every chapter in
 * the second half is built out of the first half.
 *
 * Two of the deck's sections are split, both because a divider is doing the
 * work of two:
 *
 *   - The Thunderstorms section (358) runs on through Mountain Weather from
 *     slide 384 to 415 without a divider of its own. Föhn winds, mountain
 *     waves, rotor zones and VFR flight in the hills are a chapter, not an
 *     appendix to thunderstorms, and the CAA syllabus treats them as one.
 *
 *   - The Water Vapour section (158) turns into air density at slide 172.
 *     Both belong together — density is what moisture changes — so the
 *     chapter is named for both rather than for half of it.
 *
 * The deck carries twelve embedded videos, which arrive as slides with no
 * text and no image. They are skipped, each with the reason written down.
 * Nothing else is dropped.
 *
 * A note on the annotated charts. Several slides are a MetService analysis
 * with arrows, rings and boxes drawn on top, and PowerPoint stores every one
 * of those shapes as a separate image. The chart is kept; the loose arrows
 * are not. The reasoning is in meteorology-diagrams.mjs.
 */
import { repairSlide } from "./deck-repairs.mjs";
import { isRejectedImage, isUpsideDown } from "./meteorology-diagrams.mjs";

/** Repairs this deck needs that no other deck needs. */
const TABLES = {
  callouts: {},
  // Slide-by-slide corrections, each one checked against the slide it comes
  // from.
  substitutions: {
    // A typing slip in the slide title: "Accretion Rate of Carburettor Ice Ice".
  },
  titles: {
    // A typing slip in the slide title: "Accretion Rate of Carburettor Ice Ice".
    355: "Accretion Rate of Carburettor Ice",
  },
};

export const subject = {
  slug: "meteorology",
  title: "Meteorology",
  deck: "meteorology",
  repairSlide: (blocks, context) => repairSlide(blocks, { ...context, tables: TABLES }),
  isRejectedImage,
  isUpsideDown,

  // The per-slide repair tables, exposed so the conservation test can tell a
  // hand-checked correction from a rewrite: a block whose words differ from
  // the slide's is a failure unless a substitution written down here is why.
  repairs: TABLES,

  skip: {
    1: "The deck cover: the subject name over a photograph of a thunderstorm, with the exam format. Both belong on the course page rather than in a lesson.",
    2: "Section divider announcing “The Atmosphere”. The name is kept as course structure; the slide carries nothing else.",
    29: "An embedded video with no text and no still image behind it. Nothing survives extraction, so there is nothing to teach from.",
    30: "A second embedded video, same case.",
    31: "Section divider announcing “Temperature and Heat Exchange Processes”.",
    47: "A slide headed “Winter Solstice” whose whole content is an embedded video. The heading has no body behind it once the video is gone.",
    48: "A slide headed “Winter/Summer Solstice” whose whole content is an embedded video.",
    69: "A slide headed “Climate System at Work” whose whole content is an embedded video.",
    70: "Section divider announcing “Atmospheric Pressure”.",
    103: "Section divider announcing “The Wind”.",
    114: "An embedded video with no text and no still image behind it.",
    142: "Section divider announcing “Local Winds”.",
    158: "Section divider announcing “Water Vapour”.",
    181: "Section divider announcing “Atmospheric Stability”.",
    216: "Section divider announcing “Inversions”.",
    240: "Section divider announcing “Cloud and its Classification”.",
    280: "Section divider announcing “Precipitation”.",
    291: "Section divider announcing “Visibility”.",
    312: "Section divider announcing “Fog”.",
    313: "An embedded video with no text and no still image behind it.",
    325: "Section divider announcing “Icing”.",
    358: "Section divider announcing “Thunderstorms”.",
    383: "An embedded video with no text and no still image behind it.",
    391: "A Föhn calculation exercise drawn as a diagram, of which only the labels survive extraction — “Temperature?”, “Cloud Base?”, “16,000ft”, “D.Pt 9°C” — with no drawing to attach them to. As a list of loose fragments it teaches nothing; the same calculation is taught, worked in full, on the figure in “Weather Above and in the Lee”.",
    392: "The worked answer to the first half of that exercise, and the same problem: the arithmetic is complete but its labels are scattered around a drawing that did not survive.",
    393: "The worked answer to the second half, same case.",
    416: "Section divider announcing “Fronts And Depressions”.",
    436: "An embedded video with no text and no still image behind it.",
    439: "Section divider announcing “Turbulence”.",
    440: "An embedded video with no text and no still image behind it.",
    441: "A second embedded video, same case.",
    452: "An embedded video with no text and no still image behind it.",
    463: "An embedded video with no text and no still image behind it.",
    465: "A second embedded video, same case.",
    469: "An embedded video with no text and no still image behind it.",
    470: "Section divider announcing “New Zealand Weather”.",
    484: "Section divider announcing “Meteorological Services, Reports And Forecasts”.",
    531: "A version note recording who last updated the PowerPoint and when. Source housekeeping, and it names an instructor.",
  },

  chapters: [
    {
      title: "The Atmosphere",
      syllabus: ["8.6"],
      intro:
        "What the air is made of and how it is arranged in layers. Almost " +
        "every later chapter is a consequence of two facts established here: " +
        "the atmosphere is warmed from below, and almost all the weather is in " +
        "the bottom layer of it.",
      topics: [
        {
          title: "Composition of the Atmosphere",
          pages: [3],
          intro:
            "The two gases that make up nearly all of dry air, and the trace gases " +
            "that matter out of proportion to their share.",
        },
        {
          title: "Water Vapour",
          pages: [4, 5, 6],
          intro:
            "The one component that varies, where it comes from, and the cycle it " +
            "moves through.",
          diagramNotes: {
            6: "The hydrological cycle: evaporation from ocean, rivers and soils, transpiration from vegetation, condensation into cloud, precipitation, runoff and infiltration back to groundwater.",
          },
          takeaway:
            "Water vapour is the component of the atmosphere that varies most from " +
            "day to day and place to place, and it is the one that produces " +
            "weather. Everything in this subject that is worth looking out of a " +
            "window at — cloud, rain, fog, ice, thunderstorms — is water vapour " +
            "changing state.",
        },
        {
          title: "Carbon Dioxide and Ozone",
          pages: [7, 8],
          intro:
            "Two trace gases, where each sits, and what each absorbs.",
        },
        {
          title: "Solid Particles",
          pages: [9],
          intro:
            "What else is in the air, and why it matters to cloud.",
        },
        {
          title: "The Vertical Divisions",
          pages: [10, 11],
          intro:
            "The layers of the atmosphere, and what defines the boundary between " +
            "each.",
          diagramNotes: {
            11: "The vertical structure of the atmosphere plotted against temperature: the troposphere with its falling temperature, the tropopause, the stratosphere with the ozone maximum, the mesosphere and the thermosphere.",
          },
        },
        {
          title: "The Troposphere",
          pages: [12, 13, 14, 15],
          intro:
            "The layer the weather is in: what it contains, and how its lapse rate " +
            "and its depth behave.",
          diagramNotes: {
            12: "The troposphere as a shell around the Earth, deepest at the Equator and shallowest at the poles.",
            13: "The height of the tropopause with latitude, showing the step between the tropical and polar tropopause at the mid-latitudes.",
          },
        },
        {
          title: "The Tropopause",
          pages: [16, 17, 18],
          intro:
            "Where the troposphere stops, the temperature there, and why that " +
            "temperature is different over the Equator and over the poles.",
          diagramNotes: {
            16: "Tropopause height and temperature against latitude, with the jet stream marked at the break between the tropical and polar tropopause.",
          },
          misconception:
            "Expecting the coldest tropopause over the poles. It is the other way " +
            "round: the tropical tropopause is far higher, so air rising to it has " +
            "cooled through many more thousands of feet and arrives colder than the " +
            "much lower polar tropopause. Height, not latitude, sets the " +
            "temperature.",
        },
        {
          title: "The Stratosphere",
          pages: [19],
          intro:
            "The layer above, its thickness, and what happens to temperature in " +
            "it.",
        },
        {
          title: "Aerosols",
          pages: [20, 21, 22, 23],
          intro:
            "What an aerosol is, and the part one plays inside every cloud " +
            "droplet.",
          diagramNotes: {
            23: "The long-range transport of aerosols and gases: sources at the surface, mixing through the boundary layer, and transport into the free troposphere and stratosphere.",
          },
        },
        {
          title: "Sources of Aerosol",
          pages: [24, 25, 26],
          intro:
            "Volcanic, desert and human-made, and where each ends up.",
        },
        {
          title: "Effects on the Atmosphere",
          pages: [27, 28],
          intro:
            "The direct effects of an eruption, and the indirect effects on cloud " +
            "formation.",
        },
      ],
    },

    {
      title: "Temperature and Heat Exchange",
      syllabus: ["8.8"],
      intro:
        "Where the atmosphere's energy comes from, how it gets into the air, " +
        "and why the answer to the second question — from below, not from " +
        "above — governs almost everything that follows.",
      topics: [
        {
          title: "Units of Measurement",
          pages: [32, 33, 34, 35],
          intro:
            "Celsius, Fahrenheit and Kelvin, and the fixed points each is built " +
            "on.",
        },
        {
          title: "Measuring Surface Air Temperature",
          pages: [36],
          intro:
            "Where the thermometer is put, and why the height matters.",
        },
        {
          title: "Temperature and Landing",
          pages: [37],
          intro:
            "What a hot sealed runway does to the air above it, and to an aircraft " +
            "on approach.",
        },
        {
          title: "Radiation",
          pages: [38, 39],
          intro:
            "How heat crosses empty space, and what decides the wavelength it " +
            "arrives at.",
        },
        {
          title: "Solar Radiation",
          pages: [40, 41],
          intro:
            "Where virtually all the atmosphere's energy comes from, and what " +
            "happens to it on the way in.",
        },
        {
          title: "Factors Affecting Solar Radiation",
          pages: [42, 43],
          intro:
            "The three things that decide how much energy a place receives.",
          diagramNotes: {
            43: "The path of short-wave solar radiation into the atmosphere: absorption by ozone and water vapour, reflection from cloud tops, scattering by dust, reflection from the Earth's surface as albedo, and the residual absorbed by the Earth.",
          },
        },
        {
          title: "Altitude of the Sun and Length of Day",
          pages: [44, 45, 49],
          intro:
            "Why the angle and the day length change through the year, and what " +
            "the Earth's tilt has to do with it.",
          diagramNotes: {
            44: "Parallel solar radiation striking a curved Earth: the same beam spread over a larger area at high latitudes than at the Equator.",
            49: "The Earth's orbit with the spin axis tilted: the June and December solstices and the March and September equinoxes, and the season each produces in each hemisphere.",
          },
        },
        {
          title: "Measuring Solar Radiation",
          pages: [46],
          intro:
            "The instruments, and what each measures.",
        },
        {
          title: "Terrestrial Radiation",
          pages: [50, 51, 52],
          intro:
            "The Earth radiating back, and the very different wavelength it does " +
            "it at.",
          diagramNotes: {
            52: "The energy budget: 100 units of solar energy in, the fractions reflected by cloud tops, snow and ice and the atmosphere as albedo, the fraction absorbed by the atmosphere and by the ground, and the long-wave radiation out to space.",
          },
        },
        {
          title: "Warming the Atmosphere",
          pages: [53],
          intro:
            "The single most important sentence in the subject: the atmosphere is " +
            "warmed from below.",
          takeaway:
            "Almost every question in this course has this behind it. Because the " +
            "air is heated by the surface rather than by the sun directly, the " +
            "warmest air is the lowest air; because the warmest air is the lowest " +
            "air, it rises; because it rises, it cools, condenses and makes cloud. " +
            "Turn that sequence around and you have an inversion, and everything " +
            "the inversion chapter describes follows.",
        },
        {
          title: "Conduction, Convection and Advection",
          pages: [54, 55, 56],
          intro:
            "Three ways heat moves in the atmosphere, and the difference between " +
            "the second and the third.",
          diagramNotes: {
            55: "Conduction as heat transfer through touch, and convection as warmed particles expanding and rising.",
          },
        },
        {
          title: "Latent Heat",
          pages: [57, 58],
          intro:
            "Heat that goes into changing state rather than changing temperature, " +
            "and where it reappears.",
          diagramNotes: {
            57: "The paths by which the atmosphere is warmed: long-wave terrestrial radiation absorbed and re-radiated by carbon dioxide, cloud and water vapour, plus latent heat, conduction and convection.",
          },
        },
        {
          title: "Diurnal Variation of Temperature",
          pages: [59, 60],
          intro:
            "The daily cycle of surface temperature, and why the minimum is not at " +
            "midnight.",
          diagramNotes: {
            60: "Diurnal temperature curves for ocean, grassland, cloud cover and desert, plotted from midnight through the day and back.",
          },
        },
        {
          title: "The Effect of Oceans",
          pages: [61, 62, 63],
          intro:
            "Why a maritime climate has no extremes, and the three reasons behind " +
            "it.",
          context:
            "This is the chapter that explains New Zealand. Water has an enormous " +
            "heat capacity, it mixes solar energy through a deep layer, and the " +
            "wind over it is stronger — so the sea warms slowly, cools slowly and " +
            "never gets far from its annual mean. A country that is narrow and " +
            "surrounded by that ocean inherits its temperature range, which is why " +
            "the New Zealand Weather chapter later on is about wind direction " +
            "rather than about heat.",
        },
        {
          title: "The Effects of Water Vapour, Cloud and Wind",
          pages: [64, 65, 66],
          intro:
            "Three more things that flatten the daily temperature range, and how " +
            "each does it.",
        },
        {
          title: "Horizontal Transport of Heat",
          pages: [67],
          intro:
            "The imbalance between the tropics and the poles, and what the " +
            "atmosphere does about it.",
        },
        {
          title: "Climate Classification",
          pages: [68],
          intro:
            "How climates are classified, and what the classification is measuring.",
        },
      ],
    },

    {
      title: "Atmospheric Pressure",
      syllabus: ["8.10", "8.4"],
      intro:
        "Pressure, the charts it is drawn on, and the altimeter settings it " +
        "produces. This chapter is where a weather map stops being a picture " +
        "and starts being information.",
      topics: [
        {
          title: "What Atmospheric Pressure Is",
          pages: [71, 72],
          intro:
            "The definition, and the two reasons a pilot cares about it.",
        },
        {
          title: "Pressure Variation with Height",
          pages: [73, 74],
          intro:
            "Why pressure falls with height, and the number of feet per " +
            "hectopascal that follows.",
          diagramNotes: {
            73: "Two columns of air at the same surface pressure, one warm and one cold: the same 1000 hPa level sits at a greater height in the warm column and a lower height in the cold one.",
          },
        },
        {
          title: "Weather Charts and Isobars",
          pages: [75, 76, 77, 78, 79],
          intro:
            "What is drawn on a mean sea level chart, and the rules isobars " +
            "follow.",
          diagramNotes: {
            75: "A MetService mean sea level analysis chart for New Zealand, with isobars, fronts and the valid and issue times.",
            78: "The same analysis, used to read pressure at a station and to identify the systems on it.",
          },
        },
        {
          title: "Anticyclones and Depressions",
          pages: [80, 81, 82],
          intro:
            "The two basic systems, the pressure at the centre of each, and the " +
            "direction the air circulates in the Southern Hemisphere.",
          diagramNotes: {
            82: "A MetService prognosis chart with the highs and lows marked and the circulation around each identified.",
          },
          misconception:
            "Carrying Northern Hemisphere circulation into a New Zealand exam. In " +
            "the Southern Hemisphere the air circulates anticlockwise around a low " +
            "and clockwise around a high — the opposite of every diagram in most " +
            "overseas textbooks and most of the internet. Everything else in this " +
            "subject that depends on rotation, including Buys Ballot's law and the " +
            "wind change on climb, flips with it.",
        },
        {
          title: "Ridges, Troughs and Cols",
          pages: [83, 84, 85, 86, 87],
          intro:
            "The three shapes between the highs and the lows, and the weather each " +
            "brings.",
          diagramNotes: {
            83: "High-level divergence over a low with ascending, cooling air, and high-level convergence over a high with subsiding, warming air.",
            86: "A prognosis chart with a trough and a ridge identified on it.",
            87: "Highs, lows, troughs, ridges and a col drawn as isobar patterns, with the circulation around each.",
          },
        },
        {
          title: "Changes in Atmospheric Pressure",
          pages: [88, 89],
          intro:
            "Which way systems move, and the daily rise and fall underneath that " +
            "movement.",
          diagramNotes: {
            89: "The semi-diurnal pressure variation across a day, with the maxima and minima at their usual hours.",
          },
        },
        {
          title: "New Zealand Compared to ISA",
          pages: [90, 91],
          intro:
            "How the local atmosphere differs from the standard one, and where the " +
            "diurnal variation is most pronounced.",
        },
        {
          title: "Pressure Gradient",
          pages: [92, 93, 94],
          intro:
            "The change of pressure with horizontal distance, and how isobar " +
            "spacing shows it.",
          diagramNotes: {
            93: "Two pairs of pressure systems at the same separation: 1010 to 1004 hPa over 300 km, and 1014 to 1000 hPa over the same 300 km, with the isobar spacing that results from each.",
          },
          takeaway:
            "Isobar spacing is the fastest wind forecast available. Close together " +
            "means a steep gradient and strong wind; far apart means a weak " +
            "gradient and light wind. Nothing else on a mean sea level chart tells " +
            "you as much about the day as quickly.",
        },
        {
          title: "The International Standard Atmosphere",
          pages: [95, 96, 97],
          intro:
            "The benchmark conditions, and why performance figures need one.",
          diagramNotes: {
            97: "The ISA table: height above sea level in thousands of feet against temperature in degrees Celsius and pressure in hectopascals.",
          },
          takeaway:
            "The ISA matters because nothing in a flight manual is a promise " +
            "about today. Performance figures are worked against these benchmark " +
            "conditions, so the further the real atmosphere sits from them the " +
            "further the aeroplane sits from the book. Warmer than ISA, or higher " +
            "than ISA pressure altitude, means thinner air: the wing makes less " +
            "lift, the propeller less thrust and the engine less power, so the " +
            "takeoff run is longer, the climb rate lower and the service ceiling " +
            "closer. Colder and higher-pressure than ISA works the other way and " +
            "gives you performance you did not pay for. The deviation is the " +
            "number that matters, not the absolute temperature.",
        },
        {
          title: "Altimeter Settings",
          pages: [98],
          intro:
            "What an altimeter actually measures, and the datum it is set against.",
          diagramNotes: {
            98: "An altimeter face with the subscale window and subscale knob identified.",
          },
        },
        {
          title: "The Q Codes",
          pages: [99, 100],
          intro:
            "QNH, QNE and QFE — what each is, and what the altimeter reads with " +
            "each set.",
        },
        {
          title: "Correct Subscale Usage",
          pages: [101, 102],
          intro:
            "Why the setting has to be changed, and what happens when it is not.",
          diagramNotes: {
            102: "The three settings side by side — QNH, QNE and QFE — with the altimeter reading each produces at an aerodrome 1500 feet above sea level, and the arithmetic behind each.",
          },
        },
      ],
    },

    {
      title: "The Wind",
      syllabus: ["8.12"],
      intro:
        "Four forces produce the wind, and the balance between them changes " +
        "with height. That single fact explains the wind at the surface, the " +
        "wind at cruise, why they are different, and why the difference " +
        "matters on climb-out.",
      topics: [
        {
          title: "The Forces Involved",
          pages: [104],
          intro:
            "The four forces that decide the strength and direction of the wind.",
          context:
            "Four forces, and they do not all act at once in the same " +
            "proportions. The pressure gradient force is the only one that starts " +
            "air moving; Coriolis and centripetal force bend the flow once it is " +
            "moving; friction slows it and turns it near the surface. Every wind " +
            "you will ever meet is one of those four winning over the others " +
            "somewhere, and the topics that follow take them one at a time before " +
            "putting them back together as the geostrophic and gradient wind.",
        },
        {
          title: "Pressure Gradient Force",
          pages: [105, 106],
          intro:
            "The force that starts the air moving, and the direction it acts in.",
          diagramNotes: {
            106: "The pressure gradient force acting at right angles to the isobars, from high pressure towards low.",
          },
        },
        {
          title: "Coriolis Force",
          pages: [107, 108, 109],
          intro:
            "The apparent force from the Earth's rotation, which way it deflects " +
            "in the Southern Hemisphere, and what it depends on.",
          diagramNotes: {
            108: "Air departing a high in the Southern Hemisphere curving to the left, and the Northern Hemisphere case beside it for comparison.",
          },
        },
        {
          title: "The Geostrophic Balance",
          pages: [110, 111],
          intro:
            "What happens when the pressure gradient force and Coriolis force come " +
            "into balance.",
          diagramNotes: {
            110: "The pressure gradient force and Coriolis force acting on a parcel between straight isobars, and the resulting flow along the isobars.",
          },
        },
        {
          title: "Gradient Wind and Centripetal Force",
          pages: [112, 113],
          intro:
            "What curved isobars do to the balance, and what happens near the " +
            "Equator where Coriolis force is nil.",
          diagramNotes: {
            113: [
              "The three cases around curved isobars: pressure gradient equal to Coriolis, Coriolis larger than the pressure gradient, and Coriolis smaller.",
              "The same three cases shown around a high and a low.",
              "The resulting flow around each.",
            ],
          },
        },
        {
          title: "Properties of the Coriolis Force",
          pages: [115],
          intro:
            "What it acts on, what it does not, and how it varies.",
        },
        {
          title: "Frictional Forces",
          pages: [116, 117, 118],
          intro:
            "What the surface does to the wind, the depth of the layer it acts " +
            "through, and what a deep friction layer means.",
          diagramNotes: {
            117: "The friction layer: the geostrophic wind above it flowing along the isobars, and the surface wind within it backed across them and reduced in speed.",
          },
        },
        {
          title: "Gusts and Squalls",
          pages: [119, 120],
          intro:
            "Two words for a sudden increase, and the criteria that separate them.",
          takeaway:
            "The difference between the two is not strength but duration, and it " +
            "is the reason a forecast says one or the other. A gust is a sudden " +
            "brief increase and it is gone; a squall is sustained for long enough " +
            "to change what the aeroplane is doing for as long as it lasts. On an " +
            "approach a gust costs you a moment of airspeed and a squall costs " +
            "you the approach.",
        },
        {
          title: "Diurnal Variation of the Surface Wind",
          pages: [121, 122, 123],
          intro:
            "How the friction layer changes through the day, and what the surface " +
            "wind does as a result.",
          diagramNotes: {
            122: [
              "A high and a low with the surface wind between them, and the change from day to night.",
              "The night-time case, with the surface wind veering and decreasing after sunset.",
              "The day-time case, with the surface wind backing and increasing after daybreak.",
              "Veering as a clockwise change and backing as an anticlockwise change.",
            ],
          },
        },
        {
          title: "Wind Change During Climb or Descent",
          pages: [124],
          intro:
            "What the wind does as an aircraft leaves the friction layer, and what " +
            "it does coming back into it.",
          diagramNotes: {
            124: [
              "The night-time case, with the surface wind between a high and a low.",
              "The day-time case, with the same systems.",
              "Within the friction layer.",
              "Outside the friction layer.",
            ],
          },
          takeaway:
            "In the Southern Hemisphere the wind backs and increases as you climb " +
            "out of the friction layer, and veers and decreases on the way back " +
            "down. That is why the surface wind on the ATIS is not the wind you " +
            "will find on downwind, and why the crosswind on final is often not " +
            "the one you planned for at circuit height.",
        },
        {
          title: "Wind Measurement and Units",
          pages: [125, 126, 127],
          intro:
            "The instruments, and the units a wind is reported in.",
          diagramNotes: {
            126: "A cup anemometer and wind vane on their mast.",
          },
        },
        {
          title: "Reading the Wind Without an Instrument",
          pages: [128, 129, 130, 131],
          intro:
            "The windsock, ripples on water, wind lanes and cloud shadows — four " +
            "ways of estimating wind from the cockpit.",
          diagramNotes: {
            128: [
              "A windsock at 45° from the mast, indicating about 15 knots.",
              "A windsock lifting and falling, averaging about 2 knots.",
              "A windsock at 30° from the mast, indicating about 8 knots.",
              "A windsock at 75° from the mast, indicating about 22 knots.",
              "A windsock fully extended at 90°, indicating 25 knots or more.",
            ],
            129: "Wind ripples on water, with the shadow area on the upwind shore showing the direction the wind is coming from.",
          },
        },
        {
          title: "Buys Ballot's Law",
          pages: [132, 133, 134],
          intro:
            "A rule for finding the low without a chart, and its practical use in " +
            "flight.",
          diagramNotes: {
            134: "An aircraft in the Southern Hemisphere with the wind at its back: the low pressure lies to the right, the high to the left.",
          },
        },
        {
          title: "Windshear: Vertical and Horizontal",
          pages: [135, 136, 137],
          intro:
            "What windshear is, and the difference between the vertical and " +
            "horizontal cases.",
          diagramNotes: {
            136: "Vertical wind shear: a shear zone between two layers moving at different speeds, with the aircraft passing through it.",
            137: "Horizontal wind shear: the shear zone between two adjacent bodies of air moving at different velocities.",
          },
        },
        {
          title: "Positive and Negative Windshear",
          pages: [138, 139, 140, 141],
          intro:
            "A sudden increase in headwind and a sudden decrease, and what each " +
            "does to an aircraft on approach.",
          diagramNotes: {
            138: "An aircraft on approach meeting increasing headwind ahead of the outflow, with the intended path and the departure from it.",
            140: "The same approach meeting decreasing headwind, with the aircraft falling below the intended path.",
          },
          context:
            "The two cases feel completely different in the aeroplane and only one " +
            "of them is dangerous in the short term. An increasing headwind raises " +
            "the airspeed and pushes you above the path — uncomfortable, and " +
            "correctable. A decreasing headwind takes the airspeed away at the " +
            "moment there is least of it to spare, and the aeroplane sinks. This is " +
            "why the outflow from a thunderstorm gives you the pleasant half first " +
            "and the dangerous half a few seconds later.",
        },
      ],
    },

    {
      title: "Local Winds",
      syllabus: ["8.14"],
      intro:
        "Winds produced by the ground rather than by the pressure pattern: " +
        "the sea breeze, the winds that run down and up a slope, and what a " +
        "gap in the terrain does to a flow squeezed through it.",
      topics: [
        {
          title: "The Sea Breeze",
          pages: [143, 144],
          intro:
            "Why it happens, and the temperature difference that drives it.",
          diagramNotes: {
            144: "The sea breeze circulation: a local heat low over the warm land, the breeze flowing in from the sea, and the return flow aloft.",
          },
        },
        {
          title: "Factors Affecting the Sea Breeze",
          pages: [145, 146, 147, 148, 149],
          intro:
            "Timing, cloud, pressure gradient, windshear and turbulence — five " +
            "things that change what the sea breeze does.",
          diagramNotes: {
            147: "The sea breeze front, with the prevailing wind opposing it and the vertical wind shear at the boundary.",
            148: [
              "The sea breeze meeting an opposing prevailing wind, with the shear zone between them.",
              "The same boundary seen in plan, with the land and sea either side.",
            ],
          },
        },
        {
          title: "Katabatic Winds",
          pages: [150, 151, 152],
          intro:
            "Cold air draining down a slope at night, and what it does when it " +
            "reaches the valley floor.",
          diagramNotes: {
            150: "Cold surface air draining down the slopes on both sides of a valley, labelled katabatic wind.",
            151: "Katabatic wind formation: terrestrial radiation cooling the ground on both sides of a valley and the cold air pooling in the bottom, making frost and fog likely.",
          },
        },
        {
          title: "Anabatic Winds",
          pages: [153, 154],
          intro:
            "The daytime opposite: warm air rising up a sunlit slope.",
          diagramNotes: {
            153: "Warm surface air rising up the slopes on both sides of a valley, labelled anabatic wind.",
            154: "Anabatic wind formation: ground warmed by insolation, air warmed by conduction rising up the slope, cold free air replacing the lifted air, and cloud forming at the top.",
          },
        },
        {
          title: "Terrain Channelling",
          pages: [155, 156, 157],
          intro:
            "What happens when a flow is squeezed through a gap, and the New " +
            "Zealand places where it happens every time.",
          diagramNotes: {
            156: [
              "A satellite view of New Zealand, with the gaps and straits the flow is channelled through.",
              "The North West to South East flow across the country.",
              "A natural venturi in the terrain.",
            ],
            157: "A river gorge from the air — the shape that accelerates a wind squeezed into it.",
          },
          takeaway:
            "Cook Strait and the Manawatu Gorge are the standard examples for a " +
            "reason: a flow forced through a narrowing has to speed up, so a " +
            "moderate wind on either side becomes a strong one in the gap. The " +
            "forecast wind for the region is not the wind in the gap, and the " +
            "difference is worth planning for rather than discovering.",
        },
      ],
    },

    {
      title: "Water Vapour and Air Density",
      syllabus: ["8.16", "8.10"],
      intro:
        "The changes of state water goes through, the two ways of describing " +
        "how much of it is in the air, and what all of it does to density — " +
        "which is the property an aeroplane actually feels.",
      topics: [
        {
          title: "Atmospheric Moisture",
          pages: [159, 160],
          intro:
            "How much water vapour the air holds, and the ceiling on how much it " +
            "can hold.",
          diagramNotes: {
            160: [
              "The column of a parcel of air, of which 100 per cent is dry air.",
              "The four per cent of that parcel that water vapour can occupy at saturation.",
            ],
          },
        },
        {
          title: "Condensation and Deposition",
          pages: [161, 162, 163],
          intro:
            "Vapour to liquid, and vapour straight to ice.",
          diagramNotes: {
            162: "Smog over a city — condensation onto pollution particles trapped near the surface.",
          },
        },
        {
          title: "Evaporation and Sublimation",
          pages: [164, 165, 166],
          intro:
            "The changes of state in the other direction, and a table of all of " +
            "them together.",
          diagramNotes: {
            165: "Dry ice sublimating in a bowl — solid changing directly to gas.",
          },
        },
        {
          title: "Transpiration",
          pages: [167],
          intro:
            "The plant contribution to atmospheric moisture.",
          diagramNotes: {
            167: "Water drawn up through the roots and stem of a plant and evaporating from the leaves.",
          },
          context:
            "Transpiration is included because the atmosphere's moisture does not " +
            "all come from the sea. Vegetation draws water up from the soil and " +
            "evaporates it from the leaves, which is why a forested valley can be " +
            "more humid than the coast on the same afternoon, and why fog forms " +
            "readily over bush-clad country on a clear night.",
        },
        {
          title: "Relative Humidity",
          pages: [168, 169],
          intro:
            "The ratio, what it is a ratio of, and why it changes when nothing has " +
            "been added or removed.",
          diagramNotes: {
            168: "Saturation water content against temperature: the amount of water vapour a parcel can hold rising steeply as the temperature rises.",
          },
        },
        {
          title: "Dew Point",
          pages: [170, 171],
          intro:
            "The temperature at which a parcel saturates, and the two things that " +
            "move relative humidity.",
          takeaway:
            "Relative humidity and dew point answer different questions, and " +
            "confusing them is the most common error in this chapter. Dew point is " +
            "a measure of how much water vapour is actually there and it barely " +
            "changes through a day. Relative humidity is how close the air is to " +
            "holding all it can, and it swings through a day because the " +
            "temperature does. A temperature and dew point converging is the useful " +
            "signal — for fog, for cloud base, and for carburettor ice.",
        },
        {
          title: "Air Density",
          pages: [172, 173, 174],
          intro:
            "What density is, and the first thing that changes it: pressure.",
          diagramNotes: {
            174: "Molecules of air against a wall at low pressure and at high pressure, with the pressure gauge reading for each.",
          },
        },
        {
          title: "Density, Temperature and Altitude",
          pages: [175, 176, 177, 178],
          intro:
            "Two more factors, and a summary of how the three work together.",
          diagramNotes: {
            176: "Warm air with its molecules far apart, moving a lot and less dense, beside cold air with its molecules close together and more dense.",
          },
        },
        {
          title: "Moist Air and Density",
          pages: [179, 180],
          intro:
            "The result that surprises everybody: moist air is less dense than dry " +
            "air.",
          diagramNotes: {
            180: "The impact of water content on air pressure: a water molecule weighing less than the nitrogen and oxygen molecules it replaces, so that replacing them lowers the density and the pressure.",
          },
          misconception:
            "Assuming humid air is heavy air because it feels heavy. A water " +
            "molecule has less mass than the nitrogen and oxygen molecules it " +
            "displaces, so adding water vapour makes a parcel lighter, not heavier. " +
            "A hot, humid day is therefore the worst possible combination for " +
            "aircraft performance — low density from the heat and lower still from " +
            "the moisture.",
        },
      ],
    },

    {
      title: "Atmospheric Stability",
      syllabus: ["8.18"],
      intro:
        "The most demanding chapter in the subject, and the one everything " +
        "else about cloud depends on. It comes down to a single comparison: " +
        "how fast the surrounding air cools with height against how fast a " +
        "rising parcel cools itself.",
      topics: [
        {
          title: "Types of Stability",
          pages: [182, 183, 184, 185],
          intro:
            "Stable, unstable and neutrally stable, defined by what a parcel does " +
            "after it is disturbed.",
          keyPoints: [
            "Stable air: after a disturbance, a parcel returns or wants to return to its original level. It gives layer cloud, drizzle or rain, and fair to poor visibility.",
            "Unstable air: after a disturbance, a parcel keeps moving away from where it started. It gives cumuliform cloud, showers, and very good visibility between them.",
            "Conditionally unstable air: stable while the parcel is dry, and unstable once it becomes saturated. It is the commonest state of the atmosphere, and it is why a benign morning can turn into a showery afternoon with nothing else having changed.",
          ],
        },
        {
          title: "The Environmental Lapse Rate",
          pages: [186, 187],
          intro:
            "The lapse rate of the air that is actually there, and how much it " +
            "varies.",
          diagramNotes: {
            186: "The environmental lapse rate plotted as temperature against altitude for a particular place and time.",
            187: "A family of environmental lapse rates from steep to shallow, plotted on the same axes.",
          },
        },
        {
          title: "The Adiabatic Lapse Rate",
          pages: [188],
          intro:
            "What adiabatic means, and why a rising parcel cools without losing any " +
            "heat.",
          term: "Adiabatic process",
          definition:
            "A temperature change in which no heat is added to or taken from the " +
            "parcel of air; the temperature changes because the parcel expands or " +
            "is compressed.",
        },
        {
          title: "Rising Dry Air",
          pages: [189, 190, 191, 192, 193, 194],
          intro:
            "The dry adiabatic lapse rate against the environmental lapse rate, " +
            "worked both ways, with the graph for each case.",
          diagramNotes: {
            190: "A parcel rising against a hill, ending colder than the surrounding air and sinking back.",
            191: "The same case as a graph: the DALR lying to the left of the ELR, so the parcel is colder than its environment at every level — stable.",
            192: "A parcel rising against a hill, ending warmer than the surrounding air and continuing to rise.",
            193: "The same case as a graph: the DALR lying to the right of the ELR, so the parcel is warmer than its environment — unstable.",
          },
        },
        {
          title: "Rising Saturated Air",
          pages: [195, 196, 197, 198, 199, 200, 201],
          intro:
            "The same comparison once the parcel has saturated and the latent heat " +
            "of condensation has started to slow its cooling.",
          diagramNotes: {
            196: "The saturated adiabatic lapse rate compared with the dry adiabatic lapse rate on the same axes, the saturated rate the shallower of the two.",
            197: "A saturated parcel rising at the SALR against a steep environmental lapse rate.",
            198: "The same case as a graph.",
            199: "A saturated parcel rising at the SALR against a shallow environmental lapse rate.",
            200: "The same case as a graph.",
          },
          context:
            "The reason the saturated rate is shallower is worth holding on to, " +
            "because it makes the rest of the chapter make sense. A saturated " +
            "parcel is condensing as it rises, and condensation releases latent " +
            "heat into the parcel. That heat partly offsets the cooling from " +
            "expansion, so the parcel cools more slowly — which means it stays " +
            "warmer than its surroundings for longer, which means it keeps rising " +
            "for longer. Saturated air is more unstable than dry air, and that is " +
            "where cumulonimbus comes from.",
        },
        {
          title: "Combining Dry and Saturated Air",
          pages: [202, 203, 204],
          intro:
            "Absolute stability, absolute instability and the conditional case in " +
            "between.",
          diagramNotes: {
            203: "An environmental lapse rate lying between the DALR and the SALR — conditional instability, stable while the parcel is dry and unstable once it saturates.",
            204: "A steep and a shallow environmental lapse rate compared with the DALR and SALR on one set of axes.",
          },
          takeaway:
            "Conditional instability is the state most days are in, and it is the " +
            "one to understand rather than memorise. The air is stable as long as " +
            "the parcel stays dry, and turns unstable the moment it saturates. That " +
            "is why a morning of harmless fair-weather cumulus can become an " +
            "afternoon of towering cumulus without the environment changing at all " +
            "— only the parcel reaching its condensation level sooner.",
        },
        {
          title: "The Rising Condensation Level",
          pages: [205, 206, 207, 208],
          intro:
            "Where cloud forms when air is lifted mechanically, and what the " +
            "stability decides about the cloud's shape.",
          diagramNotes: {
            206: "The dry adiabatic lapse rate and the dew point line converging, with cloud forming where they meet.",
            207: "Air unstable from the start, producing cumulus cloud from the condensation level upward.",
          },
        },
        {
          title: "The Convective Condensation Level",
          pages: [209, 210, 211],
          intro:
            "The same idea for air lifted by surface heating rather than by " +
            "terrain.",
          diagramNotes: {
            210: "Convective cloud forming above the convective condensation level, with the tops unpredictable.",
            211: "The DALR from a warmed surface meeting the dew point line at the convective condensation level.",
          },
        },
        {
          title: "Required Surface Temperature",
          pages: [212, 213],
          intro:
            "Working backwards: the surface temperature needed before convective " +
            "cloud will form at all.",
          diagramNotes: {
            212: "The construction: the dew point carried up to the environmental lapse rate to find the condensation level, and the DALR taken back down from there to the surface temperature required.",
            213: "The same construction with the crossing point and the resulting height marked.",
          },
        },
        {
          title: "Convective Stability",
          pages: [214],
          intro:
            "A layer that changes its stability as a whole when it is lifted.",
          diagramNotes: {
            214: "A 3000-foot layer lifted bodily over terrain, with its lapse rate changing from absolutely unstable to stable as the layer is stretched.",
          },
        },
        {
          title: "Diurnal Variation of Stability",
          pages: [215],
          intro:
            "How the whole picture changes between dawn and mid-afternoon.",
        },
      ],
    },

    {
      title: "Inversions",
      syllabus: ["8.20"],
      intro:
        "A layer where the temperature rises with height instead of falling. " +
        "It is the most stable thing the atmosphere produces, and almost every " +
        "consequence of it — trapped haze, low cloud, windshear, carburettor " +
        "ice — is a problem for a VFR pilot.",
      topics: [
        {
          title: "Inversions and Weather",
          pages: [217],
          intro:
            "What an inversion is, and what it does to the air beneath it.",
        },
        {
          title: "Inversion Windshear",
          pages: [218, 219],
          intro:
            "The shear across the top of the inversion, and why the calm surface " +
            "wind is misleading.",
          diagramNotes: {
            218: "Warm air over cold calm air at an inversion, with the rotors and shear along the boundary between them.",
            219: "The temperature profile through an inversion, with the smooth air above and the trapped layer below.",
          },
        },
        {
          title: "Types of Inversion",
          pages: [220],
          intro:
            "The four kinds, named for what causes each.",
          context:
            "The list is short and the names give the cause away, which makes this " +
            "a good place to fix the whole chapter in your head before the detail " +
            "arrives. Radiation is the ground cooling overnight; turbulence is " +
            "mechanical mixing evening out a layer; subsidence is air sinking in a " +
            "high and warming as it goes; frontal is warm air lying over cold at a " +
            "frontal surface. Each of the four topics that follows fills one of " +
            "those in, and they differ mostly in where in the vertical the " +
            "inversion sits.",
        },
        {
          title: "Radiation Inversion",
          pages: [221, 222],
          intro:
            "The overnight inversion, and the conditions it needs.",
          diagramNotes: {
            222: "A radiation inversion under clear skies and light winds: long-wave radiation from the cooling ground, and the temperature profile showing the inversion in the lowest thousand feet or so.",
          },
        },
        {
          title: "Turbulence Inversion",
          pages: [223, 224, 225],
          intro:
            "The inversion made at the top of a mixed friction layer.",
          diagramNotes: {
            225: "A turbulence inversion: turbulent mixing through the friction layer cooling the bottom and warming the top, with stratocumulus at the inversion and the original lapse rate shown for comparison.",
          },
        },
        {
          title: "Subsidence Inversion",
          pages: [226, 227, 228, 229],
          intro:
            "The inversion made by air sinking in an anticyclone, and how it " +
            "develops.",
          diagramNotes: {
            228: "The temperature profile through a subsidence inversion, with the inversion aloft and the surface layer beneath it.",
            229: "Dry, warming subsiding air above a surface anticyclone, with weak convection beneath, and the inversion between them at around 4,000 feet.",
          },
        },
        {
          title: "Frontal Inversion",
          pages: [230, 231, 232],
          intro:
            "The inversion at a frontal surface, where warm air lies over cold.",
          diagramNotes: {
            231: "Advancing warm air riding over less cold and cold air, with the temperature sampled at three points through the frontal surface.",
            232: "Warm air over cold air at a frontal surface, and the temperature profile showing the inversion at the frontal boundary.",
          },
        },
        {
          title: "Effects of Inversions",
          pages: [233, 234, 235, 236, 237, 238, 239],
          intro:
            "Cloud, visibility, turbulence, dew point, carburettor ice, windshear " +
            "and aircraft performance — seven consequences of one temperature " +
            "profile.",
          takeaway:
            "Every item on this list follows from one thing: an inversion is a lid. " +
            "Nothing crosses it — not moisture, not pollution, not the vertical " +
            "motion that would otherwise mix the layer. So everything the surface " +
            "produces stays underneath it and accumulates, which is why the " +
            "visibility goes, the cloud spreads into a layer, and the humidity " +
            "underneath is high enough for carburettor ice on a day that looks " +
            "clear.",
        },
      ],
    },

    {
      title: "Cloud",
      syllabus: ["8.22"],
      intro:
        "What cloud is, the four ways air is made to rise, and the ten types " +
        "the international system recognises. Recognising cloud is the most " +
        "directly useful skill in this subject: the type tells you what the " +
        "air is doing without a single instrument.",
      topics: [
        {
          title: "What Cloud Is",
          pages: [241, 242],
          intro:
            "Suspended water and ice, and the sequence that produces it.",
          diagramNotes: {
            242: "The sequence of cloud formation: air lifted by convection, orography, turbulence or widespread ascent, expanding as the pressure falls, cooling as it expands, reaching saturation point, and the water vapour condensing out.",
          },
        },
        {
          title: "Cloud Sensors",
          pages: [243, 244, 245],
          intro:
            "How an automatic station measures cloud base, and what it cannot see.",
          diagramNotes: {
            245: "A ceilometer installation on its stand.",
          },
          takeaway:
            "The whole of this topic reduces to one caution. A ceilometer fires a " +
            "narrow laser beam straight up and reports what passes through that " +
            "one column of air. It is accurate about the cloud directly above the " +
            "sensor and knows nothing about the cloud half a mile away, so an " +
            "automatic cloud report is a sample rather than a survey - which is " +
            "exactly the limitation that matters when the sky is broken and " +
            "moving.",
        },
        {
          title: "Ways Air Rises",
          pages: [246],
          intro:
            "The four mechanisms, which between them account for every cloud.",
        },
        {
          title: "Orographic Rising",
          pages: [247],
          intro:
            "Air lifted over terrain, and the different cloud it makes in stable " +
            "and unstable conditions.",
          diagramNotes: {
            247: [
              "Orographic cloud in stable conditions: a cap cloud over the ridge with the wind flowing across it.",
              "Orographic cloud in unstable conditions: cumuliform cloud building over the ridge with precipitation on the windward side.",
            ],
          },
        },
        {
          title: "Convective and Turbulent Rising",
          pages: [248, 249],
          intro:
            "Air lifted by surface heating, and air tumbled upward over obstacles.",
        },
        {
          title: "Frontal Lifting",
          pages: [250],
          intro:
            "Widespread ascent at a front, and the cloud sequence it produces.",
          diagramNotes: {
            250: "A cross-section through the frontal cloud: cirrus and cirrostratus ahead, altostratus and nimbostratus through the warm front, cumulus and cumulonimbus at the cold front, with the freezing level and the air masses labelled.",
          },
        },
        {
          title: "Cloud Persistence and Evaporation",
          pages: [251, 252],
          intro:
            "What happens to a cloud once it has formed, and to the drops that " +
            "fall out of it.",
        },
        {
          title: "Cloud Classification",
          pages: [253, 254],
          intro:
            "The international system: by height, and by the words used to build " +
            "the names.",
          diagramNotes: {
            254: "The cloud prefixes and their meanings: stratus a layer, cumulus a pile, cirrus a curl or hair, nimbus rain-bearing, and alto middle-level.",
          },
          takeaway:
            "The naming system is a description, not a list to memorise. Once you " +
            "know that stratus means a layer, cumulus a heap, cirrus a curl or " +
            "hair, nimbus heavy rain and alto the middle level, every one of the " +
            "ten names tells you what the cloud looks like and what the air is " +
            "doing — altocumulus is a middle-level heap, nimbostratus is a raining " +
            "layer, cumulonimbus is a raining heap.",
          keyPoints: [
            "Cumulus, or cumulo- as a prefix, means heaped: cloud built by convective up-currents, with a flat base and a lumpy top.",
            "Stratus, or strato-, means a layer: cloud made by slow, gradual lifting, spread out sheet-like.",
            "Cirrus, or cirro-, means a curl or hair: high cloud, streaky in appearance, made entirely of ice crystals.",
            "Nimbus, or nimbo-, means rain: attached to a cloud type that produces heavy precipitation.",
            "Alto- means middle: a cloud found in the middle levels of the troposphere.",
          ],
        },
        {
          title: "Cloud Levels",
          pages: [255],
          intro:
            "The height bands high, middle and low cloud occupy, and how they " +
            "change with latitude.",
        },
        {
          title: "High Cloud",
          pages: [256, 257],
          intro:
            "Cirrostratus and cirrocumulus: what each looks like and what it is " +
            "made of.",
          diagramNotes: {
            256: "Cirrostratus: a smooth, fibrous veil across the sky.",
            257: [
              "Cirrocumulus: small cotton-wool elements in a regular pattern.",
              "The same cloud filling the sky.",
            ],
          },
        },
        {
          title: "Middle Cloud",
          pages: [258, 259],
          intro:
            "Altostratus and altocumulus.",
          diagramNotes: {
            258: "Altostratus: an extensive grey layer, thick enough to hide the sun.",
            259: "Altocumulus: a layer of separate cloud patches at middle level.",
          },
        },
        {
          title: "Low Cloud",
          pages: [260, 261, 262],
          intro:
            "Stratocumulus, stratus and cumulus.",
          diagramNotes: {
            260: "Stratocumulus: a layer or patches of heaped low cloud.",
            261: "Stratus: a shallow layer resembling fog lifted off the ground.",
            262: "Cumulus: heaped cloud with sharp outlines and flat bases.",
          },
        },
        {
          title: "Cumulonimbus and Nimbostratus",
          pages: [263, 264, 265],
          intro:
            "The two rain-bearing types, and the very different air each comes " +
            "from.",
          diagramNotes: {
            263: "Cumulonimbus: great vertical development with an anvil spreading at the top.",
            264: "Nimbostratus: a low, shapeless layer of dark grey cloud.",
            265: "The cloud types arranged by height: cirrostratus, cirrus and cirrocumulus above, altostratus, nimbostratus and altocumulus in the middle, stratocumulus, stratus and cumulus below, and cumulonimbus through all three.",
          },
        },
        {
          title: "Towering Cumulus and Cumulonimbus",
          pages: [266, 267, 268],
          intro:
            "The stages of vertical development, photographed.",
          diagramNotes: {
            266: "Towering cumulus: a cumulus cloud grown taller than it is wide, with hard cauliflower edges and no anvil yet.",
            267: "A mature cumulonimbus at night, with lightning inside it.",
            268: "A cumulonimbus with a fully developed anvil spreading downwind at the tropopause.",
          },
          context:
            "These three photographs are the same process at three stages, and " +
            "learning to tell them apart from the cockpit is worth more than any " +
            "definition. A cumulus growing taller than it is wide, with hard " +
            "cauliflower edges, is a towering cumulus and the air in it is going " +
            "up fast. When the top loses its sharpness and spreads into an anvil, " +
            "the cloud has reached the tropopause and become a cumulonimbus - and " +
            "by then it contains everything the thunderstorm chapter warns about.",
        },
        {
          title: "Altocumulus Lenticularis",
          pages: [269, 270, 271],
          intro:
            "The lens-shaped cloud that marks a mountain wave, and the conditions " +
            "that produce it.",
          diagramNotes: {
            270: "A lenticular cloud, smooth and lens-shaped, standing still in a strong flow.",
            271: "A stack of lenticular clouds capping a mountain.",
          },
        },
        {
          title: "Rotor Cloud",
          pages: [272, 273, 274, 275],
          intro:
            "The closed circulation in the lee of a range, and what it looks like " +
            "from the air.",
          diagramNotes: {
            273: "Lenticular cloud above and rotor cloud beneath it in the lee of a range.",
            274: "A photograph of a lee wave system with the primary and secondary rotor clouds marked, and the roll cloud identified.",
            275: "The mountain wave system in diagram: wind speed increasing with altitude, lenticular clouds at the crest of the primary, secondary and tertiary waves, and a turbulent rotor beneath each, with the areas of lift and sink marked.",
          },
        },
        {
          title: "Oktas and Cloud Reports",
          pages: [276, 277],
          intro:
            "How cloud cover is reported, and which layers are included.",
          diagramNotes: {
            277: "A ceilometer mast — the instrument that produces an automatic cloud report.",
          },
        },
        {
          title: "Cloud Dispersal",
          pages: [278, 279],
          intro:
            "What makes cloud go away, and the main mechanism behind it.",
        },
      ],
    },

    {
      title: "Precipitation",
      syllabus: ["8.24"],
      intro:
        "How cloud droplets, which are far too small to fall, turn into " +
        "raindrops that are not. Two processes do it, and which one operates " +
        "tells you what will reach the ground.",
      topics: [
        {
          title: "What Precipitation Is",
          pages: [281],
          intro:
            "The definition, and the condensation that produces it.",
        },
        {
          title: "The Bergeron Process",
          pages: [282, 283],
          intro:
            "Ice crystals growing at the expense of supercooled water droplets.",
          diagramNotes: {
            283: "The Bergeron process: cloud droplets and water molecules around an ice crystal, the crystal growing as vapour deposits onto it and the droplets evaporate to feed it, until it falls as a snow crystal.",
          },
        },
        {
          title: "Collision and Coalescence",
          pages: [284, 285],
          intro:
            "The warm-cloud process, and why collisions do not always produce a " +
            "bigger drop.",
          diagramNotes: {
            285: "Growth by collision, where a falling drop sweeps up the droplets in its path, beside growth by sweeping, where a droplet is carried around the falling drop in its airflow.",
          },
        },
        {
          title: "Virga",
          pages: [286],
          intro:
            "Precipitation that never reaches the ground, and what it tells you " +
            "about the air below the cloud.",
          diagramNotes: {
            286: "Virga: trails of precipitation falling from a cloud base and evaporating before they reach the ground.",
          },
        },
        {
          title: "Rate of Fall and Types of Precipitation",
          pages: [287, 288],
          intro:
            "What decides how fast a drop falls, and the forms precipitation " +
            "arrives in.",
        },
        {
          title: "Character and Rate of Precipitation",
          pages: [289, 290],
          intro:
            "Continuous, intermittent and showery, and what decides how hard it " +
            "falls.",
          takeaway:
            "The character of the precipitation is a direct report on the stability " +
            "of the air that made it. Continuous rain from a layer means stable air " +
            "being lifted gently over a wide area; showers that start and stop mean " +
            "unstable air and individual convective cells. Hearing “showers” in a " +
            "forecast is hearing “unstable”, with everything that implies about " +
            "turbulence and about the gaps between them.",
        },
      ],
    },

    {
      title: "Visibility",
      syllabus: ["8.26"],
      intro:
        "Everything that gets between a pilot and the thing they are looking " +
        "for. For a VFR licence this is not a background topic — it is the " +
        "single most common reason a flight has to be abandoned.",
      topics: [
        {
          title: "What Visibility Is",
          pages: [292, 293],
          intro:
            "The definition, and the reductions different intensities of " +
            "precipitation produce.",
          misconception:
            "Expecting visibility to improve because it is a bright day, or to be " +
            "reported as worse at night. It is neither. Visibility is a measure " +
            "of how far the air lets you see, and what limits it is the loss of " +
            "contrast as light is scattered by whatever is suspended in the air " +
            "between you and the object. Adding illumination from the sun or the " +
            "moon brightens the object and brightens the haze in front of it by " +
            "the same proportion, so the contrast between them - and therefore " +
            "the distance at which the object disappears - is unchanged. " +
            "Prevailing visibility in a report is the same figure by day and by " +
            "night for that reason. What does change at night is your ability to " +
            "find an unlit object at all, which is a different problem with a " +
            "different answer.",
        },
        {
          title: "Drizzle and Snow",
          pages: [294],
          intro:
            "Why these two reduce visibility more than rain does for the same " +
            "amount of water.",
        },
        {
          title: "Fog, Mist, Haze and Smoke",
          pages: [295, 296],
          intro:
            "Four obscurations, and what each is made of.",
        },
        {
          title: "Sea Spray",
          pages: [297],
          intro:
            "What breaking waves put into the air, and what it does to visibility " +
            "at low level.",
        },
        {
          title: "Blowing and Drifting Snow",
          pages: [298, 299, 300, 301, 302, 303],
          intro:
            "The wind speeds that lift snow, the visibility that results, and the " +
            "difference between blowing and drifting.",
          diagramNotes: {
            300: "Blowing snow across a runway, with visibility reduced to a few hundred metres.",
            301: "A blizzard: an aircraft on a taxiway barely visible through blowing snow.",
            303: "A line of people on a snowfield, visible only as red dots — the loss of contrast that comes with a snow-covered surface.",
          },
        },
        {
          title: "Visibility Range and Whiteout",
          pages: [304, 305],
          intro:
            "What background colour does to visual range, and the condition where " +
            "there is no contrast at all.",
          diagramNotes: {
            305: "Whiteout: a snow-covered surface under an overcast sky with no horizon and no shadow to judge height by.",
          },
        },
        {
          title: "Slant Range and Runway Visual Range",
          pages: [306, 307],
          intro:
            "Why the visibility looking down is not the visibility reported, and " +
            "what RVR measures.",
          diagramNotes: {
            306: "Slant range: an aircraft overhead an aerodrome seeing straight down through a shallow layer, and the same aircraft on approach looking through much more of it.",
          },
          misconception:
            "Trusting a reported visibility on the approach. The report is a " +
            "horizontal measurement made at the surface; the view from the flight " +
            "deck on final is a slant path through the whole depth of the " +
            "obscuration. In shallow fog you can see the runway clearly from " +
            "overhead and lose it completely at 300 feet on final, with the " +
            "reported visibility unchanged.",
        },
        {
          title: "Altitude and Visibility",
          pages: [308],
          intro:
            "Why the air is clearer higher up, and what that does to distance " +
            "judgement.",
        },
        {
          title: "Visibility Sensors",
          pages: [309, 310, 311],
          intro:
            "How an automatic station measures visibility, and the limitation " +
            "built into it.",
          diagramNotes: {
            311: [
              "A forward scatter meter on its mast at an aerodrome.",
              "The principle: a transmitter and a receiver angled at each other, measuring the light scattered out of the beam by the air between them.",
            ],
          },
        },
      ],
    },

    {
      title: "Fog",
      syllabus: ["8.26"],
      intro:
        "Cloud in contact with the ground. There are several kinds, they form " +
        "for different reasons, and they clear at different times — which is " +
        "what makes them a planning problem rather than a weather problem.",
      topics: [
        {
          title: "Types of Fog",
          pages: [314, 315],
          intro:
            "The forms fog takes, and the one thing they all rely on.",
        },
        {
          title: "Radiation Fog",
          pages: [316, 317, 318],
          intro:
            "The most common kind in New Zealand: how a clear night makes it, and " +
            "what keeps the droplets in suspension.",
          diagramNotes: {
            318: "Radiation fog lying in a valley on a still morning, with the tops of the trees clear above it.",
          },
          takeaway:
            "Radiation fog needs three things at once: a clear night for the " +
            "ground to radiate its heat away, light wind to mix the cooled air " +
            "through a shallow layer without dispersing it, and enough moisture " +
            "for the air to reach its dew point. Take any one away and it does " +
            "not form. That is also how you forecast it the evening before - a " +
            "clear, calm, damp night after a wet day is the classic set-up, and " +
            "it is the one that closes aerodromes at dawn.",
        },
        {
          title: "Advection Fog",
          pages: [319, 320, 321, 322],
          intro:
            "Fog made by moving air rather than by cooling ground, and why it is " +
            "harder to get rid of.",
          diagramNotes: {
            321: "Advection fog over a coast, with the moist air moving in from the sea across the colder surface.",
            322: "Advection of moist air over a cold surface, producing advection fog.",
          },
          context:
            "The difference between the two main kinds is the difference between a " +
            "delay and a diversion. Radiation fog is made by the ground cooling " +
            "overnight and is destroyed by the sun warming it again, so it usually " +
            "burns off during the morning. Advection fog is made by warm moist air " +
            "moving over a cold surface, and the sun does nothing to the surface " +
            "underneath it — it clears when the wind changes, which may be tomorrow.",
        },
        {
          title: "Operational Impacts of Fog",
          pages: [323],
          intro:
            "What it does to an operation, and how far the visibility can fall.",
        },
        {
          title: "Katabatic Winds and Fog",
          pages: [324],
          intro:
            "How a drainage wind moves fog down a valley, and where it ends up.",
        },
      ],
    },

    {
      title: "Icing",
      syllabus: ["8.28"],
      intro:
        "Ice on the airframe and ice in the carburettor. The first is " +
        "avoidable by not flying in the conditions that cause it; the second " +
        "happens on warm clear days and is the one that catches private " +
        "pilots.",
      topics: [
        {
          title: "Dangers of Aircraft Icing",
          pages: [326, 327],
          intro:
            "What ice does to lift, thrust, weight and control, and what ice " +
            "crystals do at altitude.",
          context:
            "The list is long and it comes down to four separate attacks on the " +
            "aeroplane at once. Ice changes the shape of the wing, so it makes " +
            "less lift and stalls earlier and at a higher speed than the book " +
            "says. It adds weight. It adds drag, and it can block a pitot head or " +
            "a static port, so the instruments that would tell you what is " +
            "happening stop telling you. Any one of those is manageable; the " +
            "reason icing kills aeroplanes is that they arrive together and get " +
            "worse while you think about it.",
        },
        {
          title: "Clear Ice",
          pages: [328, 329, 330],
          intro:
            "How a large supercooled droplet freezes, and the kind of ice that " +
            "results.",
          diagramNotes: {
            329: "A large supercooled drop and a small one striking a leading edge: instant freezing at the point of contact and progressive freezing as the remainder flows back, with both drops supercooled at −5 °C.",
            330: "Clear ice on an upper wing surface — a smooth, transparent sheet following the contour.",
          },
        },
        {
          title: "Rime Ice",
          pages: [331, 332, 333],
          intro:
            "The faster-freezing case, and the very different ice it makes.",
          diagramNotes: {
            332: "The same drops at −20 °C: freezing on contact with almost no run-back, building a rough opaque deposit.",
            333: "Rime ice on the leading edge and spinner of an aircraft in flight, rough and white.",
          },
          takeaway:
            "The difference is temperature and drop size, and it decides which " +
            "problem you have. Clear ice runs back before it freezes, so it is " +
            "heavy, hard to shed and forms beyond the protected area. Rime freezes " +
            "on contact, so it is lighter and stays where it lands but wrecks the " +
            "shape of the leading edge. Neither is survivable for long in an " +
            "aeroplane with no de-icing.",
        },
        {
          title: "Hoar Frost",
          pages: [334, 335, 336, 337],
          intro:
            "Frost on a parked aircraft, frost in flight, and why it must be gone " +
            "before takeoff.",
          diagramNotes: {
            336: "Hoar frost on the upper surface of a wing at sunrise.",
          },
          takeaway:
            "Hoar frost is dangerous out of proportion to how much of it there " +
            "is. A layer thin enough to see the paint through disrupts the " +
            "airflow over the wing enough to cost lift and add stalling speed, " +
            "and the rule is absolute: it must be gone before takeoff, not " +
            "reduced, not polished smooth. The in-flight case is different and " +
            "worth knowing separately - a cold-soaked aircraft descending into " +
            "warm moist air can pick up frost on the outside of the windscreen at " +
            "exactly the moment you need to see through it.",
        },
        {
          title: "Freezing Rain",
          pages: [338, 339],
          intro:
            "The temperature structure that produces it, and why it is the worst " +
            "icing there is.",
          diagramNotes: {
            339: "The vertical structure that produces freezing rain: a warm layer above a sub-freezing layer, with the segment of freezing precipitation between the freezing levels, and an aircraft flying through it.",
          },
        },
        {
          title: "Snow, Sleet and Hail",
          pages: [340, 341, 342],
          intro:
            "What each does on an airframe in flight.",
          takeaway:
            "Three forms of frozen precipitation, three different problems. Dry " +
            "snow largely blows off an airframe in flight and blocks your view of " +
            "the world; sleet is wet and sticks; hail does mechanical damage - to " +
            "windscreens, leading edges and radomes - and it is the one you can " +
            "meet in clear air, thrown out of the anvil of a storm you thought " +
            "you were avoiding.",
        },
        {
          title: "Rate of Ice Accretion",
          pages: [343, 344, 345],
          intro:
            "What decides how fast ice builds, and where in a cloud it builds " +
            "fastest.",
          diagramNotes: {
            344: "Airframe icing in relation to the freezing level and the cloud structure, with the area of most rapid accretion marked.",
            345: "An ice-covered pitot head — the instrument failure that follows the airframe icing.",
          },
        },
        {
          title: "Flight Above Cloud",
          pages: [346, 347, 348],
          intro:
            "How supercooled droplets get to the tops, and the risk of flying " +
            "just above them.",
          context:
            "The reason this has a topic of its own is that flying just above a " +
            "cloud layer feels like the safe option and is often the icing one. " +
            "The tops of a growing layer are where the supercooled water is being " +
            "carried highest, so an aircraft skimming them is flying through the " +
            "part of the cloud with the most liquid water in it at the coldest " +
            "temperature. If lifting is being forced - over terrain, or at a " +
            "front - the tops rise while you are flying along them.",
        },
        {
          title: "Avoiding Icing",
          pages: [349],
          intro:
            "The short answer, and why for a VFR pilot it is the only answer.",
        },
        {
          title: "Carburettor Icing",
          pages: [350, 351, 352],
          intro:
            "The two processes that cool a carburettor below freezing, and where " +
            "the ice forms.",
          diagramNotes: {
            351: "The throttle plate in the carburettor throat, where the venturi effect and fuel vaporisation both cool the airflow.",
            352: "Carburettor icing at various power settings: the venturi and throttle plate at cruise power and at idle, with the ice forming around the partly closed plate at low power.",
          },
        },
        {
          title: "Factors Affecting Carburettor Ice",
          pages: [353, 354, 355],
          intro:
            "Moisture content, temperature gradient, and the chart that combines " +
            "them.",
          diagramNotes: {
            355: "The carburettor icing chart: outside air temperature against dew point, with the bands for serious icing at any power, moderate icing at cruise power, serious icing at descent power, and light icing.",
          },
          context:
            "The thing to take from the chart is how warm the dangerous conditions " +
            "are. Serious carburettor icing at descent power is possible on a day " +
            "that is well above freezing and looks completely benign, because the " +
            "cooling happens inside the carburettor rather than outside the " +
            "aeroplane. A high relative humidity and a closed throttle are all it " +
            "needs, which is exactly the configuration of a glide approach.",
        },
        {
          title: "Carburettor Ice on the Ground",
          pages: [356],
          intro:
            "What idling on the ground does, and why it is a problem before you " +
            "have left.",
        },
        {
          title: "Classification of Icing",
          pages: [357],
          intro:
            "Light, moderate, severe — the scale used in reports and forecasts.",
        },
      ],
    },

    {
      title: "Thunderstorms",
      syllabus: ["8.30"],
      intro:
        "The most hazardous weather a light aircraft can meet, gathered into " +
        "one place. Everything a thunderstorm produces — turbulence, gusts, " +
        "icing, hail, lightning, downdraughts — is individually enough to " +
        "destroy an aeroplane.",
      topics: [
        {
          title: "Thunderstorm Requirements",
          pages: [359, 360],
          intro:
            "The three ingredients, and the trigger that sets them off.",
        },
        {
          title: "Stages of a Thunderstorm",
          pages: [361, 362, 363, 364, 365, 366],
          intro:
            "Growing, mature and decaying — the life cycle, and what is happening " +
            "inside at each stage.",
          diagramNotes: {
            361: "The growing stage: strong updraughts throughout the cell carrying water droplets upward past the freezing level.",
            362: "The towering cumulus stage, with the updraughts and the heights marked.",
            363: "The mature stage: updraughts and downdraughts side by side, precipitation falling, and the freezing level crossed.",
            364: "The mature stage with the cloud structure, updraughts and downdraughts and the temperatures at each level.",
            365: "The decaying stage: downdraughts throughout, the updraughts gone, and the anvil spreading.",
            366: "The dissipating stage with the downdraughts and heights marked.",
          },
          takeaway:
            "The mature stage is the dangerous one and it is the stage where the " +
            "cell looks most impressive from outside — an updraught and a " +
            "downdraught running side by side inside one cloud, with the shear " +
            "between them. That is not weather to be flown through in any aircraft, " +
            "and in a light one it is not survivable.",
        },
        {
          title: "Turbulence and Draughts",
          pages: [367, 368],
          intro:
            "The most serious hazard, and the vertical speeds involved.",
          diagramNotes: {
            368: "Updraughts and downdraughts side by side with the turbulence in the shear between them.",
          },
        },
        {
          title: "Gusts and the Gust Front",
          pages: [369, 370, 371, 372, 373],
          intro:
            "The cold outflow spreading ahead of the storm, and the windshear it " +
            "puts across an approach.",
          diagramNotes: {
            371: "The gust front: cold outflow spreading out beneath the cell, with the return flow and shear zone marked.",
            372: "An aircraft on approach through a downburst, with the required descent profile and the potential descent profile that results from the shear.",
            373: "The structure of a severe thunderstorm: overshooting top, anvil, mesocyclone, wall cloud, flanking line and rear-flank gust front.",
          },
        },
        {
          title: "Icing, Hail and Lightning",
          pages: [374, 375, 376, 377, 378],
          intro:
            "The rest of the hazard list, and the damage each does.",
          diagramNotes: {
            375: "Hailstones the size of golf balls, held in two hands.",
            376: "Hail damage to a flight deck windscreen, seen from inside.",
            377: "A radome destroyed by hail in flight.",
            378: "Lightning damage to the fabric and structure of a light aircraft.",
          },
        },
        {
          title: "Precautions",
          pages: [379],
          intro:
            "What to do about thunderstorms, in order of usefulness.",
        },
        {
          title: "Tornadoes",
          pages: [380, 381, 382],
          intro:
            "What they are, and where in New Zealand they are most likely.",
          diagramNotes: {
            382: "The formation sequence: wind shear aloft causing the cloud to tilt, a rotation created by the up and down draughts, a wall cloud developing, and the rotation re-aligning to the vertical as a tornado.",
          },
        },
      ],
    },

    {
      title: "Mountain Weather",
      syllabus: ["8.32"],
      intro:
        "New Zealand is a mountain range in the middle of a westerly wind " +
        "belt, so this is the chapter that describes the country. Föhn winds, " +
        "mountain waves, rotors, and what all of it means for a VFR flight " +
        "through the passes.",
      topics: [
        {
          title: "Föhn Winds",
          pages: [384, 385, 386],
          intro:
            "The warm dry wind on the lee side of a range, and the four conditions " +
            "it needs.",
          diagramNotes: {
            384: "A mountain range with cloud on the windward side and clear air in the lee.",
            385: "The Föhn wind mechanism: moist air lifted on the windward side, cooling at the saturated rate and precipitating, then descending on the lee side and warming at the dry rate.",
          },
        },
        {
          title: "Weather on the Windward Side",
          pages: [387],
          intro:
            "Cloud base, precipitation and visibility where the air is being " +
            "lifted.",
        },
        {
          title: "Weather Above and in the Lee",
          pages: [388, 389, 390, 394],
          intro:
            "Conditions over the ridge line, the very different conditions " +
            "immediately east of it, and the arithmetic that produces the " +
            "difference.",
          diagramNotes: {
            390: "The Föhn calculation worked on a 12,000 foot mountain. Air arrives at the coast at 18 °C with a dew point of 12 °C. It rises at the dry adiabatic lapse rate to a rising condensation level at 2,000 feet, where it is 12 °C and saturated. From there it rises at the saturated adiabatic lapse rate through the remaining 10,000 feet — a loss of 10 × 1.5 = 15 °C — reaching the summit at −3 °C, with a new dew point of +1.5 °C at 9,000 feet on the lee side. Descending 9,000 feet at the dry adiabatic lapse rate gains 9 × 3 = 27 °C, so the air arrives on the lee side at 27 + 1.5 = 28.5 °C.",
            394: "The dry case: air flowing over a 7,000 foot mountain with no condensation anywhere, cooling at the dry adiabatic lapse rate on the way up and warming at the same rate on the way down, arriving at 26 °C on the lee side — exactly the 26 °C it started at, with the dew point unchanged at 1 °C.",
          },
          takeaway:
            "The whole Föhn effect is the difference between two lapse rates. Air " +
            "climbing a range that condenses on the way up cools slowly, at the " +
            "saturated rate, because condensation keeps releasing latent heat into " +
            "it; the same air descending the other side has left its moisture " +
            "behind as rain and warms quickly, at the dry rate. It goes up cheaply " +
            "and comes down expensively, and the surplus is the nor'wester. Take " +
            "the condensation away — the second figure — and the two rates are the " +
            "same, and the air arrives back at the temperature it started at.",
        },
        {
          title: "Small Scale Interference",
          pages: [395],
          intro:
            "Buildings, shelter belts and small obstacles, and the turbulence they " +
            "make.",
        },
        {
          title: "Mountain Waves",
          pages: [396, 397, 398],
          intro:
            "The standing wave downwind of a range, and the cloud that marks it.",
          diagramNotes: {
            397: "The mountain wave system: wave crests with lenticular clouds, rotor zones beneath containing rotor cloud, the friction layer at the bottom, and rain-producing cloud on the windward side.",
          },
        },
        {
          title: "Wavelength and Amplitude",
          pages: [399, 400],
          intro:
            "What decides the spacing of the waves, and what decides how violent " +
            "they are.",
          diagramNotes: {
            399: [
              "Wavelength measured crest to crest, and amplitude measured trough to crest.",
              "A shallow flow over a gentle slope with almost no wave.",
              "The same flow over a steeper obstacle, producing a wave downstream.",
            ],
          },
        },
        {
          title: "Rotor Zones",
          pages: [401, 402, 403, 404],
          intro:
            "The closed circulation under each wave crest, and the turbulence in " +
            "it.",
          diagramNotes: {
            401: "A rotor zone beneath the first wave crest downwind of the range, with the cap cloud over the ridge.",
            403: "Rotor cloud in the lee of a range, ragged and rolling.",
            404: [
              "A stack of lenticular clouds over a range with rotor cloud beneath.",
              "The same system photographed from the ground.",
            ],
          },
        },
        {
          title: "Cloud and Dissipation",
          pages: [405, 406, 407],
          intro:
            "The cloud each side of the range, what makes a wave system stop, and " +
            "rotor streaming.",
          diagramNotes: {
            407: "Rotor streaming: a strong wind onto a range with the flow separating at the ridge and a series of eddies running downstream at low level.",
          },
        },
        {
          title: "VFR Flight in Mountainous Terrain",
          pages: [408, 409, 410, 411, 412],
          intro:
            "Cloud base, turbulence, wind, visibility — what each does in the " +
            "hills, and which side of the range each is worse on.",
          takeaway:
            "Everything in this long topic is one idea from several sides: in the " +
            "mountains the weather is different on the two sides of the range, " +
            "and it changes faster than you can fly. Cloud base is lower on the " +
            "windward side, turbulence is worse in the lee, the wind in a valley " +
            "is not the wind on the chart, and the visibility is poorest where " +
            "the air is being lifted. Plan the escape before the entry, and treat " +
            "a pass that is closing as closed.",
        },
        {
          title: "Track Selection",
          pages: [413, 414, 415],
          intro:
            "Choosing a route through the terrain, and the angle to cross a ridge " +
            "at.",
          diagramNotes: {
            415: "A checklist for mountain flying: know the aircraft's limitations and your own, be fully prepared, get a good forecast, study the route including spot heights for the saddles, consider whether the valley is wide enough for a safe turn, mark the route on the chart, brief the passengers, ensure suitable clothing and footwear, pre-flight thoroughly, plan escape routes, and have flight-following in place.",
          },
          takeaway:
            "Crossing a ridge at 45° rather than square-on is the single most " +
            "useful habit in this chapter, and the slide says why: the turn back " +
            "to safety is through a smaller angle, so it can be flown at a " +
            "shallower bank, with less wing loading and less ground to cover. " +
            "Square onto the ridge, the escape is a 180° reversal; at 45° it is " +
            "roughly half that. The turn is being planned before it is needed, " +
            "which is the only time it can be.",
        },
      ],
    },

    {
      title: "Air Masses and Fronts",
      syllabus: ["8.36"],
      intro:
        "Where the air over New Zealand has come from, what happens where two " +
        "different air masses meet, and the cloud and weather sequence each " +
        "kind of front produces.",
      topics: [
        {
          title: "Synoptic Observation",
          pages: [417],
          intro:
            "How the weather picture is assembled, and from what.",
        },
        {
          title: "Air Mass Categories",
          pages: [418, 419, 420],
          intro:
            "The categories, and the ones that do and do not reach New Zealand.",
        },
        {
          title: "Cold and Warm Advection",
          pages: [421, 422],
          intro:
            "Air moving over a surface warmer or colder than itself, and what each " +
            "does to stability.",
          diagramNotes: {
            422: [
              "Cold advection: air moving from the pole towards the Equator over progressively warmer oceans, becoming more unstable.",
              "Warm advection: air moving from the Equator towards the pole over progressively colder oceans, becoming more stable.",
            ],
          },
          takeaway:
            "This single idea explains most New Zealand weather. Air from the south " +
            "is moving over water warmer than itself, so it is heated from below, " +
            "becomes unstable, and gives showers with good visibility between them. " +
            "Air from the north is moving over cooler water, is cooled from below, " +
            "becomes stable, and gives layer cloud, drizzle and poor visibility. " +
            "The wind direction on the chart is most of the forecast.",
        },
        {
          title: "Depressions",
          pages: [423, 424, 425, 426],
          intro:
            "Mid-latitude and polar depressions, and how each forms.",
          diagramNotes: {
            424: "A mid-latitude depression with its warm and cold fronts and the warm sector between them.",
            426: "A polar depression forming through low-level convergence.",
          },
        },
        {
          title: "The Cold Front",
          pages: [427, 428],
          intro:
            "Cold air undercutting warm, and the characteristics that go with it.",
          diagramNotes: {
            428: "A cold front in cross-section, with the steep frontal surface, the cumuliform cloud along it and the clearance behind.",
          },
        },
        {
          title: "The Warm Front",
          pages: [429, 430, 431],
          intro:
            "Warm air overtaking cold, and the much longer, gentler cloud sequence " +
            "it produces.",
          diagramNotes: {
            429: "A warm front in cross-section, with the shallow frontal surface and the cirrus, cirrostratus, altostratus and nimbostratus sequence ahead of it.",
            431: "The warm and cold fronts of a depression drawn together, with the cloud sequence through both and the warm sector between.",
          },
        },
        {
          title: "Stationary and Occluded Fronts",
          pages: [432, 433, 434, 435],
          intro:
            "A front that has stopped, and what happens when a cold front catches " +
            "a warm one.",
          diagramNotes: {
            434: "The occlusion process shown as it develops.",
            435: [
              "A three-dimensional view of an occlusion, with the very cold, cold and warm air masses and the warm air lifted clear of the surface.",
              "The initial occlusion, with the warm air just lifted off the ground.",
              "A cold occlusion, with the coldest air undercutting both.",
            ],
          },
        },
        {
          title: "Southerly and Northerly Flow onto New Zealand",
          pages: [437, 438],
          intro:
            "The two dominant flows, and the weather each brings.",
        },
      ],
    },

    {
      title: "Windshear and Turbulence",
      syllabus: ["8.40"],
      intro:
        "The mechanical side of the weather: air that changes speed or " +
        "direction faster than an aeroplane can adjust to. Windshear on the " +
        "approach, turbulence from terrain and thermals, and wake turbulence " +
        "from the aircraft ahead.",
      topics: [
        {
          title: "Windshear",
          pages: [442, 443],
          intro:
            "The definition, and where it is met.",
          term: "Windshear",
          definition:
            "A sudden change in wind speed and/or direction over a short distance, " +
            "in either the horizontal or the vertical.",
        },
        {
          title: "Windshear on Takeoff",
          pages: [444, 445, 446],
          intro:
            "Two takeoff cases, and the one thing working in your favour.",
          context:
            "Two cases, and they behave differently. Taking off into a strong " +
            "wind that dies away as you climb out of the friction layer costs you " +
            "airspeed just as the aeroplane is slow and heavy. Meeting a major " +
            "wind shift - the outflow from a shower, a sea breeze front - can " +
            "take the headwind away in seconds. The one thing working in your " +
            "favour is that a takeoff is a climb: you have power set and a flight " +
            "path you can flatten, which is more than an approach gives you.",
        },
        {
          title: "Windshear on Landing",
          pages: [447, 448, 449, 450, 451],
          intro:
            "The approach profiles that result from meeting a shear zone at " +
            "different heights.",
          diagramNotes: {
            448: "An approach profile through a shear zone: the aircraft in headwind above the zone and in calm air below it, and the resulting departure from the glide path.",
            449: "The same shear encountered at a lower height, with less time and height to recover.",
            450: "The shear zone met close to the threshold, with the sink arriving where there is no height left.",
            451: "A wing viewed from the cabin in flight, above a cloud layer.",
          },
          takeaway:
            "The height at which the shear is met decides everything. The same " +
            "wind change that is a nuisance at 1,000 feet is unrecoverable at 200, " +
            "because the recovery costs height that is not there. That is why the " +
            "decision about a windshear approach is made before it is started.",
        },
        {
          title: "What Turbulence Is",
          pages: [453],
          intro:
            "The definition, and its scale in space and time.",
        },
        {
          title: "Thermal Turbulence",
          pages: [454, 455],
          intro:
            "Convective turbulence in and around cumuliform cloud, and the second " +
            "source that comes with it.",
          takeaway:
            "Thermal turbulence has a timetable, and a VFR pilot can use it. It " +
            "is made by the sun heating the surface, so it builds through the " +
            "morning, peaks in mid-afternoon and dies away in the evening. A " +
            "flight that has to cross rough country on a hot day is a flight to " +
            "make early, and the same route four hours later is a different " +
            "flight.",
        },
        {
          title: "Mechanical Turbulence",
          pages: [456, 457, 458, 459, 460],
          intro:
            "Turbulence from surface obstacles, from small scale to a whole " +
            "mountain range.",
          diagramNotes: {
            456: "Airflow over a building, smooth upstream and tumbling into eddies downstream.",
            457: "The same effect at large scale over a mountain range, with severe turbulence in the lee.",
            458: "Smooth flow over a smooth surface beside broken, eddying flow over rugged terrain.",
          },
        },
        {
          title: "Wake Turbulence",
          pages: [461, 462, 464],
          intro:
            "The vortices every aircraft leaves behind, and what decides how " +
            "strong they are.",
          diagramNotes: {
            461: "Wing tip vortices trailing behind an aircraft in flight, rotating inward behind the wing.",
            462: "The vortex pair behind an aircraft, sinking and spreading outward.",
          },
        },
        {
          title: "Avoiding Wake Turbulence",
          pages: [466],
          intro:
            "The options open to a pilot behind a larger aircraft, on takeoff and " +
            "on landing.",
          diagramNotes: {
            466: "The safe and unsafe zones relative to a generating aircraft: on landing, stay above its path and land beyond its touchdown point; on takeoff, rotate before its rotation point and stay above its climb path.",
          },
        },
        {
          title: "Classification and Avoidance of Turbulence",
          pages: [467, 468],
          intro:
            "The light, moderate and severe scale, and the methods that reduce " +
            "what you meet.",
        },
      ],
    },

    {
      title: "New Zealand Weather",
      syllabus: ["8.44"],
      intro:
        "Everything so far, applied to one country. New Zealand's weather is " +
        "decided by three things and read off one number — the direction the " +
        "air is coming from.",
      topics: [
        {
          title: "What Decides New Zealand's Climate",
          pages: [471, 472, 473],
          intro:
            "Latitude, the ocean around it and the mountains down the middle.",
        },
        {
          title: "Determining Weather by Airflow",
          pages: [474],
          intro:
            "The method: work out where the air has come from and what it has " +
            "crossed.",
          diagramNotes: {
            474: "The circulation around New Zealand, showing where an airflow from each direction has come from before it arrives.",
          },
          takeaway:
            "This is the method the whole New Zealand Weather chapter runs on, " +
            "and it is worth learning as a habit rather than as a diagram. Find " +
            "the airflow direction on the chart, ask where that air has come from " +
            "and what it has crossed on the way, and the cloud, the visibility " +
            "and the turbulence follow from the answer. It works without a " +
            "forecast, and it tells you whether the forecast you have been given " +
            "makes sense.",
        },
        {
          title: "North Westerly Flow",
          pages: [475, 476],
          intro:
            "The classic New Zealand airflow: gales in the strait, rain in the " +
            "west, and the nor'wester in the east.",
          diagramNotes: {
            476: [
              "During a North Westerly wind, gale force winds can be found between the straits.",
              "The North Westerly airflow across New Zealand, with the pre-frontal northwest winds, the stable conditions and fair visibility in the west, the NW and WNW gales through the strait, and the lighter winds and good visibility in the east.",
              "The North West flow labelled.",
              "This West side of New Zealand has the bad weather (stable conditions).",
              "East side fine, but turbulent.",
            ],
          },
        },
        {
          title: "South Westerly Flow",
          pages: [477, 478],
          intro:
            "Cold unstable air from the south: showers, good visibility between " +
            "them, and a bumpy ride.",
          diagramNotes: {
            478: [
              "No gale force winds, because the terrain blocks the flow into the straits.",
              "This west side of New Zealand has the bad weather (unstable conditions).",
              "The South Westerly airflow across New Zealand, with showers and generally smooth flying and good visibility in the west, and fine but turbulent conditions in the east.",
              "East side fine, but turbulent.",
              "The South West flow labelled.",
            ],
          },
        },
        {
          title: "South Easterly Flow",
          pages: [479, 480],
          intro:
            "The uncommon one, and what it does when it happens.",
          diagramNotes: {
            480: [
              "West side fine, but turbulent.",
              "During a South Easterly wind, gale force winds can be found between the straits.",
              "The South Easterly airflow across New Zealand, with showers and unstable conditions in the east, drier air and moderate winds in the west, and the SE and ESE gales through the strait.",
              "This East side of New Zealand has the bad weather (unstable conditions).",
              "The South East flow labelled.",
            ],
          },
        },
        {
          title: "North Easterly Flow",
          pages: [481, 482],
          intro:
            "Warm moist air onto the east coast, and the stable, murky weather it " +
            "brings.",
          diagramNotes: {
            482: [
              "This East side of New Zealand has the bad weather (stable conditions).",
              "No gale force winds, because the terrain blocks the flow into the straits.",
              "A satellite view of New Zealand with the North Easterly flow across it.",
              "West side fine, but turbulent.",
            ],
          },
        },
        {
          title: "Coastal Weather",
          pages: [483],
          intro:
            "Putting the airflow method to work on a coastal forecast, with the " +
            "whole decision laid out as a flow chart.",
          diagramNotes: {
            483: "The airflow decision tree in full. Is the flow onshore or offshore? Offshore gives fine weather, good visibility, possible high cloud, probably turbulent and gusty. Onshore, does the flow originate in the north or the south? A dry flow from either gives fine weather, good visibility, scattered cloud, light turbulence and light to moderate winds. A moist northerly gives rain, poor visibility, overcast with low cloud bases, light to moderate turbulence and strong gusty winds. A moist southerly gives showers, poor visibility at times, passing towering cumulus and cumulonimbus, severe turbulence in cloud and light to moderate elsewhere, and strong gusty winds.",
          },
          takeaway:
            "This chart is the whole chapter in one page, and it is worth being " +
            "able to redraw from memory. Three questions — onshore or offshore, " +
            "north or south, moist or dry — and the answer is a usable forecast. " +
            "Nothing about it is specific to a particular day, which is what makes " +
            "it useful on every day.",
        },
      ],
    },

    {
      title: "Meteorological Services, Reports and Forecasts",
      syllabus: ["8.2", "8.52", "8.50"],
      intro:
        "The products a New Zealand pilot actually uses on the morning of a " +
        "flight: the charts, the forecasts, the aerodrome reports, and the " +
        "radar and satellite imagery behind them. Learning to read these is " +
        "what the whole subject has been for.",
      topics: [
        {
          title: "The MSL Chart",
          pages: [485],
          intro:
            "The mean sea level analysis: what is on it and what it is valid for.",
          diagramNotes: {
            485: "A MetService mean sea level analysis, with isobars, fronts, highs and lows and the valid and issue times.",
          },
          context:
            "The mean sea level analysis is the first thing to look at and the " +
            "last thing to stop looking at. It shows the pressure pattern at one " +
            "moment - the highs, the lows, the fronts and the isobar spacing - " +
            "and everything else in this chapter is a detail hung on it. Two " +
            "habits make it useful: check the valid time against the time you " +
            "will actually be flying, and read the isobar spacing before anything " +
            "else, because that is the wind.",
          takeaway:
            "All of these products - the analysis, the GRAFOR, the area winds, " +
            "the significant weather chart, the SIGMETs, the aerodrome forecasts " +
            "and reports, the radar and the satellite imagery - are published " +
            "together for New Zealand through the gopreflight internet website, " +
            "and that is where a flight is planned from. Reaching them " +
            "through one source matters: it is how you know the chart, the " +
            "forecast and the aerodrome report you are comparing all belong to " +
            "the same moment.",
        },
        {
          title: "GRAFOR",
          pages: [486],
          intro:
            "The graphical aviation forecast chart: what it covers and when it is " +
            "issued.",
          diagramNotes: {
            486: [
              "The GRAFOR specification: issue times, validity, number of charts, heights, area, fronts, phenomena, deep and non-deep convective cloud, and the freezing level convention.",
              "A GRAFOR chart for New Zealand, with the forecast weather areas and the annotations that go with each.",
            ],
          },
          takeaway:
            "The GRAFOR is the low-level forecast chart a VFR pilot plans from, " +
            "and the two things to get right are the validity and the areas. It " +
            "is issued for fixed periods and each chart is valid for a stated " +
            "window; flying outside that window means reading the next chart, not " +
            "extrapolating from this one. Within the chart, the weather is " +
            "described area by area, so the answer to what you will meet depends " +
            "on which area your track crosses and when.",
        },
        {
          title: "Aviation Area Winds",
          pages: [487],
          intro:
            "The AAW: issue times, validity, and the levels it covers.",
          diagramNotes: {
            487: [
              "The AAW specification: issue times, validity, the height bands for winds and temperatures, the units used, and the seventeen areas covered.",
              "An AAW listing as it is issued, with the wind and temperature for each level in each area.",
            ],
          },
          takeaway:
            "The AAW gives wind and temperature at fixed levels for each of the " +
            "areas the country is divided into, and it is the source the flight " +
            "plan's wind figures come from. Two details decide whether the " +
            "numbers are usable: they are for specific levels, so a cruise " +
            "between two of them has to be interpolated, and the direction is " +
            "degrees true, which has to be converted before it is used against a " +
            "magnetic track.",
        },
        {
          title: "The Significant Weather Chart",
          pages: [488, 489],
          intro:
            "GNZSIGWX: what it shows about turbulence, mountain waves, " +
            "cumulonimbus, volcanic ash and radioactive cloud.",
          diagramNotes: {
            488: "The GNZSIGWX specification: issue times, validity, number of charts, flight levels, area, phenomena and cloud coverage conventions.",
            489: "A significant weather chart for the New Zealand FIR, with the areas of moderate icing, turbulence and mountain wave marked and annotated.",
          },
          context:
            "The significant weather chart answers a different question from the " +
            "GRAFOR. The GRAFOR tells you what the weather will be; GNZSIGWX " +
            "tells you where the hazards are - turbulence, mountain wave, icing, " +
            "cumulonimbus, volcanic ash - and at which flight levels. For a VFR " +
            "flight the useful reading is negative: an area with nothing marked " +
            "on it is an area where nobody expects the hazards that would stop " +
            "you.",
        },
        {
          title: "SIGMET",
          pages: [490],
          intro:
            "The warning of hazardous conditions actually observed or forecast, " +
            "and the graphical monitor that goes with it.",
          diagramNotes: {
            490: [
              "The SIGMET specification: issue times, validity of four or six hours depending on the phenomenon, heights and area.",
              "A graphical SIGMET monitor showing the affected area over New Zealand.",
              "SIGMET listings in their textual form for the NZZC and NZZO FIRs.",
            ],
          },
        },
        {
          title: "The Aerodrome Forecast",
          pages: [491, 492, 493],
          intro:
            "The TAF: how long it is valid for, and how each element is coded.",
          diagramNotes: {
            491: "The TAF and TREND specification: issue times for each aerodrome, validity, heights, area, and the conventions for wind, visibility and cloud.",
            492: "A terminal aerodrome forecast for Whanganui with the raw code and its issue and validity times.",
            493: "The same forecast decoded: surface wind, visibility, weather, cloud, QNH and the temporary variations expected.",
          },
        },
        {
          title: "METAR, SPECI and TREND",
          pages: [494, 495, 496, 497, 498],
          intro:
            "The routine report, the special report, the automatic one, and the " +
            "landing forecast appended to them.",
          diagramNotes: {
            494: "The METAR, METAR AUTO and SPECI specification: how often each is issued, what an AUTO report can and cannot include, and the conventions for wind, visibility, cloud, temperature, dew point and pressure.",
            495: "An automated meteorological aerodrome report for Whanganui in its raw coded form.",
            496: "The same report decoded: surface wind, visibility, sky condition, temperature, dew point and QNH.",
          },
        },
        {
          title: "ATIS and AWIB",
          pages: [499, 500, 501, 502],
          intro:
            "The two continuous broadcasts, and the difference between them.",
          diagramNotes: {
            499: "The ATIS specification: a continuous plain language broadcast of current conditions at an aerodrome on a discrete frequency, with the elements it contains.",
            500: "An ATIS for Palmerston North in its issued form, with the identifying letter, approach, runway, conditions and pressure.",
            501: "The same ATIS decoded element by element.",
          },
        },
        {
          title: "PIREP and AIREP",
          pages: [503, 504],
          intro:
            "Reports made by pilots in flight, and the format each uses.",
          diagramNotes: {
            503: [
              "The AIREP and AIREP Special definition: a routine report from an aircraft in flight, and a special report when hazardous conditions are met.",
              "The PIREP definition: a pilot report from a domestic operator when a phenomenon of significance or a hazardous nature is encountered.",
            ],
          },
        },
        {
          title: "Rain Radar",
          pages: [505, 506, 507],
          intro:
            "The radar network, what it can see, and the parameters it operates " +
            "under.",
          diagramNotes: {
            506: "The rain radar network over New Zealand, with the coverage circle of each site.",
            507: "Composite radar coverage over the country, with the returns from each site combined.",
          },
          misconception:
            "Reading a radar picture as a picture of the cloud. It is not - the " +
            "radar sees precipitation, not cloud, so a sky full of stratus with " +
            "nothing falling out of it shows as an empty screen, and a single " +
            "small cell with heavy rain in it shows as a bright return. It also " +
            "sees only what is within range and above the lowest sweep, so " +
            "precipitation close to the ground a long way from the site can be " +
            "missed entirely.",
        },
        {
          title: "Reading Radar Imagery",
          pages: [508, 509, 510],
          intro:
            "What the colours mean, and what the radar is actually measuring.",
          diagramNotes: {
            509: "A radar image with the precipitation returns colour-coded by intensity and the timestamp on the image.",
            510: "The same imagery in the viewer used to animate a sequence of returns.",
          },
        },
        {
          title: "Cloud Types from Radar",
          pages: [511, 512, 513, 514],
          intro:
            "Telling stable precipitation from unstable by the shape of the return.",
          diagramNotes: {
            512: "A radar return from stable conditions: a broad, even area of precipitation.",
            514: "A radar return from unstable conditions: discrete cells with gaps between them, and a note that open cellular showers indicate cold air moving from the south into unstable conditions.",
          },
        },
        {
          title: "Speed, Timing and Impact",
          pages: [515],
          intro:
            "Calculating when a band of showers will arrive from a sequence of " +
            "images.",
          diagramNotes: {
            515: "A sequence of frontal positions at successive times, used to work out the speed of movement and the arrival time at a given place.",
          },
        },
        {
          title: "Satellite Imagery",
          pages: [516, 517, 518],
          intro:
            "The satellite, and how to decode what it sends.",
          diagramNotes: {
            516: "A weather satellite in orbit above the Earth.",
            517: "A satellite image over New Zealand and the Tasman with the features numbered and identified: jet stream cirrus, cold front cloud, warm sector cloud, troughs, open cellular cumulonimbus showers, stratocumulus, and smaller open cellular towering cumulus.",
            518: "An infrared image with a grey stratiform cloud inland identified as an early morning frost, and wave cloud off the Blue Mountains and the Southern Alps indicating strong winds aloft.",
          },
        },
        {
          title: "Visible and Infrared Images",
          pages: [519, 520, 521, 522],
          intro:
            "What each channel measures, and why the same cloud looks different in " +
            "each.",
          diagramNotes: {
            520: "A visible satellite image over New Zealand.",
            522: "An infrared image of the same region, with the tropical cyclones to the north.",
          },
          context:
            "The two channels answer different questions, which is why they are " +
            "always used together. The visible image measures reflected sunlight, " +
            "so it shows how thick and bright a cloud is — and shows nothing at " +
            "night. The infrared image measures emitted heat, so it shows how cold " +
            "a cloud top is, which is a measure of how high it is, and it works in " +
            "the dark. Thin high cirrus is faint on the visible image and glaring " +
            "on the infrared; low stratus is the other way round.",
        },
        {
          title: "Recognising Features",
          pages: [523, 524, 525, 526, 527],
          intro:
            "Cirrus, fog, wave cloud, thunderstorms, a cold front and a cyclone, " +
            "each as it appears from orbit.",
          diagramNotes: {
            523: "Cirrus on a satellite image, thin and streaked across the picture.",
            524: "Fog on a satellite image: a smooth, sharply bounded grey sheet following the low ground.",
            525: "Wave cloud and thunderstorms in one image, the wave cloud in parallel bands and the storms as bright cells.",
            526: "A cold front on a satellite image, as a band of cloud with a sharp trailing edge.",
            527: "A tropical cyclone with a visible eye at its centre.",
          },
        },
        {
          title: "Using the Images Together",
          pages: [528, 529, 530],
          intro:
            "Two worked examples of reading a visible and an infrared image of the " +
            "same moment side by side.",
          diagramNotes: {
            528: "The first example: a cirrus strip crossing from north-west to south-east, faint on the visible image and clear on the infrared because the cloud is ice; and the sea appearing darker than the land on the visible image because it absorbs more solar radiation.",
            529: "The second example: a strip of cloud along a coast, with the temperature of its tops read from the infrared image and its thickness read from the visible.",
            530: "The same pair with the arrows marking the features to compare between them.",
          },
        },
      ],
    },
  ],
};
