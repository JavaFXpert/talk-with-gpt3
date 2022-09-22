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

// TODO: Make this warning go away:
//  API resolved without sending a response for /api/serpapi, this may result in stalled requests.

const SerpApi = require('google-search-results-nodejs');

export default async function (req, res) {
  console.log("req.body.question:" + req.body.question);
  const search = new SerpApi.GoogleSearch(process.env.SERPAPI_KEY);

  const params = {
    engine: "google",
    safe: "active",
    q: req.body.question,
    google_domain: "google.com",
    gl: "us",
    hl: req.body.lang.substring(0, 2),
    location: "Grant County, Indiana, United States"
  };

  const callback = await function(data) {
    //console.log(data);
    let answer = "";
    if (data.search_metadata && data.search_metadata.status &&
        data.search_metadata.status == "Success") {
      if (req.body.intent == "AskForCurrentInfoIntent") {
        if (data.answer_box && data.answer_box.answer) {
          answer = data.answer_box.answer;
        }
        else if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }
      else if (req.body.intent == "AskDateIntent" ||
          req.body.intent == "AskTimeIntent") {
        if (data.answer_box && data.answer_box.answer) {
          answer = data.answer_box.answer;
        }
        else if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }
      else if (req.body.intent == "AskTemperatureIntent") {
        if (data.answer_box && data.answer_box.temperature && data.answer_box.unit) {
          answer = data.answer_box.temperature + " " + data.answer_box.unit;
        }
      }
      else if (req.body.intent == "AskWeatherIntent") {
        if (data.answer_box &&
            data.answer_box.temperature &&
            data.answer_box.unit &&
            data.answer_box.weather) {
          answer = data.answer_box.weather + ", " + data.answer_box.temperature + " " + data.answer_box.unit;
        }
        else if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }
      else if (req.body.intent == "AskNewsIntent") {
        if (data.top_stories &&
            data.top_stories.length > 0) {
          // iterate over all of the stories
          answer = "";
          for (let i = 0; i < data.top_stories.length; i++) {
            if (data.top_stories[i].title) {
              answer += data.top_stories[i].title + ". \n";
            }
          }
        }
      }
      else if (req.body.intent == "AskStockPriceIntent") {
        if (data.answer_box && data.answer_box.title &&
            data.answer_box.stock && data.answer_box.price && data.answer_box.currency) {
          answer = data.answer_box.title + ", " + data.answer_box.stock + ", " +
              data.answer_box.price + " " + data.answer_box.currency;
          if (data.answer_box.price_movement && data.answer_box.price_movement.movement &&
              data.answer_box.price_movement.percentage && data.answer_box.price_movement.date) {
            answer += ", " + data.answer_box.price_movement.movement + " " +
                data.answer_box.price_movement.percentage + "% " + data.answer_box.price_movement.date;
          }
        }
      }
      else if (req.body.intent == "AskPopulationIntent") {
        if (data.answer_box && data.answer_box.answer) {
          answer = data.answer_box.answer;
        }
        else if (data.answer_box && data.answer_box.population && data.answer_box.year) {
          answer = data.answer_box.population + " (" + data.answer_box.year + ")";
        }
      }
      else if (req.body.intent == "AskAgeIntent") {
        if (data.answer_box && data.answer_box.answer) {
          answer = data.answer_box.answer;
        }
        else if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }
      else if (req.body.intent == "AskFullMoonIntent") {
        if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet_highlighted_words.length > 0) {
            answer = data.organic_results[0].snippet_highlighted_words[0];
          }
          else if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }
      else if (req.body.intent == "CalculateIntent") {
        if (data.answer_box && data.answer_box.type && data.answer_box.result) {
          answer = data.answer_box.result;
        }
      }
      else if (req.body.intent == "AskDistanceIntent") {
        if (data.answer_box) {
          if (data.answer_box.answer) {
            answer = data.answer_box.answer;
          }
          else if (data.answer_box.routes &&
              data.answer_box.routes.length > 0) {
            answer = data.answer_box.routes[0].summary;
          }
        }
        else if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }
      else if (req.body.intent == "AskTravelTimeIntent") {
        if (data.answer_box) {
          if (data.answer_box.answer) {
            answer = data.answer_box.answer;
          }
          else if (data.answer_box.routes &&
              data.answer_box.routes.length > 0) {
            answer = data.answer_box.routes[0].summary;
          }
          else if (data.answer_box.snippet) {
            answer = data.answer_box.snippet;
          }
        }
        else if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }
      else if (req.body.intent == "AskBusinessIntent") {
        if (data.answer_box && data.answer_box.answer) {
          answer = data.answer_box.answer;
        }
        else if (data.local_results && data.local_results.places &&
            data.local_results.places.length > 0) {
          // iterate over all of the places
          answer = "";
          for (let i = 0; i < data.local_results.places.length; i++) {
            if (data.local_results.places[i].title) {
              answer += data.local_results.places[i].title + ". \n";
            }
          }
        }
        else if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }

      // If no answer found, check the generic elements
      if (answer.trim() == "") {
        if (data.answer_box && data.answer_box.answer) {
          answer = data.answer_box.answer;
        }
        else if (data.organic_results &&
            data.organic_results.length > 0) {
          if (data.organic_results[0].snippet) {
            answer = data.organic_results[0].snippet;
          }
        }
      }
    }

    console.log("answer: " + answer);
    res.status(200).json({ result: answer});
  };

  // Show result as JSON
  search.json(params, callback);
}
