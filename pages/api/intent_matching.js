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

// TODO: Find out how to share INTENT constants

import {getTimeZoneStr} from './time_zones.js';
import {composeQuestionFromConversation, correctStandardLanguage} from '../conversationContext.js';
import {getTemporalStr} from "./temporal";

const ASK_FOR_CURRENT_INFO_INTENT = 'AskForCurrentInfoIntent';
const ASK_DATE_INTENT = 'AskDateIntent';
const ASK_TIME_INTENT = 'AskTimeIntent';
const ASK_DAY_INTENT = 'AskDayIntent';
const ASK_MONTH_INTENT = 'AskMonthIntent';
const ASK_TEMPERATURE_INTENT = 'AskTemperatureIntent';
const ASK_WEATHER_INTENT = 'AskWeatherIntent';
const ASK_NEWS_INTENT = 'AskNewsIntent';
const ASK_STOCK_PRICE_INTENT = 'AskStockPriceIntent';
const ASK_POPULATION_INTENT = 'AskPopulationIntent';
const ASK_AGE_INTENT = 'AskAgeIntent';
const ASK_FULL_MOON_INTENT = 'AskFullMoonIntent';
const ASK_DISTANCE_INTENT = 'AskDistanceIntent';
const ASK_TRAVEL_TIME_INTENT = 'AskTravelTimeIntent';
const ASK_BUSINESS_INTENT = 'AskBusinessIntent';
const CALCULATE_INTENT = 'CalculateIntent';

let intentArg = "";

// Key entries must be lowercase
const intentsMap = {
  "get-date": ASK_DATE_INTENT,
  "get-time": ASK_TIME_INTENT,
  "get-day-of-week": ASK_DAY_INTENT,
  "get-month": ASK_MONTH_INTENT,
  "get-population": ASK_POPULATION_INTENT,
  "get-age": ASK_AGE_INTENT,
  "get-temperature": ASK_TEMPERATURE_INTENT,
  "get-weather": ASK_WEATHER_INTENT,
  "get-forecast": ASK_WEATHER_INTENT,
  "get-weather-forecast": ASK_WEATHER_INTENT,
  "get-weather-yesterday": ASK_WEATHER_INTENT,
  "get-weather-tomorrow": ASK_WEATHER_INTENT,
  "get-news": ASK_NEWS_INTENT,
  "get-headlines": ASK_NEWS_INTENT,
  "get-top-headlines": ASK_NEWS_INTENT,
  "get-stock-price": ASK_STOCK_PRICE_INTENT,
  "get-next-full-moon": ASK_FULL_MOON_INTENT,
  "get-last-full-moon": ASK_FULL_MOON_INTENT,
  "get-full-moon": ASK_FULL_MOON_INTENT,
  "get-math": CALCULATE_INTENT,
  "get-math-result": CALCULATE_INTENT,
  "calculate": CALCULATE_INTENT,
  "get-factorial": CALCULATE_INTENT,
  "get-square-root": CALCULATE_INTENT,
  "get-cube-root": CALCULATE_INTENT,
  "get-distance": ASK_DISTANCE_INTENT,
  "get-travel-time": ASK_TRAVEL_TIME_INTENT,
  "get-flight-time": ASK_TRAVEL_TIME_INTENT,
  "get-drive-time": ASK_TRAVEL_TIME_INTENT,
  "get-driving-time": ASK_TRAVEL_TIME_INTENT,
  "get-restaurants": ASK_BUSINESS_INTENT,
  "find-restaurants": ASK_BUSINESS_INTENT,
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
  return retStr;
}

