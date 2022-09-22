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

import {getTimeZoneStr} from './time_zones.js';

const ASK_DATE_INTENT = 'AskDateIntent';
const ASK_TIME_INTENT = 'AskTimeIntent';
const ASK_DAY_INTENT = 'AskDayIntent';
const ASK_MONTH_INTENT = 'AskMonthIntent';

let intentArg = "";

// Key entries must be lowercase
const intentsMap = {
  "what's today's date": ASK_DATE_INTENT, //en-US
  "what's the date today": ASK_DATE_INTENT, //en-US
  "what date is it": ASK_DATE_INTENT, //en-US
  "what's the date": ASK_DATE_INTENT, //en-US
  "cuál es la fecha de hoy": ASK_DATE_INTENT, //es-ES
  "qué fecha es": ASK_DATE_INTENT, //es-ES
  "quelle date est-il": ASK_DATE_INTENT, //fr-FR
  "quelle est la date d'aujourd'hui": ASK_DATE_INTENT, //fr-FR
  "今日は何日ですか": ASK_DATE_INTENT, //ja-JP
  "何日ですか": ASK_DATE_INTENT, //ja-JP

  "what is the time": ASK_TIME_INTENT, // en-US
  "what time is it": ASK_TIME_INTENT, // en-US
  "what is the current time": ASK_TIME_INTENT, // en-US
  "what is the current local time": ASK_TIME_INTENT, // en-US
  "qué hora es": ASK_TIME_INTENT, //es-ES
  "qué hora es en este momento": ASK_TIME_INTENT, //es-ES
  "quelle heure est-il": ASK_TIME_INTENT, //fr-FR
  "今何時ですか": ASK_TIME_INTENT, //ja-JP

  "what day of the week is it": ASK_DAY_INTENT, //en-US
  "what day is it": ASK_DAY_INTENT, //en-US
  "what day is it today": ASK_DAY_INTENT, //en-US
  "cuál es el día de la semana": ASK_DAY_INTENT, //es-ES
  "qué día de la semana es": ASK_DAY_INTENT, //es-ES
  "qué día es": ASK_DAY_INTENT, //es-ES
  "quel jour est-il": ASK_DAY_INTENT, //fr-FR
  "quelle est le jour de la semaine": ASK_DAY_INTENT, //fr-FR
  "quel jour de la semaine est-il": ASK_DAY_INTENT, //
  "今日は何曜日ですか": ASK_DAY_INTENT, //ja-JP
  "何曜日ですか": ASK_DAY_INTENT, //ja-JP

  "what month is it": ASK_MONTH_INTENT, //en-US
  "cuál es el mes": ASK_MONTH_INTENT, //es-ES
  "qué mes es": ASK_MONTH_INTENT, //es-ES
  "quelle est le mois": ASK_MONTH_INTENT, //fr-FR
  "quel mois est-il": ASK_MONTH_INTENT, //fr-FR
  "今月は何月ですか": ASK_MONTH_INTENT, //ja-JP
  "何月ですか": ASK_MONTH_INTENT, //ja-JP
}

function stripFinalPunctuation(str) {
  let retStr = str;
  if (str.endsWith('。') || str.endsWith('！') || str.endsWith('？') ||
      str.endsWith('.') || str.endsWith('!') || str.endsWith('?')) {
    retStr = str.substring(0, str.length - 1);
  }
  // Strip the upside down question mark if present
  if (retStr.startsWith('¿') && retStr.length > 1) {
    retStr = retStr.substring(1);
  }
  // Replace commas with empty string
  retStr = retStr.replace(/,/g, '');
  return retStr;
}

