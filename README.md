# Talk w/GPT-3 app: Getting started

The **Talk w/GPT-3** application was developed by [James L. Weaver](https://github.com/JavaFXpert)  (the author of this document) to get more new language speaking and listening practice. This application is open source, Apache 2.0 licensed, and leverages the following technologies:

- **Application framework:** [Next.js](https://nextjs.org/) with [React](https://reactjs.org/)
- **Large language model:** GPT-3 from [OpenAI](https://openai.com/) 
- **Voice speech to text:** [react-speech-recognition](https://www.npmjs.com/package/react-speech-recognition) React library. This library requires using a Chrome browser, or using a polyfill.
- **Voice text to speech:** [Amazon Polly](https://aws.amazon.com/polly/)
- **Animated speaking avatars:** [Ex-Human](https://exh.ai/) Talking Heads

This is a "bring your own keys" application, so you'll need keys for OpenAI, Amazon Polly, and optionally Ex-Human. Follow the instructions below to try the **Talk w/GPT-3** application out for yourself.

## Setup

1. If you don’t have Node.js installed, [install it from here](https://nodejs.org/en/)

2. Clone this repository

3. Navigate into the project directory

   ```bash
   $ cd talk-with-gpt3
   ```

4. Install the requirements

   ```bash
   $ npm install
   ```

5. Make a copy of the example environment variables file

   ```bash
   $ cp .env.example .env
   ```

6. Add your OpenAI [API key](https://beta.openai.com/account/api-keys) to the newly created `.env` file

7. Add your [Amazon Polly](https://aws.amazon.com/polly/) keys, and optionally your [Ex-Human](https://exh.ai/) token, to the app. This will require editing index.js and either supplying the keys/token directly where indicated, or using environment variables.

8. Create an optimized production build of the app

   ```bash
   $ npm run build
   ```

9. Start the application as a local server

   ```bash
   $ npm start
   ```

10. Access the app at [http://localhost:3000](http://localhost:3000) from a Chrome browser.

The app should appear as shown in the following image:

![talk_gpt3_initial_ui](readme_images/talk_gpt3_initial_ui.png)

As the image indicates, you'll initially be speaking English with a 30 year old male character named Matthew.

## Using the Talk w/GPT-3 app

### Toggling the microphone on/off

The microphone is off when the app first appears, so click the muted microphone icon to toggle it on. In addition to the microphone icon changing appearance, the current character's voice should announce that the microphone is on. To turn it back off, click the microphone icon again.

### Toggling the character's awake/asleep state

When the microphone is on, the voice speech to text facility processes what is heard, but the resultant text is only sent to GPT-3 when the character is awake. Consequently, the character only responds when awake. To make the character go to sleep, either click the **awake/asleep** icon, or say "go to sleep", "ve a dormir", "va te coucher", or "寝て", in English, Spanish, French or Japanese, respectively. To make the character wake up, either click the **awake/asleep** icon, or say "wake up", "despierta", "réveillez-vous", or "起きて", in English, Spanish, French or Japanese, respectively.

**Note:** The author is only proficient at speaking English, so please do create a GitHub issue that points out more natural ways to say any of the non-English phrases in this document.

### Selecting a practice language

To select a language other than English to practice, either choose it from the leftmost dropdown, or say "let's switch to X" where X is your desired language. Languages supported currently include English, Spanish, French and Japanese. To switch back to English, either use the dropdown or say "cambiemos a inglés", "passons à l'anglais", or "英語に切り替えましょう", in Spanish, French or Japanese, respectively.

### Selecting a character

There are multiple characters available for each language, with various genders and default ages. To choose a character, use the middle dropdown. Some characters (**Hiroto** and **Masahiro**) have animated avatars, as noted by **[animated]** after the character's name. You'll need to acquire and setup an [Ex-Human](https://exh.ai/) token in order to use these characters. The following image shows the Masahiro animated avatar having a conversation with a user.

![](readme_images/masahiro_ja_conversation.png)

### Changing a character's age

The age of a character is included in the GPT-3 prompt, and often affects their responses. To temporarily change a characters age, select an age from the rightmost dropdown. This may be leveraged, for example, by a language learner to attempt to constrain the character's responses to more commonly used words.

### Conversing with a character

To converse with a character, speak using the selected language.  Alternatively, type into the text box at the bottom of the app and either press the **enter** key or click the **Send** button. As shown in the previous image, the scrollable text area in the center of the app displays the initial GPT-3 prompt as well as the conversation so far. Each time you take a turn, the contents of the text area plus what you just said is sent as the next prompt to GPT-3.

#### Repeating the character's most recent utterance

To ask the character to repeat their most recent utterance, say "repeat", "repetir", "répéter" or "もう一度", in English, Spanish, French or Japanese, respectively.

#### Translating the character's most recent utterance to English

To ask the character to translate their most recent utterance to English, say "translate", "traduce", "traduire" or "翻訳して", in English, Spanish, French or Japanese, respectively.

#### Erasing a conversation

A conversation is automatically erased from the app when changing languages, characters, or ages. To erase a conversation in place, say "erase the conversation", "borrar la conversación", "effacer la conversation" or "会話を消去して", in English, Spanish, French or Japanese, respectively.

### OpenAI GPT-3 prompt and parameters used 

As discussed earlier, the prompt sent to the GPT-3 completions API is what is seen in the application's conversation text area. The GPT-3 parameters set by this application are as follows:

```
model: "text-davinci-002",
prompt: req.body.convText,
temperature: 0.7,
frequency_penalty: 1.6,
presence_penalty: 0.6,
max_tokens: 250
```

### Exiting the application

To exit the application, close the Chrome browser tab, and then type **ctrl-C** at the command prompt in which you invoked `npm start`. 

It is my hope that this application helps you and I become more proficient at listening and speaking languages that we are trying to learn!
