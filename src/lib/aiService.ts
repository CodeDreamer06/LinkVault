// src/lib/aiService.ts

// Helper function to call the AI endpoint for tag suggestions

interface AISuggestionResponse {
    // Define the expected structure based on Cably AI response for chat completions
    // Assuming it's similar to OpenAI's:
    choices: Array<{
        message: {
            role: string;
            content: string; // We expect the content to be comma-separated tags
        };
        // ... other potential fields
    }>;
    // ... other potential top-level fields
}

export async function suggestTagsFromText(text: string): Promise<string[]> {
    // Basic check for empty input
    if (!text.trim()) {
        return [];
    }

    // Get API credentials from environment variables (ensure they are available server-side or passed correctly)
    // For client-side usage, these NEED to be NEXT_PUBLIC_ if called directly from the browser.
    // If called from an API route, server-side variables are fine.
    // --> Let's assume for now we'll call this from an API route eventually, but use public vars for initial test.
    const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL; 
    const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY; // Needs NEXT_PUBLIC_ prefix

    if (!apiUrl || !apiKey) {
        console.error("AI API URL or Key is not configured in environment variables.");
        // Return empty or throw error, depending on desired handling
        return []; 
    }

    // Construct the prompt for the AI
    const prompt = `Given the following text content from a web link (could be title, description, or fetched content), suggest 5-7 relevant, single-word or two-word (lowercase) tags, separated by commas. Only return the comma-separated tags and nothing else.

Text Content:
"${text}"

Suggested Tags:`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Or another suitable model available at Cably
                messages: [
                    { role: "system", content: "You are an assistant that suggests relevant tags for web links." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 50, // Limit response length
                temperature: 0.5, // Adjust creativity/determinism
                n: 1, // Number of choices
                stop: null // No specific stop sequence needed here
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`AI API request failed with status ${response.status}:`, errorBody);
            throw new Error(`AI API request failed: ${response.statusText}`);
        }

        const data: AISuggestionResponse = await response.json();

        // Extract the tags from the response content
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            const content = data.choices[0].message.content.trim();
            // Split by comma, trim whitespace, filter empty strings, convert to lowercase
            const tags = content.split(',')
                                .map(tag => tag.trim().toLowerCase())
                                .filter(tag => tag !== '' && tag.length > 0);
            return tags;
        } else {
            console.warn("AI response structure might be different or empty.", data);
            return [];
        }

    } catch (error) {
        console.error("Error calling AI for tag suggestions:", error);
        return []; // Return empty array on error
    }
} 