function matchIntent(intentRequest, locale) {
  intentArg = "";
  let cleanedIntentReq = stripFinalPunctuation(intentRequest).trim();
  console.log("cleanedIntentReq.toLowerCase():" + cleanedIntentReq.toLowerCase());

  // Try to match the intent by using what the human said. This is
  // mainly to match the date/time oriented questions, including ones
  // that ask about time/date in a specific place.
  let matchedIntent = intentsMap[cleanedIntentReq.toLowerCase()];
  if (matchedIntent) {
    console.log(cleanedIntentReq.toLowerCase() + " matched, matchedIntent: " + matchedIntent);
    return matchedIntent;
  }
  else {
    let dateSearchStrA = '';
    let dateSearchStrB = '';
    let timeSearchStrA = '';
    let timeSearchStrB = '';
    if (locale == 'en-US') {
      dateSearchStrA = "what date is it ";
      dateSearchStrB = "what's the date ";
      timeSearchStrA = "what time is it ";
      if (cleanedIntentReq.toLowerCase().startsWith(dateSearchStrA)) {
        // User is asking for the date in a specific location
        intentArg = cleanedIntentReq.substring(dateSearchStrA.length);
        return ASK_DATE_INTENT;
      }
      else if (cleanedIntentReq.toLowerCase().startsWith(dateSearchStrB)) {
        // User is asking for the date in a specific location
        intentArg = cleanedIntentReq.substring(dateSearchStrB.length);
        return ASK_DATE_INTENT;
      }
      else if (cleanedIntentReq.toLowerCase().startsWith(timeSearchStrA)) {
        // User is asking for the time in a specific location
        intentArg = cleanedIntentReq.substring(timeSearchStrA.length);
        return ASK_TIME_INTENT;
      }
    }
    else if (locale == 'es-ES') {
      dateSearchStrA = "cuál es la fecha de hoy ";
      dateSearchStrB = "que fecha es ";
      timeSearchStrA = 'qué hora es ';
      if (cleanedIntentReq.toLowerCase().startsWith(dateSearchStrA)) {
        // User is asking for the date in a specific location
        intentArg = cleanedIntentReq.substring(dateSearchStrA.length);
        return ASK_DATE_INTENT;
      }
      else if (cleanedIntentReq.toLowerCase().startsWith(dateSearchStrB)) {
        // User is asking for the date in a specific location
        intentArg = cleanedIntentReq.substring(dateSearchStrB.length);
        return ASK_DATE_INTENT;
      }
      else if (cleanedIntentReq.toLowerCase().startsWith(timeSearchStrA)) {
        // User is asking for the time in a specific location
        intentArg = cleanedIntentReq.substring(timeSearchStrA.length);
        return ASK_TIME_INTENT;
      }
    }
    else if (locale == 'fr-FR') {
      dateSearchStrA = "quelle date est-il ";
      timeSearchStrA = 'quelle heure est-il ';
      if (cleanedIntentReq.toLowerCase().startsWith(dateSearchStrA)) {
        // User is asking for the date in a specific location
        intentArg = cleanedIntentReq.substring(dateSearchStrA.length);
        return ASK_DATE_INTENT;
      }
      else if (cleanedIntentReq.toLowerCase().startsWith(timeSearchStrA)) {
        // User is asking for the time in a specific location
        intentArg = cleanedIntentReq.substring(timeSearchStrA.length);
        return ASK_TIME_INTENT;
      }
    }
    else if (locale == 'ja-JP') {
      dateSearchStrA = 'では何日ですか';
      timeSearchStrA = 'は今何時ですか';
      timeSearchStrB = 'は何時ですか';
      if (cleanedIntentReq.endsWith(dateSearchStrA)) {
        // User is asking for the date in a specific location
        intentArg = cleanedIntentReq.substring(0, cleanedIntentReq.length - dateSearchStrA.length);
        return ASK_DATE_INTENT;
      }
      else if (cleanedIntentReq.endsWith(timeSearchStrA)) {
        // User is asking for the time in a specific location
        intentArg = cleanedIntentReq.substring(0, cleanedIntentReq.length - timeSearchStrA.length);
        return ASK_TIME_INTENT;
      }
      else if (cleanedIntentReq.endsWith(timeSearchStrB)) {
        // User is asking for the time in a specific location
        intentArg = cleanedIntentReq.substring(0, cleanedIntentReq.length - timeSearchStrB.length);
        return ASK_TIME_INTENT;
      }
    }
  }
  //return intentsMap[stripFinalPunctuation(intentRequest.toLowerCase())];
}

