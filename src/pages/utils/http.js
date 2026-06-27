export const safeJson = async (response) => {
  try {
    const text = await response.text();
    if (!text || text.trim() === "") return [];
    return JSON.parse(text);
  } catch (err) {
    console.error("JSON Parse Error:", err);
    return [];
  }
};