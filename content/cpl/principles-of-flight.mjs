/**
 * Principles of Flight and Aircraft Performance — the curriculum.
 *
 * This deck reached the project as a PDF rather than a PowerPoint, so it
 * carries only ten section dividers for 288 slides. Its slide titles, though,
 * are almost all concept names, and they line up closely with the examinable
 * areas of the subject — which is unsurprising, because the deck was written
 * against them. The chapters below follow that shape.
 *
 * The deck is also a composite. Twenty-three slides carry a footer from
 * another deck — some from a PPL technical knowledge course, five from the
 * helicopter variant of this subject. Reading every one of those slides shows
 * the teaching on them is generic or explicitly aeroplane: aerofoil
 * terminology captioned "Aeroplane Wing", the lift equation, profile drag
 * "still present even on an aeroplane taxiing", the boundary layer, and the
 * rate-one-turn rule of thumb. A search of the whole deck for rotor, collective,
 * cyclic, tail rotor or dissymmetry of lift returns nothing; the two hits for
 * "autorotation" are both the fixed-wing spin sense. So the content stays and
 * the footers are stripped, which is what `SLIDE_FOOTER` in source-repairs.mjs
 * does. One helicopter silhouette used as decoration is rejected in
 * diagram-decisions.mjs.
 */

export const subject = {
  slug: "principles-of-flight",
  title: "Principles of Flight and Aircraft Performance",
  deck: "cpl-principles-of-flight",

  skip: {
    1: "deck cover slide: the title of the subject with no body text",
    2: "blank slide: nothing but a slide-master footer",
    21: "blank slide: nothing but a slide-master footer",
    33: "blank slide: nothing but a slide-master footer",
    55: "blank slide: nothing but a slide-master footer",
    66: "blank slide: nothing but a slide-master footer",
    91: "section divider: the heading \"Lift/Drag Ratio\" with no text of its own",
    97: "blank slide: nothing but a slide-master footer",
    112: "blank slide: nothing but a slide-master footer",
    127: "section divider: the heading \"Flutter\" with no text of its own",
    129: "section divider: the heading \"Stalling & Spinning\" with no text of its own",
    146: "blank slide: nothing but a slide-master footer",
    147: "blank slide: nothing but a slide-master footer",
    158: "section divider: the heading \"Climbing Flight\" with no text of its own",
    167: "blank slide: nothing but a slide-master footer",
    168: "section divider: the heading \"Descending Flight\" with no text of its own",
    176: "section divider: the heading \"Turning\" with no text of its own",
    188: "blank slide: nothing but a slide-master footer",
    195: "blank slide: nothing but a slide-master footer",
    204: "blank slide: nothing but a slide-master footer",
    213: "blank slide: nothing but a slide-master footer",
    234: "section divider: the heading \"Ground Loop\" with no text of its own",
    244: "blank slide: nothing but a slide-master footer",
    247: "section divider: the heading \"Asymmetric Flight\" with no text of its own",
    253: "blank slide: nothing but a slide-master footer",
    259: "section divider: the heading \"Range and Endurance\" with no text of its own",
    266: "section divider: the heading \"Performance\" with no text of its own",
  },

  chapters: [
    {
      title: "Aeroscience: Forces, Moments and Energy",
      syllabus: ["22.2"],
      intro:
        "The mechanics the rest of the subject is built on. None of it is " +
        "aviation yet — it is the vocabulary of forces and motion that makes " +
        "the aviation possible.",
      topics: [
        {
          title: "Scalars, Vectors and Resolving Them",
          pages: [3, 4, 5],
          intro:
            "Quantities that have a size, quantities that also have a direction, " +
            "and how to break the second kind into components.",
          context:
            "Resolving vectors is the single most reused technique in the " +
            "subject. Lift and drag are the components of one force; thrust in a " +
            "climb is doing two jobs at once; the forces in a turn only balance " +
            "when you look at the horizontal and vertical components separately.",
        },
        {
          title: "Newton's Laws of Motion",
          pages: [6, 7, 8, 9],
          intro:
            "Three laws, and the aerodynamic consequences that follow directly " +
            "from each.",
        },
        {
          title: "Equilibrium and Momentum",
          pages: [10, 11],
          intro:
            "What it means for an aircraft to be in equilibrium, and the quantity " +
            "that has to be changed to change its motion.",
        },
        {
          title: "Mass, Weight and Curved Paths",
          pages: [12, 13],
          intro:
            "Two quantities that are constantly confused, and what is needed to " +
            "make something travel in a curve rather than a straight line.",
          misconception:
            "Using mass and weight interchangeably. Mass is how much matter there " +
            "is; weight is the force gravity exerts on it. The distinction " +
            "matters in the turning chapter, where load factor multiplies the " +
            "apparent weight while the mass is unchanged.",
        },
        {
          title: "Trigonometry, Moments and Couples",
          pages: [14, 15, 16, 17],
          intro:
            "The functions used to resolve forces, and the two ways a force can " +
            "produce rotation.",
        },
        {
          title: "Work, Energy and Power",
          pages: [18, 19, 20],
          intro:
            "Work, potential and kinetic energy, and why kinetic energy matters " +
            "so much at higher speeds.",
          takeaway:
            "Kinetic energy goes with the square of speed. That is why an " +
            "overspeed on landing costs so much more runway than it seems it " +
            "should, and why a small excess of approach speed is not a small " +
            "problem.",
        },
      ],
    },

    {
      title: "The Atmosphere and Density Altitude",
      syllabus: ["22.4"],
      intro:
        "The air is the aeroplane's working fluid, and everything the aeroplane " +
        "can do depends on how much of it there is.",
      topics: [
        {
          title: "Density and Why It Matters",
          pages: [22, 23, 24, 25, 26],
          intro:
            "How density falls with altitude, and the two consequences for the " +
            "aircraft.",
          keyPoints: [
            "As an aircraft climbs, the wings become progressively less able to generate the lift required.",
            "The power output of the engine reduces at the same time.",
            "The higher the pressure and the lower the temperature, the denser the air.",
          ],
        },
        {
          title: "The International Standard Atmosphere",
          pages: [27, 28],
          intro:
            "A hypothetical atmosphere used as a yardstick, and what it is for.",
          context:
            "The ISA does not describe today. It exists so that performance can " +
            "be compared, altimeters calibrated and predictions made against a " +
            "fixed reference — and so the real atmosphere can be described as a " +
            "deviation from it.",
        },
        {
          title: "Altitude Bands, Density Altitude and Viscosity",
          pages: [29, 30, 31, 32],
          intro:
            "How pressure and density fall with height, what density altitude " +
            "means, and the property of air that produces the boundary layer.",
        },
      ],
    },

    {
      title: "Pressure, Airspeed and the Speed Definitions",
      syllabus: ["22.6"],
      intro:
        "How an airspeed indicator works, and the four speeds it leads to. " +
        "Navigation covers the same chain from the navigator's side; here the " +
        "interest is in what the wing feels.",
      topics: [
        {
          title: "Static, Dynamic and Pitot Pressure",
          pages: [34, 35, 36],
          intro:
            "Three pressures, and the relationship between them that makes " +
            "airspeed measurable.",
        },
        {
          title: "Airspeed Indication",
          pages: [37],
          intro:
            "What the instrument is actually measuring.",
        },
        {
          title: "IAS, CAS and TAS",
          pages: [38, 39, 40, 41],
          intro:
            "The speeds in the chain, and the correction that separates each from " +
            "the next.",
          takeaway:
            "The wing only ever feels dynamic pressure, which is what the " +
            "indicator reads. That is why the stall, the limiting speeds and the " +
            "approach speed are all indicated figures and do not change with " +
            "altitude — and why the aeroplane is flown on IAS and navigated on " +
            "TAS.",
        },
      ],
    },

    {
      title: "Aerofoils and Angle of Attack",
      syllabus: ["22.6"],
      intro:
        "The shape that produces lift, the vocabulary used to describe it, and " +
        "the single angle that governs almost everything the wing does.",
      topics: [
        {
          title: "Aerofoil Terminology",
          pages: [42, 43, 44, 45],
          intro:
            "Leading and trailing edge, chord line, mean camber line, thickness " +
            "and thickness-chord ratio — and how design choices among them change " +
            "the wing's behaviour.",
        },
        {
          title: "Relative Airflow and Angle of Attack",
          pages: [46, 47, 48],
          intro:
            "The airflow the wing actually meets, and the angle between it and " +
            "the chord line.",
          misconception:
            "Confusing angle of attack with pitch attitude. Angle of attack is " +
            "measured against the relative airflow, not against the horizon — " +
            "which is why an aeroplane can be stalled in a steep descent with the " +
            "nose well below the horizon.",
        },
      ],
    },

    {
      title: "The Production of Lift",
      syllabus: ["22.8"],
      intro:
        "Where lift comes from, what governs how much of it there is, and what " +
        "happens when the wing is asked for more than it can give.",
      topics: [
        {
          title: "How Lift Is Produced",
          pages: [49, 50],
          intro:
            "The pressure difference across the wing, and the upwash and downwash " +
            "that accompany it.",
        },
        {
          title: "Lift, Drag and the Total Reaction",
          pages: [51, 52, 53, 54],
          intro:
            "The single force the air exerts on the wing, and the two components " +
            "it is resolved into.",
          context:
            "Lift and drag are not two separate forces. There is one total " +
            "reaction, and it is resolved perpendicular and parallel to the " +
            "relative airflow purely because those are the useful directions. " +
            "That is why anything increasing lift tends to increase drag as well.",
        },
        {
          title: "The Lift Formula",
          pages: [56, 57],
          intro:
            "Each term in the lift equation, and what the pilot can actually " +
            "change.",
          keyPoints: [
            "Lift depends on the coefficient of lift, air density, the square of the velocity, and the wing area.",
            "The coefficient of lift is a function of angle of attack and of the shape of the aerofoil.",
          ],
          takeaway:
            "Of everything in the equation, the pilot directly controls only two " +
            "things in flight: angle of attack and speed. Density is given to you " +
            "and area changes only with flap. That is why so much of handling " +
            "comes down to trading those two against each other.",
        },
        {
          title: "The CL Curve and CL Max",
          pages: [58, 59, 60, 61],
          intro:
            "How the coefficient of lift varies with angle of attack, and the " +
            "things that change the shape of the curve.",
        },
        {
          title: "Exceeding the Critical Angle",
          pages: [62, 63],
          intro:
            "What happens beyond the critical angle of attack, introduced here " +
            "and treated fully in the stalling chapter.",
        },
        {
          title: "Aspect Ratio",
          pages: [64, 65],
          intro:
            "The proportion of a wing's span to its chord, and what it does to " +
            "performance.",
        },
      ],
    },

    {
      title: "Drag",
      syllabus: ["22.10"],
      intro:
        "Everything resisting the aeroplane's motion, in two families that " +
        "behave in opposite ways with speed. The point where they cross decides " +
        "several of the aeroplane's most important speeds.",
      topics: [
        {
          title: "The Drag Formula",
          pages: [67],
          intro:
            "The same structure as the lift equation, with a different " +
            "coefficient.",
        },
        {
          title: "Induced Drag",
          pages: [68, 69, 70, 71, 72, 73],
          intro:
            "The drag that is the price of making lift, and the downwash that " +
            "produces it.",
          context:
            "Induced drag exists because the wing has ends. Pressure escapes " +
            "around the tips, the resulting vortices tilt the lift vector " +
            "backwards, and that rearward component is the drag. It is worst " +
            "where the wing is working hardest — slow, heavy and high angle of " +
            "attack.",
        },
        {
          title: "Reducing Induced Drag",
          pages: [74, 75, 76, 77, 78, 79, 80],
          intro:
            "Taper, washout, wing design and the other ways the effect is " +
            "reduced.",
        },
        {
          title: "Profile Drag",
          pages: [81, 82, 83, 84],
          intro:
            "Skin friction and form drag, and why profile drag is present even " +
            "when no lift is being made.",
        },
        {
          title: "The Boundary Layer",
          pages: [85, 86, 87],
          intro:
            "The thin layer of air next to the surface, its laminar and turbulent " +
            "states, and where it separates.",
          takeaway:
            "The boundary layer explains both drag and the stall. Laminar flow is " +
            "efficient but fragile; turbulent flow costs more drag but clings to " +
            "the surface further. Separation is where it lets go — and a stall is " +
            "separation over most of the wing.",
        },
        {
          title: "Interference Drag and the Total Drag Curve",
          pages: [88, 89, 90],
          intro:
            "The drag produced where components meet, and the curve that results " +
            "from adding all the sources together.",
          context:
            "The total drag curve is the shape to carry out of this chapter. " +
            "Induced drag falls with speed and profile drag rises with it, so the " +
            "sum has a minimum — and that minimum is the speed at which the " +
            "aeroplane flies most efficiently.",
        },
      ],
    },

    {
      title: "Lift/Drag Ratio",
      syllabus: ["22.12"],
      intro:
        "One number expressing how much lift the wing gives for the drag it " +
        "costs, and the angle of attack at which it is best.",
      topics: [
        {
          title: "Determining the Lift/Drag Ratio",
          pages: [92, 93, 94, 95, 96],
          intro:
            "How the ratio is derived from the total drag curve and from the " +
            "lift/drag curve.",
          takeaway:
            "Best lift/drag ratio occurs at one angle of attack, and therefore at " +
            "one indicated airspeed for a given weight. That speed reappears " +
            "throughout the subject: it is the best glide speed, and it is behind " +
            "maximum range.",
        },
      ],
    },

    {
      title: "Lift Augmentation",
      syllabus: ["22.12"],
      intro:
        "Devices that change the wing's characteristics temporarily, so that one " +
        "wing can be efficient in the cruise and still fly slowly enough to " +
        "land.",
      topics: [
        {
          title: "The Purpose of Lift Augmentation",
          pages: [98, 99, 100],
          intro:
            "What lowering trailing-edge flap does to lift, to drag and to the " +
            "stalling speed.",
        },
        {
          title: "Types of Trailing-Edge Flap",
          pages: [101, 102, 103, 104, 105],
          intro:
            "Plain, split, slotted and Fowler flap, and how their effects " +
            "compare.",
          context:
            "The four types trade lift against drag differently. A plain flap " +
            "mostly adds camber; a Fowler flap also adds area, which is why it " +
            "gives the most lift for the least drag penalty at small deflections " +
            "— and why the early stages of flap help the take-off while the last " +
            "stages only help the landing.",
        },
        {
          title: "Leading-Edge Devices",
          pages: [106, 107, 108, 109],
          intro:
            "Leading-edge flap, slats and slots, and the different job they do.",
          misconception:
            "Thinking leading-edge devices work like flaps. They do not increase " +
            "camber so much as delay separation, which raises the stalling angle " +
            "itself rather than simply producing more lift at the same angle.",
        },
        {
          title: "Spoilers",
          pages: [110, 111],
          intro:
            "Devices that deliberately destroy lift, and why that is useful.",
        },
      ],
    },

    {
      title: "Flight Controls, Trim and Balance",
      syllabus: ["22.14"],
      intro:
        "How the aeroplane is controlled about its three axes, the secondary " +
        "effects that come with each input, and the devices that make the " +
        "controls manageable.",
      topics: [
        {
          title: "The Aircraft Axes and Changes in Camber",
          pages: [113, 114],
          intro:
            "Three axes, three controls, and the mechanism common to all of them.",
        },
        {
          title: "Secondary Effects of Controls",
          pages: [115, 116],
          intro:
            "What else happens when aileron or rudder is applied.",
        },
        {
          title: "Adverse Yaw",
          pages: [117, 118],
          intro:
            "Why an aeroplane initially yaws away from the direction of roll, and " +
            "the methods used to reduce it.",
          context:
            "The down-going aileron makes more lift and therefore more induced " +
            "drag than the up-going one makes less. The wing that is rising is " +
            "also being held back — so the nose yaws the wrong way, and that is " +
            "what the rudder is coordinating.",
        },
        {
          title: "Control Effectiveness and Trim Tabs",
          pages: [119, 120],
          intro:
            "What makes a control more or less effective, and the tab that " +
            "removes the stick force.",
        },
        {
          title: "Aerodynamic Balancing",
          pages: [121, 122, 123, 124, 125],
          intro:
            "Horn balance, balance and servo tabs, and the anti-balance tab that " +
            "does the opposite.",
          misconception:
            "Assuming an anti-balance tab is a mistake or a failure. It is " +
            "deliberate: on a control that would otherwise be too light, it puts " +
            "the feel back so the pilot is not able to overstress the aeroplane " +
            "without noticing.",
        },
        {
          title: "Mass Balancing and Flutter",
          pages: [126, 128],
          intro:
            "Why control surfaces are mass balanced, and the destructive " +
            "oscillation it prevents.",
        },
      ],
    },

    {
      title: "Stalling and Spinning",
      syllabus: ["22.16"],
      intro:
        "The stall is a single condition with one cause: exceeding the critical " +
        "angle of attack. Everything else in this chapter is what changes the " +
        "speed at which that angle is reached, and what happens if one wing " +
        "reaches it first.",
      topics: [
        {
          title: "The Stall",
          pages: [130, 131, 132],
          intro:
            "What is happening to the airflow, and how the centre of pressure " +
            "moves.",
        },
        {
          title: "Recovery from a Stall",
          pages: [133],
          intro:
            "The actions that end a stall, and why they are in that order.",
          takeaway:
            "The stall is broken by reducing the angle of attack, and nothing " +
            "else does it. Power helps the recovery and reduces the height lost, " +
            "but an aeroplane at the critical angle with full power applied is " +
            "still stalled.",
        },
        {
          title: "Factors Affecting Stall Speed",
          pages: [134, 135, 136, 137],
          intro:
            "Weight, load factor, flap, slats, slots and altitude — what each " +
            "does to the indicated speed at which the wing reaches its critical " +
            "angle.",
          misconception:
            "Believing an aeroplane stalls at a fixed speed. It stalls at a fixed " +
            "<em>angle</em>. The speed at which that angle is reached moves with " +
            "weight, load factor and configuration — which is why the stall in a " +
            "steep turn arrives so much earlier than the placarded figure.",
        },
        {
          title: "Wing-Drop Stalls",
          pages: [138, 139, 140, 141, 142],
          intro:
            "What happens when one wing stalls first, how designers reduce the " +
            "tendency, and why aileron is the wrong response.",
          context:
            "Using aileron to pick up a dropping wing increases the angle of " +
            "attack on the wing that is already closest to the stall. That is why " +
            "the recovery is made with rudder and by reducing the angle of attack " +
            "— the instinctive control input is the one that deepens the problem.",
        },
        {
          title: "Autorotation and the Spin",
          pages: [143, 144, 145],
          intro:
            "How a wing-drop becomes a spin, the characteristics of the upright " +
            "spin, and the recovery.",
        },
      ],
    },

    {
      title: "Straight and Level Flight",
      syllabus: ["22.18"],
      intro:
        "Four forces in balance, the couples between them, and why one aeroplane " +
        "can fly level at two quite different speeds.",
      topics: [
        {
          title: "Thrust and the Force Couples",
          pages: [148, 149, 150],
          intro:
            "The lift/weight and thrust/drag couples, and how they balance each " +
            "other.",
          context:
            "The two couples are arranged to oppose each other on purpose. The " +
            "usual arrangement gives a nose-down pitch from one and a nose-up " +
            "from the other, so that a power failure produces a gentle pitch " +
            "change towards the glide rather than away from it.",
        },
        {
          title: "Changes in Pitching Moment",
          pages: [151, 152, 153, 154],
          intro:
            "What moves the pitching moment as speed, power and configuration " +
            "change.",
        },
        {
          title: "The Speed Range for Level Flight",
          pages: [155, 156, 157],
          intro:
            "Why level flight is possible across a range of speeds, and what " +
            "limits it at each end.",
          takeaway:
            "At a given weight, level flight at a low speed needs a high angle of " +
            "attack and at a high speed a low one. Both ends are limited: the " +
            "slow end by the stall, the fast end by available power. The region " +
            "of reversed command — where flying slower needs more power, not less " +
            "— sits at the slow end and is where approach accidents live.",
        },
      ],
    },

    {
      title: "Climbing Flight",
      syllabus: ["22.20"],
      intro:
        "Two different climbs answering two different questions: how fast can I " +
        "gain height, and how much height can I gain over a given distance.",
      topics: [
        {
          title: "Forces in the Climb",
          pages: [159, 160],
          intro:
            "Why the aeroplane is not simply pointing upwards, and what supports " +
            "the weight in a steady climb.",
          misconception:
            "Thinking the aeroplane climbs because the wing makes more lift. In a " +
            "steady climb the lift is slightly <em>less</em> than the weight — " +
            "the climb is being paid for by excess thrust, not by extra lift.",
        },
        {
          title: "Rate of Climb and Angle of Climb",
          pages: [161, 162, 163, 164],
          intro:
            "Vy and Vx, what each maximises, and the factors that affect them.",
          context:
            "Rate of climb is about excess power and gets you height in the least " +
            "time. Angle of climb is about excess thrust and gets you height in " +
            "the least distance. The second is the one for an obstacle; the first " +
            "is the one for everything else.",
        },
        {
          title: "Climb Speeds, Ceilings and Their Limits",
          pages: [165, 166],
          intro:
            "The climb speeds in use, and the difference between the absolute and " +
            "the service ceiling.",
        },
      ],
    },

    {
      title: "Descending Flight and the Glide",
      syllabus: ["22.20"],
      intro:
        "Descending with power and without it, and the surprisingly small list " +
        "of things that actually change how far a glider goes.",
      topics: [
        {
          title: "The Glide",
          pages: [169, 170],
          intro:
            "The relationship between lift/drag ratio, glide angle, airspeed and " +
            "range.",
        },
        {
          title: "Factors Affecting the Glide",
          pages: [171, 172, 173, 174, 175],
          intro:
            "Weight, wind, configuration and speed, and which of them change the " +
            "distance covered.",
          takeaway:
            "Weight does not change the glide <em>angle</em> — a heavier " +
            "aeroplane glides just as far, it simply gets there faster and needs " +
            "a higher speed to do it. Wind and configuration do change the " +
            "distance, and speed changes it the moment you depart from the best " +
            "lift/drag speed in either direction.",
        },
      ],
    },

    {
      title: "Turning and Load Factor",
      syllabus: ["22.22"],
      intro:
        "A turn is an acceleration towards the centre of the circle, and the " +
        "wing has to produce it on top of supporting the weight. Everything " +
        "costly about turning follows from that.",
      topics: [
        {
          title: "Centripetal Force and the Lift Components",
          pages: [177, 178, 179],
          intro:
            "The horizontal component that turns the aeroplane and the vertical " +
            "component that holds it up.",
          context:
            "Banking tilts the lift vector, so part of it now pulls the aeroplane " +
            "round the turn — and what is left pointing up is less than the " +
            "weight. To stay level the total lift has to be increased, and that " +
            "increase is what the load factor measures.",
        },
        {
          title: "Load Factor",
          pages: [180],
          intro:
            "What load factor is and what changes it.",
          takeaway:
            "Load factor in a level turn depends only on bank angle — not on " +
            "speed, weight or aircraft type. That is why the same bank angle " +
            "costs the same load factor in anything, and why the stall speed " +
            "increase in a turn is predictable.",
        },
        {
          title: "Turning in Practice",
          pages: [181, 182, 183, 184, 185, 186, 187],
          intro:
            "Rate and radius, the rule of thumb for a rate-one turn, and the " +
            "conditions for maximum rate and minimum radius.",
        },
        {
          title: "Steep Turns and the Loop",
          pages: [189, 190, 191, 192, 193, 194],
          intro:
            "What changes as bank increases, and the forces through a loop.",
        },
      ],
    },

    {
      title: "Propellers",
      syllabus: ["22.24"],
      intro:
        "A propeller is a rotating wing, and almost everything from the lift " +
        "chapter applies to it — with the complication that every part of the " +
        "blade is moving at a different speed.",
      topics: [
        {
          title: "Propeller Terminology and Angles",
          pages: [196, 197],
          intro:
            "Blade root, tip, and the angles used to describe a propeller.",
        },
        {
          title: "Forces on the Propeller and Helical Twist",
          pages: [198, 199],
          intro:
            "The forces the blade carries, and why it is twisted from root to " +
            "tip.",
          context:
            "The tip travels much faster than the root, so it meets the airflow " +
            "at a quite different angle. The twist exists so that every part of " +
            "the blade works at an efficient angle of attack at the same time — " +
            "without it, most of the blade would be doing very little.",
        },
        {
          title: "Constant Speed Units",
          pages: [200, 201, 202, 203],
          intro:
            "What a constant speed unit does, and what changing power settings " +
            "means with one fitted.",
        },
        {
          title: "Windmilling, Feathering and Reverse Thrust",
          pages: [205, 206, 207],
          intro:
            "Three blade conditions, and the drag or thrust each produces.",
          takeaway:
            "A windmilling propeller on a failed engine produces very large drag " +
            "— on a twin it can be worse than the lost thrust. Feathering is what " +
            "removes it, which is why feathering is one of the first actions in " +
            "an engine failure on a twin.",
        },
        {
          title: "Twisting Moments and Asymmetric Blade Effect",
          pages: [208, 209, 210],
          intro:
            "Centrifugal and aerodynamic twisting moments, and why the propeller " +
            "produces a yaw at high angles of attack.",
        },
        {
          title: "Power Absorption and Solidity",
          pages: [211, 212],
          intro:
            "How a propeller is made to absorb more power.",
        },
      ],
    },

    {
      title: "Stability",
      syllabus: ["22.26"],
      intro:
        "What the aeroplane does when it is disturbed and the pilot does " +
        "nothing. Stability is measured about each of the three axes, and more " +
        "of it is not always better.",
      topics: [
        {
          title: "Static and Dynamic Stability",
          pages: [214, 215, 216],
          intro:
            "The initial tendency after a disturbance, what happens over time, " +
            "and the trade against controllability.",
          context:
            "Stability and controllability pull against each other. A very stable " +
            "aeroplane resists being disturbed and also resists being manoeuvred; " +
            "a very controllable one does what you ask and also what the gust " +
            "asks. Every design sits somewhere on that line on purpose.",
        },
        {
          title: "Longitudinal Stability",
          pages: [217, 218, 219],
          intro:
            "Stability in pitch, the wing pitching moment, and the factors that " +
            "affect it.",
          takeaway:
            "Centre of gravity position is the factor the pilot controls. Further " +
            "forward means more longitudinal stability and heavier pitch forces; " +
            "further aft means less, and beyond the aft limit the aeroplane may " +
            "not recover from a stall at all.",
        },
        {
          title: "Directional Stability",
          pages: [220, 221],
          intro:
            "Stability in yaw, and what provides it.",
        },
        {
          title: "Lateral Stability",
          pages: [222, 223, 224, 225, 226],
          intro:
            "Stability in roll, slip, and the design features that produce it — " +
            "dihedral, sweepback and a high wing with a low centre of gravity.",
        },
        {
          title: "Spiral Instability and Dutch Roll",
          pages: [227, 228, 229],
          intro:
            "The two ways lateral and directional stability interact when they " +
            "are out of balance with each other.",
          misconception:
            "Treating these as faults. They are the two ends of the same trade: " +
            "too much directional stability relative to lateral gives spiral " +
            "instability, too little gives Dutch roll. Designers choose which of " +
            "the two to live with, and light aircraft are generally allowed to be " +
            "mildly spirally unstable because it is the easier one for a pilot to " +
            "manage.",
        },
        {
          title: "Stability and Control on the Ground",
          pages: [230, 231, 232, 233],
          intro:
            "How the aeroplane behaves on its wheels, and the tricycle and " +
            "tailwheel arrangements compared.",
        },
      ],
    },

    {
      title: "Ground Handling and Crosswind Technique",
      syllabus: ["22.26"],
      intro:
        "The forces acting on the aeroplane at low speed on and near the " +
        "ground, and the techniques for handling them.",
      topics: [
        {
          title: "Handling in Strong Winds and the Swing on Take-off",
          pages: [235, 236],
          intro:
            "Control positions while taxiing, and why the aeroplane wants to " +
            "swing as power is applied.",
        },
        {
          title: "Torque, Slipstream and Gyroscopic Effect",
          pages: [237, 238, 239],
          intro:
            "The three propeller effects behind the swing, and the direction each " +
            "acts in.",
          context:
            "All three act in the same direction for a given propeller rotation, " +
            "which is why the swing is consistent and predictable — and why the " +
            "rudder input to counter it becomes automatic rather than something " +
            "you work out each time.",
        },
        {
          title: "Crosswind Take-off and Landing",
          pages: [240, 241, 242, 243],
          intro:
            "The techniques for each, including the kick-straight method.",
        },
        {
          title: "Ground Effect",
          pages: [245, 246],
          intro:
            "What happens within about a wingspan of the surface, and its effect " +
            "on take-off.",
          misconception:
            "Treating ground effect as free performance. It reduces induced drag " +
            "near the surface, so an aeroplane can become airborne in ground " +
            "effect at a speed at which it cannot climb out of it — which is " +
            "exactly the trap on a hot, high or overloaded take-off.",
        },
      ],
    },

    {
      title: "Asymmetric Flight",
      syllabus: ["22.28"],
      intro:
        "A twin with one engine failed. The aeroplane still flies; what has " +
        "changed is that all the thrust is now on one side, and controlling the " +
        "result costs performance.",
      topics: [
        {
          title: "The Asymmetric Condition",
          pages: [248, 249, 250],
          intro:
            "The yawing moment produced by asymmetric thrust, what affects it, " +
            "and the rolling moment that follows.",
        },
        {
          title: "The Critical Engine",
          pages: [251, 252],
          intro:
            "Why the failure of one engine is worse than the other, and how " +
            "direction of rotation decides which.",
          context:
            "Asymmetric blade effect moves each propeller's effective thrust line " +
            "outboard on one side. The engine whose failure leaves the longer " +
            "moment arm is the critical one — and on a conventional twin with " +
            "both propellers turning the same way, that makes one engine " +
            "genuinely worse to lose than the other.",
        },
        {
          title: "Immediate Actions and Constant Heading Flight",
          pages: [254, 255, 256, 257],
          intro:
            "What to do first, and the choice between holding heading with bank, " +
            "with rudder, or with a combination.",
        },
        {
          title: "VMCA",
          pages: [258],
          intro:
            "The minimum control speed in the air, and what it means.",
          takeaway:
            "Below VMCA the rudder can no longer hold the yaw, whatever the pilot " +
            "does. It is not a handling limit to be managed but a speed below " +
            "which control is lost — which is why an asymmetric go-around is " +
            "flown fast and why raising the nose is the wrong instinct.",
        },
      ],
    },

    {
      title: "Range and Endurance",
      syllabus: ["22.30"],
      intro:
        "Distance for the fuel carried, and time in the air for the fuel " +
        "carried. Two different targets flown at two different speeds.",
      topics: [
        {
          title: "Range and Specific Fuel Consumption",
          pages: [260, 261, 262],
          intro:
            "What range means, and the measure of how efficiently the engine " +
            "turns fuel into power.",
        },
        {
          title: "Flying for Range",
          pages: [263],
          intro:
            "The considerations when the object is distance.",
        },
        {
          title: "Endurance",
          pages: [264, 265],
          intro:
            "Staying airborne longest, and the factors affecting it.",
          takeaway:
            "Range is flown near the best lift/drag speed; endurance is flown " +
            "slower, at minimum power required. The aeroplane covering the least " +
            "ground per hour is the one that will stay up longest.",
        },
      ],
    },

    {
      title: "Performance and P-Charts",
      syllabus: ["22.32"],
      intro:
        "Turning everything in this subject into numbers you can use before " +
        "flight: what the aeroplane will actually do today, at this weight, at " +
        "this aerodrome, in this weather.",
      topics: [
        {
          title: "Performance Definitions",
          pages: [267, 268, 269],
          intro:
            "The defined terms used in performance work.",
        },
        {
          title: "Gradient of Climb, Landing Threshold and Drift Down",
          pages: [270, 271, 272],
          intro:
            "Three concepts that decide obstacle clearance and what happens after " +
            "an engine failure at altitude.",
        },
        {
          title: "Factors Affecting Take-off and Landing",
          pages: [273, 274],
          intro:
            "Everything that lengthens or shortens the distances required.",
          context:
            "Almost every factor on this list works through density or through " +
            "energy. High, hot and humid all reduce density, so the aeroplane " +
            "needs more true speed for the same indicated speed and the engine " +
            "makes less power. Weight, slope and surface work through the energy " +
            "that has to be gained or dissipated.",
        },
        {
          title: "Operational Requirements for Distance",
          pages: [275, 276],
          intro:
            "The proportion of runway that may be used and how the distances are " +
            "calculated.",
        },
        {
          title: "Pressure Altitude and Density Altitude",
          pages: [277, 278, 279, 280],
          intro:
            "How each is calculated, and why performance charts are entered with " +
            "them.",
        },
        {
          title: "Using P-Charts",
          pages: [281, 282, 283, 284],
          intro:
            "Working take-off and landing distances from the charts, including " +
            "the wind component graph.",
          takeaway:
            "A P-chart is entered in a fixed order and each step carries the " +
            "answer into the next. Working it out of order — or reading the wind " +
            "component from the wrong axis — produces a plausible number that is " +
            "wrong, which is worse than no number at all.",
        },
        {
          title: "Flight Manual Data and Engine-Inoperative Performance",
          pages: [285, 286, 287, 288],
          intro:
            "Where the data comes from, and the en-route performance requirement " +
            "with an engine inoperative.",
        },
      ],
    },
  ],
};
