const rover_dialogue = [
  "Beep boop. Hello there, strange being. My name is R.O.V.E.R., and I am here to assist you. What is your name?",
  "Hugh Mann. A respectable name. Well, Hugh Mann, you are in a pickle. You have crash-landed on Mars. But don't fear! Our colonies on Earth have the resources to repair your vessel and send you home. Although... we do have a shortage with the Zenos running about.",
  "*nervous laugh* Apologies, Hugh Mann. Perhaps this will be more difficult than I thought. Let's not waste time, then!",
];

const user_dialogue = ["Hugh Mann.", "Goodbye."];

// R.O.V.E.R.'s line once the intro is done and he's acting as a taxi.
const rover_travel_line = "Beep boop. I can take you anywhere. Choose a destination.";

// Short one-liners (used by the trading post header + the legacy TradeScreen).
const TRADER_LINES = {
  martian: "Ooh, shiny rocks! Dr Oxy Genn pays top Tintinas. Mostly top. Sometimes.",
  human: "Captain McMars here. I handle ship systems, repairs, and getting you home in one piece.",
  robot: "Yo, yo, yo. DJ-TMoney in the dome! Need gear or that sulfur filter? I got you.",
};

// Full conversations for the traders at Vastitas Borealis.
// intro: lines played in order the first time you talk to them (CONTINUE between each).
// topics: optional questions Hugh can ask; each reply returns to the topic menu.
// repeat: what they say on later visits. prompt: shown after answering a topic.
// farewell: said when Hugh leaves.
const TRADER_DIALOGUE = {
  martian: {
    speaker: "DR OXY GENN",
    intro: [
      "Halt, Earthling!  Dr Oxy Genn, Grand Master of Vastitas and licensed rock appraiser. Mostly licensed, just don't ask where I get them from.",
      "You dig up ore, I give you Tintinas. Ice, iron, silica, sulfur, basalt... the rarer the rock, the shinier the coin. And Dr Oxy Genn loves coins.",
    ],
    repeat: "Back again, Earthling? Dr Oxy Genn smells ore in those pockets. Let's deal.",
    topics: [
      {
        label: "WHAT ARE TINTINAS?",
        reply: "The finest currency on Mars! Little gold T-Bits. Spend them with DJ-TMoney on drills, blasters and that sulfur filter you'll be needing.",
      },
      {
        label: "WHERE DO I FIND ORE?",
        reply: "Ice sits right here in Vastitas. Iron and silica hide in Alba Mons and Tempe Terra. Sulfur and basalt? Olympus Mons... but that's Zeno country. Bring a blaster. And a spare face.",
      },
      {
        label: "ARE YOU A REAL WIZARD?",
        reply: "Watch closely. *waves staff* ...There. I have made your doubt disappear. Dr Oxy Genn accepts tips.",
      },
    ],
    prompt: "Anything else, Earthling? Dr Oxy Genn's time is valuable. Dr Oxy Genn's time costs 2 Tintinas a minute.",
    farewell: "Bring Dr Oxy Genn more rocks! Big ones! Shiny ones!",
  },
  human: {
    speaker: "CAPTAIN McMARS",
    intro: [
      "Captain McMars reporting. I specialize in ship systems and upgrades.",
      "Bring the required raw materials, and we can restore the Comm Array, Life Support, Fusion Power, and Propulsion in sequence.",
    ],
    repeat: "Back again? Let us get those ship systems online.",
    topics: [
      {
        label: "WHAT DOES EACH SYSTEM DO?",
        reply: "The Comm Array lets Earth hear you. Life Support keeps you breathing. Fusion Power supplies energy. Propulsion gets you off Mars. Restore all four to go home.",
      },
      {
        label: "WHY THAT INSTALLATION ORDER?",
        reply: "Ship systems depend on one another. Restore them in order: Comm Array, Life Support, Fusion Power, then Propulsion.",
      },
    ],
    prompt: "Any other ship questions, pilot?",
    farewell: "Bring the materials and we will get you home.",
  },
  robot: {
    speaker: "DJ-TMONEY",
    intro: [
      "Yo, yo, yo! DJ-TMoney in the dome! Only bot on Mars still spinnin' vinyl and slingin' gear.",
      "Drills, blasters, and the Sulfur Filter. You bring the Tintinas, I bring the heat. Cash only, space cowboy.",
    ],
    repeat: "My favorite customer is back! What we copping today?",
    topics: [
      {
        label: "WHY DO I NEED A FILTER?",
        reply: "Olympus Mons air is full of sulfur. Buy my Sulfur Filter before heading up there. Once purchased, it permanently unlocks the route and protects you while mining.",
      },
      {
        label: "WHICH BLASTER SHOULD I GET?",
        reply: "T1 is a start, T2 hits harder, and T3 is the Zeno melter. Equip with [2], then fire with SPACE or click.",
      },
    ],
    prompt: "What else you need to know? Ask away, I got all day. Literally. Mars days are long.",
    farewell: "Stay fresh out there. Peace!",
  },
};

export { rover_dialogue, user_dialogue, rover_travel_line, TRADER_LINES, TRADER_DIALOGUE };