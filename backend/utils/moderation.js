const { OpenAI } = require("openai");
const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
const openai = hasOpenAIKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function moderateContent(text) {
  if (!hasOpenAIKey) {
    // In absence of a key, skip moderation gracefully (treat as not flagged)
    return { flagged: false, categories: {}, category_scores: {} };
  }
  try {
    const response = await openai.moderations.create({ input: text });
    const result = response.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories,
      category_scores: result.category_scores,
    };
  } catch (err) {
    throw new Error("Moderation API error");
  }
}

module.exports = { moderateContent };
