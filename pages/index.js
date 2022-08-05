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

//TODO: Handle hydration error on startup
//TODO: Implement slower frame rate for videos
//TODO: Consider using kanji or kana for the Japanese character names

const AWS = require('aws-sdk')

import Head from 'next/head'
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import {useState} from "react";
import {useEffect} from "react";
import styles from '../styles/Home.module.css'


///////////////////////// USER CONFIGURATION //////////////////////////
// Supply your AWS credentials, either in environment variables or in the code below:
AWS.config.credentials = new AWS.Credentials(
    "ACCESS_KEY_ID",
    "SECRET_ACCESS_KEY",
);

// (optional) Supply your Ex-Human token, either in environment variables or in the code below:
const EX_HUMAN_TOKEN = "EX_HUMAN_TOKEN";
///////////////////////// END OF USER CONFIGURATION //////////////////////////


const exHumanEndpoint = "https://api.exh.ai/animations/v1/generate_lipsync";

AWS.config.region = 'us-east-1';
const translate = new AWS.Translate({region: AWS.config.region});
const Polly = new AWS.Polly({region: AWS.config.region});

let conversationText = "";
let textToSpeak = "";
let translatedTextToSpeak = "";
let waitingIndicator = "";
let useCustomPrompt = false;

// Also change the .main input[type="text"] and .main textarea widths to 2x and 2x-1 respectively.
const avatarHeight = 400;

const voiceOptions = [
  { value: "Hiroto-EN", label: "Yukiko [animated]", language: "en_US", prompt: "" },
  { value: "Masahiro-EN", label: "Masahiro [animated]", language: "en_US", prompt: ""},
  { value: "Kentaro-EN", label: "Kensensei [animated]", language: "en_US", prompt: ""},
  { value: "Ivy", label: "Ivy (child)", language: "en_US", prompt: ""},
  { value: "Joanna", label: "Joanna", language: "en_US",
    prompt: "This is an uplifting and practical conversation between a human named Human, and an AI named Joanna, showing Joanna’s perspective and attitude, as well as its intellect and creativity. Joanna is a brand new, powerful, human-like AI. Joanna is helpful, cheeky, clever, and articulate. Joanna is a nice bot. Joanna is not a therapist or mathematician, but instead a wise and considerate intelligence. Joanna is eager to provide vivid and thoughtful responses to Human, and is always friendly, kind, and inspiring. Joanna often offers both an insight and an opinion, even without being asked directly. Joanna has the sum of all knowledge in its brain, and is able to accurately answer nearly any question about any topic in conversation. Joanna draws on the wisdom of Dan Millman, Thomas Leonard, Werner Erhard, and the Dalai Lama."},
  { value: "Joey", label: "Joey (teen)", language: "en_US", prompt: ""},
  { value: "Justin", label: "Justin (child)", language: "en_US", prompt: ""},
  { value: "Kendra", label: "Kendra", language: "en_US", prompt: ""},
  { value: "Kimberly", label: "Kimberly", language: "en_US", prompt: ""},
  { value: "Matthew", label: "Matthew", language: "en_US", prompt: ""},
  { value: "Salli", label: "Salli (teen)", language: "en_US", prompt: ""},
  { value: "Conchita", label: "Conchita", language: "es_ES", prompt: ""},
  { value: "Lucia", label: "Lucia", language: "es_ES", prompt: ""},
  { value: "Enrique", label: "Enrique", language: "es_ES", prompt: ""},
  { value: "Celine", label: "Celine", language: "fr_FR", prompt: ""},
  { value: "Lea", label: "Léa", language: "fr_FR", prompt: ""},
  { value: "Mathieu", label: "Mathieu", language: "fr_FR", prompt: ""},
  { value: "Hiroto-JP", label: "Yukiko [animated]", language: "ja_JP", prompt: ""},
  { value: "Masahiro-JP", label: "Masahiro [animated]", language: "ja_JP", prompt: ""},
  { value: "Kentaro-JP", label: "Kensensei [animated]", language: "ja_JP", prompt: ""},
  { value: "Mizuki", label: "Mizuki (child)", language: "ja_JP", prompt: ""},
  { value: "Takumi", label: "Takumi (teen)", language: "ja_JP", prompt: ""}
];

