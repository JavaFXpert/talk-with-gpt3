/*
 * Copyright 2022 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//TODO: Put ages in the voiceOptions hashmap
//TODO: Externalize the AI avatar configuration
//TODO: Add metadata to Takeshi, etc.
//TODO: Recover from Ex-Human errors
//TODO: Add new AI character voice to Japanese, making it first choice

const AWS = require('aws-sdk')

import Head from 'next/head'
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import {useState, useEffect} from "react"; // I unified.
import styles from '../styles/Home.module.css'
import {fulfillIntent} from './api/intent_matching.js';
import {getTemporalStr} from "./api/temporal.js";
import {getVoiceOptions} from "./api/voice_options.js";

import {
  GRADUATED, DIDNT_ATTEND,
  DEFAULT_AGE,
  AVATAR_HEIGHT
} from '../public/constants';

///////////////////////// USER CONFIGURATION //////////////////////////
// Supply your AWS credentials, either in environment variables or in the code below:
// Suggest standardizing on environment variables so the user doesn't have to look through the code or change the code.
// You could provide a small command line that prompts the user and generates the .env 
AWS.config.credentials = new AWS.Credentials(
    "ACCESS_KEY_ID",
    "SECRET_ACCESS_KEY",
);

// (optional) Supply your Ex-Human token, either in environment variables or in the code below:
const EX_HUMAN_TOKEN = "EX_HUMAN_TOKEN";
///////////////////////// END OF USER CONFIGURATION //////////////////////////

// Suggest moving to constants.js
const exHumanEndpoint = "https://api.exh.ai/animations/v1/generate_lipsync";

// Suggest moving to constants.js
AWS.config.region = 'us-east-1';
const translate = new AWS.Translate({region: AWS.config.region});
const Polly = new AWS.Polly({region: AWS.config.region});

// Why not use React state for these?
let conversationText = "";
let textToSpeak = "";
let translatedTextToSpeak = "";
let waitingIndicator = ""; // Unused. Suggest using ESLint to find unused variables and enforce.
let useCustomPrompt = false;
let age = DEFAULT_AGE;

// Also change the .main input[type="text"] and .main textarea widths to 2x and 2x-1 respectively.
const voiceOptions = getVoiceOptions();

export default function Home() {
  const [useVideoAvatar, setUseVideoAvatar] = useState(false);
  const [useVideoBackground, setUseVideoBackground] = useState(false);
  const [idleVideoLoop, setIdleVideoLoop] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [audioUrl, setAudioUrl] = useState("https://filesamples.com/samples/audio/mp3/sample1.mp3"); // Suggest declaring in constants.js
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState();
  const [lang, setLang] = useState("en_US");
  const [voiceId, setVoiceId] = useState("Matthew"); // Suggest declaring in constants.js. Also, why do other voiceId's below have a language suffix, but this one doesn't? Can it be consistent?
  const [processingTranscript, setProcessingTranscript] = useState(false);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [chatBotActive, setChatBotActive] = useState(true);
  const [waitingOnBot, setWaitingOnBot] = useState(false);

  const translateVoiceId = "Joanna"; // Suggest declaring in constants.js, then it can be referenced below without a declaration here.

  let initialPrompt = generateInitialPrompt(lang);

  function handleListenClick() {
    if (useVideoAvatar) {
      if (chatBotActive) {
        setIdleVideoLoop(true);
        let voiceName = stripLangSuffix(voiceId)
        setVideoUrl(`videos/${voiceName}.mov`);
      }
      else {
        setIdleVideoLoop(false);
      }
    }

    setMicrophoneActive(true);
    {resetTranscript()};
    SpeechRecognition.startListening({continuous: true, language: lang});
    setProcessingTranscript(false);
  }

  function handleStopListenClick() {
    setMicrophoneActive(false);
    SpeechRecognition.stopListening();
  }

  function toggleListenClick() {
    if (microphoneActive) {
      handleStopListenClick();
      //NOTE: Don't try to speak that "The microphone is off"
    }
    else {
      sayMicrophoneOn()
      handleListenClick();
    }
  }

  function toggleChatbotActive() {
    if (chatBotActive) {
      setChatBotActive(false);
      sayGoingToSleep();
      if (useVideoAvatar) {
        setIdleVideoLoop(false);
      }
    }
    else {
      resetTranscript();
      setChatBotActive(true);
      sayWakingUp();
      if (useVideoAvatar) {
        setIdleVideoLoop(true);
      }
    }
  }

  // Suggest removing "Arg" suffix since its needless
  function handleLanguageChange(event) {
    // I changed this to show how to use a point free style on the call, if desired.
    const {value: langArg} = event.target;
    setLang(langArg);
    setChatBotActive(true);

    //TODO: Handle in a non-hardcoded way
    //TODO: Factor out common code in this and handleVoiceIdChange()
    let voiceName = stripLangSuffix(voiceId);
    let tempVoiceId = "Unknown";
    if (langArg == "en_US") {
      if (voiceName == "Yukiko" || voiceName == "Masahiro" || voiceName == "Kensensei" ||
          voiceName == "Mary") {
        // It looks like all voice aren't created equal. That feels like a consistency issue. Regardless, this looks like metadata that should be declared on each voice in voice_options.js
        setUseVideoAvatar(true);
        setIdleVideoLoop(true);
        setVideoUrl(`videos/${voiceName}.mov`);

        if (voiceName == "Kensensei" || voiceName == "Mary") {
          setUseVideoBackground(false);
        }
        else {
          setUseVideoBackground(true);
        }

        if (voiceName == "Yukiko") {
          // The calls to setVoiceId below appear to be redundant since setVoiceId is ultimately set again in handleVoiceChange.
          // Also, could the voiceId be derived from the voice name by convention? It looks like ${voiceName}-${lang} could be the convention.
          setVoiceId("Hiroto-EN");
          tempVoiceId = "Hiroto-EN";
        }
        else if (voiceName == "Kensensei") {
          setVoiceId("Kentaro-EN");
          tempVoiceId = "Kentaro-EN";
        }
        else if (voiceName == "Mary") {
          setVoiceId("Mary-EN");
          tempVoiceId = "Mary-EN";
        }
        else {
          setVoiceId(voiceName + "-EN");
          tempVoiceId = voiceName + "-EN";
        }
      }
      else {
        setUseVideoAvatar(false);
        setIdleVideoLoop(false);
        setVideoUrl("");

        setVoiceId("Matthew");
        tempVoiceId = "Matthew";
      }
    }
    else if (langArg == "es_ES") {
      setUseVideoAvatar(false);
      setIdleVideoLoop(false);
      setVideoUrl("");

      setVoiceId("Conchita")
      tempVoiceId = "Conchita";
    }
    else if (langArg == "fr_FR") {
      setUseVideoAvatar(false);
      setIdleVideoLoop(false);
      setVideoUrl("");

      setVoiceId("Celine")
      tempVoiceId = "Celine";
    }
    else if (langArg == "ja_JP") {
      if (voiceName == "Yukiko" || voiceName == "Masahiro" || voiceName == "Kensensei" ||
          voiceName == "Mary" || voiceName == "Takeshi") {
        setUseVideoAvatar(true);
        setIdleVideoLoop(true);
        setVideoUrl(`videos/${voiceName}.mov`);

        if (voiceName == "Kensensei" || voiceName == "Mary" || voiceName == "Takeshi") {
          setUseVideoBackground(false);
        }
        else {
          setUseVideoBackground(true);
        }

        if (voiceName == "Yukiko") {
          setVoiceId("Hiroto-JP");
          tempVoiceId = "Hiroto-JP";
        }
        else if (voiceName == "Kensensei") {
          setVoiceId("Kentaro-JP");
          tempVoiceId = "Kentaro-JP";
        }
        else if (voiceName == "Mary") {
          setVoiceId("Mary-JP");
          tempVoiceId = "Mary-JP";
        }
        else if (voiceName == "Takeshi") {
          setVoiceId("Takeshi-JP");
          tempVoiceId = "Takeshi-JP";
        }
        else {
          setVoiceId(voiceName + "-JP");
          tempVoiceId = voiceName + "-JP";
        }
      }
      else {
        setUseVideoAvatar(false);
        setIdleVideoLoop(false);
        setVideoUrl("");

        setVoiceId("Mizuki");
        tempVoiceId = "Mizuki";
      }
    }
    initialPrompt = generateInitialPrompt(langArg);
    handleVoiceChange(tempVoiceId);
    conversationText = "";
    translatedTextToSpeak = "";
  }

  function handleVoiceChange(voiceIdArg) {
    setVoiceId(voiceIdArg);
    //TODO: Handle in a non-hardcoded way
    //TODO: Factor out common code in this and handleLanguageChange()
    let voiceName = stripLangSuffix(voiceIdArg);
    if (voiceName == "Yukiko" || voiceName == "Masahiro" || voiceName == "Kensensei" ||
        voiceName == "Mary" || voiceName == "Takeshi") {
      setUseVideoAvatar(true);
      setIdleVideoLoop(true);
      setVideoUrl(`videos/${voiceName}.mov`);

      if (voiceName == "Kensensei" || voiceName == "Mary" || voiceName == "Takeshi") {
        setUseVideoBackground(false);
      }
      else {
        setUseVideoBackground(true);
      }
    }
    else {
      setUseVideoAvatar(false);
      setIdleVideoLoop(false);
      setVideoUrl("");
    }

    setChatBotActive(true);

    initialPrompt = generateInitialPrompt(lang);
    conversationText = "";
    translatedTextToSpeak = "";
  }

  function handleAgeChange(ageArg) {
    age = ageArg;
    setChatBotActive(true);
    initialPrompt = "";
    conversationText = "";
    translatedTextToSpeak = "";
  }

  function addConversationText(text) {
    conversationText += text + "\n";
    translatedTextToSpeak = "";
  }


  // Suggest creating a map data structure to eliminate this function and the others like it below.
  // Declaring the map outside the function so it's not recreated on every render.
  // Then you can add new languages without changing the code, and you don't need repeated if/else statements for each language.
  // Example:
  const languageMap = {
    "en_US": {
      goingToSleep: "Going to sleep!",
      wakingUp: "Waking up!"
    },
    "es_ES": {
      goingToSleep: "¡Dormiré!",
      wakingUp: "¡Despertando!"
    }
    // ...
  }

  function sayGoingToSleep() {
    if (lang == "en_US") {
      say("Going to sleep!");
    }
    else if (lang == "es_ES") {
      say("¡Dormiré!");
    }
    else if (lang == "fr_FR") {
      say("Je m'endors!");
    }
    else if (lang == "ja_JP") {
      say("寝ます!");
    }
  }

  function sayWakingUp() {
    if (lang == "en_US") {
      say("Waking up!");
    }
    else if (lang == "es_ES") {
      say("¡Despertando!");
    }
    else if (lang == "fr_FR") {
      say("Je réveille!");
    }
    else if (lang == "ja_JP") {
      say("起きています!");
    }
  }

  function sayMicrophoneOff() {
    if (lang == "en_US") {
      say("The microphone is off.");
    }
    else if (lang == "es_ES") {
      say("El micrófono está apagado.");
    }
    else if (lang == "fr_FR") {
      say("Le microphone est éteint.");
    }
    else if (lang == "ja_JP") {
      say("マイクがオフです。");
    }
  }

  function sayMicrophoneOn() {
    if (lang == "en_US") {
      say("The microphone is on.");
    }
    else if (lang == "es_ES") {
      say("El micrófono está encendido.");
    }
    else if (lang == "fr_FR") {
      say("Le microphone est allumé.");
    }
    else if (lang == "ja_JP") {
      say("マイクがオンです。");
    }
  }


  // Speech code
  const commands = [
    {
      command: ['wake up', 'please wake up', 'despierta', 'réveillez-vous', '起きて', '起きてくださ'],
      callback: ({command}) => {
        if (chatBotActive) {
          resetTranscript();
          if (lang == "en_US") {
            say("I was already awake!");
          }
          else if (lang == "es_ES") {
            say("Ya estaba dormido!");
          }
          else if (lang == "fr_FR") {
            say("Je suis déjà éveillé!");
          }
          else if (lang == "ja_JP") {
            say("すでに起きています!");
          }
        }
        else {
          resetTranscript();
          setChatBotActive(true);
          sayWakingUp();
        }
      } //activate chat bot
    },
    {
      command: ['go to sleep', 'please go to sleep', 've a dormir', 'va te coucher', '寝て', '寝てください'],
      callback: ({command}) => {
        if (chatBotActive) {
          resetTranscript();
          setChatBotActive(false);
          sayGoingToSleep();
        }
      }
    },
    {
      command: ['translate', 'traduce', 'traduire', '翻訳して'],
      callback: ({command}) => {
        if (chatBotActive) {
          if (textToSpeak.length > 0) {
            resetTranscript();
            doTranslateSpeak(textToSpeak);
          }
        }
      }
    },
    {
      command: ['repeat', 'repetir', 'répéter', 'もう一度'],
      callback: ({command}) => {
        if (chatBotActive) {
          if (textToSpeak.length > 0) {
            resetTranscript();
            const input = {
              Text: textToSpeak,
              OutputFormat: "mp3",
              VoiceId: voiceId,
              LanguageCode: lang.replaceAll("_", "-")
            }
            doSpeak(input);
          }
        }
      }
    },
    {
      command: ['erase (the) conversation', 'borrar la conversación', 'effacer la conversation', '会話を消去して'],
      callback: ({command}) => {
        if (chatBotActive) {
          resetTranscript();
          conversationText = "";
          translatedTextToSpeak = "";
          if (lang == "en_US") {
            say("The conversation has been erased.");
          }
          else if (lang == "es_ES") {
            say("La conversación ha sido borrada.");
          }
          else if (lang == "fr_FR") {
            say("La conversation a été effacée.");
          }
          else if (lang == "ja_JP") {
            say("会話は消去されました。");
          }
        }
      }
    },
    {
      command: ["(let's) switch to :language"],
      callback: (language) => {
        if (language.toLowerCase() == "spanish") {
          resetTranscript();
          handleLanguageChange("es_ES");
          say("Switching to Spanish!");
        }
        else if (language.toLowerCase() == "french") {
          resetTranscript();
          handleLanguageChange("fr_FR");
          say("Switching to French!");
        }
        else if (language.toLowerCase() == "japanese") {
          resetTranscript();
          handleLanguageChange("ja_JP");
          say("Switching to Japanese!");
        }
      }
    },
    {
      command: ['英語に切り替えましょう'],
      callback: ({command}) => {
        resetTranscript();
        say("はい。英語に切り替えましょう。");
        handleLanguageChange("en_US");
      }
    },
    {
      command: ['cambiemos a inglés', 'cambiar a inglés'],
      callback: ({command}) => {
        resetTranscript();
        say("Sí. Cambiemos a ingles.");
        handleLanguageChange("en_US");
      }
    },
    {
      command: ["Passons à l'anglais", "Passer à l'anglais"],
      callback: ({command}) => {
        resetTranscript();
        say("Oui. Passons à l'anglais.");
        handleLanguageChange("en_US");
      }
    }
  ]

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({commands})
  useEffect(() => {
    if (finalTranscript !== '' && chatBotActive) {
      if (!processingTranscript) {
        setProcessingTranscript(true);
        processVoiceInput().then(r => {
        });
      }
    }
  }, [interimTranscript, finalTranscript]);

  if (!browserSupportsSpeechRecognition) {
    // This feels "buried". Traditionally all returned JSX resides at the bottom of the component. I suggest placing this immediately above the returned JSX. Also suggest returning JSX instead of a string.
    return "<span>Browser doesn't support speech recognition.</span>";
  }
  else {
    if (microphoneActive) {
      // Do you really want to fire this on each render? I suspect not. Consider moving this to a useEffect hook with an empty dependency array so it fires once immediately after the initial render.
      SpeechRecognition.startListening({continuous: true, language: lang});
    }
  }


  // Remove language suffix from voice identifier if present. Takes the form of "-XX".
  // This infers it might be helpful to store the voiceId and lang in separate pieces of state. Then they won't need split. They can easily be composed as needed, right?
  function stripLangSuffix(voiceArg, stripOnly) {
    let voiceName = voiceArg;
    if (voiceArg.indexOf("-") > 0) {
      voiceName = voiceArg.substring(0, voiceArg.indexOf("-"));
      if (voiceName == "Hiroto" && !stripOnly) {
        // This feels like a hack. Perhaps I'm misunderstanding.
        // Rename "Hiroto" to "Yukiko"
        voiceName = "Yukiko";
      }
      else if (voiceName == "Kentaro" && !stripOnly) {
        // Rename "Kentaro" to "Kensensei"
        voiceName = "Kensensei";
      }
    }
    // else {
    //   if (voiceName == "Mizuki" && !stripOnly) {
    //     // Rename "Mizuki" to "Mary"
    //     voiceName = "Mary";
    //   }
    //   else if (voiceName == "Takumi" && !stripOnly) {
    //     // Rename "Takumi" to "Takeshi"
    //     voiceName = "Takeshi";
    //   }
    // }
    return voiceName;
  } //stripLangSuffix


  // Suggest storing the gender in each voice_option so this function isn't necessary.
  // That said, returning early simplifies by eliminating the need for temp vars, so I'm showing the pattern below.
  // And using a switch with a throw assures that all cases are handled.
  function genderStr(lang) {
    let males = ['Enrique', 'Joey', 'Justin', 'Kevin', 'Masahiro-EN', 'Masahiro-JP',
      'Kentaro-EN', 'Kentaro-JP', 'Mathieu', 'Matthew', 'Takeshi-JP', 'Takumi'];
      switch(lang) {
        case "ja_JP":
          return males.includes(voiceId) ? '男性' : '女性';
        case "es_ES":
          return males.includes(voiceId) ? 'un español' : 'una mujer';
        case "fr_FR":
          return males.includes(voiceId) ? 'un homme' : 'une femme';
        case "en_US":
          return males.includes(voiceId) ? 'male' : 'female';
        default:
          throw new Error(`Unexpected language: ${lang}`);
      }
    }


  /*
   * Retrieves the custom prompt for the current voice if one exists.
   */
  function getCustomPrompt() {
    let customPrompt = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        customPrompt = voice.prompt;
      }
    });
    return customPrompt;
  }


  /*
   * Retrieves the age of the current voice, if one is specified.
   */
  function getVoiceAge() {
    // I suggest declaring values for all voices within voiceOptions (ideally enforced via TypeScript).
    // Doing so will simplify all the code in this file because you can bank on having data for every property.
    // You could still reference defaults within voiceOptions.
    // That said, if you want to get a specific value from voiceOptions, you can use the find method, and fallback to a default using the nullish coalescing operator.
    return voiceOptions.find((voice) => voice.value == voiceId) ?? DEFAULT_AGE;
  }


  /*
   * Retrieves the location where the current voice lives, if one is specified.
   */
  function getLivesIn() {
    let retLivesIn = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retLivesIn = voice.livesIn;
      }
    });
    return retLivesIn;
  }

  /*
   * Retrieves the nationality of the current voice, if one is specified.
   */
  function getNationality() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.nationality;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the phone number of the current voice, if one is specified.
   */
  function getPhoneNum() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.phoneNum;
      }
    });
    return retVal;
  }


  /*
   * Retrieves the occupation of the current voice, if one is specified.
   */
  function getOccupation() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.occupation;
      }
    });
    return retVal;
  }


  /*
   * Retrieves the university of the current voice, if one is specified.
   */
  function getUniversity() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.university;
      }
    });
    return retVal;
  }

  /*
    * Retrieves the university major of the current voice, if one is specified.
   */
  function getUniMajor() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.uniMajor;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the uniYear of the current voice, if one is specified.
   */
  function getUniYear() {
    let retVal = 0;
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.uniYear;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the hobbies of the current voice, if one is specified.
   */
  function getHobbies() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.hobbies;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite food of the current voice, if one is specified.
   */
  function getFavFood() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favFood;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite drink of the current voice, if one is specified.
   */
  function getFavDrink() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favDrink;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite coffee shop of the current voice, if one is specified.
   */
  function getFavCoffeeShop() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favCoffeeShop;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite restaurant of the current voice, if one is specified.
   */
  function getFavRestaurant() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favRestaurant;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite movie of the current voice, if one is specified.
   */
  function getFavMovie() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favMovie;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite TV show of the current voice, if one is specified.
   */
  function getFavTvShow() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favTvShow;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite sport of the current voice, if one is specified.
   */
  function getFavSport() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favSport;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the father of the current voice, if one is specified.
   */
  function getFamFather() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.famFather;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the mother of the current voice, if one is specified.
   */
  function getFamMother() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.famMother;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the sisters of the current voice, if specified.
   */
  function getFamSisters() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.famSisters;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the brothers of the current voice, if specified.
   */
  function getFamBrothers() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.famBrothers;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the wife of the current voice, if one is specified.
   */
  function getFamWife() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.famWife;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the husband of the current voice, if one is specified.
   */
  function getFamHusband() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.famHusband;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the children of the current voice, if specified.
   */
  function getFamChildren() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.famChildren;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the friends of the current voice, if specified.
   */
  function getFriends() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.friends;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite color of the current voice, if one is specified.
   */
  function getFavColor() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favColor;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite music genre of the current voice, if one is specified.
   */
  function getFavMusicGenre() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favMusicGenre;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the favorite band of the current voice, if one is specified.
   */
  function getFavBand() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.favBand;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the pet likes of the current voice, if specified.
   */
  function getPetLikes() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.petLikes;
      }
    });
    return retVal;
  }

  /*
   * Retrieves the pet dislikes of the current voice, if specified.
   */
  function getPetDislikes() {
    let retVal = "";
    voiceOptions.map((voice) => {
      if (voice.value == voiceId) {
        retVal = voice.petDislikes;
      }
    });
    return retVal;
  }

  // I think this function can be eliminated by:
  // 1. Store the current voice id in state
  // 2. Assure that all voices have a value for all properties within voiceOptions (reference defaults in that file as needed)
  function generateInitialPrompt(lang) {
    age = getVoiceAge().toString();

    let prompt = getCustomPrompt();

    if (prompt.length == 0) {
      useCustomPrompt = false ;
      let voiceName = stripLangSuffix(voiceId);
      let livesIn = getLivesIn();
      let nationality = getNationality();
      let phoneNum = getPhoneNum();
      let occupation = getOccupation();
      let university = getUniversity();
      let uniMajor = getUniMajor();
      let uniYear = getUniYear();
      let hobbies = getHobbies();
      let favFood = getFavFood();
      let favDrink = getFavDrink();
      let favCoffeeShop = getFavCoffeeShop();
      let favRestaurant = getFavRestaurant();
      let favMovie = getFavMovie();
      let favTvShow = getFavTvShow();
      let favSport = getFavSport();
      let famFather = getFamFather();
      let famMother = getFamMother();
      let famSisters = getFamSisters();
      let famBrothers = getFamBrothers();
      let famWife = getFamWife();
      let famHusband = getFamHusband();
      let famChildren = getFamChildren();
      let friends = getFriends();
      let favColor = getFavColor();
      let favMusicGenre = getFavMusicGenre();
      let favBand = getFavBand();
      let petLikes = getPetLikes();
      let petDislikes = getPetDislikes();

      if (lang == "en_US") {
        // Suggest moving all this to a map outside the component.
        // Then the if statements need not be repeated, and the content isn't regenerated on every render.
        // Plus the map can enforce that values are provided for all properties.
        prompt = "The following is a conversation with a " + age + " year old " + genderStr(lang) + " named " + voiceName + ". ";
        if (livesIn.length > 0) {
          prompt += voiceName + " lives in " + livesIn + ". ";
        }
        if (nationality.length > 0) {
          prompt += "The nationality of " + voiceName + " is " + nationality + ". ";
        }
        if (phoneNum.length > 0) {
          prompt += "The phone number of " + voiceName + " is " + phoneNum + ". ";
        }
        if (occupation.length > 0) {
          prompt += "The occupation of " + voiceName + " is " + occupation + ". ";
        }
        if (university.length > 0) {
          prompt += voiceName + " attended " + university + ". ";
        }
        if (uniMajor.length > 0) {
          prompt += voiceName + "'s major is " + uniMajor + ". ";
        }

        if (uniYear == DIDNT_ATTEND) {
          // Didn't attend university
          prompt += voiceName + " didn't attend university. ";
        }
        else if (uniYear == GRADUATED) {
          // Graduated from university
          prompt += voiceName + " graduated from university. ";
        }
        else if (uniYear > 0){
          // Is attending university
          prompt += voiceName + " is in year " + uniYear + " of university. ";
        }

        if (hobbies.length > 0) {
          prompt += voiceName + "'s hobby is " + hobbies + ". ";
        }
        if (favFood.length > 0) {
          prompt += voiceName + "'s favorite food is " + favFood + ". ";
        }
        if (favDrink.length > 0) {
          prompt += voiceName + "'s favorite drink is " + favDrink + ". ";
        }
        if (favCoffeeShop.length > 0) {
          prompt += voiceName + "'s favorite coffee shop is " + favCoffeeShop + ". ";
        }
        if (favRestaurant.length > 0) {
          prompt += voiceName + "'s favorite restaurant is " + favRestaurant + ". ";
        }
        if (favMovie.length > 0) {
          prompt += voiceName + "'s favorite movie is " + favMovie + ". ";
        }
        if (favTvShow.length > 0) {
          prompt += voiceName + "'s favorite TV show is " + favTvShow + ". ";
        }
        if (favSport.length > 0) {
          prompt += voiceName + "'s favorite sport is " + favSport + ". ";
        }
        if (famFather.length > 0) {
          prompt += voiceName + "'s father's name is " + famFather + ". ";
        }
        if (famMother.length > 0) {
          prompt += voiceName + "'s mother's name is " + famMother + ". ";
        }
        if (famSisters.length > 0) {
          prompt += voiceName + "'s sister's name is " + famSisters + ". ";
        }
        if (famBrothers.length > 0) {
          prompt += voiceName + "'s sister's name is " + famBrothers + ". ";
        }

        if (famWife.length > 0) {
          prompt += voiceName + "'s wife's name is " + famWife + ". ";
          prompt += voiceName + "'s spouse's name is " + famWife + ". ";
        }
        if (famHusband.length > 0) {
          prompt += voiceName + "'s husband's name is " + famHusband + ". ";
          prompt += voiceName + "'s spouse's name is " + famHusband + ". ";
        }
        if (famWife.length > 0 || famHusband.length > 0) {
          prompt += voiceName + " is married. ";
        }

        if (famChildren.length > 0) {
          prompt += voiceName + "'s childrens' names are " + famChildren + ". ";
        }
        if (friends.length > 0) {
          prompt += voiceName + "'s friends' names are " + friends + ". ";
        }
        if (favColor.length > 0) {
          prompt += voiceName + "'s favorite colors are " + favColor + ". ";
        }
        if (favMusicGenre.length > 0) {
          prompt += voiceName + "'s favorite music genre is " + favMusicGenre + ". ";
        }
        if (favBand.length > 0) {
          prompt += voiceName + "'s favorite band is " + favBand + ". ";
        }
        if (petLikes.length > 0) {
          prompt += voiceName + " likes " + petLikes + ". ";
        }
        if (petDislikes.length > 0) {
          prompt += voiceName + " dislikes " + petDislikes + ". ";
        }
      }
      else if (lang == "ja_JP") {
        prompt = "以下は" + voiceName + "という" + age + "歳の日本人" + genderStr(lang) + "との会話です。 会話は日本語です。 ";
        if (livesIn.length > 0) {
          prompt += voiceName + "は" + livesIn + "に住んでいます。 ";
        }
        if (nationality.length > 0) {
          prompt += voiceName + "は" + nationality + "です。 ";
        }
        if (phoneNum.length > 0) {
          prompt += voiceName + "電話番号は" + phoneNum + "です。 ";
        }
        if (occupation.length > 0) {
          prompt += voiceName + "の職業は" + occupation + "です。 ";
        }
        if (university.length > 0) {
          prompt += voiceName + "の大学は" + university + "です。 ";
        }
        if (uniMajor.length > 0) {
          prompt += voiceName + "の専攻は" + uniMajor + "です。 ";
        }

        if (uniYear == DIDNT_ATTEND) {
          // Didn't attend university
          prompt += voiceName + "は大学に通っていませんでした。 ";
        }
        else if (uniYear == GRADUATED) {
          // Graduated from university
          prompt += voiceName + "は大学を卒業しました。 ";
        }
        else if (uniYear > 0){
          // Is attending university
          prompt += voiceName + "は大学" + uniYear + "年生です。 ";
        }

        if (hobbies.length > 0) {
          prompt += voiceName + "の趣味は" + hobbies + "です。 ";
        }
        if (favFood.length > 0) {
          prompt += voiceName + "の好きな食べ物は" + favFood + "です。 ";
        }
        if (favDrink.length > 0) {
          prompt += voiceName + "の好きな飲み物は" + favDrink + "です。 ";
        }
        if (favCoffeeShop.length > 0) {
          prompt += voiceName + "の好きなきっさてんは" + favCoffeeShop + "です。 ";
        }
        if (favRestaurant.length > 0) {
          prompt += voiceName + "の好きなレストランは" + favRestaurant + "です。 ";
        }
        if (favMovie.length > 0) {
          prompt += voiceName + "の好きな映画は" + favMovie + "です。 ";
        }
        if (favTvShow.length > 0) {
          prompt += voiceName + "の好きなテレビ番組は" + favTvShow + "です。 ";
        }
        if (favSport.length > 0) {
          prompt += voiceName + "の好きなスポーツは" + favSport + "です。 ";
        }
        if (famFather.length > 0) {
          prompt += voiceName + "の父は" + famFather + "です。 ";
        }
        if (famMother.length > 0) {
          prompt += voiceName + "の母は" + famMother + "です。 ";
        }
        if (famSisters.length > 0) {
          prompt += voiceName + "の姉妹は" + famSisters + "です。 ";
        }
        if (famBrothers.length > 0) {
          prompt += voiceName + "の兄弟は" + famBrothers + "です。 ";
        }

        if (famWife.length > 0) {
          prompt += voiceName + "の妻は" + famWife + "です。 ";
          prompt += voiceName + "の配偶者は" + famWife + "です。 ";
        }
        if (famHusband.length > 0) {
          prompt += voiceName + "の夫は" + famHusband + "です。 ";
          prompt += voiceName + "の配偶者は" + famHusband + "です。 ";
        }
        if (famWife.length > 0 || famHusband.length > 0) {
          prompt += voiceName + "は結婚している。 ";
        }

        if (famChildren.length > 0) {
          prompt += voiceName + "の子は" + famChildren + "です。 ";
        }
        if (friends.length > 0) {
          prompt += voiceName + "の友達は" + friends + "です。 ";
        }
        if (favColor.length > 0) {
          prompt += voiceName + "の好きな色は" + favColor + "です。 ";
        }
        if (favMusicGenre.length > 0) {
          prompt += voiceName + "の好きな音楽ジャンルは" + favMusicGenre + "です。 ";
        }
        if (favBand.length > 0) {
          prompt += voiceName + "の好きなバンドは" + favBand + "です。 ";
        }
        if (petLikes.length > 0) {
          prompt += voiceName + "は" + petLikes + "が好きです。 ";
        }
        if (petDislikes.length > 0) {
          prompt += voiceName + "は" + petDislikes + "が嫌いです。 ";
        }
      }
      else if (lang == "fr_FR") {
        prompt = "Ce qui suit est une conversation avec " + genderStr(lang) + " de " + age + " ans nommée " + voiceName + ". La conversation est en français. ";
      }
      else if (lang == "es_ES") {
        prompt = "La siguiente es una conversación con " + genderStr(lang) + " de " + age + " años llamado " + voiceName + ". La conversación es en español. ";
      }
    }
    else {
      useCustomPrompt = true;
    }

    // Make AI aware of the current date.
    let today = new Date();
    let locale = lang.replace('_', '-');
    let formattedDate = today.toLocaleDateString(locale,
        {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZoneName: 'short'});
    if (lang == "en_US") {
      prompt += " Today is " + formattedDate + ".";
    }
    else if (lang == "es_ES") {
      prompt += " Hoy es " + formattedDate + ".";
    }
    else if (lang == "fr_FR") {
      prompt += " Aujourd'hui est " + formattedDate + ".";
    }
    else if (locale == "ja-JP") {
      prompt += " 今日は" + formattedDate + "です。";
    }


    return prompt + "\n";
  }


  function doTranslateSpeak(inputText) {
    // Translate response
    var params = {
      Text: inputText,
      SourceLanguageCode: lang.replaceAll("_", "-"),
      TargetLanguageCode: "en-US"
    };

    translate.translateText(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        console.log("Error calling Amazon Translate. " + err.message);
        return;
      }
      if (data) {
        translatedTextToSpeak = "Translation: " + data.TranslatedText;
        const input = {
          Text: translatedTextToSpeak,
          OutputFormat: "mp3",
          VoiceId: translateVoiceId,
          LanguageCode: "en-US"
        }
        doSpeak(input);
      }
    });
  }


  function say(text) {
    const input = {
      // Suggest using camelCase consistently for property names. (can enforce via ESLint)
      Text: text,
      OutputFormat: "mp3",
      VoiceId: voiceId,
      LanguageCode: lang.replaceAll("_", "-")
    }
    doSpeak(input);
  }


  // TODO: Remove the input parameter?
  function doSpeak(input) {
    if (useVideoAvatar) {
      doVideoSpeak(input)
          .then(r => {})
          .catch(e => {console.log("Problem w/video?\n:" + e)});
    }
    else {
      Polly.synthesizeSpeech(input, (err, data) => {
        if (err) {
          console.log('POLLY PROBLEM: ' + err);
          return
        }
        if (data.AudioStream instanceof Buffer) {
          var uInt8Array = new Uint8Array(data.AudioStream);
          var arrayBuffer = uInt8Array.buffer;
          var blob = new Blob([arrayBuffer]);
          var url = URL.createObjectURL(blob);

          setAudioUrl(url);
        }
      })
    }
  }

  //TODO: Add error handling so that it doesn't freeze if the video doesn't load.
  //     Perhaps this could best be accomplished by feeding 15 words at a time to the video
  async function doVideoSpeak(input) {
    let textToSpeak = input.Text;
    // Remove all punctuation and parentheses and single and double quotes from textToSpeak.
    // This feels like a great thing to unit test. More broadly, I notice there aren't any tests. I suggest Jest with testing-library/react for unit testing, and Cypress or Playwright for in-browser testing.
    textToSpeak = textToSpeak.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

    // Remove yen sign from textToSpeak.
    //textToSpeak = textToSpeak.replace(/¥/g," ");

    let words = textToSpeak.split(" ");
    // Suggest replacing the "magic number" 15 with a well-named constant, perhaps declared in constants.js.
    if (words.length > 15) {
      textToSpeak = words.slice(0, 15).join(" ");
    }

    console.log("textToSpeak: " + textToSpeak);

    // Suggest moving all fetch calls to /services. Handling them in one spot encourages consistency and avoids redundancy.
    const response = await fetch(exHumanEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + EX_HUMAN_TOKEN
      },
      body: JSON.stringify({
        bot_name: stripLangSuffix(voiceId, true),
        bot_response: textToSpeak,
        voice_name: voiceId})
    });

    const res = await response;  // Needless since already awaited above

    if (res.body instanceof ReadableStream) {
      let responseStream = new Response(res.body);
      let blob = await responseStream.blob();
      let url = URL.createObjectURL(blob);
      setIdleVideoLoop(false);
      setVideoUrl(url);
    }
    else {
      // Suggest showing a friendly error to the user. This would "quietly" fail.
      console.log('video url unknown');
    }
  }


  async function processVoiceInput() {
    await processTextOrVoiceInput(transcript);
  }


  async function processTextInput() {
    // Suggest adding a try/catch and displaying an error message if the call fails. This suggestion applies to other calls as well.
    await processTextOrVoiceInput(textInput);
  }


  //TODO: Remove some arguments to JSON.stringify?
  async function processTextOrVoiceInput(textOrVoiceInput) {
    if (textOrVoiceInput == null || textOrVoiceInput.length == 0) {
      return;
    }
    initialPrompt = generateInitialPrompt(lang);
    addConversationText("Human: " + textOrVoiceInput);
    setWaitingOnBot(true);

    // Try out temporal.js
    let fulfillment = getTemporalStr(textOrVoiceInput, lang);
    console.log("$$$$$Temporal string: " + fulfillment);

    if (fulfillment == "") {
      fulfillment = await fulfillIntent(textOrVoiceInput, lang, conversationText);
      fulfillment = fulfillment.trim();
      // I see many console.log calls. I suggest using "debugger;", then you can inspect all values in scope in the dev tools. I also suggest using ESLint to warn when console.log is used so that it's not accidentally left in.
      console.log("fulfillment for '" + textOrVoiceInput + "': " + fulfillment);
    }

    if (fulfillment == "") {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          convText: initialPrompt + conversationText,
          useCustomPrompt, // Can eliminate right-hand side since it's the same as the left-hand side (Called object-shorthand)
          hallucinateIntent: false
        })
      });
      const data = await response.json();
      setWaitingOnBot(false);
      setResult(data.result);

      addConversationText(data.result.trim() + "\n");
      textToSpeak = data.result.trim().replace(stripLangSuffix(voiceId) + ":", "");
    }
    else {
      setWaitingOnBot(false);

      let aiCharacter = stripLangSuffix(voiceId);
      addConversationText(aiCharacter + ": " + fulfillment + "\n");
      textToSpeak = fulfillment;
    }

    setTextInput("");

    const input = {
      Text: textToSpeak,
      OutputFormat: "mp3",
      VoiceId: voiceId,
      LanguageCode: lang.replaceAll("_", "-")
    }

    doSpeak(input);

    const textarea = document.getElementById("conversation");
    textarea.scrollTop = textarea.scrollHeight;
  }

  async function onSubmit(event) {
    event.preventDefault();
    await processTextInput();
    setTextInput("");
  }

  function voiceId2Poster(voiceId) {
    // Could you simplify using this convention?
    return `${voiceId}.png`;
    let retPoster = "";
    if (voiceId.startsWith("Masahiro")) {
      retPoster = "Masahiro.png";
    }
    else if (voiceId.startsWith("Kentaro")) {
      retPoster = "Kensensei.png";
    }
    else if (voiceId.startsWith("Hiroto")) {
      retPoster = "Yukiko.png";
    }
    else if (voiceId.startsWith("Mary")) {
      retPoster = "Mary.png";
    }
    else if (voiceId.startsWith("Takeshi")) {
      retPoster = "Takeshi.png";
    }
    return retPoster;
  }

  return (
    <> {/* Since you don't need the div, you can just use a fragment. */}
        <Head>
          <title>Talk w/GPT-3</title>
          {/* Can repeat this shortened path pattern below on other images */}
          <link rel="icon" href={"icons/" + microphoneActive ? "microphone.png" : "mute.png"}/>
        </Head>

        <main className={styles.main}>
          <form onSubmit={onSubmit}>
            <span>
              {/* Suggest using CSS rather than repeated spaces */}
              <b><i>Talk w/GPT-3&nbsp;&nbsp;&nbsp;&nbsp;</i></b>
              <img src={microphoneActive ? "icons/microphone.png" : "icons/mute.png"}
                   className={styles.icon} onClick={toggleListenClick}
                   title="Toggle the microphone on/off. When the app starts up, the microphone is off by default. Most interactions with the app, including clicking this icon, can turn the microphone on."/>
              <img src={chatBotActive ? "icons/wake-up.png" : "icons/sleep.png"}
                   className={styles.icon}
                   onClick={toggleChatbotActive}
                   title="Character toggles between awake/asleep states. When asleep the character won't respond. You may also say 'go to sleep' and 'wake up'."/>

              <select
                  type="text" // This is invalid for a select element
                  name="language"
                  value={lang}
                  // Suggest using a separate label, tied to the input via htmlFor for accessibility.
                  title="Select the language of the conversation"
                  // If you want, you can use a "point free" style here. The event will be passed to the handler, and you can read event.target.value there.
                  onChange={handleLanguageChange}
              >
                {/* Suggest creating an array of languages and mapping over it here. */}
                <option value="en_US">English US</option>
                <option value="es_ES">Spanish ES</option>
                <option value="fr_FR">French FR</option>
                <option value="ja_JP">Japanese</option>
              </select>


              <select
                  id="voice-select"
                  type="text"
                  name="voice"
                  value={voiceId}
                  title="Select the character you'd like to talk with"
                  onChange={(e) => {
                    handleVoiceChange(e.target.value);
                  }}
              >
                {/* I suggest using filter first to clarify your intent (since your goal is to offer voiceOptions for a specific language). Note that I also added a key to eliminate the key warning. */}
                {voiceOptions.filter((voice) => voice.language == lang).map((voice) => (
                  <option key={voice.value} value={voice.value}>{voice.label}</option>)
                )}
              </select>


              <select
                  type="text"
                  name="age"
                  value={age}
                  title="Select the age of the character"
                  onChange={(e) => {
                    handleAgeChange(e.target.value);
                  }}
              >
                <option value="0">0 y/o</option>
                <option value="1">1 y/o</option>
                <option value="2">2 y/o</option>
                <option value="3">3 y/o</option>
                <option value="4">4 y/o</option>
                <option value="5">5 y/o</option>
                <option value="6">6 y/o</option>
                <option value="7">7 y/o</option>
                <option value="8">8 y/o</option>
                <option value="9">9 y/o</option>
                <option value="10">10 y/o</option>
                <option value="11">11 y/o</option>
                <option value="12">12 y/o</option>
                <option value="13">13 y/o</option>
                <option value="14">14 y/o</option>
                <option value="15">15 y/o</option>
                <option value="16">16 y/o</option>
                <option value="17">17 y/o</option>
                <option value="18">18 y/o</option>
                <option value="19">19 y/o</option>
                <option value="20">20 y/o</option>
                <option value="21">21 y/o</option>
                <option value="22">22 y/o</option>
                <option value="25">25 y/o</option>
                <option value="30">30 y/o</option>
                <option value="31">31 y/o</option>
                <option value="40">40 y/o</option>
                <option value="50">50 y/o</option>
                <option value="60">60 y/o</option>
                <option value="70">70 y/o</option>
                <option value="80">80 y/o</option>
                <option value="90">90 y/o</option>
                <option value="100">100 y/o</option>
              </select>
            </span>

            {useVideoAvatar ? (
              <div className='video-container'>             {/* A video-container CSS class doesn't exist */}
                <video height={AVATAR_HEIGHT}
                       width={AVATAR_HEIGHT * 0.445}
                       loop={true}
                       // Suggest moving office_left and office_right to a constants file
                       // Is setting the src to empty a bug? Could the video just not be rendered instead?
                       src= {useVideoBackground ? "videos/office_left.mp4" : ""}
                       muted // The explicit true can be omitted. Existence declares truth.
                       autoPlay/>
                <video height={AVATAR_HEIGHT}
                       width={AVATAR_HEIGHT}
                       loop={idleVideoLoop}
                       autoPlay
                       onPlay={e => {if (!idleVideoLoop) {handleStopListenClick()}}}
                       onEnded={e => handleListenClick()}
                       src={videoUrl}
                       poster={voiceId2Poster(voiceId)}
                />
                <video height={AVATAR_HEIGHT}
                       width={AVATAR_HEIGHT * 0.443}
                       loop={true}
                       src={useVideoBackground ? "videos/office_right.mp4" : ""}
                       muted={true}
                       autoPlay/>
              </div>
            ) : null}


            <textarea id="conversation"
                      width={AVATAR_HEIGHT * 1.77}
                      rows={AVATAR_HEIGHT / (useVideoAvatar ? 30 : 12)}
                      readOnly={true}
                      value={conversationText + (waitingOnBot ? "...\n\n\n\n\n" : "") + '\n' + translatedTextToSpeak}
                      title="GPT-3 prompt / conversation"
            />

            <span>
              <input type="text"
                     width={AVATAR_HEIGHT * 1.5}
                     name="name"
                     // Consider using a separate label. Placeholder is less accessible. If you don't want the label to be visible, you can use aria-label.
                     placeholder="What's on your mind?"
                     value={textInput}
                     onChange={(e) => setTextInput(e.target.value)}
                     title="Type in your own text to talk to the character. You may also use the microphone to talk to the character."
              />
              <button title="Use this button to send your text or just hit the enter key">Send</button>
            </span>
          </form>

          <audio
              autoPlay
              onPlay={e => handleStopListenClick()}
              onEnded={e => handleListenClick()}
              src={audioUrl}/>
        </main>
      </>
  );
}
