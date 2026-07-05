import "dotenv/config";

// Function to send a user's message to the Gemini API
const getGeminiAPIResponse = async (message) => {
    try {
        // Send a POST request to the Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.Gemini_API_Key}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                // Request body in Gemini format
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: message
                                }
                            ]
                        }
                    ]
                })
            }
        );

        // Convert the response into JSON
        const data = await response.json();

        // If the API returns an error
        if (!response.ok) {
            console.log(data);
            return "Something went wrong while contacting Gemini.";
        }

        // Extract Gemini's reply
        return (
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response generated."
        );

    } catch (err) {
        console.error(err);
        return "Internal Server Error";
    }
};

export default getGeminiAPIResponse;