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

// TODO: Consider deleting this function, since it's not used.
async function ascertainSubject(textToExamine) {
  // Try to extract the subject from the current conversation state.
  let subjectPrompt = "What is the subject of the following sentence:\n" +
      "\n" +
      "Text: Indianapolis is the capital of Indiana\n" +
      "Subject: Indianapolis\n" +
      "\n" +
      // "Text: King Charles III is the King of England\n" +
      // "Subject: King Charles III\n" +
      // "\n" +
      "Text:";

  const responseSubject = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      convText: subjectPrompt + textToExamine + "\nSubject:",
      useCustomPrompt: false,
      hallucinateSubject: true
    })
  });
  const dataSubject = await responseSubject.json();
  let subject = dataSubject.result.trim();
  if (subject.startsWith("The subject of the sentence is ")) {
    subject = subject.substring("The subject of the sentence is ".length);
  }
  // replace all quotes with empty string


  console.log("SUBJECT:" + subject);
  return subject;
}

// TODO: Make this work more consistently
export async function correctStandardLanguage(textToCorrect, lang) {
  // Try to extract the subject from the current conversation state.
  let langStr = "English";
  if (lang.startsWith("es")) {
    langStr = "Spanish";
  }
  else if (lang.startsWith("fr")) {
    langStr = "French";
  }
  else if (lang.startsWith("ja")) {
    langStr = "Japanese";
  }
  let subjectPrompt = "Correct this to standard " + langStr + ":\n" +
      "\n";

  const responseCorrected = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      convText: subjectPrompt + textToCorrect.trim(),
      useCustomPrompt: false,
      correctStandardLang: true
    })
  });
  const dataCorrected = await responseCorrected.json();
  let corrected = dataCorrected.result.trim();
  console.log("CORRECTED:" + corrected);

  if (corrected == "") {
    console.log("Restoring original text since corrected text is empty.");
    corrected = textToCorrect;
  }
  return corrected;
}

export async function composeQuestionFromConversation(conversationText) {
  // Try to create a complete question from the current conversation state.
  let prompt = "How should Human rephrase the final question of the following conversation to supply complete context?\n" +
      "\n";

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      convText: prompt + conversationText + "\n\nQuestion:",
      useCustomPrompt: false,
      composeQuestion: true
    })
  });
  const dataQuestion = await response.json();
  let question = dataQuestion.result.trim();

  console.log("COMPLETE QUESTION:" + question);
  return question;
}