export function getTemporalStr(intentRequest, lang) {
  let today = new Date();
  let locale = lang.replace('_', '-');
  let formattedDate = "";
  let retFulfillment = "";
  let intent = matchIntent(intentRequest, locale);
  console.log("intentRequest: " + intentRequest);
  //console.log("locale: " + locale);

  if (intent == ASK_DATE_INTENT) {
    if (intentArg != "") {
      formattedDate = getFormattedDateByLocation(intentArg, locale);
      if (formattedDate != null) {
        if (locale == "en-US") {
          retFulfillment = "Today is " + formattedDate + " " + intentArg + ".";
        }
        else if (locale == "es-ES") {
          retFulfillment = "Hoy es " + formattedDate + " " + intentArg + ".";
        }
        else if (locale == "fr-FR") {
          retFulfillment = "Aujourd'hui c'est le " + formattedDate + " " + intentArg + ".";
        }
        else if (locale == "ja-JP") {
          // change 0 to 12 for Japanese
          formattedDate = formattedDate.replace('後0:', '後12:')
              .replace('前0:', '前12:');
          retFulfillment = intentArg + "では" + formattedDate + "です。";
        }
      }
      else {
        if (locale == "en-US") {
          retFulfillment = "I don't know what date it is " + intentArg + ".";
        }
        else if (locale == "es-ES") {

          retFulfillment = "No se que fecha es " + intentArg + ".";
        }
        else if (locale == "fr-FR") {
          retFulfillment = "Je ne sais pas quelle date c'est " + intentArg + ".";
        }
        else if (locale == "ja-JP") {
          retFulfillment = intentArg + "の日付がわからない。";
        }
        retFulfillment = "";
      }
    }
    else {
      formattedDate = today.toLocaleDateString(locale,
          {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
      if (locale == "en-US") {
        retFulfillment = "Today is " + formattedDate + ".";
      }
      else if (locale == "es-ES") {
        retFulfillment = "Hoy es " + formattedDate + ".";
      }
      else if (locale == "fr-FR") {
        retFulfillment = "Aujourd'hui c'est le " + formattedDate + ".";
      }
      else if (locale == "ja-JP") {
        retFulfillment = "今日は" + formattedDate + "です。";
      }
    }
  }
  else if (intent == ASK_TIME_INTENT) {
    if (intentArg != "") {
      console.log("intent == ASK_TIME_INTENT, intentArg: " + intentArg);
      formattedDate = getFormattedTimeByLocation(intentArg, locale);
      if (formattedDate != null) {
        if (locale == "en-US") {
          retFulfillment = "It is " + formattedDate + " " + intentArg + ".";
        }
        else if (locale == "es-ES") {
          retFulfillment = formattedDate + " " + intentArg + ".";
        }
        else if (locale == "fr-FR") {
          retFulfillment = "Il est " + formattedDate + " " + intentArg + ".";
        }
        else if (locale == "ja-JP") {
          // change 0 to 12 for Japanese
          formattedDate = formattedDate.replace('後0:', '後12:')
              .replace('前0:', '前12:');
          retFulfillment = intentArg + "は" + formattedDate + "です。";
        }
      }
      else {
        if (locale == "en-US") {
          retFulfillment = "I don't know what time it is " + intentArg + ".";
        }
        else if (locale == "es-ES") {
          retFulfillment = "No se que hora es " + intentArg + ".";
        }
        else if (locale == "fr-FR") {
          retFulfillment = "Je ne sais pas quelle heure il est " + intentArg + ".";
        }
        else if (locale == "ja-JP") {
          retFulfillment = "今" + intentArg + "が何時か分からない。";
        }
        retFulfillment = "";
      }
    }
    else {
      formattedDate = today.toLocaleTimeString(locale,
          {hour: 'numeric', minute: 'numeric', hour12: true});
      if (locale == "en-US") {
        retFulfillment = "It is " + formattedDate + ".";
      }
      else if (locale == "es-ES") {
        // TODO: Work out how to say something like "the time is" in Spanish
        retFulfillment = formattedDate;
      }
      else if (locale == "fr-FR") {
        retFulfillment = "Il est " + formattedDate + ".";
      }
      else if (locale == "ja-JP") {
        formattedDate = formattedDate.replace('後0:', '後12:')
            .replace('前0:', '前12:');
        retFulfillment = "今" + formattedDate + "です。";
      }
    }
  }
  else if (intent == ASK_DAY_INTENT) {
    // Day is in long format, e.g. 日曜日, in japanese
    formattedDate = today.toLocaleString(locale, {weekday: 'long'});
    if (locale == "en-US") {
      retFulfillment = "Today is " + formattedDate + ".";
    }
    else if (locale == "es-ES") {
      retFulfillment = "Hoy es " + formattedDate + ".";
    }
    else if (locale == "fr-FR") {
      retFulfillment = "Aujourd'hui ç'est " + formattedDate + ".";
    }
    else if (locale == "ja-JP") {
      retFulfillment = "今日は" + formattedDate + "です。";
    }
  }
  else if (intent == ASK_MONTH_INTENT) {
    // Month is in long format, e.g. 一月 or 二月, in japanese
    formattedDate = today.toLocaleString(locale, {month: 'long'});
    if (locale == "en-US") {
      retFulfillment = "It is " + formattedDate + ".";
    }
    else if (locale == "es-ES") {
      retFulfillment = "Es " + formattedDate + ".";
    }
    else if (locale == "fr-FR") {
      retFulfillment = "Il est " + formattedDate + ".";
    }
    else if (locale == "ja-JP") {
      retFulfillment = formattedDate + "です。";
    }
  }
  return retFulfillment;
}

function getFormattedDateByLocation(locStr, locale) {
  let retFormattedDate = null;
  let timeZoneStr = getTimeZoneStr(locStr, locale);
  let today = new Date();
  if (timeZoneStr != null) {
    retFormattedDate = today.toLocaleDateString(locale,
        {timeZone: timeZoneStr, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
  }
  return retFormattedDate;
}

function getFormattedTimeByLocation(locStr, locale) {
  let retFormattedTime = null;
  let timeZoneStr = getTimeZoneStr(locStr, locale);
  let now = new Date();
  if (timeZoneStr != null) {
    retFormattedTime = now.toLocaleTimeString(locale,
        {timeZone: timeZoneStr, hour: 'numeric', minute: 'numeric', hour12: true});
  }
  return retFormattedTime;
}
