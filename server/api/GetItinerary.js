import OpenAI from "openai";
import { requireUser } from "../auth/session.js";

const openai = new OpenAI();

export default defineEventHandler(async (event) => {
  await requireUser(event); // spends OpenAI credits: signed-in users only (the check sits outside the try on purpose)
  try {
    const query = getQuery(event);
    console.log("days");
    console.log(query.days);

    let promptText = `Make me a ${query.days} day long vacation itinerary in ${query.destination} with the names of destinations and places to eat for each day and with these preferences in mind: `;
    if (query.selectedPreferences) {
      const preferencesArray = query.selectedPreferences.split(',');
      const preferencesText = preferencesArray.join(', ');
      promptText += preferencesText;
      promptText += ' . Also at the end of each day can you provide the coordinates [longitude FIRST, then latitude] for each destination, example: Big Ben [-0.1246, 51.5007]. Put the coordinates in [] and separate them by ,. Also each time you mention a name of a destination with coordinates please repeat that name and put it in {} brackets after the original name so it looks like this - Eiffel Tower {Eiffel Tower}. If there are 7 coordinates for the given day I need 7 names of destinations. This is an example of how a single destination from a day should look like: 1. Rijksmuseum {Rijksmuseum} [4.8852, 52.3590] Start your day by visiting the Rijksmuseum. This expansive museum is home to thousands of art pieces, including works by Rembrandt and Vermeer. Please DONT give a separate Coordinates section after each Day';
    } else {
      promptText += 'No specific preferences';
      promptText += ' . Also at the end of each day can you provide the coordinates [longitude FIRST, then latitude] for each destination, example: Big Ben [-0.1246, 51.5007]. Put the coordinates in [] and separate them by ,. Also each time you mention a name of a destination with coordinates please repeat that name and put it in {} brackets after the original name so it looks like this - Eiffel Tower {Eiffel Tower}. If there are 7 coordinates for the given day I need 7 names of destinations. This is an example of how a single destination from a day should look like: 1. Rijksmuseum {Rijksmuseum} [4.8852, 52.3590] Start your day by visiting the Rijksmuseum. This expansive museum is home to thousands of art pieces, including works by Rembrandt and Vermeer. Please DONT give a separate Coordinates section after each Day';
    }
    console.log(promptText);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      temperature: 0.2,
      messages: [
        { role: "user", content: promptText }
      ]
    });

    const result = completion.choices[0].message.content.trim();

    // Remove all "#" and "*" signs from the result
    const cleanedResult = result.replace(/[#*]/g, '');

    console.log(cleanedResult);
    return cleanedResult;
  } catch (error) {
    console.error('Error:', error.message);
    return error.message;
  }
});
