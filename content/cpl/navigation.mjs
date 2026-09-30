/**
 * Flight Navigation General — the curriculum.
 *
 * The CPL Navigation deck is the best-organised of the six: it is a real
 * PowerPoint rather than a flattened PDF, and its sixteen section dividers
 * describe a sensible teaching order that this curriculum mostly keeps.
 *
 * Three places depart from it, each for a reason.
 *
 *   - The deck's "Visual Navigation Procedures" section runs from slide 135 to
 *     184 and contains three unrelated subjects: the routine of flying a
 *     planned leg, the arithmetic of getting back onto track, and what to do
 *     when the weather or the terrain has taken the plan away from you. Fifty
 *     slides under one heading is a chapter a student cannot navigate, so it
 *     becomes four.
 *
 *   - "Fuel Planning" is one slide. As its own chapter it would be a heading
 *     with a paragraph under it; it belongs at the end of the flight plan it
 *     completes, which is where it is.
 *
 *   - Slide 189 is the heading "Chart Preparation" with nothing under it and
 *     slide 190 is its body. They are one topic.
 *
 * Everything in `intro`, `definition`, `keyPoints`, `example`, `context`,
 * `misconception` and `takeaway` is written for this course. It explains,
 * connects and warns; it never states a rule, a minimum, a conversion factor or
 * a limit that the deck does not.
 */

