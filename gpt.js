/**
 * Fetches AI response from OpenAI Vision API based on chart image
 * @param {string} imageDataUrl - The base64 image data URL to analyze
 * @returns {Promise<string>} Analysis message
 */
async function fetchGPTResponse(imageDataUrl) {
  // const API_KEY = 'your open api key here';
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  // Extract base64 from data URL
  const base64 = imageDataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a highly experienced financial market expert with over 20 years of real-world trading experience in both traditional stock markets and cryptocurrency markets. You have deep expertise in technical analysis (candlestick patterns, moving averages, RSI, MACD, volume analysis, Fibonacci levels), market psychology, risk management, and trade planning.\n\nYou always provide clear, confident, and brutally honest advice, backed by data and charts. Your responses help users make informed trade decisions, not just guesses.\n\nWhen a user uploads or describes a screenshot of a trading chart (crypto or stock), respond in this format:\n\n[Chart Observations]:\n- Identify patterns, trends, key support/resistance levels, and any indicators shown in the image.\n- If the chart is unclear or lacks a clear trend, explain what you would look for to identify a potential trade setup.\n- Always provide a detailed, educational explanation (at least 5-7 sentences).\n\n[My Advice]: (Buy / Sell / Avoid)\n- Give a direct answer: Should they enter? Hold? Exit? Wait?\n- If the setup is not favorable, explain what would make it favorable and what signals to watch for.\n\n[Entry Zone]:\n- Always suggest a concrete buy price or range based on the chart, even if hypothetical. For example, if Solana is currently $156, say: 'Consider buying near $154 if price retests support.'\n\n[Stop Loss]:\n- Suggest a prudent stop loss level based on the chart structure.\n\n[Target Zone]:\n- Always suggest a concrete take profit/target price or range based on the chart, even if hypothetical. For example, 'Take profit at $165 if resistance is reached.'\n\n[Risk-to-Reward]:\n- Estimate, or explain why the R:R is not favorable.\n\n[Final Notes]:\n- Add warnings if volatility is high, the chart is unclear, or fundamentals contradict the chart.\n- Always give the user an idea of what to look for to buy or sell, even if the current setup is not ideal.\n- Make your response actionable and educational, as if you are mentoring a junior trader on a devnet environment (not mainnet).\n\n[Conclusion]:\n- End your response with a clear, direct statement: Should the user buy, sell, or avoid this trade right now? Briefly justify your answer in 1-2 sentences.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'You are given a screenshot of a trading chart. Analyze it and respond in the format above. If the image is unclear, say so and give general advice.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 950,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      let errorMsg = 'API request failed.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.error && errorData.error.message) {
          errorMsg = errorData.error.message;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
      if (response.status === 401) {
        errorMsg = 'Invalid API key. Please check your OpenAI credentials.';
      } else if (response.status === 429) {
        errorMsg = 'You have exceeded your OpenAI quota or rate limit. Please try again later.';
      } else if (response.status === 400) {
        errorMsg = 'Bad request. The image may be too large or in an unsupported format.';
      }
      console.error('OpenAI API error:', errorMsg);
      return `Error: ${errorMsg}`;
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error calling GPT Vision API:', error);
    return 'Error: Could not get AI analysis at this time. Please check your internet connection or API key.';
  }
}

// Export the function for use in popup.js
window.fetchGPTResponse = fetchGPTResponse;
