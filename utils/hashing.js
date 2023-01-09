const crypto = require("crypto");
module.exports = (url) => {
  //produce a 64-character hexadecimal string that represents the SHA-256 hash of the long URL.
  const hash = crypto.createHash("sha256").update(url).digest("hex");
  //   console.log(hash);
  const uniqueKey = Date.now();
  //   use timestamp unique identifier to avoid collisions
  const new_url = url + uniqueKey;
  //   console.log(new_url);
  //   const hash2 = crypto.createHash("sha256").update(new_url).digest("hex");
  //   console.log(hash2);
  //   base 64 encoding to convert the hash into a shorter, fixed-length
  const b64 = Buffer.from(hash, "utf8").toString("base64");
  //   const b642 = Buffer.from(hash2, "utf8").toString("base64");
  console.log(b64.substring(0, 7));
  //   console.log(b642.substring(0, 7));

  return b64.substring(0, 7);
};