export const subject = {
  slug: "navigation",
  title: "Flight Navigation General",
  deck: "cpl-navigation",

  skip: {
    1: "deck cover slide: the words \"CPL Navigation\" on a title layout, with no body text and no diagram",
    2: "examination administration — length, question count, chart scale and the calculator rule. Useful to a student, but it belongs on the course page rather than inside a lesson on navigation",
    3: "section divider: the heading \"Shape of the Earth\" with no text of its own",
    19: "section divider: the heading \"Direction on the Earth\" with no text of its own",
    36: "carries only the heading \"Tracks and Bearings on Aeronautical Charts\" and the line \"Student to demonstrate to Instructor\" — a classroom exercise with no teaching content for a reader",
    37: "section divider: the heading \"Speed\" with no text of its own",
    51: "blank slide: no text, no diagram, no table",
    52: "section divider: the heading \"Altimetry\" with no text of its own",
    64: "section divider: the heading \"Time\" with no text of its own",
    89: "carries the heading \"Duration of Daylight\" and the two words \"North Pole\" and \"South Pole\", which label a diagram that is not on the slide. Nothing survives extraction; the concept is taught in the twilight topic instead",
    90: "section divider: the heading \"Aeronautical Maps and Charts\" with no text of its own",
    108: "section divider: the heading \"Computations\" with no text of its own",
    135: "section divider: the heading \"Visual Navigation Procedures\" with no text of its own",
    185: "section divider: the heading \"Flight Planning\" with no text of its own",
    191: "section divider: the heading \"Plan Preparation\" with no text of its own",
    209: "section divider: the heading \"Fuel Planning\" with no text of its own",
    211: "section divider: the heading \"Enroute Diversion Calculations\" with no text of its own",
    224: "section divider: the heading \"Cruise Performance\" with no text of its own",
    230: "section divider: the heading \"Radio Aids in Support of VFR Operations\" with no text of its own",
    250: "closing section divider: the heading \"Exam Techniques\" with no text of its own",
  },

  chapters: [
    /* ================================================================= 1 == */
    {
      title: "The Shape of the Earth and Position",
      syllabus: ["18.2", "18.6"],
      intro:
        "Everything else in this subject rests on two ideas: that the Earth is " +
        "a sphere, and that a sphere can be ruled with a grid. Get the " +
        "vocabulary of that grid right here and the rest of the subject is " +
        "arithmetic.",
      topics: [
        {
          title: "The Form and Rotation of the Earth",
          pages: [4, 5, 6],
          intro:
            "The Earth is close enough to a sphere for navigation and not quite " +
            "close enough to ignore. Both halves of that sentence matter later.",
          keyPoints: [
            "An oblate spheroid is flattened at the poles: the distance round the Earth through the poles is shorter than round the Equator.",
            "The polar axis runs from the South geographic pole to the North geographic pole, and the Earth turns about it from west to east.",
            "Where the axis meets the surface defines true north and true south — the reference every chart is drawn to.",
          ],
          context:
            "West-to-east rotation is not a piece of trivia. It is why the sun " +
            "appears to move westward, why local time runs ahead of you as you " +
            "fly east, and why the whole of the Time chapter works the way it " +
            "does.",
        },
        {
          title: "Great Circles and Small Circles",
          pages: [7, 8, 9, 10],
          intro:
            "The one distinction in this chapter that examiners return to, and " +
            "the one that decides which line on a chart is actually the shorter " +
            "way there.",
          definition:
            "A great circle is a circle on the Earth's surface whose plane passes " +
            "through the centre of the Earth. A small circle is any circle whose " +
            "plane does not.",
          term: "Great circle and small circle",
          keyPoints: [
            "The arc of a great circle is the shortest distance between two points on the Earth.",
            "Only one great circle can be drawn between two points — unless they are exactly opposite each other.",
            "The meridians of longitude and the Equator are great circles; every other parallel of latitude is a small circle.",
          ],
          misconception:
            "Thinking a great circle is defined by being big. What defines it is " +
            "the plane passing through the centre of the Earth; being the largest " +
            "circle that can be drawn is a consequence of that, not the test.",
        },
        {
          title: "Rhumb Lines",
          pages: [11],
          intro:
            "The other way to join two points: not the shortest, but the one you " +
            "can actually fly without continually altering heading.",
          definition:
            "A rhumb line is a line that cuts every meridian of longitude at the " +
            "same angle.",
          term: "Rhumb line",
          context:
            "A rhumb line is a constant direction and a great circle is not, " +
            "because the meridians converge towards the poles and a great circle " +
            "crosses each of them at a slightly different angle. Over a short leg " +
            "the two are indistinguishable; over an ocean crossing the difference " +
            "is worth real fuel. Both facts live together: the great circle is " +
            "shorter, the rhumb line is easier to fly.",
        },
        {
          title: "The Equator and Parallels of Latitude",
          pages: [12, 13],
          intro:
            "The north–south half of the grid, and the one exception in it.",
          keyPoints: [
            "The Equator is a great circle whose plane is at right angles to the polar axis.",
            "Parallels of latitude join points of equal latitude and are small circles — every one of them except the Equator.",
          ],
        },
        {
          title: "Meridians of Longitude",
          pages: [14, 15],
          intro:
            "The east–west half of the grid. Every meridian is half a great " +
            "circle, and each one indicates true north and south at the point you " +
            "are standing.",
          keyPoints: [
            "Longitude is angular distance east or west of the Prime Meridian at Greenwich, which is designated 0°.",
            "A meridian is half a great circle; its other half is the meridian 180° away.",
            "Every great circle containing the polar axis is a meridian of longitude.",
            "Meridians cut the parallels of latitude at 90°.",
          ],
          context:
            "That last point is why a chart's grid is a useful protractor: if " +
            "meridians and parallels meet at right angles on the paper as they do " +
            "on the Earth, an angle you measure against a meridian is a real " +
            "angle. The Charts chapter calls a projection that preserves this " +
            "“conformal”, and it is the single property an aeronautical " +
            "chart cannot do without.",
        },
        {
          title: "Units of Distance",
          pages: [16, 17],
          intro:
            "Three units, one of which is defined by the Earth itself — which is " +
            "why it is the one aviation uses.",
          keyPoints: [
            "The nautical mile is the length of the arc of a great circle subtending one minute of angle at the centre of the Earth.",
            "One minute of latitude is therefore one nautical mile, which is what makes a chart's latitude scale a distance scale.",
            "The statute mile has no application in navigation; the kilometre is one ten-thousandth of the distance from the Equator to the pole.",
          ],
          takeaway:
            "Because a nautical mile is one minute of arc, you can measure " +
            "distance off the latitude scale at the side of a chart. Never off the " +
            "longitude scale along the top — meridians converge, so a minute of " +
            "longitude shrinks as you move away from the Equator.",
        },
        {
          title: "Specifying Position on the Earth",
          pages: [18],
          intro:
            "Latitude and longitude fix a point exactly. They are also almost " +
            "useless on the radio, which is why the slide ends with two other " +
            "methods.",
          keyPoints: [
            "Position is stated as latitude north or south, then longitude east or west.",
            "One degree is 60 minutes of arc; one minute is 60 seconds.",
            "For reporting, over-or-abeam a named feature, or distance and bearing from one, is what actually gets used.",
          ],
          context:
            "Reading a full latitude and longitude aloud takes long enough that " +
            "the aircraft has moved before the sentence ends. Keep the grid for " +
            "planning and plotting; use place names and bearing-and-distance for " +
            "talking. The Position Reporting topic later in this subject returns " +
            "to this properly.",
        },
      ],
    },

    /* ================================================================= 2 == */
    {
      title: "Direction: True, Magnetic and Compass",
      syllabus: ["18.4"],
      intro:
        "A chart is drawn to true north. A compass points somewhere else, and " +
        "the instrument in front of you points somewhere else again. This " +
        "chapter is the two corrections that get you from one to the other, and " +
        "the discipline of always knowing which of the three you are holding.",
      topics: [
        {
          title: "Direction and the Compass Rose",
          pages: [20],
          intro:
            "How direction is expressed before any correction is applied to it.",
          keyPoints: [
            "Direction is a circle of 360 degrees with north at 000.",
            "Directions are given as three figures — 090° rather than 90°.",
            "Runway designators are the exception: they carry two figures, being the magnetic direction rounded to the nearest ten degrees.",
          ],
        },
        {
          title: "True Direction",
          pages: [21],
          intro:
            "What a chart measures, and why you cannot fly it directly.",
          context:
            "True direction is the angle at which a track crosses a local " +
            "meridian, and it is what a protractor on a chart gives you. Nothing " +
            "in the cockpit displays it. That single mismatch is the reason " +
            "variation exists as a subject: the plan is made in one reference and " +
            "flown in another.",
        },
        {
          title: "The Earth's Magnetic Field",
          pages: [22, 23],
          intro:
            "Why magnetic north is somewhere else, and why it moves.",
          keyPoints: [
            "The Earth behaves as a large magnet with a magnetic north and a magnetic south pole.",
            "Lines of magnetic flux run between them and form the field the compass aligns with.",
            "The magnetic poles are not the geographic poles — the northern one lies in the region of Hudson Bay in Canada, the southern one near South Victoria in Antarctica.",
          ],
        },
        {
          title: "Magnetic Variation and Isogonals",
          pages: [24, 25, 26],
          intro:
            "The first of the two corrections, and the one that is printed on the " +
            "chart for you.",
          definition:
            "Variation is the angular difference between true north and magnetic " +
            "north at a given place.",
          term: "Variation",
          keyPoints: [
            "Variation is given on navigation charts by lines joining points of equal variation, called isogonals.",
            "Variation east — magnetic least.",
            "Variation west — magnetic best.",
          ],
          context:
            "Variation is a property of where you are, not of your aircraft. Two " +
            "aircraft over the same point have the same variation; the same " +
            "aircraft on a long east–west leg does not, which is why the value is " +
            "taken from the chart for the part of the route being planned rather " +
            "than once for the whole trip.",
        },
        {
          title: "Converting True to Magnetic",
          pages: [27],
          intro:
            "The rhyme applied in the direction that matters — chart to cockpit.",
          example:
            "180°T with 25° East variation: east is least, so subtract. " +
            "180 − 25 = 155°M. Then 220°T with 17° West variation: west is best, " +
            "so add. 220 + 17 = 237°M.",
          exampleTitle: "Both directions of the rhyme",
          misconception:
            "The commonest error is not forgetting the rhyme but applying it the " +
            "wrong way round, because it only describes going from true to " +
            "magnetic. Coming back the other way — a magnetic bearing you want to " +
            "plot on a chart — the sign reverses. If you are ever unsure, sketch " +
            "true north and magnetic north as two lines and read the angle off; " +
            "it takes ten seconds and it cannot be got backwards.",
        },
        {
          title: "Compass Deviation",
          pages: [28, 29, 30],
          intro:
            "The second correction, and the one that belongs to the aircraft " +
            "rather than to the place.",
          definition:
            "Deviation is the angular difference between magnetic direction and " +
            "compass direction.",
          term: "Deviation",
          keyPoints: [
            "It is caused by metal and by the magnetic fields of the aircraft's own electrical equipment.",
            "Its value for that aircraft on that heading is read from the deviation card.",
            "Deviation east — compass least. Deviation west — compass best.",
          ],
          example:
            "340°M with 1° West deviation: west is best, so add. 340 + 1 = 341°C. " +
            "045°M with 3° East deviation: east is least, so subtract. " +
            "045 − 3 = 042°C.",
          exampleTitle: "Magnetic to compass",
          context:
            "Deviation is small — usually a degree or two — and it is the last " +
            "correction applied, so the order runs true, magnetic, compass. " +
            "Because it comes from the aircraft, moving something metal in the " +
            "cockpit changes it. A headset or a torch left on the coaming is a " +
            "genuine source of error, and it is not on the card.",
        },
        {
          title: "Bearings: True, Magnetic, Compass and Relative",
          pages: [31, 32, 33],
          intro:
            "The same three references again, now applied to the direction of a " +
            "thing rather than the direction you are going — plus a fourth that " +
            "is measured from the aircraft itself.",
          keyPoints: [
            "A straight line drawn between two points on a chart gives a true bearing; the direction back along it is the reciprocal, so a true bearing is always either TO or FROM.",
            "That reciprocal is also called the back bearing — the same line read in the opposite direction, 180° away. A bearing of 070° has a back bearing of 250°.",
            "A true bearing corrected for variation is a magnetic bearing; a magnetic bearing corrected for deviation is a compass bearing.",
            "A relative bearing is measured clockwise in degrees from the nose of the aircraft.",
          ],
          misconception:
            "Treating a relative bearing as a direction. It is not one — it is an " +
            "angle away from wherever the nose happens to be pointing, so the same " +
            "object gives a different relative bearing the moment you turn. It " +
            "becomes a direction only when you add the heading to it.",
        },
        {
          title: "Converting Between Bearing References",
          pages: [34, 35],
          intro:
            "Putting the three conversions together in the order they are used " +
            "when a needle gives you a relative bearing and a chart needs a true " +
            "one.",
          example:
            "Heading 340°M with the needle showing a relative bearing of 090°. " +
            "340 + 090 = 430; subtract 360 to bring it back into range, giving a " +
            "magnetic bearing to the station of 070°M. With 20° East variation, " +
            "east is least going the other way — so plotting on a true chart, " +
            "070 + 20 = 090°T.",
          exampleTitle: "Needle to chart",
          keyPoints: [
            "Heading plus relative bearing gives the bearing TO the station; if the total exceeds 360, subtract 360.",
            "Adding or subtracting 180° turns a bearing TO into the bearing FROM, which is the one you plot away from the station.",
          ],
          context:
            "Taking a bearing off the chart in the first place has cautions of its " +
            "own. A protractor measures the angle between your track and a " +
            "meridian, and meridians converge — so on a long leg the angle at the " +
            "departure end and the angle at the arrival end are not the same " +
            "number. Measure against the meridian nearest the middle of the leg, " +
            "and the error either side of it cancels. Distance comes off the " +
            "latitude scale at the side of the sheet and never off the longitude " +
            "scale along the top, for the same reason: a minute of latitude is a " +
            "nautical mile everywhere, a minute of longitude shrinks as you move " +
            "away from the Equator. And whatever you measure is a true bearing, " +
            "because the chart is drawn to true north — it is not usable in the " +
            "cockpit until variation has been applied.",
          takeaway:
            "Say out loud which reference you are in at every step. Almost every " +
            "error in this chapter is not arithmetic — it is arriving at a right " +
            "answer in the wrong reference.",
        },
      ],
    },

    /* ================================================================= 3 == */
    {
      title: "Speed and the Triangle of Velocities",
      syllabus: ["18.8", "18.34"],
      intro:
        "An aircraft has one speed through the air and a different one over the " +
        "ground, and the wind is the entire difference between them. This " +
        "chapter defines both, explains why the airspeed indicator does not " +
        "read either of them once you have climbed, and introduces the triangle " +
        "that the rest of the subject solves over and over.",
      topics: [
        {
          title: "Speed in Aviation",
          pages: [38, 39],
          intro:
            "Knots, and the one arithmetic shortcut worth memorising before " +
            "anything else.",
          keyPoints: [
            "Speed is measured in nautical miles per hour — knots.",
            "At 60 kt you cover one nautical mile per minute; at 120 kt, two.",
            "Airspeed is speed relative to the air; groundspeed is speed relative to the ground.",
            "Inertial and GNSS systems state speed as groundspeed.",
          ],
          takeaway:
            "The nautical-mile-per-minute relationship is the basis of nearly " +
            "every mental calculation in the cockpit. Learn your own aircraft's " +
            "figure — at 90 kt it is 1.5 nm a minute — and revising an ETA stops " +
            "needing the flight computer at all.",
        },
        {
          title: "The Airspeed Chain: IAS, CAS, EAS and TAS",
          pages: [40],
          intro:
            "Four speeds, each one the previous speed with an error taken out of " +
            "it. The deck teaches the order with a mnemonic; the table below is " +
            "the chain itself, reconstructed from the diagram on the slide.",
          keyPoints: [
            "Indicated airspeed is what the instrument shows.",
            "Calibrated airspeed is IAS corrected for instrument and pressure error.",
            "Equivalent airspeed is CAS corrected for compressibility error.",
            "True airspeed is EAS corrected for density error.",
          ],
          context:
            "Each correction removes one lie the instrument is telling. Only two " +
            "of them matter at the speeds a CPL candidate flies: the deck's own " +
            "note records that below about 250 kt compressibility is negligible, " +
            "so CAS and EAS are effectively the same number and the working chain " +
            "is IAS → CAS → TAS. Density is the correction that does the real " +
            "work, and the next two topics are about it.",
          misconception:
            "Assuming the chain is a set of increasing numbers. It is a set of " +
            "corrections, and the correction can go either way — CAS can be lower " +
            "than IAS. It is only the density step that reliably moves in one " +
            "direction as you climb.",
        },
        {
          title: "Why True Airspeed Exceeds Indicated Airspeed with Height",
          pages: [41, 42],
          intro:
            "The single most useful idea in this chapter, and one worth being " +
            "able to explain rather than recite.",
          keyPoints: [
            "The difference between IAS and TAS is density.",
            "At sea level on a standard day the two are the same.",
            "The airspeed indicator measures dynamic pressure, not speed.",
            "In thinner air the aircraft must move faster to generate the same dynamic pressure, so TAS rises for a given IAS as density falls.",
          ],
          context:
            "This is why the aircraft handles by indicated airspeed and navigates " +
            "by true airspeed. The wing only ever feels dynamic pressure, so the " +
            "stall, the approach speed and the limiting speeds are all indicated " +
            "figures and do not change with altitude. The ground, meanwhile, only " +
            "sees how fast you are actually moving — so the flight plan is built " +
            "on TAS.",
          takeaway:
            "Same IAS, higher altitude, greater TAS. If a question moves an " +
            "aircraft up and holds the indicated airspeed, the true airspeed has " +
            "gone up and so has the groundspeed.",
        },
        {
          title: "Factors Affecting True Airspeed",
          pages: [43, 44],
          intro:
            "The two variables behind density, and which way each of them pushes.",
          keyPoints: [
            "True airspeed is affected by density, and density changes with temperature, pressure and altitude.",
            "Cold air is denser than warm air, so on a warm day the aircraft must fly faster to hold the same IAS.",
            "As the aircraft climbs, pressure and density fall; hold the same IAS and TAS has increased.",
          ],
          misconception:
            "Reaching for the flight computer for a question that only asks which " +
            "way the number moves. Warmer or higher both mean thinner air, and " +
            "thinner air always means a higher TAS for a given IAS. The wheel is " +
            "for how much, not whether.",
        },
        {
          title: "Vectors and the Triangle of Velocities",
          pages: [45, 46],
          intro:
            "Three quantities, each with a size and a direction, that always add " +
            "up. Once you can see the triangle, every wind problem in this subject " +
            "is the same problem with a different side missing.",
          keyPoints: [
            "A vector is a line representing both a speed and a direction.",
            "The three vectors are heading with TAS, track with groundspeed, and wind direction with wind speed.",
            "Adding the wind vector to the heading/TAS vector gives track and groundspeed.",
          ],
          diagramNotes: {
            46:
              "The three vectors closing into a triangle. The heavy line from A to " +
              "B is heading and TAS — where the nose points and how fast the " +
              "aircraft moves through the air. The short arrow from B to C is the " +
              "wind, drawn blowing with it. The line from A to C is what results: " +
              "track and groundspeed, the path actually made over the ground. The " +
              "angle marked at A between the two long lines is the drift.",
          },
          context:
            "Any two of the three vectors give you the third. Planning, you know " +
            "the track you want and the forecast wind, and you solve for heading " +
            "and groundspeed. Airborne, you know your heading and TAS and can " +
            "measure the track you are actually making, so you solve for the wind. " +
            "It is one triangle, worked from whichever corner you happen to be " +
            "standing in.",
        },
        {
          title: "Drift and Drift Correction",
          pages: [47, 48],
          intro:
            "What the wind does to you, and the deliberate error you fly to " +
            "cancel it.",
          definition:
            "Drift is the angular difference between track and heading.",
          term: "Drift",
          keyPoints: [
            "Drift is caused by wind; a direct headwind or tailwind produces none.",
            "To follow a track, the nose is turned into wind to compensate — drift correction.",
            "Wind pushing the aircraft left of track is corrected with left or port drift; pushing it right, with right or starboard drift.",
          ],
          misconception:
            "Confusing which way the wind pushes you with which way you turn. " +
            "They are opposite: a wind from the left blows you right, so you turn " +
            "left into it. The deck's own test is the reliable one — ask which " +
            "wing is further forward.",
        },
        {
          title: "Wind Velocity and Components",
          pages: [49],
          intro:
            "A short topic about a long-standing trap: wind is quoted in two " +
            "different references depending on where you read it.",
          keyPoints: [
            "Some wind velocities are given in degrees true and others in degrees magnetic.",
            "A wind component is expressed as a plus for a tailwind and a minus for a headwind.",
          ],
          takeaway:
            "Check the reference before using a wind, not after. Forecast winds " +
            "are conventionally true and the runway is magnetic, so combining them " +
            "without converting inserts the local variation straight into your " +
            "crosswind calculation.",
        },
        {
          title: "Navigation Terminology",
          pages: [50],
          intro:
            "Five terms that appear throughout the rest of this subject and are " +
            "easy to use loosely.",
          keyPoints: [
            "Flight-planned track: the planned path of the aircraft over the Earth's surface.",
            "Required track: the track needed to reach a point once you are off the planned one.",
            "Track made good: the path actually flown over the surface.",
            "Wind angle: the angle between the wind direction and the track.",
            "Wind correction angle: the correction applied to allow for drift and make good the planned track.",
          ],
          context:
            "The distinction between flight-planned track, track made good and " +
            "required track is the whole of the 1 in 60 chapter in three phrases. " +
            "You compare the first two to find out how wrong you are, then work " +
            "out the third to fix it.",
        },
      ],
    },

    /* ================================================================= 4 == */
    {
      title: "Altimetry and Cruising Levels",
      syllabus: ["18.12"],
      intro:
        "An altimeter is a pressure gauge with a height scale printed on it. " +
        "Everything that follows — the settings, the transition layer, the " +
        "cruising level table — exists because pressure is not the same " +
        "everywhere and does not stay the same for long.",
      topics: [
        {
          title: "Vertical Reference: Height, Altitude and Elevation",
          pages: [53, 54],
          intro:
            "Seven definitions that differ only in what they are measured from. " +
            "The datum is the whole distinction.",
          keyPoints: [
            "Height is measured from a specified datum; altitude is measured from mean sea level.",
            "Elevation is the height of the surface above sea level.",
            "Indicated altitude is what the altimeter shows with the correct QNH set.",
            "Calibrated altitude is indicated altitude corrected for instrument and position error; true altitude is calibrated altitude corrected for density error.",
            "Pressure altitude is the altitude in the standard atmosphere corresponding to the actual pressure; density altitude is the altitude in the standard atmosphere with the same density as the actual conditions.",
          ],
          context:
            "Notice that calibrated and true altitude follow exactly the same " +
            "pattern as calibrated and true airspeed — instrument error out first, " +
            "then density. Both instruments are measuring pressure and inferring " +
            "something else from it, so both inherit the same two errors.",
        },
        {
          title: "Flight Levels and the Transition Layer",
          pages: [55],
          intro:
            "Above a certain point everyone abandons the local pressure and uses " +
            "the same one, so that aircraft are separated from each other even if " +
            "none of them knows its true height.",
          keyPoints: [
            "A flight level is a level flown against the standard pressure setting of 1013.2 hPa.",
            "The transition altitude is the altitude at which 1013.2 is set when climbing.",
            "The transition level is the level at which the aerodrome QNH is set when descending.",
            "The transition layer between them keeps aircraft on QNH separated from aircraft on the standard setting.",
          ],
          context:
            "The layer exists because the changeover cannot be instantaneous for " +
            "everybody at once. An aircraft climbing changes setting at one height " +
            "and an aircraft descending changes at another, and the gap between " +
            "those two heights is the buffer that stops the two ever being on " +
            "different settings at the same level. The New Zealand figures are in " +
            "the altimeter setting rules topic later in this chapter.",
        },
        {
          title: "Altimeter Settings: QNH, QFE and QNE",
          pages: [56],
          intro:
            "Three settings, three different questions being asked of the same " +
            "instrument.",
          keyPoints: [
            "QNH sets sea level pressure in the subscale, so the altimeter reads altitude above mean sea level.",
            "QFE sets aerodrome pressure, so the altimeter reads height above that datum — zero on the ground.",
            "QNE is the standard setting of 1013, and the altimeter then reads pressure altitude, expressed as a flight level.",
          ],
          takeaway:
            "QNH tells you your height above the sea, which is what the terrain " +
            "on the chart is measured from. QFE tells you your height above the " +
            "aerodrome. QNE tells you nothing about your real height at all — only " +
            "where you sit relative to everyone else using the same setting.",
        },
        {
          title: "Flying Between Areas of Different Pressure",
          pages: [57, 58, 59],
          intro:
            "The error that puts aircraft into terrain, and the four words that " +
            "prevent it.",
          keyPoints: [
            "If mean sea level pressure were the same everywhere, an altimeter set to it would always read true height.",
            "It is not, so if the setting is no longer the pressure where you are, the height shown is wrong.",
            "Flying from high pressure to low pressure without resetting, the altimeter over-reads.",
            "Flying from low pressure to high pressure without resetting, the altimeter under-reads.",
          ],
          example:
            "Leaving Auckland at 6,500 ft with 995 hPa set and flying to Gisborne " +
            "where the QNH is 1020, holding the indicated 6,500 ft all the way. " +
            "The aircraft has in fact been climbing steadily relative to sea level, " +
            "because the datum under it has been falling away. Fly the same route " +
            "in reverse and the aircraft descends steadily instead — while the " +
            "needle never moves.",
          exampleTitle: "Auckland to Gisborne at a constant indication",
          misconception:
            "Reading “over-reads” as “safe” because the number " +
            "on the dial is larger. It is the opposite: over-reading means the " +
            "altimeter is claiming more height than you have, so you are lower " +
            "than you think. That is the dangerous one, and it is the direction " +
            "the deck's phrase names — high to low, look out below.",
        },
        {
          title: "Temperature Error and True Altitude",
          pages: [60],
          intro:
            "The second reason the altimeter is not telling you your real height, " +
            "and the one no setting can correct.",
          keyPoints: [
            "The altimeter is built around the standard atmosphere, which assumes about 1 hPa per 30 ft.",
            "Temperature changes that lapse rate.",
            "In warm air, true altitude is higher than indicated altitude.",
            "In cold air, true altitude is lower than indicated altitude.",
          ],
          context:
            "Pressure error you can fix by dialling in the right QNH. Temperature " +
            "error you cannot — the subscale has no way to tell the instrument how " +
            "cold the column of air beneath you is. This is why cold weather " +
            "operations near terrain carry a caution that warm ones do not: on a " +
            "genuinely cold day the aircraft is lower than the altimeter says and " +
            "there is no setting that will change that.",
          takeaway: "Cold and low go together, in both senses of the phrase.",
        },
        {
          title: "Altimeter Setting Rules in the New Zealand FIR",
          pages: [61, 62],
          intro:
            "The rule that turns the transition layer from an idea into three " +
            "specific instructions.",
          keyPoints: [
            "At or above the transition level of FL150, maintain vertical position by reference to 1013.2 hPa.",
            "At or below 13,000 ft, maintain vertical position by reference to the QNH setting.",
            "Between 13,000 ft and FL150, use the altimeter setting advised by ATC.",
            "Climbing, 1013 is set on passing the transition altitude of 13,000 ft; descending, the local QNH is set on passing FL150.",
          ],
          context:
            "The reason given on the slide is a practical one rather than a legal " +
            "one: an aircraft covering ground quickly, well above any terrain, " +
            "would otherwise be resetting its subscale continuously for no safety " +
            "benefit. Above the transition level nobody needs to know their height " +
            "above the sea — only that they are separated from each other.",
        },
        {
          title: "VFR Cruising Levels",
          pages: [63],
          intro:
            "The table that keeps opposing traffic 1,000 ft apart without anyone " +
            "having to coordinate it.",
          keyPoints: [
            "VFR flights more than 3,000 ft above the surface must use an appropriate level from the table of cruising levels.",
            "Magnetic track 270°M through north to 089°M: odd thousands plus 500.",
            "Magnetic track 090°M through south to 269°M: even thousands plus 500.",
            "Above the transition altitude the same split applies, but the levels are flight levels flown on 1013 rather than altitudes on QNH — the sequence simply continues, so the first VFR level above the transition is FL155, then FL165, and so on by the same magnetic-track rule.",
          ],
          diagramNotes: {
            63:
              "The rule drawn as a compass rose split across the 090–270 line. The " +
              "upper half, tracks from 270°M clockwise through north to 089°M, is " +
              "marked odd thousands plus 500. The lower half, 090°M through south " +
              "to 269°M, is marked even thousands plus 500. The labels either side " +
              "of the dividing line show where each half begins and ends.",
          },
          context:
            "The rule does not stop at the transition altitude — it changes " +
            "units. Below it you are on QNH and the table is written in altitudes; " +
            "above it everyone is on 1013 and the same table is written in flight " +
            "levels. The arithmetic and the magnetic-track split are identical; " +
            "only the datum underneath them has changed. The published table for " +
            "both is in the AIP, and it is the authority — this explains the " +
            "pattern so the table makes sense rather than replacing it.",
          takeaway:
            "It is the magnetic track that decides the level, not the heading. On " +
            "a windy day those differ by the drift angle, and a track of 088°M " +
            "flown on a heading of 095°M is still an odd-thousands-plus-500 leg.",
        },
      ],
    },

    /* ================================================================= 5 == */
    {
      title: "Time, Daylight and Twilight",
      syllabus: ["18.16"],
      intro:
        "Time in navigation is a measure of how far the Earth has turned. Once " +
        "that is accepted, converting between time zones and calculating when " +
        "the light will go are the same piece of arithmetic in different " +
        "clothes.",
      topics: [
        {
          title: "Date and Time Groups",
          pages: [65],
          intro:
            "Four formats, differing only in how much of the date they carry.",
          keyPoints: [
            "Time is expressed in the 24-hour clock.",
            "Six figures give day and time: the 24th at 1pm is 241300.",
            "Eight figures give month, day and time: 16 March at 8am is 03160800.",
            "Ten figures add the year and are the form used in NOTAMs; twelve figures give the full year.",
          ],
        },
        {
          title: "Time and Longitude",
          pages: [66, 67, 68],
          intro:
            "The relationship the whole chapter is built on: 360 degrees in 24 " +
            "hours.",
          keyPoints: [
            "The Earth rotates through 360° in one day relative to the sun, so 15° per hour.",
            "Every point on the same meridian of longitude shares the same local mean time.",
            "Travelling east, local time advances one hour per 15° of longitude; travelling west, it goes back.",
          ],
          context:
            "The sun does not move; you do. Everything in this chapter follows " +
            "from that, and it is worth holding onto when a question asks for the " +
            "time somewhere else — you are not converting a clock reading, you are " +
            "asking how far round the Earth has turned between two places.",
        },
        {
          title: "Time Zones, UTC and New Zealand Time",
          pages: [69, 70, 71, 72, 73],
          intro:
            "The world's fifteen-degree slices, and where New Zealand sits in " +
            "them.",
          keyPoints: [
            "Time zones are lettered A to Z; New Zealand is in the M or Mike zone.",
            "Zulu time is taken from the Prime Meridian and is also called GMT or UTC; global positioning systems depend on it entirely.",
            "New Zealand Standard Time is referenced to the 180° meridian and is UTC + 12.",
            "New Zealand Daylight Time is UTC + 13, from the last Sunday in September to the first Sunday in April.",
          ],
          misconception:
            "Working a problem in local time and converting at the end. Convert " +
            "to UTC first, do the whole calculation there, and convert back once. " +
            "Everything aviation publishes — forecasts, NOTAMs, flight plans — is " +
            "in UTC precisely so that nobody has to hold two clocks in their head " +
            "while doing arithmetic.",
        },
        {
          title: "The International Date Line",
          pages: [74],
          intro:
            "Where the day changes, and which way it changes.",
          keyPoints: [
            "The date line exists to keep the date correct as you travel round the globe.",
            "Crossing it eastward, subtract a day.",
            "Crossing it westward, add a day.",
          ],
        },
        {
          title: "Time and Arc",
          pages: [75, 76, 77],
          intro:
            "The conversion factors, and the method that uses them.",
          keyPoints: [
            "360° in 24 hours means 15° in one hour.",
            "1° of longitude therefore takes 4 minutes of time.",
            "15 minutes of arc takes 1 minute of time, and 1 minute of arc takes 4 seconds.",
            "Travelling east, add time; travelling west, subtract.",
          ],
          example:
            "It is 1300 local at 30°W — what is the time at 75°W? The arc between " +
            "them is 75 − 30 = 45°. At 4 minutes per degree that is 180 minutes, " +
            "or 3 hours. The direction of travel is westward, so subtract: " +
            "1300 − 3 hours = 1000 local at 75°W.",
          exampleTitle: "Four steps, every time",
          takeaway:
            "Arc, multiply by four, decide the direction, apply. The step people " +
            "drop under pressure is the third one, and it is the only one that can " +
            "put the answer six hours out.",
        },
        {
          title: "Calculating Local Mean Time",
          pages: [78, 79, 80],
          intro:
            "The same four steps, now applied from the Prime Meridian rather than " +
            "between two arbitrary places.",
          keyPoints: [
            "Local mean time uses the sun as its celestial reference and the local meridian as its terrestrial one.",
            "All points on a meridian share the same LMT.",
            "Always use the shortest arc.",
          ],
          example:
            "What is the LMT at 110°45'E at 1400 UTC? The arc is 110°45'. " +
            "110 × 4 = 440 minutes; 45' at 1 minute per 15' adds 3 more, giving " +
            "443 minutes, or 7 hours 23 minutes. The direction from Greenwich is " +
            "eastward, so add: 1400 + 7:23 = 2123 LMT.",
          exampleTitle: "Minutes of arc as well as degrees",
        },
        {
          title: "Working Between UTC, Standard Time and Local Time",
          pages: [81],
          intro:
            "A full worked problem of the kind the examination asks: a real " +
            "flight, two time zones and a date change.",
          context:
            "Work it entirely in UTC. Convert the departure time to UTC, add the " +
            "flight time in UTC, and only then convert the arrival into the " +
            "destination's local time. Note what the worked answer does when the " +
            "running total passes 2400 — it rolls over into the next day, and the " +
            "date has to roll with it.",
        },
        {
          title: "Sunrise, Sunset and Twilight",
          pages: [82, 83],
          intro:
            "Four definitions that decide when you may legally still be flying, " +
            "and a distinction people get wrong for their whole career.",
          keyPoints: [
            "Sunrise is when the upper limb of the sun reaches the visible horizon; sunset is when it disappears below it. The period between is sunlight.",
            "Morning civil twilight begins when the centre of the rising sun is 6° below the sensible horizon; evening civil twilight ends at the same angle after sunset.",
            "Daylight is the period between morning and evening civil twilight.",
          ],
          misconception:
            "Treating daylight and sunlight as the same thing. Daylight is always " +
            "the longer of the two, because it starts before the sun appears and " +
            "ends after it has gone. Since it is daylight that the operating rules " +
            "are written around, using sunset as your deadline is the conservative " +
            "error — but confusing them in the other direction is not.",
        },
        {
          title: "The Sensible and Visible Horizons",
          pages: [84],
          intro:
            "Why the definitions above specify which horizon they mean, and what " +
            "that costs you at altitude.",
          keyPoints: [
            "The sensible horizon is tangential to a person standing on the surface.",
            "The visible horizon is depressed by the curvature of the Earth, and drops further the higher you are.",
          ],
          context:
            "Climb, and you can see over the curve of the Earth to a sun that has " +
            "already set for everyone beneath you. The consequence is entirely " +
            "practical: the aerodrome you are heading for can be in darkness while " +
            "your own cockpit is still lit. Plan the arrival against the published " +
            "time on the ground, never against what you can see from the cruise.",
        },
        {
          title: "Factors Affecting Sunrise, Sunset and Twilight",
          pages: [85, 86, 87, 88],
          intro:
            "Date, latitude, altitude and terrain — the four things that move the " +
            "times, and the two that catch people out in New Zealand.",
          keyPoints: [
            "Date: in summer morning civil twilight begins earlier and evening civil twilight ends later than in winter.",
            "Latitude: points on the same meridian but different latitudes have different sunrise and sunset times.",
            "In the tropics the sun crosses the horizon at close to 90°, so twilight is short; at higher latitudes it crosses obliquely and twilight is longer.",
            "In New Zealand, twilight is always longer in the south of the country and shorter in the north.",
          ],
          context:
            "Terrain is the factor that does not appear in any table. The eastern " +
            "side of the Southern Alps loses the light substantially earlier than " +
            "the west coast at the same latitude on the same day, because the " +
            "mountains get in the way of a sun that has not technically set. If " +
            "the last leg runs up an eastern valley late in the day, the published " +
            "time is optimistic.",
        },
      ],
    },

    /* ================================================================= 6 == */
    {
      title: "Charts and Projections",
      syllabus: ["18.22", "18.26"],
      intro:
        "A chart is a compromise. A curved surface cannot be laid flat without " +
        "something being stretched, so every projection chooses what to get " +
        "right and accepts what it will get wrong. This chapter is about which " +
        "choice each projection made, and which chart that makes it fit for.",
      topics: [
        {
          title: "What an Aeronautical Chart Has to Get Right",
          pages: [91, 92],
          intro:
            "Five properties a chart would ideally have. No projection delivers " +
            "all five, which is why there is more than one.",
          keyPoints: [
            "Surface features should keep their true shape.",
            "The angular relationship between features should be preserved — parallels and meridians intersecting at 90°. A projection that does this is conformal, or orthomorphic.",
            "The scale should be constant.",
            "Great circles should be straight lines.",
            "Rhumb lines should be straight lines, if possible.",
          ],
          context:
            "The second property is the one that cannot be given up. If angles " +
            "are not preserved, a bearing measured on the chart is not the bearing " +
            "you would fly, and the chart stops being a navigation instrument. " +
            "Scale and the two straight-line properties are all negotiable; " +
            "conformality is not, and every chart named in this chapter is " +
            "conformal.",
        },
        {
          title: "The Mercator Projection",
          pages: [93, 94],
          intro:
            "The cylinder. Famous, useful in one place, and actively misleading " +
            "in another.",
          keyPoints: [
            "It is constructed on a cylinder, which gives it an expanding scale.",
            "It is conformal, so bearings are correct, and shapes are correctly represented.",
            "Rhumb lines are straight lines; parallels are straight but expand towards the poles.",
            "Meridians and parallels intersect at 90°, and adjoining sheets of the same scale for the same latitude fit both north–south and east–west.",
            "Scale is not constant, and the projection is of little use beyond about 65° north or south.",
          ],
          context:
            "The expanding scale is a direct consequence of wrapping a sphere in " +
            "a cylinder: the cylinder touches at the Equator and the gap grows " +
            "towards the poles, so the projection has to stretch further and " +
            "further to fill it. The poles themselves are infinitely far away and " +
            "are simply not projected.",
        },
        {
          title: "The Lambert Conformal Projection",
          pages: [95, 96],
          intro:
            "The cone. Less famous, and the one your charts are actually drawn " +
            "on.",
          keyPoints: [
            "The cone cuts the Earth's surface at two standard parallels of latitude.",
            "All angles and bearings are correctly represented.",
            "Meridians are straight lines and parallels are arcs concentric about the pole, intersecting at 90°.",
            "Great circles may be treated as straight lines.",
            "Rhumb lines are curved, concave towards the nearer pole.",
            "Scale is considered constant, and the poles are projected.",
          ],
          misconception:
            "Expecting the Lambert to behave like the Mercator because both are " +
            "conformal. They swap their straight lines over: on a Mercator the " +
            "rhumb line is straight and on a Lambert the great circle effectively " +
            "is. Since a Lambert's scale is near enough constant, a straight line " +
            "you draw on a VNC is both measurable and close to the shortest route " +
            "— which is exactly what a chart to fly with needs.",
        },
        {
          title: "Choosing the Right Chart",
          pages: [97, 98],
          intro:
            "Which projection for which job, and the three New Zealand charts you " +
            "will actually handle.",
          keyPoints: [
            "Mercator: useful at equatorial latitudes and for planning long distances, since most of the world fits on it.",
            "Lambert: usable at most latitudes including polar regions, and suited to countries with an east–west spread.",
            "The 1:1,000,000 VPC covers the whole country and is used for pre-flight planning.",
            "The VNC divides the country into 16 areas at 1:500,000 or 1:250,000 and is used for navigation in flight.",
            "The aerodrome chart comes from the AIP and shows the layout and facilities of the aerodrome.",
          ],
          misconception:
            "Scale wording reverses the intuition. The 1:1,000,000 VPC is the " +
            "small-scale chart and the 1:500,000 VNC is the large-scale one, even " +
            "though the VPC covers more ground. The fraction is what is being " +
            "compared: one five-hundred-thousandth is a larger fraction than one " +
            "millionth. Large scale, more detail, less area.",
        },
        {
          title: "Chart Scale",
          pages: [99, 100, 101, 102],
          intro:
            "One definition and one ratio, worked in both directions.",
          definition:
            "Chart scale is the ratio of a given chart length to the actual " +
            "distance on the Earth that it represents.",
          term: "Scale",
          example:
            "What is the real distance across 12 cm of a 1:250,000 chart? " +
            "12 × 250,000 = 3,000,000 cm, which is 30 km. Going the other way: if " +
            "4 cm of chart measures 22 nm on the ground, the scale works out at " +
            "about 1:1,003,200 — near enough to 1:1,000,000.",
          exampleTitle: "Both directions of the same ratio",
          takeaway:
            "Keep the units consistent before you divide. Most errors in scale " +
            "questions are centimetres against nautical miles rather than anything " +
            "conceptual — convert to one system first, then work the ratio.",
        },
        {
          title: "Reading a Chart: Legends and Relief",
          pages: [103, 104, 105, 106, 107],
          intro:
            "The symbols and the colours. The legend is not something to learn by " +
            "heart, but the relief shading is worth knowing cold, because it is " +
            "the fastest terrain warning on the chart.",
          keyPoints: [
            "Mountainous areas are shown in darker browns, with silver for areas of permanent snow.",
            "Forested areas are dark green.",
            "Plains such as the Canterbury plains are shown in silver and brown.",
            "Lakes and rivers are blue.",
          ],
          context:
            "Relief shading is doing a job the contour figures cannot do at a " +
            "glance. A route that crosses from green into progressively darker " +
            "brown is climbing, and it tells you so before you have read a single " +
            "spot height.",
        },
      ],
    },

    /* ================================================================= 7 == */
    {
      title: "The Navigation Computer",
      syllabus: ["18.28"],
      intro:
        "A circular slide rule with a wind face on the back. It looks archaic " +
        "and is examined without a calculator, so it has to be fluent rather " +
        "than merely understood. Every problem in this chapter is one of two " +
        "things: a ratio on the front, or a vector on the back.",
      topics: [
        {
          title: "The Circular Slide Rule",
          pages: [109],
          intro:
            "What the two scales are, and the single idea behind everything the " +
            "front of the computer does.",
          diagramNotes: {
            109:
              "The face of the E6-B. The outer scale carries distance, fuel and " +
              "the unit index marks — NAUT, STAT, KM, IMP GAL, US GAL, LITERS, " +
              "FUEL LBS, KG. The inner scale carries time, with the 60 RATE index " +
              "marked by a triangle at the bottom left. The two windows in the " +
              "middle set pressure altitude against air temperature, and the " +
              "printed instructions inside the disc give the altitude and airspeed " +
              "corrections. The temperature conversion scale runs along the bottom " +
              "edge.",
          },
          context:
            "The front is one continuous proportion. Whatever you set on the " +
            "outer scale against something on the inner scale stays in that ratio " +
            "all the way round, so a single setting answers every question of the " +
            "same kind at once. Set 60 on the inner against a groundspeed on the " +
            "outer and you have not solved one time–distance problem — you have " +
            "solved all of them for that speed.",
          takeaway:
            "The computer never places the decimal point. It gives you the digits " +
            "and you decide the magnitude, which is why every worked example in " +
            "this chapter begins with a rough mental check.",
        },
        {
          title: "Finding True Airspeed",
          pages: [110],
          intro:
            "The one calculation that uses the windows rather than the scales.",
          example:
            "TAS at 7,000 ft pressure altitude, −10°C, CAS 120 kt. In the pressure " +
            "altitude window set 7,000 against −10. Then find 120 on the inner " +
            "scale and read TAS above it on the outer: 135 kt.",
          exampleTitle: "CAS to TAS",
          context:
            "This is the density correction from the Speed chapter made " +
            "mechanical. Setting pressure altitude against temperature is telling " +
            "the computer how thin the air is; after that the ratio between the " +
            "scales is fixed and CAS reads across to TAS directly.",
        },
        {
          title: "Multiplication and Division",
          pages: [111, 112],
          intro:
            "The slide rule underneath everything else. Worth ten minutes of " +
            "practice on its own, because every later problem is one of these two " +
            "with units attached.",
          example:
            "5 × 4.28: set 10 on the inner scale below 5 on the outer, find 4.28 " +
            "on the inner and read 214 above it. A rough check says 5 × 4 = 20, so " +
            "the answer is 21.4. Then 56 ÷ 8: set 8 on the inner below 56 on the " +
            "outer, and read the answer above 10 on the inner — 70 in digits, and " +
            "the rough check of 7 places the point.",
          exampleTitle: "Both operations, with the decimal placed by hand",
          takeaway:
            "The rough check is not optional politeness. The wheel returns 7, 70 " +
            "and 700 identically, and only your own estimate distinguishes them.",
        },
        {
          title: "Time, Speed and Distance",
          pages: [113, 114, 115],
          intro:
            "The most used setting on the instrument, worked for each of the " +
            "three unknowns in turn.",
          keyPoints: [
            "Speed is distance over time, and the computer holds that ratio between the outer and inner scales.",
            "Set 60 minutes on the inner scale against the speed on the outer, and every time on the inner now reads its distance on the outer.",
          ],
          example:
            "At 150 kt, how far in 30 minutes? Set 60 on the inner against 150 on " +
            "the outer; against 30 on the inner read 75 on the outer — 75 nm. " +
            "Reversed: 28 nm covered in 15 minutes. Set 28 on the outer against 15 " +
            "on the inner, and against 60 on the inner read 112 — a groundspeed of " +
            "112 kt. Leave the setting where it is and 10 minutes reads 18.6 nm.",
          exampleTitle: "One setting, three questions",
          takeaway:
            "Notice that the third answer needed no new setting. Once the wheel " +
            "holds your groundspeed, leave it there for the leg — every distance " +
            "and every time on that leg is already on the scale.",
        },
        {
          title: "Fuel Consumption and Endurance",
          pages: [116, 117, 118],
          intro:
            "The identical setting with litres in place of miles, which is the " +
            "point of a slide rule.",
          example:
            "Burning 45 litres an hour, what is used in 14 minutes? Set 60 on the " +
            "inner against 45 on the outer and read 10.5 litres against 14. " +
            "Endurance works backwards: 67 litres available at 19 litres an hour — " +
            "set 60 on the inner against 19 on the outer, and against 67 on the " +
            "outer read 212 minutes, or 3 hours 32.",
          exampleTitle: "Consumption and endurance",
          context:
            "A rate is a rate. The computer does not know whether the outer scale " +
            "is holding miles or litres, so once you have seen that time–speed– " +
            "distance and fuel flow are the same setting, there is nothing new to " +
            "learn here — only new units to keep track of.",
        },
        {
          title: "Unit Conversions",
          pages: [119, 120, 121, 122, 123],
          intro:
            "The index marks around the outer scale, and the one conversion the " +
            "instrument will not do.",
          keyPoints: [
            "Distance: place the KM mark on the inner scale under the NM mark on the outer, and every value reads across — 90 nm is 166 km.",
            "Feet and kilometres have their own marks on the outer scale; place the value under one and read below the other.",
            "Weight: kilograms to pounds is a multiplication by 2.2, so 50 kg is 110 lb.",
            "Volume: litres, imperial gallons and US gallons all have marks — 30 litres is 6.6 imperial gallons or 7.9 US gallons.",
            "Temperature is read on the separate Fahrenheit–Celsius scale along the bottom edge, where 20°C is 68°F.",
          ],
          misconception:
            "Expecting metres and feet to convert like everything else. They do " +
            "not — the deck's note is explicit that you cannot convert between " +
            "metres and feet on the computer, because the mark provided is for " +
            "kilometres, not metres.",
          context:
            "That is true of the index marks, and it is not the end of the story: " +
            "the conversion is still needed, because obstacle and terrain heights " +
            "are published in both units. Do it as an ordinary multiplication " +
            "instead, which the front of the computer is built for. One metre is " +
            "3.28 feet, so set 1 on the inner scale against 3.28 on the outer, and " +
            "every metre value on the inner now reads its height in feet on the " +
            "outer — 100 m against 328 ft, 500 m against 1,640 ft. The setting " +
            "holds for the whole scale, so one turn of the wheel converts every " +
            "figure on the chart.",
        },
        {
          title: "Converting Fuel Volume to Weight",
          pages: [124, 125, 126],
          intro:
            "The step that turns a fuel order into a loading figure, and the " +
            "number that makes it possible.",
          definition:
            "Specific gravity is the weight of a unit volume of fuel. Avgas has a " +
            "specific gravity of 0.72, so one litre weighs 0.72 kg. The specific " +
            "gravity of oil is 0.9.",
          term: "Specific gravity",
          keyPoints: [
            "In metric units, weight in kilograms equals specific gravity multiplied by volume in litres.",
            "One US gallon of Avgas weighs 2.69 kg.",
            "Fuel pounds is not a unit.",
          ],
          example:
            "Convert 40 US gallons of Avgas to kilograms. Set 1 on the inner " +
            "scale against 2.69 on the outer; against 40 on the inner read " +
            "107.6 kg. The rough check — 40 × 2.5 = 100 — places the decimal point.",
          exampleTitle: "Gallons to kilograms",
          context:
            "This is where navigation hands over to weight and balance. The " +
            "aircraft is fuelled in volume and loaded in weight, and the specific " +
            "gravity is the only bridge between the two. Ordering in litres and " +
            "planning in kilograms without converting is how an aircraft ends up " +
            "over its maximum weight on paper it thought was correct.",
        },
        {
          title: "Climb and Descent Calculations",
          pages: [127, 128],
          intro:
            "Time to climb, rate of climb and rate of descent — and the distance " +
            "the climb consumes, which is the figure a flight plan actually needs.",
          example:
            "Departing Whanganui and climbing to 6,500 ft at 120 kt with a rate " +
            "of climb of 800 fpm: work the time to climb first, then apply the " +
            "groundspeed to it to get the horizontal distance covered by the top " +
            "of climb.",
          exampleTitle: "Distance covered in the climb",
          context:
            "A leg is rarely flown at one speed. The climb is slower over the " +
            "ground and the descent faster, so a plan that treats the whole leg as " +
            "cruise will always be optimistic. Finding the climb and descent " +
            "distances is what lets you separate the true level cruise sector, " +
            "which is the only part the cruise groundspeed applies to.",
        },
        {
          title: "The Wind Side: Heading and Groundspeed",
          pages: [129, 130, 131, 132],
          intro:
            "The back of the computer, which solves the triangle of velocities " +
            "from the Speed chapter by drawing it rather than calculating it.",
          keyPoints: [
            "Set the grommet on the 100 line as a convenient halfway mark.",
            "Set the wind direction under the true index and mark the wind speed above the grommet.",
            "Rotate the disc until the required track is under the true index.",
            "Slide until the mark sits on the line representing your TAS.",
            "Read the drift as the distance of the mark from the centre line, and apply it towards the wind.",
          ],
          diagramNotes: {
            130:
              "A printed procedure card for the same method in six steps: set wind " +
              "direction under the true index, mark wind velocity up from the " +
              "centre point, set true course under the true index, slide the wind " +
              "velocity mark to the true airspeed, read ground speed under the " +
              "centre, and read the wind correction angle between the centre line " +
              "and the wind velocity mark.",
          },
          example:
            "True track 020°, wind 270/25, TAS 120 kt. Working through the steps: " +
            "if the mark ends up sitting twelve places to the left of the centre " +
            "line, the aircraft is drifting 12° to starboard and the heading must " +
            "be 12° to the left of track — numbers decreasing.",
          exampleTitle: "The worked wind problem",
          misconception:
            "Adding the drift instead of subtracting it, or the reverse. The mark " +
            "shows which way the wind is pushing you; you turn the other way. If " +
            "the result ever leaves you drifting further off track rather than " +
            "back onto it, the sign is the thing to check first.",
        },
        {
          title: "Crosswind and Headwind Components",
          pages: [133],
          intro:
            "The same wind face used for a runway rather than a route.",
          keyPoints: [
            "Set the wind direction under the index and mark the wind speed above the grommet.",
            "Set the runway heading under the index.",
            "Draw a line horizontally across to the vertical centreline and read the headwind component there.",
            "Rotate the plotting disc until that line is parallel with the radial drift lines, and read the crosswind along it.",
          ],
          context:
            "This is the calculation that decides whether the landing is legal " +
            "and whether it is wise, so it is worth being able to do quickly and " +
            "then sanity-check. A wind 30° off the nose gives roughly half its " +
            "strength as crosswind; 45° gives about three-quarters. If the wheel " +
            "disagrees badly with that, something has been set wrong.",
        },
        {
          title: "Finding the Wind in Flight",
          pages: [134],
          intro:
            "The triangle worked from the other corner: you have flown the leg, so " +
            "now you know things you did not know on the ground.",
          keyPoints: [
            "Place the track made good under the true index and set the grommet on the measured groundspeed.",
            "Mark where the drift angle — the difference between heading and track made good — meets your TAS.",
            "Rotate until the mark is directly above the grommet, then slide until the grommet is back on 100.",
            "The wind direction is under the true index and the wind speed is the distance from the grommet to the mark.",
          ],
          takeaway:
            "The four quantities in play are track made good, groundspeed, " +
            "heading and TAS, which the deck offers a mnemonic for. The forecast " +
            "wind was a prediction; this is a measurement, and it is a better basis " +
            "for the rest of the flight than the figure you planned with.",
        },
      ],
    },

    /* ================================================================= 8 == */
    {
      title: "Flight Preparation and the In-Flight Routine",
      syllabus: ["18.48"],
      intro:
        "The habits that turn a flight plan into a flight. None of this is " +
        "difficult; all of it is the sort of thing that is skipped when a " +
        "student is busy, which is exactly when it is needed.",
      topics: [
        {
          title: "Pre-Flight Planning",
          pages: [136],
          intro:
            "The list of what must be checked before departure.",
          keyPoints: [
            "Weather, NOTAMs and the AIP.",
            "Tracks, altitudes, checkpoints and turning points, and the alternates.",
            "Fuel requirements and the airspace to be crossed.",
            "Charts, the navigation log, evening civil twilight, the aircraft pre-flight and the equipment carried.",
          ],
        },
        {
          title: "In-Flight Procedures, Fixes and Pinpoints",
          pages: [137, 138],
          intro:
            "The five things you are actually doing between checkpoints, and the " +
            "vocabulary for knowing where you are.",
          keyPoints: [
            "Chart reading, selection of checkpoints, drift correction, track crawling and the 1 in 60 rule.",
            "A fix is generally derived from two features; a pinpoint from one.",
            "A waypoint is a location or fix used in IFR operations, generally RNAV.",
          ],
          context:
            "The distinction between a fix and a pinpoint is about confidence " +
            "rather than accuracy. One feature can put you exactly over a place, " +
            "but two crossing features prove it — and over unfamiliar terrain, " +
            "being certain matters more than being precise.",
        },
        {
          title: "Aircraft Management and the SAFDIE Check",
          pages: [139, 140],
          intro:
            "Flying the aeroplane accurately is part of navigating it, and the " +
            "cruise check that keeps it that way.",
          keyPoints: [
            "Balanced flight, planned airspeed and altitude, trimming, lookout and assessing the weather.",
            "SAFDIE: Suction, Alternator and altitude, Fuel, DI and compass, Icing and carburettor heat with outside air temperature, Engine temperatures and pressures.",
          ],
          context:
            "The D is the one that belongs to this subject. A directional " +
            "indicator drifts, and an aircraft flown on an uncorrected DI tracks " +
            "steadily further from the planned line without anything looking " +
            "wrong. Realigning it against the compass at every cruise check is what " +
            "keeps the heading you are flying and the heading you planned the same " +
            "heading.",
        },
        {
          title: "Maintaining a Flight Log",
          pages: [141],
          intro:
            "What goes in it, and why it is the thing that makes a lost procedure " +
            "possible later.",
          keyPoints: [
            "Actual time of departure and actual time of arrival.",
            "Position fixes, with the position and the time at that point.",
            "ETAs and revised estimates at every checkpoint.",
          ],
          takeaway:
            "A log kept properly is what turns “uncertain of position” " +
            "into an arithmetic problem instead of an emergency. Without a last " +
            "known fix and a time, there is no dead reckoning position to work " +
            "from — which is why the lost procedure later in this subject begins " +
            "by assuming you have one.",
        },
        {
          title: "Turning Points and Amending the ETA",
          pages: [142, 147],
          intro:
            "The two things that happen at every waypoint: a heading change and a " +
            "revised estimate.",
          keyPoints: [
            "A turning point is where a change of heading is required; mark them clearly on the chart and record the new heading in the log.",
            "Note the time at each point so the ETA for the next one can be worked.",
            "Groundspeed checks give a new groundspeed; apply it to the distance remaining for a current ETA.",
            "Record the revision in the log and pass it to an ATS unit if required.",
          ],
          context:
            "An ETA is a promise made with the forecast wind, and the forecast is " +
            "usually a little wrong. Revising early and often keeps the error " +
            "small; leaving it until the destination is close means one large " +
            "correction, and if anyone is waiting on your SARTIME, a large late " +
            "correction is the one that causes trouble.",
        },
        {
          title: "Approaching the Destination",
          pages: [143],
          intro:
            "Being ready before you get there, which for most flights means being " +
            "ready before the descent.",
          keyPoints: [
            "Have an up-to-date flight log with an ETA for the aerodrome.",
            "The AIP open at the correct chart, and the arrival procedures and aerodrome layout already familiar.",
            "The correct QNH set and the appropriate radio calls made.",
          ],
        },
        {
          title: "Map Reading Technique",
          pages: [144, 145, 146],
          intro:
            "Choosing features that will still be recognisable at 3,000 ft in " +
            "haze, and orienting the chart so that what you see matches what you " +
            "are holding.",
          keyPoints: [
            "Map reading depends on knowledge of direction, distance and groundspeed, plus the selection and identification of landmarks.",
            "Choose checkpoints for in-flight visibility, size, relationship to other features, and the angle they will be viewed from.",
            "Flying high you see a plan view; flying low you see elevation and side profile.",
            "Orient the chart to the direction of travel, so that features drawn right of track appear to the right of the aircraft.",
          ],
          misconception:
            "Reading from the ground to the map — spotting something interesting " +
            "and hunting for it on the chart. Work the other way: expect a feature " +
            "at a time, then look for it. Reading ground to map is how a student " +
            "convinces themselves that the wrong lake is the right one.",
        },
        {
          title: "Checkpoints in Difficult Terrain",
          pages: [148],
          intro:
            "A short list of what changes when the ground stops being helpful.",
          keyPoints: [
            "Checkpoints over or near mountainous terrain need particular care.",
            "The interval between checkpoints, and the use of dead reckoning between them.",
            "Chart orientation in the cockpit.",
          ],
        },
        {
          title: "Departure, Cruise and Descent Routine",
          pages: [149, 150, 151, 152],
          intro:
            "The three phases and what belongs in each.",
          keyPoints: [
            "Departure: the departure procedure, setting heading on the departure track, and calculating time to climb and rate of climb.",
            "Cruise: top of climb checks, and mental calculations for time, distance, groundspeed and ETA.",
            "Cruise routine: area QNH set, cruise power and mixture set, aircraft trimmed, SAFDIE completed, and a position fix taken to confirm the planned track is being made good and the first checkpoint estimate is holding.",
            "Descent: configuration for the descent and calculating rate of descent.",
          ],
          takeaway:
            "The first fix after top of climb is the most valuable one of the " +
            "flight. It is the earliest point at which the plan can be checked " +
            "against reality, and an error found there costs a small heading " +
            "change rather than a diversion.",
        },
      ],
    },

    /* ================================================================= 9 == */
    {
      title: "Track Correction and the 1 in 60 Rule",
      syllabus: ["18.36"],
      intro:
        "One approximation, used four different ways. It is the only piece of " +
        "mental arithmetic in this subject that has to be automatic, because it " +
        "is the one you use with the aeroplane moving and the chart on your " +
        "knee.",
      topics: [
        {
          title: "Position Lines",
          pages: [153, 154],
          intro:
            "Knowing you are somewhere on a line, which is less than a fix and " +
            "more than nothing.",
          definition:
            "A position line is a line an aircraft is known to be on at a " +
            "particular time.",
          term: "Position line",
          context:
            "A single position line will not tell you where you are along it, so " +
            "it cannot be a fix. What it can do is time you: cross a line, note " +
            "the time, cross another and you have a groundspeed, without ever " +
            "having pinpointed the aircraft. Two position lines crossing at a good " +
            "angle do give a fix, which is what the earlier topic meant by a fix " +
            "coming from two features.",
        },
        {
          title: "The 1 in 60 Rule",
          pages: [155, 156],
          intro:
            "The approximation itself, and why it is allowed to be an " +
            "approximation.",
          keyPoints: [
            "One nautical mile subtends an angle of one degree at a distance of 60 nautical miles.",
            "So 5 nm off at 60 nm along is 5°, 10 nm off is 10°, and 15 nm off is 15°.",
            "You do not have to have flown 60 nm — 4 nm off track in 30 nm along track is the same angle as 8 nm off in 60 nm, which is 8°.",
          ],
          context:
            "It works because for small angles the arc and the straight line " +
            "across it are near enough the same length. That is also where it " +
            "stops working: as the angle grows the approximation drifts, which is " +
            "the reason for the 15° limit that appears in the total correction " +
            "topic. Inside that range it is accurate enough to fly and simple " +
            "enough to do in your head.",
        },
        {
          title: "Track Error",
          pages: [157, 159],
          intro:
            "The first of the two angles: how far the wind has already turned you " +
            "away from the planned track.",
          keyPoints: [
            "Track error equals distance off track, divided by distance gone, multiplied by 60.",
          ],
          example:
            "You have flown 50 nm and find yourself 10 nm off track. " +
            "TE = 10 ÷ 50 × 60 = 12°.",
          exampleTitle: "Distance off over distance gone",
          takeaway:
            "Track error is measured backwards, from where you started. It tells " +
            "you what went wrong, not what to do about it — and turning by the " +
            "track error alone only makes the tracks parallel. You would fly the " +
            "rest of the leg exactly 10 nm off.",
        },
        {
          title: "Closing Angle and Total Correction",
          pages: [158, 160, 161],
          intro:
            "The second angle, and why the two are added rather than chosen " +
            "between.",
          keyPoints: [
            "Closing angle equals distance off track, divided by distance to go, multiplied by 60.",
            "The total correction — the track change to make — is track error plus closing angle.",
            "This returns the aircraft to the flight planned track at the point chosen.",
            "It only works while track error and closing angle are each no greater than 15°.",
          ],
          example:
            "A planned track A–B of 100 nm. After 30 nm the aircraft is 4 nm right " +
            "of track. To regain track in another 30 nm: TE = 4 ÷ 30 × 60 = 8° and " +
            "CA = 4 ÷ 30 × 60 = 8°, so the total correction is 16° left. To regain " +
            "it at B instead, the track error is still 8° but the closing angle is " +
            "4 ÷ 70 × 60 = 3.4°, giving 11.4° left.",
          exampleTitle: "The same position, two different rejoin points",
          context:
            "The two angles do different jobs. The track error cancels the drift " +
            "that put you there, so the aircraft stops going further off; the " +
            "closing angle is the extra that carries it back. Adding them does " +
            "both at once. The worked example above is worth reading twice — same " +
            "aircraft, same error, and the correction changes because the point " +
            "you choose to rejoin at has changed.",
          misconception:
            "Applying the correction and then leaving it there. Once back on " +
            "track you must take the closing angle off again, or the aircraft will " +
            "carry straight on through the track and out the other side.",
        },
        {
          title: "Regaining a Reciprocal Track",
          pages: [162, 163],
          intro:
            "Turning back the way you came, and why the reciprocal heading is not " +
            "the answer.",
          keyPoints: [
            "Having applied left drift before turning around, fly the reciprocal heading and deduct twice the drift.",
            "Having applied right drift, fly the reciprocal heading and add twice the drift.",
          ],
          context:
            "The doubling catches people out until you see why. Turning round " +
            "does not change the wind, but it does put it on the other side of the " +
            "aircraft — so you have to take off the correction you were carrying " +
            "and then put the same amount on the other side. That is two lots of " +
            "drift, not one.",
        },
        {
          title: "Diverting Using the 1 in 60 Rule",
          pages: [164, 165],
          intro:
            "The same arithmetic applied to a destination you did not plan for.",
          example:
            "Tracking 320°M with 135 nm still to run, you decide to divert to an " +
            "aerodrome 10 nm abeam to the right of track and 42 nm ahead. The " +
            "geometry gives a heading of 329°M, and at a groundspeed of 133 kt the " +
            "42 nm takes about 19 minutes.",
          exampleTitle: "A small-angle diversion",
          context:
            "This works while the diversion is a small change of heading, which " +
            "is what the 1 in 60 rule is for. A large diversion is not a track " +
            "correction problem at all — it is a new leg, and it wants a fresh " +
            "track, distance and wind rather than an angle added to the old one.",
        },
        {
          title: "The 60-Degree Diversion Method",
          pages: [166],
          intro:
            "For going round something rather than to somewhere: weather, or an " +
            "obstacle, with a known way back onto track.",
          keyPoints: [
            "Turn 60° off track and note the new heading on the log; hold it for a suitable time.",
            "If needed, parallel the original track by altering heading 60° back, and hold that for a suitable time.",
            "Once the obstacle is cleared by a suitable margin, alter heading a further 60°, or 120° if no parallel leg was flown.",
            "When the track is regained, alter heading 60° to maintain it.",
          ],
          takeaway:
            "The value of the method is that it is symmetrical and timed, so it " +
            "can be flown and undone without any calculation while you are busy " +
            "looking at the weather. Write the times down as you go — the whole " +
            "thing depends on knowing how long each leg was.",
        },
      ],
    },

    /* ================================================================ 10 == */
    {
      title: "Navigation in Demanding Conditions",
      syllabus: ["18.50"],
      intro:
        "Low level, poor visibility, mountains, and the point at which you " +
        "admit you do not know where you are. The techniques do not change; " +
        "what changes is how little margin there is when they are applied " +
        "carelessly.",
      topics: [
        {
          title: "Navigation at Low Level",
          pages: [167],
          intro:
            "Around 500 ft AGL the world stops looking like the chart, and the " +
            "workload moves from the log to the windscreen.",
          keyPoints: [
            "The procedures are the same as at higher levels, with special considerations.",
            "Lookout must be constant because of the proximity of terrain and obstacles.",
            "Features are seen in elevation rather than in plan view, so checkpoints must be chosen for that.",
            "The height of a check feature relative to the surrounding terrain matters; masts, chimneys and steeples become usable.",
            "Keeping the flight log up to date is harder, because aircraft handling demands more attention — so preparation must be thorough.",
          ],
          takeaway:
            "Everything that can be decided on the ground should be decided on " +
            "the ground. At low level there is no spare capacity to work anything " +
            "out, and the consequence of getting it wrong arrives faster.",
        },
        {
          title: "Navigation in Reduced Visibility",
          pages: [168, 169],
          intro:
            "The advice begins by telling you not to be there, which is worth " +
            "reading as advice rather than as a formality.",
          keyPoints: [
            "Avoid the situation, and resist the temptation to climb up through gaps in cloud.",
            "Checkpoints are harder to see until you are overhead them.",
            "Account for the reduced-visibility configuration in the estimated elapsed time, and round speeds for quick mental work — 1.5 to 2 nm per minute.",
            "Check heading, DI and compass frequently.",
            "Be accurate with pinpoints: be certain where you are before committing to it.",
            "Diverting: if inland, draw a track to the coast; talk to ATS; use GPS in addition to visual navigation, without rushing.",
          ],
          context:
            "Drawing a track to the coast is a good instinct generalised. A " +
            "coastline is a feature you cannot miss and cannot misidentify, and " +
            "when the small features have stopped being reliable, heading for the " +
            "large one that cannot fail is worth more than a clever fix.",
        },
        {
          title: "Uncertain of Position",
          pages: [170],
          intro:
            "The stage before lost, where the problem is still small enough to " +
            "fix with arithmetic.",
          keyPoints: [
            "Check the DI and compass.",
            "Estimate the track correction needed to make good the required track.",
            "If the wrong heading has been held because of an incorrect visual reference, recalculate.",
          ],
        },
        {
          title: "The Lost Procedure",
          pages: [171, 172],
          intro:
            "A definite plan of action, in the order it is carried out.",
          keyPoints: [
            "Maintain the present heading if possible.",
            "If the next checkpoint is not in sight at the ETA, hold heading for a further 10% of the elapsed time since the last positive fix.",
            "Check the headings flown since that fix: the DI aligned, variation and drift applied correctly, and no discrepancy between the track on the chart and the one on the flight plan.",
            "Determine the DR position from the latest track and groundspeed to establish distance flown since the fix.",
            "Work out the minimum safe altitude for the probable area, then look out for significant features.",
            "On obtaining a fix, re-check the DI and resume normal navigation.",
          ],
          context:
            "The instruction to hold heading is the one that feels wrong and is " +
            "most important. Turning to look for something destroys the dead " +
            "reckoning position, which is the only real information you still " +
            "have. The extra 10% exists because being slightly slow is far more " +
            "common than being genuinely lost.",
          misconception:
            "Treating altitude as a last resort. It appears in the deck's own " +
            "list of considerations for a reason: climbing extends the visible " +
            "horizon, improves the radio and increases the terrain margin all at " +
            "once. If fuel and airspace allow, it is usually the first thing worth " +
            "doing rather than the last.",
        },
        {
          title: "Establishing a Dead Reckoning Position",
          pages: [173, 174, 175],
          intro:
            "Turning the last known fix into an area on the chart — and it is an " +
            "area, not a point.",
          keyPoints: [
            "Use the latest track and groundspeed to work the distance flown since the last position fix; this becomes the most probable position.",
            "Method 1: apply plus and minus 10% of the estimated distance flown, over an arc 30° either side of the probable track made good.",
            "Method 2: draw a circle about the most probable position with a radius of 10% of the estimated distance flown since the last positive fix.",
          ],
          takeaway:
            "Both methods size the uncertainty at about 10% of the distance since " +
            "the fix, which is why the timing of that last fix matters so much. " +
            "Twenty miles on gives a two-mile circle; a hundred miles on gives a " +
            "ten-mile one, and inside ten miles a great many lakes look alike.",
        },
        {
          title: "Navigation in Mountainous Terrain",
          pages: [176, 177, 178],
          intro:
            "Eight specific traps, each of which has caused accidents, and the " +
            "preparation that answers them.",
          keyPoints: [
            "Pinpointing is harder, especially where snow cover hides the shapes and features you would use.",
            "Peaks are tempting to navigate by and easy to misidentify — confirm with the DI and compass.",
            "Stay windward where possible, and account for wind and drift in the lee.",
            "Cloud in mountains is disorienting; coordinate visual orientation with DI and compass readings.",
            "The wider valley is tempting at a junction and often the wrong one — check the orientation of valleys against the DI and compass.",
            "A ridge top is easily mistaken for the horizon; monitor the instruments to confirm.",
            "Power is limited at altitude, which affects the ability to climb out of high terrain.",
            "Weather in the distance cannot be judged reliably.",
          ],
          context:
            "The deck names the common causes of mountain accidents as inadequate " +
            "preparation, poor navigational technique, misunderstanding the " +
            "weather, and insufficient fuel to allow a change of track around high " +
            "terrain. Three of the four are decided before the aircraft moves. " +
            "That is why the answer is a thorough met briefing, an operational " +
            "briefing, a prepared flight plan and plenty of daylight — and why " +
            "experience is described as something built gradually rather than " +
            "assumed.",
        },
        {
          title: "Flight Plans and SARTIME",
          pages: [179],
          intro:
            "Telling someone where you are going, and the responsibility that " +
            "creates.",
          keyPoints: [
            "A flight plan may be lodged by telephone, internet or fax.",
            "A SARTIME is distinct from an ETA.",
            "SARTIMEs must be updated or terminated.",
          ],
          takeaway:
            "An ETA is when you expect to arrive; a SARTIME is when somebody will " +
            "start looking for you if you have not. Forgetting to terminate one " +
            "launches a search for an aircraft that is safely on the ground — " +
            "which is why updating and terminating are listed as part of the " +
            "procedure rather than as an afterthought.",
        },
      ],
    },

    /* ================================================================ 11 == */
    {
      title: "Position Reporting and Time Terminology",
      syllabus: ["18.10"],
      intro:
        "Short, and almost entirely vocabulary. The terms in it appear in " +
        "flight plans, radio calls and examination questions, and they are " +
        "distinguished from one another by details that are easy to skim past.",
      topics: [
        {
          title: "Position from Bearing and Distance",
          pages: [180],
          intro:
            "Plotting where an aircraft is when someone tells you where it is " +
            "from something else.",
          example:
            "A bearing of 360°T from NZFL at 10 nm: draw the bearing out from the " +
            "station and measure the distance along it. The aircraft is at the " +
            "far end.",
          exampleTitle: "One bearing and one distance",
          context:
            "One bearing on its own only gives a position line. It becomes a " +
            "position because the distance fixes how far along that line you are " +
            "— which is exactly what a DME adds to a VOR radial, and why that " +
            "pairing gives a fix from a single station.",
        },
        {
          title: "Maximum Holding Time",
          pages: [181],
          intro:
            "What is left after everything else has been paid for.",
          keyPoints: [
            "Work out the fuel required for the entire flight first.",
            "The reserve is 30 minutes, and the fuel to reach the alternate must also be accounted for.",
            "Fuel carried above that total is what is available for holding.",
            "The holding time itself is then a simple calculation on the navigation computer at the given holding consumption rate.",
          ],
          takeaway:
            "Holding fuel is a residue, not an allowance. It exists only if you " +
            "chose to carry more than the minimum, which is the practical argument " +
            "for the advice in the fuel planning topic to carry as much as is " +
            "practicable.",
        },
        {
          title: "Time Terminology: ETD, EET, ETI and ETA",
          pages: [182, 183],
          intro:
            "Six abbreviations, three of them pairs of estimated and actual.",
          keyPoints: [
            "ETD is the estimated time of departure and ATD the actual time of departure — the time you get airborne.",
            "EET is the estimated elapsed time: the time to fly from A to B.",
            "ETI is the estimated time interval: the time between one reporting call and the next.",
            "ETA is the estimated time of arrival and ATA the actual time of arrival.",
            "The latest time of departure is the last moment you can leave and still arrive within your limits: take the latest acceptable arrival time and subtract the estimated elapsed time.",
          ],
          context:
            "ETI is the one that is genuinely different. It is not about the " +
            "route at all — it is a promise to a controller about when you will " +
            "speak again, and the example on the slide is exactly that: a call " +
            "reporting a position at one time and undertaking to call again at " +
            "another.",
          example:
            "Working out a latest time of departure is subtraction, and the whole " +
            "of the difficulty is deciding what the latest acceptable arrival " +
            "actually is. For a day VFR flight it is usually evening civil " +
            "twilight at the destination; it can equally be the hour an aerodrome " +
            "closes, or the time a required service stops. Take that time, " +
            "subtract the estimated elapsed time for the route, and subtract any " +
            "allowance you have decided to hold for a diversion or for holding. " +
            "ECT 1912, an EET of 1 hour 40, and 30 minutes held back gives a " +
            "latest departure of 1702 — and every minute later than that is spent " +
            "out of one of those margins.",
          exampleTitle: "Latest time of departure",
        },
        {
          title: "Position Reference Methods",
          pages: [184],
          intro:
            "Four ways of saying where you are, in descending order of how often " +
            "they are actually used.",
          keyPoints: [
            "Place name: overhead a named aerodrome or feature.",
            "Bearing and distance: five miles west of an aerodrome.",
            "Latitude and longitude.",
            "The grid system, where the chart is divided into grids and the position is the grid you are in.",
          ],
          takeaway:
            "Choose the method the listener can act on fastest. To a tower, " +
            "bearing and distance from a place they know beats a latitude and " +
            "longitude they would have to plot — which is the practical form of " +
            "the point made back in the first chapter.",
        },
      ],
    },

    /* ================================================================ 12 == */
    {
      title: "Route Selection and Flight Plan Preparation",
      syllabus: ["18.40", "18.42", "18.44", "18.46"],
      intro:
        "The whole subject, applied once, end to end. The deck works a real " +
        "cross-country from Whangarei to Kaitaia via Kaikohe and fills in the " +
        "plan a column at a time — which is the most useful thing in it, " +
        "because it shows the order the columns have to be worked in.",
      topics: [
        {
          title: "Route Selection",
          pages: [186],
          intro:
            "Choosing where to go before working out how, and being honest about " +
            "your own experience while doing it.",
          keyPoints: [
            "Weather first — choose a route with relatively settled conditions.",
            "Ground elevation, and whether the aircraft has the performance to climb over the terrain.",
            "A route you are comfortable flying: without mountain experience, do not select one through mountainous terrain.",
          ],
        },
        {
          title: "Selecting a Cruising Altitude",
          pages: [187],
          intro:
            "The choice constrained by the cruising level table from the " +
            "altimetry chapter.",
          keyPoints: [
            "Always cruise at an altitude consistent with the VFR magnetic track and altitude requirements.",
          ],
          context:
            "Terrain, wind, cloud base and the oxygen requirement all argue for " +
            "particular heights, and the table then rounds your choice to the " +
            "nearest legal one in the right direction. Work out roughly what you " +
            "want first, then let the table pick the exact figure.",
        },
        {
          title: "Alternate Routes and Aerodromes",
          pages: [188],
          intro:
            "The plan for when the plan does not work.",
          keyPoints: [
            "Selecting an alternate route uses the same considerations as the original.",
            "For an alternate aerodrome: fuel facilities, suitability for the aircraft, and whether prior permission is required.",
          ],
          takeaway:
            "Prior permission is the one that is discovered too late. An " +
            "aerodrome that is perfectly suitable and closed to you is not an " +
            "alternate, and finding that out in the air is not the moment.",
        },
        {
          title: "Preparing the Chart",
          pages: [189, 190],
          intro:
            "Transferring the plan onto the thing you will actually be holding.",
          keyPoints: [
            "Mark the departure aerodrome, the turning points and the destination.",
            "Draw the track lines in pencil, thick enough to stand out.",
            "Mark the points where ETAs are to be updated.",
            "Add heading-change markings along each track: either 1:60 marks, or a pair of drift lines drawn at a fixed angle either side of it.",
          ],
          context:
            "The two kinds of marking answer the two questions you will actually " +
            "have in the air. Drift lines — commonly drawn at 5° or 10° either " +
            "side of track from the departure point — let you read your track " +
            "error straight off the chart by seeing which line you are sitting on, " +
            "with no arithmetic at all. The 1:60 marks do the same job by " +
            "distance: ticks along the track at known intervals, so distance gone " +
            "and distance off can be read and put into the formula. Either is " +
            "quicker than measuring, and the point of drawing them on the ground " +
            "is that neither needs a ruler in turbulence. The ETA amendment marks " +
            "belong with them, because the place you check your track is usually " +
            "the place you check your groundspeed.",
          context:
            "The chart is the only part of the plan you can read at a glance with " +
            "an aircraft to fly. Anything that has to be found on a separate sheet " +
            "in turbulence effectively is not available, so the marks that matter " +
            "most belong on the chart itself.",
        },
        {
          title: "The Worked Flight Plan: the Brief",
          pages: [192, 193],
          intro:
            "The flight, and the performance figures the plan will be built from.",
          keyPoints: [
            "Whangarei (NZWR) to Kaitaia (NZKT) via Kaikohe, departing 2215 UTC.",
            "Climb: set heading overhead WR at 1,500 ft and climb on track to 7,500 ft at a mean 700 fpm, CAS 75 kt.",
            "Cruise: CAS 90 kt.",
            "Descent: on track to arrive overhead KT at 1,500 ft, mean 600 fpm, CAS 75 kt.",
          ],
        },
        {
          title: "Forecast Winds and Temperatures",
          pages: [194, 195],
          intro:
            "The GA forecast for the two legs, at four levels. The table is the " +
            "raw material for almost every remaining column.",
          context:
            "Two sets of figures are given because the wind is different over the " +
            "second leg. Anything that spans both legs has to be worked twice — " +
            "which is the reason the plan is laid out leg by leg rather than as " +
            "one calculation for the whole route.",
        },
        {
          title: "Completing the Plan: Legs, MSA and CAS",
          pages: [196],
          intro:
            "The first three columns, and the only one of them that involves " +
            "judgement.",
          keyPoints: [
            "Enter each leg separately: WR to top of climb, TOC to Kaikohe, Kaikohe to top of descent, TOD to KT.",
            "MSA: take the highest elevation within 5 nm either side of track, always round up, then add 1,000 ft — or 2,000 ft over mountainous terrain, which means anything above 3,000 ft.",
            "CAS is given for each leg and can be entered directly.",
          ],
          takeaway:
            "The corridor is 5 nm either side, not on the track itself. An MSA " +
            "worked from spot heights along the pencil line alone is not a minimum " +
            "safe altitude — it is the height of the ground you were aiming to " +
            "miss.",
        },
        {
          title: "Mean Climb and Descent Temperatures",
          pages: [197, 198],
          intro:
            "A climb happens across a range of altitudes, so it is worked at a " +
            "single representative one — and the climb and the descent use " +
            "different fractions.",
          example:
            "Climbing from 1,500 to 7,500 ft is 6,000 ft. Divide by three to get " +
            "2,000 and deduct from 7,500, giving 5,500 ft — two-thirds of the way " +
            "up — where the temperature is +8°. Descending from 7,500 to 1,500 ft " +
            "is again 6,000 ft; divide by two to get 3,000 and add to 1,500, " +
            "giving 4,500 ft, where the temperature is 11°.",
          exampleTitle: "Two-thirds up, halfway down",
          context:
            "The climb uses two-thirds and the descent one-half because the " +
            "aircraft does not spend its time evenly across the band. In the climb " +
            "the rate falls off with height, so more of the time is spent in the " +
            "upper part of the band; a descent is closer to uniform.",
        },
        {
          title: "Climb and Descent Times",
          pages: [199],
          intro:
            "Height to gain divided by rate, rounded to the minute.",
          example:
            "6,000 ft at 700 fpm is 8.6 minutes — 9 minutes rounded. The descent, " +
            "6,000 ft at 600 fpm, is exactly 10 minutes.",
          exampleTitle: "Straight division",
        },
        {
          title: "True Airspeed, Tracks and Distances",
          pages: [200, 201],
          intro:
            "Turning the given CAS into TAS, and measuring the legs off the chart.",
          keyPoints: [
            "TAS is worked from CAS, temperature and altitude for each leg.",
            "Tracks are measured with a protractor and distances with a navigation ruler.",
            "Two total distances are 'hooked' on the plan.",
            "Once groundspeed is known, the climb and descent distances follow, which is what fixes the level cruise sector of each leg.",
          ],
          context:
            "There is a circularity here that trips people up: you need the " +
            "groundspeed to find the climb distance, and the climb distance to know " +
            "how much of the leg is cruise. The way out is the order the plan " +
            "imposes — work the climb as its own leg with its own wind, and the " +
            "cruise sector is simply what is left of the distance afterwards.",
        },
        {
          title: "Interpolating the Wind",
          pages: [202, 203],
          intro:
            "The forecast gives winds at 3,000, 5,000, 7,000 and 9,000 ft, and " +
            "your mean climb altitude is 5,500. This is how the gap is closed.",
          example:
            "Between 210/12 at 5,000 ft and 200/18 at 7,000 ft. The direction " +
            "changes 10° over 2,000 ft, which is 2.5° per 500 ft, so at 5,500 ft it " +
            "is 207.5°, rounded to 208°T. The speed changes 6 kt over 2,000 ft, or " +
            "1.5 kt per 500 ft, giving 13.5 kt, rounded to 14. The climb wind is " +
            "208°T/14.",
          exampleTitle: "Proportion, applied twice",
          takeaway:
            "Direction and speed are interpolated separately, and the same method " +
            "is used again for the halfway-down descent wind and the cruise winds. " +
            "It is proportion, nothing more — but doing it for direction and " +
            "forgetting to do it for speed is a common slip.",
        },
        {
          title: "Headings, Variation and ETAs",
          pages: [204, 205],
          intro:
            "The Direction chapter and the wind side of the computer, applied to " +
            "each leg in turn.",
          keyPoints: [
            "Headings and groundspeeds come from the navigation computer.",
            "Variation is taken off the VPC chart: variation east, magnetic least; variation west, magnetic best.",
            "Magnetic heading is the variation applied to the true heading; compass heading is the deviation applied to the magnetic heading.",
            "ETAs are built by adding each leg's time to the ETD of 2215 UTC in turn.",
          ],
        },
        {
          title: "Fuel Requirements and Zone Fuels",
          pages: [206, 207, 208, 210],
          intro:
            "The last column, and the one with a legal minimum attached to it.",
          keyPoints: [
            "Sufficient fuel for the flight plus a reserve of 30 minutes, which is the legal minimum for a VFR flight.",
            "Taxi, takeoff and the climb to 1,500 ft: 6 litres.",
            "Consumption rates: climb 34 l/hr, cruise 28 l/hr, descent 18 l/hr, holding 24 l/hr, plus fuel for the circuit and landing.",
            "Specific gravity of fuel 0.72.",
            "Zone fuel is each leg's time at that leg's rate — WR to TOC is 9 minutes at 34 l/hr, which is 5 litres.",
          ],
          context:
            "The reason the fuel column is worked last is that it depends on " +
            "every column before it. The times come from the groundspeeds, the " +
            "groundspeeds from the winds, the winds from the interpolation, and the " +
            "interpolation from the mean altitudes. Change the cruising level and " +
            "the fuel figure changes — which is why the plan is worked in this " +
            "order and not in the order the form is printed.",
          takeaway:
            "The deck is explicit that 30 minutes is a minimum rather than a " +
            "target, and adds that at this stage of your flying it is a good idea " +
            "to carry as much fuel as is practicable. Every extra litre beyond the " +
            "minimum is holding time, and holding time is options.",
        },
      ],
    },

    /* ================================================================ 13 == */
    {
      title: "Point of No Return and Equi-Time Point",
      syllabus: ["18.58"],
      intro:
        "Two points on a route that sound similar and answer completely " +
        "different questions. One is about fuel and one is about time, and " +
        "keeping that straight is most of the work.",
      topics: [
        {
          title: "The Point of No Return",
          pages: [212, 213],
          intro:
            "The last place from which you can still change your mind and get " +
            "home.",
          definition:
            "The point of no return, also called the point of safe return, is the " +
            "point along a track beyond which there is insufficient fuel remaining " +
            "to return to the departure aerodrome and arrive with the required " +
            "reserves.",
          term: "Point of no return (PNR)",
          keyPoints: [
            "PNR is a fuel consideration.",
            "Any wind, head or tail, moves the PNR closer to the departure aerodrome.",
            "Safe endurance is the flight fuel available divided by the fuel flow.",
          ],
          misconception:
            "Expecting a tailwind out to push the PNR further away. It does not — " +
            "any wind moves it closer, because whatever the wind gives you on the " +
            "way out it takes back on the way home, and it takes it back over a " +
            "slower groundspeed and therefore a longer time. Only in still air is " +
            "the PNR at its furthest.",
        },
        {
          title: "Calculating Time and Distance to the PNR",
          pages: [214, 215, 216],
          intro:
            "One formula, and the setting on the computer that solves it.",
          keyPoints: [
            "PNR = E × H ÷ (O + H), where E is safe endurance, O is groundspeed out and H is groundspeed home.",
            "The result is a time; apply the groundspeed out to it for the distance.",
            "On the computer: set E × H on the outer scale against O + H on the inner, and read the decimal time on the outer opposite 10 on the inner, then convert to hours and minutes.",
            "For distance, set O on the outer against 60 on the inner and read distance against the time.",
          ],
          diagramNotes: {
            216:
              "The formula mapped onto the computer's scales. “Endurance” " +
              "sits over “Out + Home” at one setting mark, and " +
              "“Time to PNR” sits over “Home” at the other — " +
              "the two ratios of the PNR formula, read against each other on the " +
              "wheel.",
          },
          context:
            "The formula is less arbitrary than it looks. The fuel has to cover " +
            "going out and coming back, so the total ground covered per unit of " +
            "endurance depends on both speeds — which is where O + H comes from. " +
            "Multiplying by H rather than O gives you the outbound share of that " +
            "endurance, because the slower leg consumes proportionally more of it.",
        },
        {
          title: "The Equi-Time Point",
          pages: [217, 218],
          intro:
            "The point from which going on and turning back take the same time. " +
            "Nothing to do with how much fuel is in the tanks.",
          definition:
            "The equi-time point, also called the critical point, is the point " +
            "along track from which it takes the same time to reach the " +
            "destination as it would to return to the departure aerodrome.",
          term: "Equi-time point (ETP)",
          keyPoints: [
            "ETP is a time consideration.",
            "Distance to ETP = total distance × groundspeed home ÷ (groundspeed on + groundspeed home).",
          ],
          context:
            "The PNR asks whether you can get back; the ETP asks where you would " +
            "get to soonest if something happened right now. That is why the ETP " +
            "formula contains the total distance and no endurance at all — it does " +
            "not care how much fuel you have, only how far apart the two ends are " +
            "and how fast you would travel towards each.",
        },
        {
          title: "Worked ETP: a Single Wind",
          pages: [219, 220],
          intro:
            "The straightforward case, where one wind applies for the whole route.",
          example:
            "450 nm between A and B, TAS 150 kt, headwind of 20 kt from A to B. " +
            "Groundspeed on is 130 kt and groundspeed home is 170 kt, so O + H is " +
            "300. ETP = 450 × 170 ÷ 300 = 255 nm from A — which is 195 nm from B.",
          exampleTitle: "450 nm into a 20 kt headwind",
          takeaway:
            "The ETP has moved past the halfway point, into wind. That is the " +
            "sense check worth applying to every answer: the equi-time point always " +
            "sits on the upwind side of the midpoint, because the return leg will " +
            "be the fast one.",
        },
        {
          title: "Worked ETP: Two Different Winds",
          pages: [221, 222, 223],
          intro:
            "The same formula where the wind component changes along the route, " +
            "plus the elapsed time to get there.",
          example:
            "TAS 210 kt over 580 nm, with a component of −40 kt from A to the ETP " +
            "and +20 kt from the ETP to B. Groundspeed on is 230 and groundspeed " +
            "home is 250, so ETP = 580 × 250 ÷ 480 = 302 nm from A. For the elapsed " +
            "time, the groundspeed from A to the ETP is 210 − 40 = 170 kt, and " +
            "302 nm at 170 kt is 106 minutes, or 1 hour 46.",
          exampleTitle: "580 nm with the wind changing at the ETP",
          misconception:
            "Using the same groundspeed for the distance calculation and the time " +
            "calculation. They are different numbers doing different jobs: the " +
            "formula needs the speeds on and home to place the point, and the " +
            "elapsed time then needs the actual outbound groundspeed to fly to it.",
        },
      ],
    },

    /* ================================================================ 14 == */
    {
      title: "Cruise Performance: Range and Endurance",
      syllabus: ["18.46"],
      intro:
        "Four ways of flying the same aircraft over the same route, each " +
        "optimal for a different question. They are mutually exclusive, and " +
        "knowing which one a situation is asking for is the skill.",
      topics: [
        {
          title: "Maximum Range",
          pages: [225],
          intro:
            "Flying the greatest distance on the fuel carried.",
          keyPoints: [
            "The more fuel carried, the greater the range.",
            "Range is affected by weight, wind, air temperature, altitude and aircraft configuration, including the constant speed unit.",
          ],
          context:
            "Weight appears on that list for the same reason it appears " +
            "everywhere in performance: a heavier aircraft needs more lift, more " +
            "lift means more drag, and more drag means more fuel for every mile. " +
            "Carrying extra fuel therefore buys less range than the arithmetic " +
            "suggests, because some of it is spent carrying the rest.",
        },
        {
          title: "Specific Range",
          pages: [226, 227],
          intro:
            "Range expressed as a rate rather than a total, which is what makes " +
            "it comparable between conditions.",
          definition:
            "Specific range is the distance travelled per unit of fuel burned.",
          term: "Specific range",
          keyPoints: [
            "Best specific air range is found at the best ratio of TAS to fuel flow: SAR = TAS ÷ fuel flow.",
            "Best specific ground range is found at the best ratio of groundspeed to fuel flow: SGR = GS ÷ fuel flow.",
          ],
          context:
            "The difference between the two is entirely the wind. Air range is a " +
            "property of the aeroplane; ground range is a property of the flight. " +
            "Into a strong headwind the best ground range is found at a higher " +
            "airspeed than the best air range, because spending a little more fuel " +
            "per hour to reduce the hours spent in the headwind is the better " +
            "bargain.",
        },
        {
          title: "Maximum Endurance",
          pages: [228],
          intro:
            "Staying airborne for the longest time, where distance covered is " +
            "irrelevant.",
          keyPoints: [
            "Maximum endurance means remaining airborne for the longest possible time.",
            "It is what you want when holding at an aerodrome waiting for the weather to improve.",
          ],
          takeaway:
            "Endurance and range are different targets and are flown at different " +
            "speeds. Range asks for the most miles per litre; endurance asks for " +
            "the fewest litres per hour, and the aircraft that is covering the " +
            "least ground is the one doing the second job best.",
        },
        {
          title: "Minimum Flight Time",
          pages: [229],
          intro:
            "Getting there fastest, and what it costs.",
          keyPoints: [
            "In nil wind this means the highest TAS; where wind components apply, the highest groundspeed.",
            "It cannot be achieved at the most efficient airspeed and power setting, and requires a relatively high fuel flow.",
          ],
          context:
            "This is the honest counterweight to the three topics before it. " +
            "Speed is available and it is paid for in fuel, so the decision is a " +
            "trade rather than an optimisation — and the reserve requirement sets " +
            "the floor below which the trade is no longer yours to make.",
        },
      ],
    },

    /* ================================================================ 15 == */
    {
      title: "Radio Aids in Support of VFR Navigation",
      syllabus: ["18.70"],
      intro:
        "Four aids, treated here only as far as a VFR pilot uses them: as " +
        "confirmation of a position that has already been established " +
        "visually. The emphasis throughout the deck is that they support the " +
        "navigation rather than replace it.",
      topics: [
        {
          title: "The ADF and the NDB",
          pages: [231],
          intro:
            "The oldest aid, and the one that gives you an angle rather than a " +
            "direction.",
          definition:
            "The ADF is a radio receiver which, tuned to a ground-based " +
            "non-directional beacon, indicates the direction of that beacon from " +
            "the aircraft by means of a needle.",
          term: "Automatic direction finder (ADF)",
          keyPoints: [
            "The needle shows a relative bearing — the position of the beacon relative to the aircraft's nose.",
          ],
          context:
            "Because the reading is relative, the same beacon in the same place " +
            "gives a different indication after every turn. That is the whole " +
            "difficulty of the ADF and the reason the next topic exists: the " +
            "needle has to be combined with the heading before it means anything " +
            "you can put on a chart.",
        },
        {
          title: "Magnetic Bearings To and From an NDB",
          pages: [232, 233],
          intro:
            "Converting what the needle gives you into something a chart will " +
            "accept — and the trap that catches people using a VNC with an ADF.",
          keyPoints: [
            "A magnetic bearing is a true bearing with variation applied.",
            "A bearing of 270°T from the aircraft with 22° East variation is 248°M — east is least.",
            "A bearing of 030°T with 10° West variation is 040° in magnetic terms — west is best.",
            "VNC charts are aligned to true north and the ADF is referenced to magnetic north, so failing to apply variation means the track will not be maintained.",
          ],
          misconception:
            "Plotting a magnetic bearing straight onto a chart. The chart is " +
            "drawn to true north and the needle is working in magnetic, so a " +
            "bearing taken off the instrument has to have variation applied before " +
            "it is drawn — and the direction of that application is the reverse of " +
            "going from chart to cockpit. Say which reference you are in before " +
            "and after every conversion; the arithmetic is trivial and the " +
            "bookkeeping is not.",
        },
        {
          title: "The VOR and its Radials",
          pages: [234, 235, 236],
          intro:
            "The aid that gives a magnetic bearing directly, without needing the " +
            "aircraft's heading at all.",
          keyPoints: [
            "A VOR station has a two-letter identifying code broadcast in Morse; the ident must be confirmed before the signals are used.",
            "VORs are published on the VNC charts and in the chart section of the AIP.",
            "Every magnetic bearing from the station is a radial, determined by a phase difference — magnetic north from the station is radial 360, magnetic south is radial 180.",
          ],
          context:
            "A radial is a bearing FROM the station and is already magnetic, " +
            "which is what makes the VOR so much easier to use than the ADF: it is " +
            "independent of your heading and needs no conversion to be understood. " +
            "Confirming the ident is not a formality — an unmonitored beacon can " +
            "transmit an unusable signal, and the ident is the only warning you get.",
        },
        {
          title: "Distance Measuring Equipment",
          pages: [237, 238],
          intro:
            "The one aid that answers how far rather than which way.",
          definition:
            "DME is a radio navigation aid designed to provide continuous " +
            "indications of the aircraft's distance from the selected DME ground " +
            "station.",
          term: "Distance measuring equipment (DME)",
          context:
            "A bearing gives a position line and a distance gives a circle; " +
            "together they intersect at a point. That is why a VOR paired with a " +
            "DME produces a fix from a single station, where two separate bearings " +
            "would otherwise be needed.",
        },
        {
          title: "The Global Positioning System",
          pages: [239, 240, 241],
          intro:
            "Three segments, and the displays you actually see.",
          keyPoints: [
            "Space segment: 24 satellites in orbit.",
            "Control segment: monitoring stations and ground antennas.",
            "User segment: all the receivers.",
          ],
        },
        {
          title: "RAIM and PDOP",
          pages: [242, 243, 249],
          intro:
            "How a receiver decides whether to trust itself, and what geometry " +
            "has to do with accuracy.",
          keyPoints: [
            "Four satellites are needed for an accurate position.",
            "Five are required for RAIM — receiver autonomous integrity monitoring — to detect an anomalous situation.",
            "Six are required to isolate the unacceptable satellite.",
            "PDOP is position dilution of precision: the further apart the satellites are while still in view, the lower the PDOP and the greater the accuracy.",
            "RAIM predictions assess signal reliability in advance, identifying potential outages so that routes can be planned around them.",
          ],
          context:
            "The satellite counts follow a logic worth holding onto rather than " +
            "memorising. Four gives an answer. A fifth gives a second opinion, so " +
            "a disagreement can be noticed — but not resolved. A sixth breaks the " +
            "tie and identifies which satellite is the liar. Detection needs five; " +
            "exclusion needs six.",
        },
        {
          title: "Geodetic Datum and Augmentation",
          pages: [244, 245],
          intro:
            "Two reasons a satellite position and a chart position may not agree, " +
            "and the system that narrows the gap.",
          keyPoints: [
            "GPS and worldwide data banks use the World Geodetic System 1984.",
            "Used with an older chart based on the New Zealand Geodetic Datum 1949, errors of up to a couple of hundred metres may occur.",
            "Ground-based reference stations broadcast the difference between the satellite-indicated position and their own known position.",
            "Differential GPS and the Wide Area Augmentation System can reduce errors to 3–5 metres.",
          ],
          context:
            "A datum error is not the receiver being wrong. The receiver is " +
            "correct about where it is on one model of the Earth's shape and the " +
            "chart is drawn on another, so both are right and they disagree. It is " +
            "worth knowing the size of the discrepancy — a couple of hundred metres " +
            "matters when the feature you are looking for is a strip in a valley.",
        },
        {
          title: "GPS Errors and Limitations",
          pages: [246],
          intro:
            "Six ways the position can be degraded, most of them invisible while " +
            "they are happening.",
          keyPoints: [
            "Multi-path error, from satellite signals bouncing off the Earth.",
            "Ionospheric propagation effect: charged particles interfering with propagation speed.",
            "Tropospheric propagation effect: water vapour slowing the signals, compensated for in the receiver.",
            "Receiver error, from difficulty matching the pseudo-random code.",
            "Interference, since satellite signals are weak and shielding from VHF radios and radar may be insufficient.",
            "Battery life, on portable handheld units.",
          ],
        },
        {
          title: "Human Factors and Using GPS as a Back-Up",
          pages: [247, 248],
          intro:
            "The errors that are not the equipment's fault, and the argument this " +
            "chapter has been building towards.",
          keyPoints: [
            "Mode error and data entry error.",
            "Non-standardisation of control knobs and switches, and data display.",
            "Position of the unit in the cockpit, and compulsive fiddling.",
            "GPS does fail; a pilot with no navigational skills is then in serious trouble.",
          ],
          takeaway:
            "The head-down time is the risk that the error list understates. " +
            "Compulsive fiddling is on that list because a pilot absorbed in a " +
            "receiver is not looking out, not flying accurately and not map " +
            "reading — and the aid meant to reduce workload has quietly increased " +
            "it. Use it to confirm a position you have already established, not to " +
            "find one you have lost.",
        },
      ],
    },
  ],
};
