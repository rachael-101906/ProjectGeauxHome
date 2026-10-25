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
  human: "Arg! Captain McMars at yer service. Finest gear on Mars. Don't ask where I got it.",
  robot: "Yo, yo, yo. DJ-C Money in the dome! Bring me materials and I'll rebuild that ship of yours.",
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
        reply: "The finest currency on Mars! Little gold T-Bits. Spend them with Captain McMars on drills, blasters and that sulfur filter you'll be needing.",
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
      "Aye, ahoy, me matie. Captain McMars reportin' for duty. Me and me crew of two deal in the finest gear on Mars, along with my trusty cyborg parrot, Mr. Squawkers.",
      "Drills, blasters, and a Sulfur Filter for the Olympus air. Bring me Tintinas and it's yours. Just don't ask where any of it came from, arg.",
    ],
    repeat: "Arg, look who it is, Mr. Squawkers. Back again, space cowboy? What'll it be?",
    topics: [
      {
        label: "WHY DO I NEED A FILTER?",
        reply: "Olympus Mons air is thick with sulfur, matie. Buy me Sulfur Filter before ye head up there. Once it's yours, the route's open for good.",
      },
      {
        label: "WHICH BLASTER SHOULD I GET?",
        reply: "T1 gets ye started, T2 hits harder, and the T3 melts Zenos like butter. Equip it with [2], then fire with SPACE or a click.",
      },
      {
        label: "WHERE DID YOU GET ALL THIS?",
        reply: "Ugh, don't ask me where I got that. Mr. Squawkers, cover his ears.",
      },
    ],
    prompt: "Anything else, matie? Mr. Squawkers is gettin' hungry.",
    farewell: "Fair winds, space cowboy. Arg!",
  },
  robot: {
    speaker: "DJ-CMONEY",
    intro: [
      "Yo, yo, yo! DJ-C Money in the dome! Only bot on Mars still spinnin' vinyl and rebuildin' spaceships.",
      "Bring me raw materials and I'll hook up your Comm Array, Life Support, Fusion Power, and Propulsion. In that order. Trust me. Mostly.",
    ],
    repeat: "My favorite customer is back! What we building today?",
    topics: [
      {
        label: "WHAT DOES EACH SYSTEM DO?",
        reply: "Comm Array lets Earth hear you. Life Support keeps you breathing. Fusion Power keeps the lights on. Propulsion gets you off this rock. All four and you can geaux home.",
      },
      {
        label: "WHY THAT ORDER?",
        reply: "Each system runs off the last one. Install them out of order and you get a very short, very loud flight.",
      },
      {
        label: "CAN I TRUST YOU?",
        reply: "Can you trust me? Ha! You have my word. And my word is... mostly good.",
      },
    ],
    prompt: "What else you need to know? Ask away, I got all day. Literally. Mars days are long.",
    farewell: "Stay fresh out there. Peace!",
  },
};

export { rover_dialogue, user_dialogue, rover_travel_line, TRADER_LINES, TRADER_DIALOGUE };