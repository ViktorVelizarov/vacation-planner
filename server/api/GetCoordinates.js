import { requireUser } from '../auth/session.js'

export default defineEventHandler(async (event) => {
    await requireUser(event) // spends OpenAI credits: signed-in users only (outside the try on purpose)
    try {
      const query = getQuery(event)
      let promptText = `Give me the coordinates(Longitude, Latitude) for all the destinations from this text in day number ${query.dayNum} seperated by a / .Here is the text:   `;
      console.log(promptText);
  
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-instruct",
          prompt: promptText,
          temperature: 1,
          max_tokens: 3886,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        })
      });
  
  
      const data = await response.json();
      const result = data.choices[0].text.trim();
      console.log( result)
      return result
    } catch (error) {
      console.error('Error:', error.message);
      return error.message
    }
  })