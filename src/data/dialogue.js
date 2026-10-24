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
  martian: "Ooh, shiny rocks! Marty pays top Tintinas. Mostly top. Sometimes.",
  human: "Yo, yo, yo. It's DJ-TMoney. Lookin' for some dope gear? I gots you covered.",
  robot: "Bring me raw materials and I will make your ship fly. Probably.",
};

// Full conversations for the traders at Vastitas Borealis.
// intro: lines played in order the first time you talk to them (CONTINUE between each).
// topics: optional questions Hugh can ask; each reply returns to the topic menu.
// repeat: what they say on later visits. prompt: shown after answering a topic.
// farewell: said when Hugh leaves.
const TRADER_DIALOGUE = {
  martian: {
    speaker: "MARTY McMARS",
    intro: [
      "Halt, Earthling! Marty McMars, Grand Wizard of Vastitas and licensed rock appraiser. Mostly licensed.",
      "You dig up ore, I give you Tintinas. Ice, iron, silica, sulfur, basalt... the rarer the rock, the shinier the coin.",
    ],
    repeat: "Back again, Earthling? Marty smells ore in those pockets. Let's deal.",
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
        reply: "Watch closely. *waves staff* ...There. I have made your doubt disappear. Marty accepts tips.",
      },
    ],
    prompt: "Anything else, Earthling? Marty's time is valuable. Marty's time costs 2 Tintinas a minute.",
    farewell: "Bring Marty more rocks! Big ones! Shiny ones!",
  },
  human: {
    speaker: "DJ-TMONEY",
    intro: [
      "Yo, yo, yo! DJ-TMoney in the dome! Only human on Mars still spinnin' vinyl and slingin' gear.",
      "Drills, blasters, filters. You bring the Tintinas, I bring the heat. Cash only, space cowboy.",
    ],
    repeat: "My favorite customer is back! What we copping today?",
    topics: [
      {
        label: "WHY DO I NEED A FILTER?",
        reply: "Olympus Mons air is straight sulfur, my guy. One whiff and you're down for the count. Grab my Filter and you can breathe easy up there.",
      },
      {
        label: "WHICH BLASTER SHOULD I GET?",
        reply: "T1 gets you started, T2 hits harder, T3 melts Zenos like butter on a hot rock. Equip it with [2], fire with SPACE or click. Simple.",
      },
      {
        label: "WHY BETTER DRILLS?",
        reply: "Higher-tier drills chew through rock faster. Basalt laughs at a T1. A T4? Basalt stops laughing.",
      },
    ],
    prompt: "What else you need to know? Ask away, I got all day. Literally. Mars days are long.",
    farewell: "Stay fresh out there. Peace!",
  },
  robot: {
    speaker: "DR. OXY GENN",
    intro: [
      "Greetings, organic. I am Dr. Oxy Genn, ship systems specialist. Your vessel is... how do you say... toast.",
      "Bring me raw ore and I will rebuild it in order: Comm Array, Life Support, Fusion Power, then the Propulsion Engine. Then you go home.",
    ],
    repeat: "Welcome back, organic. Your ship remains toast. Shall we make it less toast?",
    topics: [
      {
        label: "WHAT DOES EACH SYSTEM DO?",
        reply: "Comm Array lets Earth hear you. Life Support keeps you breathing. Fusion Power gives the ship energy. Propulsion gets you off this rock. All four, and you can geaux home.",
      },
      {
        label: "WHY THAT ORDER?",
        reply: "Each system draws power from the last. Install Propulsion before Fusion and you will achieve a very short, very loud flight.",
      },
    ],
    prompt: "Further queries, organic?",
    farewell: "Return with materials. I will be here. I am always here.",
  },
};

export { rover_dialogue, user_dialogue, rover_travel_line, TRADER_LINES, TRADER_DIALOGUE };