async function matchIntent(intentRequest, locale) {
  intentArg = "";
  let cleanedIntentReq = stripFinalPunctuation(intentRequest).trim();

  // Try to match the intent by using an intent result from GPT
  let intentPrompt = "Convert this text to a short intent.\n" +
      "\n" +
      "Text: What is the capital of Ohio?\n" +
      "Intent: get-capital Ohio\n" +
      "\n" +
      "Human: What is the population of Indianapolis \n" +
      "Intent: get-population Indianapolis\n" +
      "\n" +
      "Human: What time is it?\n" +
      "Intent: get-time\n" +
      "\n" +
      "Human: What is today's date?\n" +
      "Intent: get-date\n" +
      "\n" +
      "Human: How old is Huey Lewis?\n" +
      "Intent: get-age Huey Lewis\n" +
      "\n" +
      "Human: What time is it in Cambodia?\n" +
      "Intent: get-time Cambodia\n" +
      "\n" +
      "Human: What day is it?\n" +
      "Intent: get-day\n" +
      "\n" +
      "Human: What day is it in Perth?\n" +
      "Intent: get-day Perth\n" +
      "\n" +
      "Human: Let's play checkers.\n" +
      "Intent: play-checkers\n" +
      "\n" +
      "Human: Please tell me how many people live in Indianapolis\n" +
      "Intent: get-population Indianapolis\n" +
      "\n" +
      "Human: What's the weather forecast?\n" +
      "Intent: get-weather\n" +
      "\n" +
      "Human: How hot is it outside?\n" +
      "Intent: get-temperature\n" +
      "\n" +
      "Human: In what time zone is Sydney Australia?\n" +
      "Intent: get-timezone Sydney Australia\n" +
      "\n" +
      "Human: What is the current price of Microsoft stock?\n" +
      "Intent: get-stock-price MSFT\n" +
      "\n" +
      "Human: What is the price of Disney?\n" +
      "Intent: get-stock-price DIS\n" +
      "\n" +
      "Human: What should I wear today?\n" +
      "Intent: get-weather\n" +
      "\n" +
      "Human:";

  const responseIntent = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      convText: intentPrompt + cleanedIntentReq + "\nIntent:",
      useCustomPrompt: false,
      hallucinateIntent: true
    })
  });
  const dataIntent = await responseIntent.json();
  let intentList = dataIntent.result.trim().split(" ");
  console.log("intentList:" + intentList);

  let matchedIntent = intentsMap[intentList[0].toLowerCase()];
  if (matchedIntent) {
    console.log(intentList[0] + " matched, matchedIntent: " + matchedIntent);
    if (intentList.length > 1) {
      // Intent matched but there are intent arguments
      intentList.shift();
      intentArg = intentList.join(" ");
      console.log("intentArg:" + intentArg);
    }
    return matchedIntent;
  }

  // If the user indicated that they want current information, then
  // use ASK_FOR_CURRENT_INFO_INTENT
  let lcIntentReq = cleanedIntentReq.toLowerCase();
  if (lcIntentReq.includes(" current ") ||
      lcIntentReq.includes("currently") ||
      lcIntentReq.includes(" now") ||
      lcIntentReq.includes(" at the moment") ||
      lcIntentReq.includes(" at this moment") ||
      lcIntentReq.includes("at the present time") ||
      lcIntentReq.includes("at present") ||
      lcIntentReq.includes("at this time") ||
      lcIntentReq.includes(" yet") ||
      lcIntentReq.includes(" latest ") ||
      lcIntentReq.includes("at the present moment")) {
    return ASK_FOR_CURRENT_INFO_INTENT;
  }
  //TODO: ADD RETURN?
}

export async function fulfillIntent(intentRequest, lang,
                                    conversationText) {
  let today = new Date();
  let locale = lang.replace('_', '-');
  let formattedDate = "";
  let retFulfillment = "";
  let intent = await matchIntent(intentRequest, locale);
  console.log("intentRequest: " + intentRequest);
  //console.log("locale: " + locale);

  if (
      intent == ASK_FOR_CURRENT_INFO_INTENT ||
      intent == ASK_POPULATION_INTENT ||
      intent == ASK_AGE_INTENT ||
      intent == ASK_TEMPERATURE_INTENT ||
      intent == ASK_WEATHER_INTENT ||
      intent == ASK_NEWS_INTENT ||
      intent == ASK_STOCK_PRICE_INTENT ||
      intent == ASK_FULL_MOON_INTENT ||
      intent == CALCULATE_INTENT ||
      intent == ASK_DISTANCE_INTENT ||
      intent == ASK_TRAVEL_TIME_INTENT ||
      intent == ASK_BUSINESS_INTENT ||
      intent == ASK_DATE_INTENT ||
      intent == ASK_TIME_INTENT
  ) {
    // Get answers from the web.
    retFulfillment = invokeSerpapi(intent, intentRequest, lang,
        conversationText);
  }

  return retFulfillment;
}


async function invokeSerpapi(intent, intentRequest, lang,
                             conversationText) {
  // Compose a question from the conversation text so that the SERP API query
  // has enough context.
  let questionFromConversation = await composeQuestionFromConversation(conversationText);
  console.log("===Conversation so far: " + conversationText);
  console.log("===Question from conversation: " + questionFromConversation);
  console.log("===Intent: " + intent);

  let retFulfillment = getTemporalStr(questionFromConversation, lang);
  console.log("$$$$$Temporal string: " + retFulfillment);
  if (retFulfillment != "") {
    // No need to invoke the SERP API.
    return retFulfillment;
  }

  console.log("Calling querySerpapi");
  const response = await fetch("/api/serpapi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: intent,
      question: questionFromConversation,
      lang: lang,
    })
  });
  const serpData = await response.json();
  console.log("serpData.result:" + serpData.result);

  let cleanedUpAnswer = serpData.result;
  // remove outer quotes from the answer
  if (cleanedUpAnswer.startsWith('"') && cleanedUpAnswer.endsWith('"')) {
    cleanedUpAnswer = cleanedUpAnswer.substring(1, cleanedUpAnswer.length - 1);
  }
  // replace middle dots with commas
  cleanedUpAnswer = cleanedUpAnswer.replace(/·/g, ',');

  // Begin using the correctStandardLanguage function when it works properly.
  retFulfillment = cleanedUpAnswer;
  /*
  let correctedStdLang = await correctStandardLanguage(cleanedUpAnswer, lang);
  console.log("correctedStdLang:" + correctedStdLang);
  retFulfillment = correctedStdLang;
   */

  return retFulfillment;
}