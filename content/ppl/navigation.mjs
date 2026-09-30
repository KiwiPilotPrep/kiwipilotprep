/**
 * PPL Air Navigation and Flight Planning — the curriculum.
 *
 * 239 slides, and the deck's own fourteen section dividers are close to a
 * teaching order already: the shape of the Earth, then direction on it, then
 * speed through the air, then height above it, then time, then the chart, then
 * the computer that does the arithmetic, and only then the flying. The
 * importer had reduced all of that to fourteen chapters and fifty-one lessons
 * — some of them thirty slides long — so the material was there and the course
 * was not.
 *
 * Two changes to the deck's order, both for the same reason: a student meets
 * the trouble after the technique rather than during it.
 *
 *   - The lost procedure is taught in one place. The deck introduces it at
 *     slides 134–138, in the middle of visual navigation procedures, and then
 *     returns to it at 163–168 with the DR position and the most probable
 *     position. Split across two chapters it reads as two half-explanations;
 *     gathered, it is one procedure with a beginning and an end.
 *
 *   - Diversions, low-level and reduced-visibility navigation sit with it,
 *     because they are the same skill under pressure.
 *
 * The flight computer chapters are deliberately long and deliberately
 * step-by-step. This is the one subject where a PPL exam candidate is asked to
 * *do* something rather than recall it, and the deck's worked examples — set
 * the grommet, mark the wind, read the answer — are the most valuable thing in
 * it. Every one of them is kept.
 */
import { repairSlide } from "./deck-repairs.mjs";
import { isRejectedImage, isUpsideDown } from "./navigation-diagrams.mjs";

/** Repairs this deck needs that no other deck needs. */
const TABLES = {
  // Lines that are not teaching: a cue for the instructor standing in front of
  // the class, which is nobody a student reading this has.
  callouts: {
    183: ["Instructor will demonstrate how to fully prepare a chart."],
  },

  // Slide-by-slide corrections, each one checked against the slide it comes
  // from. Nothing here changes what the deck teaches; it repairs what the
  // layout or a typing slip did to it.
  substitutions: {
    // The slide names the point "Most Probable Position (MMP)" and then uses
    // MPP for the rest of the deck. MPP is the term; MMP is a slip, and a
    // student meeting both in four lines has no way to know which is which.
    135: [
      ["Most Probable Position (MMP)", "Most Probable Position (MPP)"],
      ["either side of your MMP", "either side of your MPP"],
      // The list this line belongs to starts on the slide before, unnumbered.
      // Left as "4." it is step four of a list whose first three steps the
      // student never saw a number for.
      ["4. Adopt the Lost Procedure.", "Adopt the Lost Procedure."],
    ],
    // The text box put the result before the method: "Or draw a circle around
    // your MPP, 10% of the distance. To find your MPA".
    136: [
      [
        "Or draw a circle around your MPP, 10% of the distance. To find your MPA",
        "To find your MPA you can instead draw a circle around your MPP, with a " +
          "radius of 10% of the distance flown since the last fix.",
      ],
    ],
    // An opening bracket where a question mark belongs, which swallows the
    // question that follows it.
    137: [
      [
        "What is the condition of yourself and the aircraft (How long have you been flying for?",
        "What is the condition of yourself and the aircraft? How long have you been flying for?",
      ],
    ],
    // Same list, same slip as 135: a "4." with no 1, 2 or 3 above it.
    165: [["4. Determine DR position", "Determine DR position"]],
    // The slide's heading is the CAA syllabus item for this topic, copied word
    // for word — an instruction to an examination candidate rather than a
    // heading for a reader. The teaching underneath it is untouched.
    108: [[
      "Derive Time, Speed or Distance Given Two Factors",
      "Finding time, speed or distance when you know the other two",
    ]],
  },

  titles: {},
};

