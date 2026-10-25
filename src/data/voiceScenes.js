// Voiced scenes: the recorded ElevenLabs conversations in src/components/audio/,
// with a timed caption for every line so the dialogue box stays in sync with the audio.
//
// Timings (seconds into the file) and speakers came from transcribing each recording.
// If you re-record a file, update its `start`/`end` numbers (or ask for a re-transcribe).
//   who: "hugh" | "rover" | "oxy" (Dr. Oxy Genn) | "mcmars" (Captain McMars) | "djc" (DJ-C Money)
//
// Where each scene is triggered: search for playScene( in screens/Base.jsx.

const audioFiles = import.meta.glob("../components/audio/*.{mp3,wav,m4a,ogg}", {
  eager: true,
  query: "?url",
  import: "default",
});
const audioByName = Object.fromEntries(
  Object.entries(audioFiles).map(([path, url]) => [path.split("/").pop(), url]),
);

const SCENES = {
  roverMeet: {
    file: "Hugh meeting R.O.V.E.R (1).mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 2.3, text: "Whoa! Where the hell am I?" },
      { who: "rover", start: 2.58, end: 8.74, text: "Hello there, strange being. My name is R.O.V.E.R., and I am here to assist you. What is your name?" },
      { who: "hugh", start: 9.32, end: 14.56, text: "Uh, okay. Talking R.O.V.E.R. That's new. My name is Hugh Mann." },
      { who: "rover", start: 15.04, end: 19.12, text: "Hugh Mann. A respectable name. With a respectable hat." },
      { who: "hugh", start: 19.68, end: 20.54, text: "Heh. Thanks." },
      { who: "rover", start: 21.06, end: 26.84, text: "Well, Hugh Mann, you are in a pickle. You have crash-landed on Mars. But don't fear!" },
      { who: "rover", start: 26.84, end: 36.18, text: "Our colonies on Earth have the resources to repair your vessel and send you home. Although, we do have a shortage with the Zenos running about." },
      { who: "hugh", start: 36.78, end: 43.2, text: "Zenos? Actually, never mind. I'm sure I'll find out later. This is going to take a while, isn't it?" },
      { who: "rover", start: 43.52, end: 51.32, text: "Heh heh. Apologies, Hugh Mann. Perhaps this will be more difficult than I thought. Let's not waste time, then. Hop on, let's go!" },
    ],
  },
  merchants: {
    file: "R.O.V.E.R explaining to hugh the Merchants (1).mp3",
    lines: [
      { who: "rover", start: 0.0, end: 7.24, text: "This, Hugh Mann, is the beautiful icy land of Vastitas. It is home to the three best merchants on Mars." },
      { who: "rover", start: 7.96, end: 13.6, text: "Captain McMars, who will sell you all the gear you need. Just don't ask him where he acquired it." },
      { who: "rover", start: 14.1, end: 23.52, text: "Dr. Oxy Genn will buy ores from you in exchange for Tintinas, the currency here on Mars. DJ-C Money will get you set up with trade upgrades." },
      { who: "rover", start: 23.96, end: 27.94, text: "Be mindful with that one. He isn't known for being the most... reliable." },
    ],
  },
  firstWeapon: {
    file: "Hugh Getting first weapon.mp3",
    lines: [
      { who: "mcmars", start: 0.0, end: 2.78, text: "Why hello there! You look far from home." },
      { who: "hugh", start: 3.38, end: 5.22, text: "Yeah, you could say that." },
      { who: "mcmars", start: 5.74, end: 10.8, text: "Here, hang tight. I think I have something that'll remind you a little more of home." },
      { who: "hugh", start: 11.4, end: 11.92, text: "Whoa!" },
      { who: "mcmars", start: 12.4, end: 15.38, text: "Ugh, don't ask me where I got that." },
      { who: "hugh", start: 15.88, end: 18.56, text: "Uh, yeah, got it. Thanks, Captain." },
    ],
  },
  buy_t1b: {
    file: "Hugh X CPT T1B.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 4.32, text: "Hey Captain, I have 400 Tintinas. What can you do for me?" },
      { who: "mcmars", start: 4.86, end: 10.34, text: "You're in luck! That right there will get you a brand new and improved T1 Blaster!" },
    ],
  },
  buy_t2d: {
    file: "Hugh X CPT T2D.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 4.52, text: "Hey Captain, I have 100 Tintinas. What can you do for me?" },
      { who: "mcmars", start: 5.02, end: 10.56, text: "You're in luck. That right there will get you a brand new and improved T2 Drill." },
    ],
  },
  buy_t3d: {
    file: "Hugh x Capt T3D.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 4.24, text: "Hey Captain, I have 600 Tintinas. What can you do for me?" },
      { who: "mcmars", start: 4.72, end: 10.22, text: "You're in luck! That right there will get you a brand new and improved T3 Drill!" },
    ],
  },
  buy_t4d: {
    file: "Hugh X CPT T4D.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 5.22, text: "Hey Captain, I have 1,200 Tintinas. What can you do for me?" },
      { who: "mcmars", start: 5.6, end: 11.0, text: "You're in luck! That right there will get you a brand new and improved T4 Drill!" },
    ],
  },
  buy_t3b: {
    file: "Hugh X CPT T3B.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 5.26, text: "Hey Captain, I have 1,600 Tintinas. What can you do for me?" },
      { who: "mcmars", start: 5.66, end: 11.2, text: "You're in luck! That right there will get you a brand new and improved T3 Blaster!" },
    ],
  },
  sell_ice: {
    file: "Hugh x Doc selling Ice.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 2.3, text: "Hey Doc, I have some ice for you." },
      { who: "oxy", start: 2.7, end: 6.46, text: "Perfect. Here is 5 Tintinas each. Scurry along now." },
    ],
  },
  sell_iron: {
    file: "Hugh x Doc Iron.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 2.4, text: "Hey Doc, I have some iron for you." },
      { who: "oxy", start: 2.86, end: 6.76, text: "Perfect! Here is 15 Tintinas each! Scurry along now!" },
    ],
  },
  sell_silica: {
    file: "Hugh x Doc Silica.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 2.68, text: "Hey Doc, I have some silica for ya." },
      { who: "oxy", start: 3.0, end: 7.08, text: "Perfect. Here is 25 Tintinas each. Scurry along now." },
    ],
  },
  sell_sulfur: {
    file: "Hugh x Doc Sulfer.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 2.56, text: "Hey Doc, I have some sulfur for ya." },
      { who: "oxy", start: 2.92, end: 7.0, text: "Perfect. Here is 35 Tintinas each. Scurry along now." },
    ],
  },
  sell_basalt: {
    file: "Hugh x  Doc Basalt.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 2.52, text: "Hey Doc, I have some basalt for you." },
      { who: "oxy", start: 2.92, end: 6.74, text: "Perfect. Here is 60 Tintinas each. Scurry along now." },
    ],
  },
  install_comm: {
    file: "Hugh x DJ C Common array sytem.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 4.6, text: "Hey, DJ-C, I got 10 ice and 5 iron. What can that get me?" },
      { who: "djc", start: 5.1, end: 7.02, text: "That'll get you a Comm Array system." },
    ],
  },
  install_life: {
    file: "Hugh x DJ C Life Support system.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 4.9, text: "Hey, DJ-C, I got 10 iron and 3 silica. What can that get me?" },
      { who: "djc", start: 5.38, end: 7.22, text: "That'll get you a Life Support System." },
    ],
  },
  install_fusion: {
    file: "Hugh x DJ C Fusion Power System.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 5.26, text: "Hey, DJ-C. I got 8 silica and 5 sulfur. What can that get me?" },
      { who: "djc", start: 5.78, end: 7.9, text: "That'll get you a Fusion Power System." },
    ],
  },
  finalTrade: {
    file: "Final Trade Convo with DJ C.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 7.06, text: "Hey, DJ-C, here's my last booty and brass for you. 15 sulfur and 10 basalt, as promised." },
      { who: "djc", start: 7.78, end: 12.02, text: "Ah, impressive job. I didn't think you would make it this far." },
      { who: "hugh", start: 12.56, end: 14.08, text: "Glass half full kind of guy." },
      { who: "djc", start: 14.62, end: 16.52, text: "Off to fight the alpha?" },
      { who: "hugh", start: 17.08, end: 17.44, text: "Yep." },
      { who: "djc", start: 18.06, end: 23.4, text: "All right. When you get the last materials from the alpha, I will be waiting back here for you with the engine." },
      { who: "djc", start: 23.88, end: 28.32, text: "Hand me your booty and brass, as you call it, and the engine is all yours." },
      { who: "hugh", start: 28.96, end: 30.56, text: "Huh, do I have your word?" },
      { who: "djc", start: 31.12, end: 32.16, text: "You have my word." },
    ],
  },
  djReunion: {
    file: "Hugh meeting back um with DJ C final scenes.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 9.78, text: "Go go go! That crane better still be there when I get back. All a man has is his word. Unfortunately for me, I've made a deal with a machine." },
      { who: "hugh", start: 10.6, end: 18.38, text: "Oh wow, I really didn't think you would be there. Hey DJ-C, you really are a lifesaver. You know that. Thank you." },
      { who: "djc", start: 19.06, end: 20.86, text: "What? Didn't think I would pull through?" },
      { who: "hugh", start: 21.5, end: 24.64, text: "Uh, you could say I had my doubts." },
    ],
  },
  bigAlpha: {
    file: "Hugh seeing the big alpha.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 1.94, text: "Now that's a big alpha!" },
    ],
  },
  endingTakeRover: {
    file: "Option A Hugh takes ROVER with.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 4.02, text: "Come on, R.O.V.E.R. Let's get out of Dodge. You're gonna love Earth." },
      { who: "hugh", start: 4.74, end: 8.92, text: "Once we get home, we'll see about getting you a hat made that's as crisp as mine." },
    ],
  },
  endingLeaveRover: {
    file: "Option B hugh Leaves ROVER.mp3",
    lines: [
      { who: "hugh", start: 0.0, end: 2.62, text: "Good lord. That was a close one." },
      { who: "rover", start: 4.16, end: 7.16, text: "Well, human. Seems you got all that you needed." },
      { who: "hugh", start: 7.82, end: 13.1, text: "Yeah, thank you. I gotta go now. There is no time. You were a great help. Bye!" },
      { who: "rover", start: 13.58, end: 15.76, text: "Wait! Human! Let me come with you!" },
      { who: "hugh", start: 16.06, end: 22.0, text: "I can't stop. There is no time. You will be alright. You have made it this long on Mars. You belong here!" },
    ],
  },
  endingRoverFinal: {
    file: "Option B ROVER final line.mp3",
    lines: [
      { who: "rover", start: 0.0, end: 4.3, text: "I tried to tell you. It's a shame. We could have been friends." },
    ],
  },
};

// Resolve file names to bundled URLs; warn (dev only) if a file was renamed or removed.
for (const [id, scene] of Object.entries(SCENES)) {
  scene.id = id;
  scene.url = audioByName[scene.file] ?? null;
  scene.duration = scene.lines[scene.lines.length - 1].end;
  if (!scene.url && import.meta.env.DEV) {
    console.warn(`[voiceScenes] "${scene.file}" not found in src/components/audio/ (scene "${id}" will play silently).`);
  }
}

export default SCENES;
