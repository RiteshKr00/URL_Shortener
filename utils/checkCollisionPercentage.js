const hashing = require("./hashing");

module.exports = () => {
  const numUrls = 100000; // Number of long URLs to generate
  const shortUrlLength = 7; // Desired length of shortened URLs

  let collisionCount = 0; // Counter for number of collisions
  const urlMap = new Map(); // Map to store shortened URLs

  for (let i = 0; i < numUrls; i++) {
    // Generate a long URL
    const longUrl =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const shortUrl = hashing(longUrl);
    if (urlMap.has(shortUrl)) {
      collisionCount++;
    } else {
      // If it doesn't exist, add it to the map
      urlMap.set(shortUrl, longUrl);
    }
  }
  const collisionPercentage = (collisionCount / numUrls) * 100;
  console.log(`Collision percentage: ${collisionPercentage}%`);
};