export const subject = {
  slug: "navigation",
  title: "Air Navigation and Flight Planning",
  deck: "navigation",
  repairSlide: (blocks, context) => repairSlide(blocks, { ...context, tables: TABLES }),
  isRejectedImage,
  isUpsideDown,

  // The per-slide repair tables, exposed so the conservation test can tell a
  // hand-checked correction from a rewrite: a block whose words differ from
  // the slide's is a failure unless a substitution written down here is why.
  repairs: TABLES,

  skip: {
    1: "The deck cover: the subject name and its CAA subject number, with no teaching on it.",
    2: "The exam format — 70 minutes, 25 questions, a 1:250,000 chart and no calculators. Worth knowing and stated on the course page; it teaches no navigation.",
    3: "Section divider announcing “Back to Basics”. The name is kept as course structure; the slide carries nothing else.",
    16: "Section divider announcing “Direction on the Earth”.",
    43: "Section divider announcing “Speed”.",
    45: "A blank slide: no text and no figure.",
    55: "Section divider announcing “Altimetry”.",
    72: "Section divider announcing “Time”.",
    91: "Section divider announcing “Aeronautical Charts”.",
    92: "A blank slide: no text and no figure.",
    100: "A classroom exercise — “Tracks and Bearing on Aeronautical Charts: Student to demonstrate to Instructor”. It is an instruction to the instructor, and measuring track direction on a chart is taught in Direction and again in Chart Preparation.",
    102: "Section divider announcing “Computations”.",
    130: "Section divider announcing “Visual Navigation Procedures”.",
    178: "Section divider announcing “Flight Planning”.",
    182: "The words “Chart Preparation” alone on a slide — a heading whose body is on the slide after it.",
    184: "Section divider announcing “Plan Preparation”.",
    200: "Section divider announcing “Fuel Planning”.",
    202: "Section divider announcing “Cruise Performance”.",
    207: "Section divider announcing “Radio Aids in Support of VFR Operations”.",
    212: "The word “VOR” alone on a slide: a heading for the run that follows.",
    217: "The words “Distance Measuring Equipment (DME)” alone on a slide: a heading for the run that follows.",
    219: "The words “Global Positioning System” alone on a slide: a heading for the run that follows.",
    230: "The word “Radar” alone on a slide: a heading for the run that follows.",
    239: "Section divider announcing “Exam Techniques”, with nothing behind it in the deck.",
  },

  chapters: [
    {
      title: "The Shape of the Earth",
      syllabus: ["6.2", "6.6", "6.10"],
      intro:
        "Navigation is measurement on a curved surface, so it starts with the " +
        "surface. Everything later in the subject — a track drawn on a chart, a " +
        "position passed on the radio, a distance in nautical miles — depends on " +
        "the definitions in this chapter being exact rather than roughly right.",
      topics: [
        {
          title: "The Earth Is Not a Sphere",
          pages: [4],
          intro:
            "The shape navigation actually works on, and how far it departs from the " +
            "sphere everyone pictures.",
          takeaway:
            "The difference between the equatorial and polar diameters is small " +
            "enough to ignore for everything a PPL will do, and it is worth knowing " +
            "it exists: it is why charts have projections, why a chart is only " +
            "accurate over a limited area, and why the answer changes slightly " +
            "depending on which definition of a mile you use.",
        },
        {
          title: "Rotation and the Poles",
          pages: [5, 6],
          intro:
            "The polar axis, the direction of rotation, and the two points every " +
            "other definition is measured from.",
          diagramNotes: {
            5: "The Earth on its polar axis, with the direction of rotation from west to east marked.",
          },
          diagramNotes: {
            5: "The Earth on its polar axis, with the direction of rotation from west to east marked.",
            6: "The North and South Poles as the two ends of that axis, and the points every measurement of latitude and longitude is referred to.",
          },
        },
        {
          title: "The Equator, Great Circles and Small Circles",
          pages: [7, 9, 10],
          intro:
            "The three circles that matter, and the property that separates the " +
            "first two from the third.",
          keyPoints: [
            "A great circle is the largest circle that can be drawn on the surface, and its plane passes through the centre of the Earth.",
            "A small circle is any circle whose plane does not.",
            "The Equator is a great circle; every other parallel of latitude is a small circle.",
            "The shortest distance between two points on the Earth is along the great circle joining them.",
          ],
        },
        {
          title: "Latitude and Longitude",
          pages: [8, 11, 12, 13, 14],
          intro:
            "The grid every position is quoted in: meridians running pole to pole, " +
            "parallels running around the Earth, and how each is measured.",
          context:
            "The two are measured differently and that is where the confusion " +
            "starts. Longitude is measured east and west from the Greenwich " +
            "meridian, up to 180° each way, and its meridians are halves of great " +
            "circles that converge at the poles. Latitude is measured north and " +
            "south from the Equator, up to 90° each way, and its parallels are " +
            "small circles that never meet. That convergence of the meridians is " +
            "why one minute of latitude is a nautical mile anywhere on Earth and " +
            "one minute of longitude is not.",
        },
        {
          title: "Rhumb Lines",
          pages: [15],
          intro:
            "The line you actually fly when you hold a constant heading, and how it " +
            "differs from the shortest route.",
          misconception:
            "Assuming the line drawn on the chart and the shortest route are the " +
            "same thing. A rhumb line cuts every meridian at the same angle, which " +
            "is what makes it flyable with one heading; a great circle is shorter " +
            "but its direction changes continuously. Over the distances a PPL flies " +
            "the difference is negligible, which is exactly why it is worth knowing " +
            "that it is a difference at all.",
        },
      ],
    },

    {
      title: "Direction",
      syllabus: ["6.4"],
      intro:
        "Three norths, two corrections between them, and a strict order in which " +
        "the corrections are applied. Almost every navigation error a student " +
        "makes in the air is an error in this chapter applied the wrong way round.",
      topics: [
        {
          title: "Measuring Direction",
          pages: [17, 18],
          intro:
            "The 360° circle, and the convention for writing and speaking a " +
            "direction.",
          diagramNotes: {
            17: "The compass rose divided into 360 degrees, with north at 000, east at 090, south at 180 and west at 270.",
          },
          takeaway:
            "Three figures always, so that a direction can never be confused with " +
            "anything else on a radio: zero nine zero, not ninety. The runway " +
            "designator is the deliberate exception - it drops the last digit and " +
            "is spoken as two figures, so runway 03 is the runway pointing at " +
            "about 030 degrees magnetic.",
        },
        {
          title: "True Direction",
          pages: [19],
          intro:
            "Direction measured from the geographic north pole — the one the chart " +
            "is drawn against.",
        },
        {
          title: "Magnetic Direction and the Earth's Field",
          pages: [20, 21, 22, 23],
          intro:
            "The other north: where it is, why it moves, and why the compass points " +
            "at it rather than at the pole on the chart.",
        },
        {
          title: "Variation",
          pages: [24, 25],
          intro:
            "The angle between true and magnetic north, how it is shown on a chart, " +
            "and the fact that it is different everywhere.",
          definition:
            "Variation is the angular difference between true north and magnetic " +
            "north at a given place. Lines joining places of equal variation are " +
            "isogonals, and they are printed on the chart because the value changes " +
            "from place to place and slowly over time.",
          term: "Variation",
        },
        {
          title: "Converting True, Magnetic and Compass",
          pages: [26, 27],
          intro:
            "The two rules, and the direction each one runs in.",
          keyPoints: [
            "Variation east, magnetic least: 180°T with 25°E variation is 155°M.",
            "Variation west, magnetic best: 180°T with 25°W variation is 205°M.",
            "The same rule applies again between magnetic and compass, using deviation instead of variation.",
          ],
          context:
            "Work in one direction at a time and write down which one you are going. " +
            "The rules are symmetrical, so a student who has learnt them as words " +
            "rather than as a direction of travel will apply them backwards under " +
            "pressure — and a variation applied backwards is twice the error, not " +
            "none.",
        },
        {
          title: "Deviation",
          pages: [28, 29],
          intro:
            "The compass's own error, where the correction card comes from, and " +
            "what invalidates it.",
          diagramNotes: {
            27: "A compass deviation card, giving the compass heading to steer for each magnetic heading around the card.",
          },
        },
        {
          title: "Bearings",
          pages: [30, 31, 32, 33],
          intro:
            "True, magnetic, relative and reciprocal bearings — four ways of saying " +
            "where something is.",
          keyPoints: [
            "A relative bearing is measured clockwise from the aircraft's nose, not from north.",
            "Relative bearing plus magnetic heading gives the magnetic bearing to the object.",
            "A reciprocal is 180° away — add 180 if the bearing is under 180, subtract it if over.",
          ],
        },
        {
          title: "Heading and Drift",
          pages: [34, 35, 36, 37],
          intro:
            "The difference between where the nose points and where the aeroplane " +
            "goes, and the angle between them.",
          misconception:
            "Treating heading and track as the same thing in anything but nil wind. " +
            "The heading is where the aeroplane is pointing; the track is where it " +
            "is going over the ground; drift is the angle the wind puts between " +
            "them. Flying the planned heading in a crosswind and expecting to " +
            "arrive is the single most common navigation error there is.",
        },
        {
          title: "Distance",
          pages: [38, 39, 40, 41, 42],
          intro:
            "Nautical miles, statute miles and kilometres, and the one of them that " +
            "is defined by the Earth itself.",
          keyPoints: [
            "One nautical mile is one minute of latitude — which is why latitude, not longitude, is used to measure distance off a chart.",
            "1 nm is 1.852 km, and 1 nm is about 1.15 statute miles.",
            "A degree of latitude is 60 nm.",
          ],
        },
      ],
    },

    {
      title: "Speed",
      syllabus: ["6.8"],
      intro:
        "Four speeds with four different meanings, and a triangle that connects " +
        "the aeroplane's movement through the air to its movement over the " +
        "ground. This chapter is the theory behind every wind calculation in the " +
        "rest of the subject.",
      topics: [
        {
          title: "Types of Speed",
          pages: [44, 46, 47],
          intro:
            "Indicated, calibrated, true and ground speed, and the correction " +
            "between each pair.",
          keyPoints: [
            "Indicated airspeed is what the instrument reads; calibrated airspeed is that corrected for instrument and position error.",
            "True airspeed is calibrated airspeed corrected for density — so it increases with altitude and temperature for the same indication.",
            "Groundspeed is true airspeed with the wind applied. It is the only one that gets you there on time.",
          ],
        },
        {
          title: "Airspeed and Altitude",
          pages: [48, 49],
          intro:
            "Why the same indicated airspeed is a higher true airspeed as you climb, " +
            "and the rough rule for how much.",
        },
        {
          title: "Vectors",
          pages: [50],
          intro:
            "Representing a speed and a direction as one arrow — the tool the next " +
            "topic is built from.",
          diagramNotes: {
            50: "The three vectors that make the triangle of velocities: heading and true airspeed, track and groundspeed, and the wind velocity.",
          },
          takeaway:
            "A vector carries two pieces of information in one line - which way, " +
            "and how fast - and that is the whole reason the triangle works. Add " +
            "two of these three together and the third falls out, which is what " +
            "every wind calculation in this course is doing whether it is drawn " +
            "on paper or set up on a flight computer.",
        },
        {
          title: "The Triangle of Velocities",
          pages: [51],
          intro:
            "Heading and true airspeed, wind velocity, track and groundspeed: three " +
            "vectors that must close.",
          context:
            "The triangle is the whole of practical navigation in one diagram. Two " +
            "of the three vectors are always known — you plan the track, the " +
            "forecast gives the wind — and the third falls out of them. Every " +
            "flight computer wind calculation later in the course is this triangle " +
            "solved mechanically instead of drawn.",
        },
        {
          title: "Wind Velocity and Terminology",
          pages: [52, 53, 54],
          intro:
            "How a wind is written and spoken, and the convention that catches " +
            "people out.",
          misconception:
            "Reading a forecast wind as the direction it is blowing towards. A wind " +
            "velocity is written as the direction it is coming *from*, in degrees " +
            "true in a forecast and degrees magnetic from a tower — so 270/25 is a " +
            "westerly at 25 knots pushing you east. Getting the sense backwards " +
            "puts the drift on the wrong side.",
        },
      ],
    },

    {
      title: "Altimetry",
      syllabus: ["6.12"],
      intro:
        "The altimeter measures pressure and reports it as height, which works " +
        "only while the pressure it is calibrated against matches the day. This " +
        "chapter is the definitions, the settings, and the two errors that put an " +
        "aeroplane lower than it thinks it is.",
      topics: [
        {
          title: "Pressure and Height",
          pages: [56, 57],
          intro:
            "The relationship the instrument depends on, and the standard lapse rate " +
            "used to calibrate it.",
        },
        {
          title: "Height, Altitude, Elevation and Flight Level",
          pages: [58],
          intro:
            "Height, altitude, elevation, flight level — four words for a vertical " +
            "distance, each measured from something different.",
          keyPoints: [
            "Height is measured from a nominated point, usually the aerodrome.",
            "Altitude is measured from mean sea level.",
            "Elevation is the height of a fixed point — the aerodrome itself — above mean sea level.",
            "A flight level is measured from the 1013 hPa datum rather than from the ground at all.",
          ],
        },
        {
          title: "Temperature Error",
          pages: [59, 60, 61],
          intro:
            "What a day colder than standard does to the altimeter, and which way " +
            "the error takes you.",
          takeaway:
            "Flying from warm air into cold air, the altimeter over-reads: the " +
            "aeroplane is lower than it says. That is the direction that matters, " +
            "because it is the one that puts you closer to the terrain than the " +
            "instrument admits.",
        },
        {
          title: "Pressure Error",
          pages: [62, 63, 64],
          intro:
            "The same problem caused by pressure rather than temperature, and the " +
            "phrase every pilot learns for it.",
          keyPoints: [
            "High to low, look out below: flying from high pressure to low pressure without resetting, the altimeter over-reads and the aeroplane is lower than indicated.",
            "1 hPa is about 30 ft at low level, so a 10 hPa change is roughly 300 ft of error.",
          ],
        },
        {
          title: "Altimeter Settings",
          pages: [65, 66, 67],
          intro:
            "QNH, QFE and the standard setting: what each one makes the altimeter " +
            "read, and when each is used.",
        },
        {
          title: "The Transition Altitude and Levels",
          pages: [68, 69, 70, 71],
          intro:
            "Where the setting changes from the local pressure to the standard one, " +
            "and how levels are quoted above it.",
          context:
            "This is a long topic because it has to establish four things that " +
            "are easy to confuse: the transition altitude, which is where you " +
            "change from a QNH to the standard setting on the way up; the " +
            "transition level, which is where you change back on the way down; " +
            "the layer between them, which is not somewhere to cruise; and the " +
            "fact that the two are different values applying in different " +
            "directions. Hold the direction of travel with each and the rest " +
            "follows.",
        },
      ],
    },

    {
      title: "Time and Twilight",
      syllabus: ["6.16", "6.18"],
      intro:
        "Aviation runs on one clock, and a VFR pilot's day has hard edges at " +
        "each end of it. This chapter covers the time system, the way times are " +
        "written, and how to work out when the light goes — which is a legal " +
        "boundary as well as a practical one.",
      topics: [
        {
          title: "The Sensible and Visible Horizon",
          pages: [73, 74, 75],
          intro:
            "The two horizons, and why the difference between them decides when " +
            "twilight begins.",
          context:
            "The list on the first of these slides is the vocabulary of the whole " +
            "chapter, and each term is defined in the topics that follow: the two " +
            "horizons here, sunrise and sunset and twilight next, then UTC, New " +
            "Zealand standard and daylight time, morning and evening civil " +
            "twilight, and local mean time. The distinction to get straight first " +
            "is the one on this slide, because everything about the light depends " +
            "on it. The sensible horizon is the flat plane through an observer " +
            "standing on the surface; the visible horizon is the real one they " +
            "can see, which drops further away the higher they go.",
        },
        {
          title: "Sunrise, Sunset and Twilight",
          pages: [76, 77],
          intro:
            "What each of the four terms means, and the amount of usable light each " +
            "one describes.",
        },
        {
          title: "Time Zones and New Zealand Time",
          pages: [78, 79, 80, 81, 82],
          intro:
            "UTC, the zone offsets, New Zealand standard and daylight time, and " +
            "converting between them.",
          context:
            "Every flight plan, forecast, NOTAM and clearance is in UTC, and New " +
            "Zealand is twelve hours ahead of it — thirteen in daylight time. That " +
            "puts the local date and the UTC date on different days for most of the " +
            "working morning, which is exactly when a mis-converted time does the " +
            "most damage to a plan.",
        },
        {
          title: "Date and Time Groups",
          pages: [83, 84],
          intro:
            "The six-figure group used to write a date and time unambiguously.",
        },
        {
          title: "Working Out the Light",
          pages: [85, 86, 87, 88, 89, 90],
          intro:
            "Using the tables to find morning and evening civil twilight, and the " +
            "things that shift them.",
          keyPoints: [
            "Latitude, longitude and the date all move the times — the tables are worked by zone for that reason.",
            "Terrain matters too: a valley loses the light before the table says the sun sets.",
            "Work the times out at planning, not in the air. Running out of daylight is a planning failure, not a weather event.",
          ],
        },
      ],
    },

    {
      title: "Aeronautical Charts",
      syllabus: ["6.14", "6.22", "6.26"],
      intro:
        "A chart is a curved surface printed flat, which cannot be done without " +
        "distorting something. This chapter is what the New Zealand charts choose " +
        "to preserve, what they show, and how to read scale and symbols off them.",
      topics: [
        {
          title: "Why a Chart Distorts",
          pages: [93],
          intro:
            "Why a projection is necessary at all, and what it costs.",
          takeaway:
            "Shape, distance, angle and area cannot all survive being flattened. " +
            "Every projection chooses which to keep and which to give up, so the " +
            "useful question about a chart is never “is it accurate” but " +
            "“accurate in what”.",
        },
        {
          title: "Scale",
          pages: [94],
          intro:
            "The definition, and what 1:250,000 actually means on the chart in your " +
            "hand.",
          example:
            "On a 1:500,000 chart, one centimetre on the paper is 500,000 " +
            "centimetres on the ground — 5 km, or about 2.7 NM. On a 1:250,000 " +
            "chart the same centimetre is half that, which is why the larger-scale " +
            "sheet shows twice the detail and covers a quarter of the area.",
          exampleTitle: "Reading a scale ratio",
          misconception:
            "Calling 1:1,000,000 the “larger” scale because the number is " +
            "bigger. It is the ratio that counts: 1:250,000 is the larger scale, " +
            "because a given stretch of ground is drawn longer on the paper.",
        },
        {
          title: "The New Zealand Charts",
          pages: [95, 101],
          intro:
            "Three charts, three jobs: the planning chart, the navigation chart, " +
            "and the aerodrome chart.",
          diagramNotes: {
            101: "An extract from a visual navigation chart: terrain, airspace boundaries with their upper and lower limits, aerodromes with frequencies and elevations, and visual reporting points, all on one sheet.",
          },
          keyPoints: [
            "The Visual Planning Chart (VPC) covers the whole country at 1:1,000,000 and is for pre-flight planning.",
            "The Visual Navigation Chart (VNC) breaks the country into 16 areas at 1:500,000 and 1:250,000, and is what you fly with.",
            "The Aerodrome Chart comes from the AIP and shows the layout and facilities of one aerodrome.",
          ],
        },
        {
          title: "Reading the Legend",
          pages: [97],
          intro:
            "The key to every symbol on the sheet, and the operating criteria table " +
            "printed beside it.",
          diagramNotes: {
            97: "The VNC legend: aerodromes and heliports, navigation facilities, airspace line styles, hazards and obstacles, cultural and natural features, and the operating criteria table giving the rules, cruising levels and VMC minima for each class of airspace.",
          },
          takeaway:
            "The operating criteria table on the chart answers most of the airspace " +
            "questions that come up in flight — what the class requires, which " +
            "cruising levels apply on your track, what visibility and cloud " +
            "clearance you need. It is worth reading on the ground before a first " +
            "cross-country rather than looking for it in the air.",
        },
        {
          title: "Aerodrome Charts",
          pages: [98, 99],
          intro:
            "What the AIP page for an aerodrome shows, and the symbols it uses.",
          diagramNotes: {
            98: [
              "The AIP aerodrome chart for Whanganui: runways with their dimensions and magnetic bearings, taxiways and apron, the NDB and DME with their frequencies, circuit directions for each runway, and the cautions that go with them.",
              "The operational data page for the same aerodrome: runway surface and strength, declared take-off and landing distances, IFR take-off minima, and the pilot-activated lighting procedure with the frequency and pulse sequence to use.",
            ],
            99: "The AIP legend for aerodrome charts — thresholds, displaced thresholds, clearways, paved and unpaved runways, holding positions, wind direction indicators and helicopter areas.",
          },
          takeaway:
            "The aerodrome chart and the operational data page are read at " +
            "different times and answer different questions. The chart answers " +
            "where things are - which runway, which taxiway, where the circuit " +
            "goes, where the navigation aids sit. The operational data answers " +
            "whether you can use them: the surface, the strength, the declared " +
            "distances, the lighting and how to turn it on. Both are read before " +
            "the flight; neither is read for the first time on the approach.",
        },
        {
          title: "Relief and Terrain",
          pages: [96],
          intro:
            "How height is shown on a New Zealand chart without a single contour " +
            "line being read.",
          takeaway:
            "Relief shading is the fastest terrain check there is: blue is water, " +
            "greens are low ground, dark green is forest, browns darken with height, " +
            "and silver is permanent snow. A track that crosses from green into dark " +
            "brown has told you something about your cruise level before you have " +
            "looked at a single spot height.",
        },
      ],
    },

    {
      title: "The Navigation Computer",
      syllabus: ["6.28"],
      intro:
        "The circular slide rule is the one tool the PPL exam expects you to " +
        "operate rather than describe, and it is examined without a calculator. " +
        "Every worked example the deck gives is kept here, in the order it builds " +
        "them: the scales first, then arithmetic, then the aviation problems that " +
        "arithmetic is for.",
      topics: [
        {
          title: "Finding True Airspeed",
          pages: [103, 104],
          intro:
            "Setting pressure altitude against temperature, and reading true " +
            "airspeed off the outer scale.",
          exampleTitle: "The deck's worked example",
          example:
            "What is your TAS at 9,000 ft pressure altitude, +20°C, with a CAS of " +
            "120 kt? Set the pressure altitude against the temperature in the " +
            "right-hand window, find 120 on the inner scale, and read the true " +
            "airspeed above it on the outer. Work it through on the computer as you " +
            "read — this is a topic that cannot be learnt by looking at it.",
        },
        {
          title: "Multiplication and Division",
          pages: [105, 106, 107],
          intro:
            "The two operations everything else is built from, and the rough check " +
            "that puts the decimal point in the right place.",
          takeaway:
            "The slide rule gives you the digits and not the magnitude: 30.4 × 5.6 " +
            "and 3.04 × 56 read identically. So every answer is preceded by a rough " +
            "mental check — 30 × 5 is about 150, so the answer is three digits " +
            "before the decimal point. Skip the check and the computer will happily " +
            "hand you an answer ten times too big.",
        },
        {
          title: "Time, Speed and Distance",
          pages: [108, 109, 110, 111],
          intro:
            "The relationship, and the three questions it answers on the computer.",
        },
        {
          title: "Fuel Consumption Problems",
          pages: [112, 113, 114],
          intro:
            "Rate, quantity and endurance — the same three-way relationship as time, " +
            "speed and distance, in litres.",
          takeaway:
            "Every problem in this run is the same three quantities in a " +
            "different order - rate, time and quantity - and the flight computer " +
            "solves any one from the other two on the same scales it uses for " +
            "time, speed and distance. Once you see that the fuel side of the " +
            "computer is the speed side with different labels, the number of " +
            "separate procedures to remember drops from a dozen to one.",
        },
        {
          title: "Conversions",
          pages: [115, 116, 117, 118, 119],
          intro:
            "Temperature, distance, height, mass and volume — the marked indexes on " +
            "the scales, and how to use them.",
          takeaway:
            "Every conversion on this page is the same operation: line the two " +
            "index marks up on the two scales and read across. The computer is " +
            "not doing arithmetic - it is holding a fixed ratio between the inner " +
            "and outer scales, so once the marks are aligned every value converts " +
            "at once, not just the one you set. That is why a single setting " +
            "converts 90 nautical miles to kilometres and also converts every " +
            "other distance you care to read off without touching it again.",
        },
        {
          title: "Volumes and Weights",
          pages: [120, 121, 122],
          intro:
            "Turning a volume of fuel into a weight, and the unit that is not a unit.",
          misconception:
            "Treating “fuel pounds” as a unit of fuel. It is a weight, and turning " +
            "a volume into it needs the specific gravity of what is in the tank — " +
            "AVGAS and JET A1 do not weigh the same, and a conversion done with the " +
            "wrong figure puts the aeroplane over its weight limit on paper and " +
            "under its fuel requirement in the air.",
        },
      ],
    },

    {
      title: "Wind, Climb and Descent Calculations",
      syllabus: ["6.28", "6.32", "6.34"],
      intro:
        "The wind side of the computer, which solves the triangle of velocities " +
        "mechanically. This is the part of the subject that is practised rather " +
        "than read: the steps are short and the order matters.",
      topics: [
        {
          title: "Climb and Descent",
          pages: [123],
          intro:
            "Time to climb, rate of climb and rate of descent on the computer.",
          context:
            "All three of these calculations are the time-speed-distance " +
            "relationship with different labels. Time to climb is height to gain " +
            "divided by rate of climb. Rate of climb is height to gain divided by " +
            "time available. Rate of descent is height to lose divided by the " +
            "time you will take to lose it, which comes from the distance to run " +
            "and the groundspeed. Set them up on the computer the same way you " +
            "set up a leg time, and the only thing that changes is what you call " +
            "the numbers.",
          diagramNotes: {
            123: [
              "The computer set up to find time to climb, with height to gain against rate of climb.",
              "The same scales used to find rate of climb from a height and a time.",
              "The descent case: height to lose and the time available giving the rate of descent required.",
            ],
          },
        },
        {
          title: "Heading and Groundspeed from a Wind",
          pages: [124, 125, 126, 127],
          intro:
            "The standard wind problem, worked step by step: grommet, wind, track, " +
            "airspeed, answer.",
          keyPoints: [
            "Set the grommet on a convenient line, set the wind direction under the true index, and mark the wind speed up from the grommet.",
            "Rotate until the track is under the true index, then slide the wind mark to the true airspeed line.",
            "Groundspeed reads under the grommet; the wind correction angle is the offset of the mark from the centre line.",
          ],
        },
        {
          title: "Crosswind and Headwind Components",
          pages: [128],
          intro:
            "The same instrument used to answer the question that decides whether " +
            "you take off at all.",
        },
        {
          title: "Finding the Wind in Flight",
          pages: [129],
          intro:
            "Running the calculation backwards from what the aeroplane is actually " +
            "doing.",
        },
      ],
    },

    {
      title: "Visual Navigation in Practice",
      syllabus: ["6.48", "6.60"],
      intro:
        "Everything the previous chapters were for. Planning a cross-country, " +
        "flying it, keeping a log, reading the ground against the chart, and " +
        "arriving when you said you would.",
      topics: [
        {
          title: "The Language of Visual Navigation",
          pages: [131, 132],
          intro:
            "The terms used for the rest of the chapter: fix, pinpoint, dead " +
            "reckoning, track made good.",
        },
        {
          title: "Pre-Flight Planning",
          pages: [133],
          intro:
            "What is done on the ground, and why the flight is largely decided " +
            "there.",
          takeaway:
            "The list is long and it is a list of sources rather than of tasks, " +
            "which is the point. Every item names a document or a check that " +
            "exists whether you look at it or not - the forecast, the NOTAMs, the " +
            "AIP entry for the aerodrome, the chart, the aircraft. A flight is " +
            "not planned by thinking hard about it; it is planned by going " +
            "through this list and finding out what is actually true today.",
        },
        {
          title: "Managing the Aeroplane While Navigating",
          pages: [139, 140],
          intro:
            "Flying accurately enough for the navigation to work, and the cruise " +
            "check that keeps it that way.",
          keyPoints: [
            "The plan assumes balanced flight at the planned airspeed and altitude. Fly something else and the plan stops describing the aeroplane.",
            "SAFDIE — suction, alternator and altitude, fuel, DI against the compass, instruments, engine — run at intervals so nothing drifts unnoticed.",
          ],
        },
        {
          title: "Keeping a Flight Log",
          pages: [141],
          intro:
            "What goes in it, when, and why it is what saves you when you are " +
            "unsure of position.",
        },
        {
          title: "Turning Points and Rejoining",
          pages: [142, 143],
          intro:
            "Flying a leg to its end, and arriving at a destination in a way that " +
            "fits the traffic already there.",
        },
        {
          title: "Chart Reading",
          pages: [144, 145],
          intro:
            "The four things it depends on, and how to pick features that will " +
            "still be recognisable at 2,000 feet.",
          context:
            "Read from the chart to the ground, not the other way round: decide " +
            "what you expect to see, then look for it. Reading from the ground to " +
            "the chart is how a pilot talks themselves into believing one lake is " +
            "another, and it is far harder to undo than a missed feature.",
        },
        {
          title: "Pinpointing and Amending the ETA",
          pages: [146, 147],
          intro:
            "Fixing where you are, and correcting the estimate before anyone has to " +
            "ask you for it.",
        },
        {
          title: "Cruise Procedures",
          pages: [148, 149],
          intro:
            "The routine of a leg: top of climb checks, the cruise cycle, and the " +
            "corrections available when the track is not being made good.",
        },
      ],
    },

    {
      title: "Track Corrections and the 1 in 60 Rule",
      syllabus: ["6.36", "6.38"],
      intro:
        "One piece of arithmetic, used four different ways: how far off track " +
        "you are, how much to turn to parallel the track, how much to turn to " +
        "regain it, and how to divert to somewhere else entirely. It is the most " +
        "useful thing in the subject and it fits on a kneeboard.",
      topics: [
        {
          title: "The 1 in 60 Rule",
          pages: [150, 151],
          intro:
            "What the rule says, and why it does not require you to have flown " +
            "60 nm.",
          definition:
            "One degree of angle produces one nautical mile of displacement over " +
            "sixty nautical miles of distance. So track error in degrees equals the " +
            "distance off track, multiplied by 60, divided by the distance flown.",
          term: "The 1 in 60 rule",
        },
        {
          title: "Track Error",
          pages: [152],
          intro:
            "Working out how many degrees the aeroplane has diverged, from the " +
            "distance off and the distance gone.",
        },
        {
          title: "Closing Angle",
          pages: [153, 154],
          intro:
            "The second half of the correction: the extra turn that puts you back " +
            "on track by a chosen point rather than merely parallel to it.",
          keyPoints: [
            "Track error alone stops the divergence getting worse — it makes the aeroplane parallel the planned track.",
            "Closing angle is worked from the distance still to run, and added to the track error, to regain the track at the destination.",
            "Both are the same arithmetic: 60 times the distance off, divided by the distance concerned.",
          ],
        },
        {
          title: "Reciprocal Tracks",
          pages: [155, 156],
          intro:
            "Turning round: the heading to fly back along a track you have been " +
            "drifting on, and why the drift correction doubles.",
        },
        {
          title: "Diverting",
          pages: [157, 158, 159],
          intro:
            "Working a new heading, distance and time to somewhere that was not on " +
            "the plan — including the 60° method for going round weather.",
          takeaway:
            "A diversion worked in the air is a simplified version of the " +
            "planning you already know how to do on the ground: a track measured " +
            "roughly off the chart, a heading corrected for the wind you already " +
            "have, a groundspeed you already know, and a time. The reason it is " +
            "taught as its own drill is that all four have to be done quickly, in " +
            "sequence, while flying - so the order matters more than the " +
            "precision, and the aeroplane has to be pointed roughly the right way " +
            "before any of it starts.",
        },
      ],
    },

    {
      title: "When the Navigation Goes Wrong",
      syllabus: ["6.50"],
      intro:
        "Low level, poor visibility, and being unsure of where you are. These " +
        "are gathered into one chapter because they are one problem with three " +
        "faces, and because the procedure for the last of them is the most " +
        "important drill in the subject.",
      topics: [
        {
          title: "Navigating at Low Level",
          pages: [160],
          intro:
            "What changes below about 500 feet, and what does not.",
        },
        {
          title: "Navigating in Reduced Visibility",
          pages: [161, 162],
          intro:
            "Avoiding the situation, the temptation to resist, and how a diversion " +
            "is worked when the visibility is already poor.",
          takeaway:
            "The advice on this slide — resist the temptation to climb up through " +
            "gaps — is there because it is the decision that turns a difficult " +
            "flight into an accident. A VFR pilot on top of a layer has no legal " +
            "way down and no instrument training to make one.",
        },
        {
          title: "Uncertain of Position",
          pages: [134, 163],
          intro:
            "The first actions, taken while you are merely uncertain rather than " +
            "lost.",
        },
        {
          title: "The Lost Procedure",
          pages: [135, 136, 137, 138, 164, 165],
          intro:
            "The full drill, in order, and the reasoning behind each step.",
          context:
            "The procedure is built on one idea: the aeroplane's position is not " +
            "unknown, it is uncertain within a calculable area, and the flight log " +
            "is what makes it calculable. Hold the heading, work the dead reckoning " +
            "position from the last fix, draw the area it could be in, and search " +
            "that area rather than the whole chart. Wandering while you think about " +
            "it destroys the only information you have.",
        },
        {
          title: "The DR Position and the Most Probable Position",
          pages: [166, 167, 168],
          intro:
            "Two ways of turning the last known fix into an area to search, and the " +
            "ten per cent rule behind both.",
        },
        {
          title: "Navigating in Mountainous Terrain",
          pages: [169, 170, 171],
          intro:
            "Why pinpointing is harder in the mountains, and the preparation that " +
            "makes it possible.",
        },
      ],
    },

    {
      title: "Flight Planning",
      syllabus: ["6.40", "6.42", "6.44", "6.46"],
      intro:
        "Turning a route into a plan: choosing the track and the altitude, " +
        "filling in the plan line by line, and working out the fuel. The deck " +
        "works one complete cross-country from start to finish, and that worked " +
        "example is the backbone of this chapter.",
      topics: [
        {
          title: "Flight Notification and SARTIME",
          pages: [172],
          intro:
            "Telling somebody where you are going and when to worry — how a plan is " +
            "lodged, and the difference between a SARTIME and an ETA.",
          takeaway:
            "A SARTIME is the time at which somebody starts looking for you, and it " +
            "is the only part of a flight plan that works when everything else has " +
            "failed. It has to be updated when the flight changes and terminated " +
            "when it ends — an un-terminated SARTIME launches a search for an " +
            "aeroplane parked on its stand.",
        },
        {
          title: "Reporting a Position",
          pages: [173, 177],
          intro:
            "Working out where you are from a bearing and a distance, and the " +
            "several ways of saying it.",
        },
        {
          title: "Holding Time, ETD and ETI",
          pages: [174, 175, 176],
          intro:
            "Three figures the plan produces that are used in the air: how long you " +
            "could hold, when you expect to leave, and how long each leg should " +
            "take.",
          context:
            "Three figures that come out of the same plan and are used at " +
            "different moments. The estimated time of departure fixes when " +
            "everything else starts. The estimated time interval for each leg is " +
            "what turns a distance into an arrival time, and it is what a " +
            "position report is checked against. Maximum holding time is the one " +
            "that decides an outcome: it is the fuel you have left after the " +
            "reserve, expressed as minutes, and it is the number that tells you " +
            "how long you can wait for an aerodrome to clear before you have to " +
            "go somewhere else.",
        },
        {
          title: "Route Selection",
          pages: [179],
          intro:
            "What decides the route before any arithmetic is done.",
        },
        {
          title: "Selecting an Altitude",
          pages: [180],
          intro:
            "Terrain, cloud, wind, airspace and the cruising level rules, and how " +
            "they interact.",
          takeaway:
            "The cruising altitude is chosen against four things at once, and " +
            "they pull in different directions: terrain clearance sets a floor, " +
            "the cruising level rules constrain what you may use above 3,000 " +
            "feet, the wind may be better or worse a few thousand feet higher, " +
            "and cloud may make the legal choice unflyable. The point of choosing " +
            "on the ground is that you can weigh all four; in the air you will be " +
            "weighing whichever one has just become a problem.",
        },
        {
          title: "Alternates",
          pages: [181],
          intro:
            "Choosing where else you could go, and what makes an alternate worth " +
            "having.",
        },
        {
          title: "Chart Preparation",
          pages: [183],
          intro:
            "What to mark on the chart before flight, and what to leave off it.",
        },
        {
          title: "The Flight Plan: Setting Up",
          pages: [185, 186, 187, 188],
          intro:
            "The worked cross-country the rest of the chapter completes: the route, " +
            "the climb, and the forecast winds it will be planned against.",
        },
        {
          title: "Temperature, Altitude and the Climb",
          pages: [189, 190, 191],
          intro:
            "Working the climb and descent segments — altitudes, temperatures and " +
            "the time each takes.",
        },
        {
          title: "True Airspeed, Tracks and Distances",
          pages: [192, 193],
          intro:
            "Filling in the columns that come off the computer and the chart.",
        },
        {
          title: "Wind Velocities and Interpolation",
          pages: [194, 195],
          intro:
            "Taking the wind from the forecast for a level that is not in the " +
            "forecast.",
        },
        {
          title: "Headings, Groundspeeds and Variation",
          pages: [196, 197],
          intro:
            "The last of the arithmetic, and the correction that turns a true " +
            "heading into one you can fly.",
        },
        {
          title: "Fuel Requirements",
          pages: [198, 199, 201],
          intro:
            "What must be carried, how the minimum is built up, and where the " +
            "figures come from.",
          keyPoints: [
            "Fuel is planned as: taxi and start, the flight itself, any alternate, the fixed reserve, and a holding or contingency allowance.",
            "The reserve is a floor, not a plan: arriving with exactly the reserve means every assumption on the plan happened to be right.",
            "Plan in the same units as the aeroplane's gauges and dipstick, and convert once rather than repeatedly.",
          ],
          context:
            "The consumption rates on this slide are given to you, and on a real " +
            "flight they are not: you derive them from the aircraft flight manual " +
            "for the aeroplane you are flying, on the day, at the power setting " +
            "and altitude you plan to use. That is the step to practise. The " +
            "manual gives a rate in litres or gallons per hour for each phase - " +
            "climb, cruise at a stated power and level, descent, holding - and a " +
            "leg's fuel is that rate multiplied by the time the leg will take. " +
            "Change the cruise level or the power setting and the rate changes " +
            "with it, which is why the fuel figure is worked out after the route " +
            "and the altitude have been decided rather than before.",
        },
      ],
    },

    {
      title: "Cruise Performance",
      syllabus: ["6.28", "6.62"],
      intro:
        "Four different ways to fly the same leg, each optimal for something " +
        "different. Knowing which one you want is what turns a fuel figure into " +
        "a decision.",
      topics: [
        {
          title: "Maximum Range",
          pages: [203],
          intro:
            "Flying the greatest distance on the fuel carried, and what it costs in " +
            "time.",
        },
        {
          title: "Specific Range",
          pages: [204],
          intro:
            "Distance per unit of fuel, and the difference between the best air " +
            "range and the best ground range.",
        },
        {
          title: "Maximum Endurance",
          pages: [205],
          intro:
            "Staying airborne longest, which is a different speed and a different " +
            "purpose.",
        },
        {
          title: "Minimum Flight Time",
          pages: [206],
          intro:
            "Getting there fastest, and what the wind does to the answer.",
        },
      ],
    },

    {
      title: "Radio Aids for VFR Navigation",
      syllabus: ["6.70", "6.72"],
      intro:
        "The aids a VFR pilot may use to support visual navigation — never to " +
        "replace it. Each one is covered as what it does, how it is read, and " +
        "what it will not tell you.",
      topics: [
        {
          title: "The Automatic Direction Finder",
          pages: [208],
          intro:
            "What an ADF receives, and what the needle is pointing at.",
        },
        {
          title: "Relative Bearings from an NDB",
          pages: [209, 210],
          intro:
            "Turning the needle's relative bearing into a magnetic bearing to or " +
            "from the station.",
          diagramNotes: {
            209: "The needle read as a relative bearing: ahead, behind, and off to one side — the three cases every ADF question reduces to.",
          },
        },
        {
          title: "Variation and the ADF",
          pages: [211],
          intro:
            "Why the chart and the instrument are not in the same units, and what " +
            "to do about it.",
        },
        {
          title: "The VOR",
          pages: [213, 214, 215, 216],
          intro:
            "What a VOR transmits, what a radial is, and how the indicator is set " +
            "up and read.",
          diagramNotes: {
            214: "The VOR indicator: course index, the TO/FROM flag, the deviation scale and the omni bearing selector.",
            216: "A radial as a magnetic bearing from the station, and the same aircraft position shown on the instrument.",
          },
        },
        {
          title: "Distance Measuring Equipment",
          pages: [218],
          intro:
            "What DME measures, and the difference between that and the distance " +
            "over the ground.",
          context:
            "DME answers one question - how far am I from the station - and it " +
            "answers it as a slant range, the straight-line distance from the " +
            "aircraft to the ground station rather than the distance across the " +
            "ground. Directly overhead a DME at 6,000 feet the reading is about " +
            "one nautical mile, not zero. At the ranges a cross-country is flown " +
            "the difference is small enough to ignore, and close in it is not.",
        },
        {
          title: "GPS: Segments and Position Fixing",
          pages: [220, 221, 222],
          intro:
            "The three segments of the system, and how many satellites a position " +
            "actually needs.",
          diagramNotes: {
            222: [
              "The three segments of the system: the satellites in orbit, the ground control stations that track and correct them, and the receiver in the aircraft.",
              "The satellite constellation, arranged so that several are in view from anywhere on Earth.",
              "Position fixing by ranging: each satellite fixes the receiver somewhere on a sphere around it, and the spheres intersect at one point.",
            ],
          },
          context:
            "A GPS receiver does not know where it is - it works out how long a " +
            "signal took to arrive from each satellite, turns that into a " +
            "distance, and finds the one place all those distances agree on. " +
            "Three satellites fix a position in two dimensions and a fourth adds " +
            "altitude and corrects the receiver's clock, which is why coverage " +
            "matters and why the receiver needs several satellites in view rather " +
            "than one. Everything in the next two topics about integrity and " +
            "error follows from that: the fix is a calculation, and it is only as " +
            "good as the signals it was calculated from.",
        },
        {
          title: "GPS Integrity and Accuracy",
          pages: [223, 224, 225, 226],
          intro:
            "RAIM, dilution of precision, the datum the whole system is referenced " +
            "to, and the augmentation that improves it.",
        },
        {
          title: "GPS Errors and Human Factors",
          pages: [227, 228, 229],
          intro:
            "What degrades a GPS position, the mistakes pilots make with the box, " +
            "and why it stays a back-up.",
          takeaway:
            "The errors that matter most in a light aircraft are not satellite " +
            "errors — they are mode errors, data entry errors and non-standard " +
            "switchery. A GPS will confidently navigate you to the wrong waypoint " +
            "if that is the one you typed, which is why the chart, the clock and " +
            "the heading stay the primary means of navigation.",
        },
        {
          title: "Primary and Secondary Radar",
          pages: [231, 232, 233, 234, 235, 236],
          intro:
            "The two kinds, the principle each works on, and what a transponder " +
            "adds to what a controller sees.",
          context:
            "Primary radar works on an echo — it sees anything that reflects, " +
            "including terrain and weather, and needs nothing from the aeroplane. " +
            "Secondary radar interrogates the transponder and gets a coded reply, " +
            "so it sees only aircraft that answer, and it sees them with an " +
            "identity and, in Mode C, an altitude. That is why transponder " +
            "mandatory airspace exists: without the reply, the controller's picture " +
            "of you is far poorer.",
        },
        {
          title: "Radar Services for VFR Flights",
          pages: [237, 238],
          intro:
            "The four services a VFR flight can ask for, and what each one commits " +
            "the controller to.",
        },
      ],
    },
  ],
};