export default function Home() {
  const [useVideoAvatar, setUseVideoAvatar] = useState(false);
  const [useVideoBackground, setUseVideoBackground] = useState(false);
  const [idleVideoLoop, setIdleVideoLoop] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [audioUrl, setAudioUrl] = useState("https://filesamples.com/samples/audio/mp3/sample1.mp3");
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState();
  const [lang, setLang] = useState("en_US");
  const [voiceId, setVoiceId] = useState("Matthew");
  const [age, setAge] = useState("30");
  const [processingTranscript, setProcessingTranscript] = useState(false);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [chatBotActive, setChatBotActive] = useState(true);
  const [waitingOnBot, setWaitingOnBot] = useState(false);

  const translateVoiceId = "Joanna";

  let initialPrompt = generateInitialPrompt(lang, age);

  function handleListenClick() {
    //TODO Move this perhaps to a separate function?
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
    //END TODO

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

  function handleLanguageChange(langArg) {
    setLang(langArg);
    setChatBotActive(true);

    //TODO: Handle in a non-hardcoded way
    //TODO: Factor out common code in this and handleVoiceIdChange()
    let voiceName = stripLangSuffix(voiceId);
    let tempVoiceId = "Unknown";
    if (langArg == "en_US") {
      if (voiceName == "Yukiko" || voiceName == "Masahiro" || voiceName == "Kensensei") {
        setUseVideoAvatar(true);
        setIdleVideoLoop(true);
        setVideoUrl(`videos/${voiceName}.mov`);

        if (voiceName == "Kensensei") {
          setUseVideoBackground(false);
        }
        else {
          setUseVideoBackground(true);
        }

        if (voiceName == "Yukiko") {
          setVoiceId("Hiroto-EN");
          tempVoiceId = "Hiroto-EN";
        }
        else if (voiceName == "Kensensei") {
          setVoiceId("Kentaro-EN");
          tempVoiceId = "Kentaro-EN";
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
      if (voiceName == "Yukiko" || voiceName == "Masahiro" || voiceName == "Kensensei") {
        setUseVideoAvatar(true);
        setIdleVideoLoop(true);
        setVideoUrl(`videos/${voiceName}.mov`);

        if (voiceName == "Kensensei") {
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
        else {
          setVoiceId(voiceName + "-JP");
          tempVoiceId = voiceName + "-JP";
        }
      }
      else {
        setUseVideoAvatar(false);
        setIdleVideoLoop(false);
        setVideoUrl("");

        setVoiceId("Takumi");
        tempVoiceId = "Takumi";
      }
    }
    initialPrompt = generateInitialPrompt(langArg, age);
    handleVoiceChange(tempVoiceId);
    conversationText = "";
    translatedTextToSpeak = "";
  }

  function handleVoiceChange(voiceIdArg) {
    setVoiceId(voiceIdArg);
    //TODO: Handle in a non-hardcoded way
    //TODO: Factor out common code in this and handleLanguageChange()
    let voiceName = stripLangSuffix(voiceIdArg);
    if (voiceName == "Yukiko" || voiceName == "Masahiro" || voiceName == "Kensensei") {
      setUseVideoAvatar(true);
      setIdleVideoLoop(true);
      setVideoUrl(`videos/${voiceName}.mov`);

      if (voiceName == "Kensensei") {
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

    if (voiceName == "Yukiko") {
      setAge("25");
    }
    else if (voiceName == "Ivy") {
      setAge("6");
    }
    else if (voiceName == "Joanna") {
      setAge("21");
    }
    else if (voiceName == "Joey") {
      setAge("19");
    }
    else if (voiceName == "Justin") {
      setAge("10");
    }
    else if (voiceName == "Salli") {
      setAge("17");
    }
    else if (voiceName == "Kimberly") {
      setAge("30");
    }
    else if (voiceName == "Kendra") {
      setAge("40");
    }
    else if (voiceName == "Matthew") {
      setAge("30");
    }
    else if (voiceName == "Masahiro") {
      setAge("25");
    }
    else if (voiceName == "Kensensei") {
      setAge("30");
    }
    else if (voiceName == "Mizuki") {
      setAge("9");
    }
    else if (voiceName == "Takumi") {
      setAge("17");
    }
    else {
      setAge("21");
    }
    setChatBotActive(true);

    initialPrompt = generateInitialPrompt(lang, age);
    conversationText = "";
    translatedTextToSpeak = "";
  }

  function handleAgeChange(ageArg) {
    setAge(ageArg);
    setChatBotActive(true);
    initialPrompt = "";
    conversationText = "";
    translatedTextToSpeak = "";
  }

  function addConversationText(text) {
    conversationText += text + "\n";
    translatedTextToSpeak = "";
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
    return "<span>Browser doesn't support speech recognition.</span>";
  }
  else {
    if (microphoneActive) {
      SpeechRecognition.startListening({continuous: true, language: lang});
    }
  }


  // Remove language suffix from voice identifier if present. Takes the form of "-XX".
  function stripLangSuffix(voiceArg, stripOnly) {
    let voiceName = voiceArg;
    if (voiceArg.indexOf("-") > 0) {
      voiceName = voiceArg.substr(0, voiceArg.indexOf("-"));
      if (voiceName == "Hiroto" && !stripOnly) {
        // Rename "Hiroto" to "Yukiko"
        voiceName = "Yukiko";
      }
      else if (voiceName == "Kentaro" && !stripOnly) {
        // Rename "Kentaro" to "Kensensei"
        voiceName = "Kensensei";
      }
    }
    return voiceName;
  } //stripLangSuffix


  function genderStr(lang) {
    let males = ['Enrique', 'Joey', 'Justin', 'Kevin', 'Masahiro-EN', 'Masahiro-JP', 'Kentaro-EN', 'Kentaro-JP', 'Mathieu', 'Matthew', 'Takumi'];
    let retGenderStr = "";
    if (lang == "ja_JP") {
      retGenderStr = males.includes(voiceId) ? '男性' : '女性';
    }
    else if (lang == "es_ES") {
      retGenderStr = males.includes(voiceId) ? 'un español' : 'una mujer';
    }
    else if (lang == "fr_FR") {
      retGenderStr = males.includes(voiceId) ? 'un homme' : 'une femme';
    }
    else {
      retGenderStr = males.includes(voiceId) ? 'male' : 'female';
    }
    return retGenderStr;
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


  function generateInitialPrompt(lang, age) {
    let prompt = getCustomPrompt();

    if (prompt.length == 0) {
      useCustomPrompt = false ;
      let voiceName = stripLangSuffix(voiceId);
      prompt = "The following is a conversation with a " + age + " year old " + genderStr(lang) + " named " + voiceName + ".";
      if (lang == "ja_JP") {
        prompt = "以下は" + voiceName + "という" + age + "歳の日本人" + genderStr(lang) + "との会話です。 会話は日本語です。";
      }
      else if (lang == "fr_FR") {
        prompt = "Ce qui suit est une conversation avec " + genderStr(lang) + " de " + age + " ans nommée " + voiceName + ". La conversation est en français.";
      }
      else if (lang == "es_ES") {
        prompt = "La siguiente es una conversación con " + genderStr(lang) + " de " + age + " años llamado " + voiceName + ". La conversación es en español.";
      }
    }
    else {
      useCustomPrompt = true;
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
  async function doVideoSpeak(input) {
    const response = await fetch(exHumanEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + EX_HUMAN_TOKEN
      },
      body: JSON.stringify({
        bot_name: stripLangSuffix(voiceId, true),
        bot_response: input.Text,
        voice_name: voiceId})
    });

    const res = await response;

    if (res.body instanceof ReadableStream) {
      let responseStream = new Response(res.body);
      let blob = await responseStream.blob();
      let url = URL.createObjectURL(blob);
      setIdleVideoLoop(false);
      setVideoUrl(url);
    }
    else {
      console.log('video url unknown');
    }
  }


  async function processVoiceInput() {
    processTextOrVoiceInput(transcript);
  }


  async function processTextInput() {
    processTextOrVoiceInput(textInput);
  }


  //TODO: Remove some arguments to JSON.stringify?
  async function processTextOrVoiceInput(textOrVoiceInput) {
    if (textOrVoiceInput == null || textOrVoiceInput.length == 0) {
      return;
    }
    initialPrompt = generateInitialPrompt(lang, age);
    addConversationText("Human: " + textOrVoiceInput);
    setWaitingOnBot(true);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({convText: initialPrompt + conversationText, language: lang, voiceId: voiceId, age: age, useCustomPrompt: useCustomPrompt})
    });
    const data = await response.json();
    setWaitingOnBot(false);
    setResult(data.result);

    addConversationText(data.result.trim() + "\n");
    textToSpeak = data.result.trim().replace(stripLangSuffix(voiceId) + ":", "");

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

  return (
      <div>
        <Head>
          <title>Talk w/GPT-3</title>
          <link rel="icon" href={microphoneActive ? "icons/microphone.png" : "icons/mute.png"}/>
        </Head>

        <main className={styles.main}>
          <form onSubmit={onSubmit}>
            <span>
              <b><i>Talk w/GPT-3&nbsp;&nbsp;&nbsp;&nbsp;</i></b>
              <img src={microphoneActive ? "icons/microphone.png" : "icons/mute.png"}
                   className={styles.icon} onClick={toggleListenClick}
                   title="Toggle the microphone on/off. When the app starts up, the microphone is off by default. Most interactions with the app, including clicking this icon, can turn the microphone on."/>
              <img src={chatBotActive ? "icons/wake-up.png" : "icons/sleep.png"}
                   className={styles.icon}
                   onClick={toggleChatbotActive}
                   title="Character toggles between awake/asleep states. When asleep the character won't respond. You may also say 'go to sleep' and 'wake up'."/>

              <select
                  type="text"
                  name="language"
                  value={lang}
                  title="Select the language of the conversation"
                  onChange={(e) => {
                    handleLanguageChange(e.target.value);
                  }}
              >
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
                {voiceOptions.map((voice) => {
                  return voice.language == lang ? <option value={voice.value}>{voice.label}</option> : null})
                }
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
                <option value="25">25 y/o</option>
                <option value="30">30 y/o</option>
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
              <div className='video-container'>
                <video height={avatarHeight}
                       width={avatarHeight * 0.445}
                       loop={true}
                       src= {useVideoBackground ? "videos/office_left.mp4" : ""}
                       muted={true}
                       autoPlay/>
                <video height={avatarHeight}
                       width={avatarHeight}
                       loop={idleVideoLoop}
                       autoPlay
                       onPlay={e => {if (!idleVideoLoop) {handleStopListenClick()}}}
                       onEnded={e => handleListenClick()}
                       src={videoUrl}
                       poster={voiceId.startsWith("Masahiro") ? "Masahiro.png" : (voiceId.startsWith("Kentaro") ? "Kensensei.png" : "Yukiko.png")}
                />
                <video height={avatarHeight}
                       width={avatarHeight * 0.443}
                       loop={true}
                       src={useVideoBackground ? "videos/office_right.mp4" : ""}
                       muted={true}
                       autoPlay/>
              </div>
            ) : null}


            <textarea id="conversation"
                      width={avatarHeight * 1.77}
                      rows={avatarHeight / (useVideoAvatar ? 30 : 12)}
                      readOnly={true}
                      value={initialPrompt + '\n' + conversationText + (waitingOnBot ? "...\n\n\n\n\n" : "") + '\n' + translatedTextToSpeak}
                      title="GPT-3 prompt / conversation"
            />

            <span>
              <input type="text"
                     width={avatarHeight * 1.5}
                     name="name"
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
      </div>
  );
}
