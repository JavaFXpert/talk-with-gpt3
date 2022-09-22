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
import {useState} from "react";
import {useEffect} from "react";
import styles from '../styles/Home.module.css'
import {fulfillIntent} from './api/intent_matching.js';
import {getTemporalStr} from "./api/temporal.js";


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

const GRADUATED = 99;
const DIDNT_ATTEND = 0;

const voiceOptions = [
  { value: "Hiroto-EN", label: "Yukiko [animated]", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Masahiro-EN", label: "Masahiro [animated]", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Kentaro-EN", label: "Kensensei [animated]", language: "en_US",
    nationality: "Japanese", phoneNum: "0, 1, 1, 5, 5, 5, 1, 2, 1, 2",
    livesIn: "Nagoya, Japan", whereBorn: "Meitetsu Hospital in Japan", whereFrom: "Aichi prefecture in Japan",
    occupation: "Teacher", university: "Berlin Free University", uniMajor: "", uniYear: GRADUATED, hobbies: "VR games and watching anime",
    favFood: "ramen and sushi", favDrink: "hot coffee", favCoffeeShop: "Starbucks", favRestaurant: "Hooters",
    favMovie: "Joker", favTvShow: "Abema News", favSport: "ping pong and badminton",
    favColor: "red and blue and white", favMusicGenre: "rock and classical", favBand: "L'Arc-en-Ciel and Marilyn Manson",
    petLikes: "dogs", petDislikes: "cats",
    famFather: "Etsuro who is 61 years old", famMother: "Yukiko who is 59 years old", famSisters: "Yujiro who is 28 years old", famBrothers: "",
    famWife: "Yuria who is 34 years old", famHusband: "", famChildren: "Hideo who is 1 year old",
    friends: "Keitaro 31 years old, Takumi 31 years old, Hiroki 31 years old and Kousei 31 years old",
    prompt: ""},
  { value: "Mary-EN", label: "Mary [animated]", language: "en_US",
    nationality: "American", phoneNum: "1, 5, 5, 5, 1, 2, 1, 2",
    livesIn: "Urasa Japan", occupation: "student", university: "Arizona University", uniMajor: "Japanese language", uniYear: 2, hobbies: "music",
    favFood: "hamburgers", favDrink: "coffee", favCoffeeShop: "Starbucks", favRestaurant: "McDonalds",
    favMovie: "Godzilla", favTvShow: "American Idol", favSport: "tennis",
    favColor: "blue", favMusicGenre: "J-Pop", favBand: "Baby Metal",
    petLikes: "dogs", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "Takeshi, Sora, and Robert",
    prompt: ""},
  { value: "Ivy", label: "Ivy (child)", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Joanna", label: "Joanna", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: "This is an uplifting and practical conversation between a human named Human, and an AI named Joanna, showing Joanna’s perspective and attitude, as well as its intellect and creativity. Joanna is a brand new, powerful, human-like AI. Joanna is helpful, cheeky, clever, and articulate. Joanna is a nice bot. Joanna is not a therapist or mathematician, but instead a wise and considerate intelligence. Joanna is eager to provide vivid and thoughtful responses to Human, and is always friendly, kind, and inspiring. Joanna often offers both an insight and an opinion, even without being asked directly. Joanna has the sum of all knowledge in its brain, and is able to accurately answer nearly any question about any topic in conversation. Joanna draws on the wisdom of Dan Millman, Thomas Leonard, Werner Erhard, and the Dalai Lama."},
  { value: "Joey", label: "Joey (teen)", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Justin", label: "Justin (child)", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Kendra", label: "Kendra", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Kimberly", label: "Kimberly", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Matthew", label: "Matthew", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Salli", label: "Salli (teen)", language: "en_US",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Conchita", label: "Conchita", language: "es_ES",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Lucia", label: "Lucia", language: "es_ES",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Enrique", label: "Enrique", language: "es_ES",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Celine", label: "Celine", language: "fr_FR",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Lea", label: "Léa", language: "fr_FR",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Mathieu", label: "Mathieu", language: "fr_FR",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Hiroto-JP", label: "Yukiko [animated]", language: "ja_JP",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Masahiro-JP", label: "Masahiro [animated]", language: "ja_JP",
    nationality: "", phoneNum: "",
    livesIn: "", occupation: "", university: "", uniMajor: "", uniYear: DIDNT_ATTEND, hobbies: "",
    favFood: "", favDrink: "", favCoffeeShop: "", favRestaurant: "",
    favMovie: "", favTvShow: "", favSport: "",
    favColor: "", favMusicGenre: "", favBand: "",
    petLikes: "", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  { value: "Kentaro-JP", label: "Kensensei [animated]", language: "ja_JP",
    nationality: "日本人", phoneNum: "0, 1, 1, 5, 5, 5, 1, 2, 1, 2",
    livesIn: "日本の名古屋市", whereBorn: "名鉄病院", whereFrom: "愛知県",
    occupation: "先生", university: "ベルリン自由大学", uniMajor: "", uniYear: GRADUATED, hobbies: "VRゲームとアニメを見ること",
    favFood: "ラーメンと寿司", favDrink: "ホットコーヒー", favCoffeeShop: "スターバックス", favRestaurant: "フーターズ",
    favMovie: "Joker", favTvShow: "アベマニュース", favSport: "ピンポンとバドミントン",
    favColor: "赤と黒と白", favMusicGenre: "ロックとクラシック", favBand: "ラルクアンシエルとマリリンマンソン",
    petLikes: "犬", petDislikes: "猫",
    famFather: "えつろう61歳", famMother: "ゆきこ59歳", famSisters: "ゆうじろう28歳", famBrothers: "",
    famWife: "ゆりあ34歳", famHusband: "", famChildren: "ひでお1歳",
    friends: "けいたろう31歳とたくみ31歳とひろき31歳とこうせい31歳",
    prompt: ""},
  { value: "Mary-JP", label: "Mary [animated]", language: "ja_JP",
    nationality: "アメリカ人", phoneNum: "1, 5, 5, 5, 1, 2, 1, 2",
    livesIn: "浦佐日本", occupation: "学生", university: "アリゾナ大学", uniMajor: "日本語", uniYear: 2, hobbies: "音楽",
    favFood: "ハンバーガー", favDrink: "コーヒー", favCoffeeShop: "スターバックス", favRestaurant: "マクドナルド",
    favMovie: "ゴジラ", favTvShow: "アメリカンアイドル", favSport: "テニス",
    favColor: "青い", favMusicGenre: "Jポップ", favBand: "ベビーメタル",
    petLikes: "犬", petDislikes: "",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "たけしさんとソラさんとロバートさん",
    prompt: ""},
  { value: "Takeshi-JP", label: "Takeshi [animated]", language: "ja_JP",
    nationality: "日本人", phoneNum: "1 5 5 5 1 3 1 3",
    livesIn: "浦佐日本", occupation: "学生", university: "さくら大学", uniMajor: "れきし", uniYear: 4, hobbies: "",
    favFood: "ごはんとパン", favDrink: "コーヒーとおちゃ", favCoffeeShop: "スターバックス", favRestaurant: "モスバーガー",
    favMovie: "ベスト・キッド", favTvShow: "歌舞伎", favSport: "自転車と水泳",
    favColor: "赤い", favMusicGenre: "クラシックロック", favBand: "ビートルズ",
    petLikes: "", petDislikes: "猫",
    famFather: "", famMother: "", famSisters: "", famBrothers: "",
    famWife: "", famHusband: "", famChildren: "",
    friends: "",
    prompt: ""},
  // { value: "Mizuki", label: "Mary", language: "ja_JP",
  //   nationality: "アメリカ人", phoneNum: "1, 5, 5, 5, 1, 2, 1, 2",
  //   livesIn: "浦佐日本", occupation: "学生", university: "アリゾナ大学", uniMajor: "日本語", uniYear: 2, hobbies: "音楽",
  //   favFood: "ハンバーガー", favDrink: "コーヒー", favCoffeeShop: "スターバックス", favRestaurant: "マクドナルド",
  //   favMovie: "ゴジラ", favTvShow: "アメリカンアイドル", favSport: "テニス",
  //   favColor: "青い", favMusicGenre: "Jポップ", favBand: "ベビーメタル",
  //   petLikes: "犬", petDislikes: "",
  //   famFather: "", famMother: "", famSisters: "", famBrothers: "",
  //   famWife: "", famHusband: "", famChildren: "",
  //   friends: "たけしさんとソラさんとロバートさん",
  //   prompt: ""},
  // { value: "Takumi", label: "Takeshi", language: "ja_JP",
  //   nationality: "日本人", phoneNum: "1 5 5 5 1 3 1 3",
  //   livesIn: "浦佐日本", occupation: "学生", university: "さくら大学", uniMajor: "れきし", uniYear: 4, hobbies: "",
  //   favFood: "ごはんとパン", favDrink: "コーヒーとおちゃ", favCoffeeShop: "スターバックス", favRestaurant: "モスバーガー",
  //   favMovie: "ベスト・キッド", favTvShow: "歌舞伎", favSport: "自転車と水泳",
  //   favColor: "赤い", favMusicGenre: "クラシックロック", favBand: "ビートルズ",
  //   petLikes: "", petDislikes: "猫",
  //   famFather: "", famMother: "", famSisters: "", famBrothers: "",
  //   famWife: "", famHusband: "", famChildren: "",
  //   friends: "",
  //   prompt: ""}
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
      if (voiceName == "Yukiko" || voiceName == "Masahiro" || voiceName == "Kensensei" ||
          voiceName == "Mary") {
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
      setAge("31");
    }
    else if (voiceName == "Mary") {
      setAge("19");
    }
    else if (voiceName == "Takeshi") {
      setAge("22");
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
      voiceName = voiceArg.substring(0, voiceArg.indexOf("-"));
      if (voiceName == "Hiroto" && !stripOnly) {
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


  function genderStr(lang) {
    let males = ['Enrique', 'Joey', 'Justin', 'Kevin', 'Masahiro-EN', 'Masahiro-JP',
      'Kentaro-EN', 'Kentaro-JP', 'Mathieu', 'Matthew', 'Takeshi-JP', 'Takumi'];
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

  function generateInitialPrompt(lang, age) {
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

    // Try out temporal.js
    let fulfillment = getTemporalStr(textOrVoiceInput, lang);
    console.log("$$$$$Temporal string: " + fulfillment);

    if (fulfillment == "") {
      fulfillment = await fulfillIntent(textOrVoiceInput, lang, conversationText);
      fulfillment = fulfillment.trim();
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
          useCustomPrompt: useCustomPrompt,
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
                       poster={voiceId2Poster(voiceId)}
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
                      value={conversationText + (waitingOnBot ? "...\n\n\n\n\n" : "") + '\n' + translatedTextToSpeak}
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
