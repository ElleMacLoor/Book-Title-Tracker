import fs from "fs";

const ASINS = JSON.parse(fs.readFileSync("data/asins.json", "utf8"));
const historyPath = "data/ranks.json";

let history = [];
if (fs.existsSync(historyPath)) {
  history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
}

function extractBestSellerRank(html) {
  const match = html.match(/Best Sellers Rank:[\s\S]*?#([\d,]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

async function fetchRank(item) {
  console.log(`Fetching: ${item.title} - ${item.url}`);

  const res = await fetch(item.url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  console.log(`Status for ${item.title}: ${res.status}`);

  const html = await res.text();
  const rank = extractBestSellerRank(html);

  console.log(`Rank found for ${item.title}: ${rank}`);

  return rank;
}

const today = new Date().toISOString().slice(0, 10);

for (const item of ASINS) {
  const rank = await fetchRank(item);

  history.push({
    date: today,
    title: item.title,
    asin: item.asin,
    rank
  });
}

fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

console.log("Updated ranks.json");
