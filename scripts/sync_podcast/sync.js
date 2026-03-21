// Sync podcast episodes from RSS feed to content/fec markdown files.
//
// Usage:
//   node sync.js [contentDir]

import { XMLParser } from "fast-xml-parser";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RSS_URL = "https://anchor.fm/s/4c31b3c4/podcast/rss";
const AUTHORS = `["Denis Souron", "Benjamin Auzanneau"]`;
const CREDITS_EN = "Credits music : Welcome to Legacy by Benjamin Auzanneau";
const CREDITS_FR = "Musique du générique : Welcome to Legacy par Benjamin Auzanneau";
const DEFAULT_TAGS = ["Frontend", "Podcast"];

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONTENT_DIR = join(__dirname, "..", "..", "content", "fec");

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  cdataPropName: "__cdata",
  isArray: (_name, jpath) => jpath === "rss.channel.item",
  parseAttributeValue: false,
  trimValues: true,
});

// Parse an RSS feed XML string and return an array of episode objects.
// Each episode has: number, title, pubDate (Date), spotifyId, description, links (string[]).
export function parseRSSFeed(xmlContent) {
  const doc = xmlParser.parse(xmlContent);
  const items = doc?.rss?.channel?.item ?? [];

  return items.flatMap((item) => {
    const title = str(item.title).trim();
    const epNum = extractEpisodeNumber(title);
    if (!epNum) return [];

    const pubDate = parsePubDate(str(item.pubDate));
    if (!pubDate) {
      console.error(`Warning: could not parse date for episode "${title}"`);
      return [];
    }

    const htmlDesc = str(item["content:encoded"] ?? item.description ?? "");

    return [
      {
        number: epNum,
        title,
        pubDate,
        spotifyId: extractSpotifyID(item),
        description: extractDescriptionText(item),
        links: extractLinksFromHTML(htmlDesc),
      },
    ];
  });
}

// Returns the set of episode numbers already present in contentDir.
export async function existingEpisodeNumbers(contentDir) {
  const RE_EXIST = /^\d{4}-\d{2}-\d{2}-fec-(\d+)\.md$/;
  let entries;
  try {
    entries = await readdir(contentDir);
  } catch (err) {
    if (err.code === "ENOENT") return new Set();
    throw err;
  }
  const nums = new Set();
  for (const name of entries) {
    const m = RE_EXIST.exec(name);
    if (m) nums.add(parseInt(m[1], 10));
  }
  return nums;
}

// Sync podcast episodes from an RSS feed URL to contentDir.
// Returns number of new markdown files created.
export async function syncEpisodes(contentDir, rssUrl) {
  console.log(`Fetching RSS feed from ${rssUrl} ...`);
  const resp = await fetch(rssUrl);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${rssUrl}`);
  const xml = await resp.text();
  return syncEpisodesFromXML(contentDir, xml);
}

// Sync podcast episodes from raw RSS XML content to contentDir.
// Returns number of new markdown files created (EN + FR count separately).
export async function syncEpisodesFromXML(contentDir, xmlContent) {
  const episodes = parseRSSFeed(xmlContent);
  console.log(`Found ${episodes.length} episodes in RSS feed.`);

  const existing = await existingEpisodeNumbers(contentDir);
  console.log(`Found ${existing.size} existing episodes in ${contentDir}.`);

  await mkdir(contentDir, { recursive: true });

  let newCount = 0;
  for (const ep of episodes) {
    if (existing.has(ep.number)) continue;

    const dateStr = formatDate(ep.pubDate);
    const baseName = `${dateStr}-fec-${ep.number}`;

    await writeFile(join(contentDir, `${baseName}.md`), buildEnMarkdown(ep));
    console.log(`Created ${baseName}.md`);

    await writeFile(join(contentDir, `${baseName}.fr.md`), buildFrMarkdown(ep));
    console.log(`Created ${baseName}.fr.md`);

    newCount += 2;
  }

  return newCount;
}

// Build the English markdown content for an episode.
export function buildEnMarkdown(ep) {
  const tags = DEFAULT_TAGS.map((t) => `"${t}"`).join(", ");
  const lines = [
    `+++`,
    `title = "${escapeTOMLString(ep.title)}"`,
    `authors = ${AUTHORS}`,
    ``,
    `[taxonomies]`,
    `tags = [${tags}]`,
    `+++`,
    ``,
    ep.description,
    ``,
    `<!-- more -->`,
    ``,
    `_This is a french podcast without translation and transcription._`,
  ];
  if (ep.spotifyId) {
    lines.push(``, `{{ spotify(id="${ep.spotifyId}") }}`);
  }
  if (ep.links.length > 0) {
    lines.push(``, `Episode Notes :`, ``);
    lines.push(...ep.links);
  }
  lines.push(``, CREDITS_EN, ``);
  return lines.join("\n");
}

// Build the French markdown content for an episode.
export function buildFrMarkdown(ep) {
  const tags = DEFAULT_TAGS.map((t) => `"${t}"`).join(", ");
  const lines = [
    `+++`,
    `title = "${escapeTOMLString(ep.title)}"`,
    `authors = ${AUTHORS}`,
    ``,
    `[taxonomies]`,
    `tags = [${tags}]`,
    `+++`,
    ``,
    ep.description,
    ``,
    `<!-- more -->`,
  ];
  if (ep.spotifyId) {
    lines.push(``, `{{ spotify(id="${ep.spotifyId}") }}`);
  }
  if (ep.links.length > 0) {
    lines.push(``, `Notes de l'épisode :`, ``);
    lines.push(...ep.links);
  }
  lines.push(``, CREDITS_FR, ``);
  return lines.join("\n");
}

// --- Internal helpers ---

function str(val) {
  if (!val) return "";
  if (typeof val === "object" && val.__cdata !== undefined) return String(val.__cdata);
  return String(val);
}

function extractEpisodeNumber(title) {
  const m = /^#(\d+)/.exec(title.trim());
  return m ? parseInt(m[1], 10) : 0;
}

function extractSpotifyID(item) {
  const uri = str(item["spotify:episodeUri"]);
  if (uri) {
    const m = /spotify:episode:([A-Za-z0-9]+)/.exec(uri);
    if (m) return m[1];
  }
  const link = str(item.link);
  if (link) {
    const m = /open\.spotify\.com\/episode\/([A-Za-z0-9]+)/.exec(link);
    if (m) return m[1];
  }
  const guid = str(
    typeof item.guid === "object" ? item.guid["#text"] ?? item.guid : item.guid
  );
  if (guid) {
    const m = /spotify:episode:([A-Za-z0-9]+)/.exec(guid);
    if (m) return m[1];
  }
  return "";
}

function parsePubDate(s) {
  s = s.trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function extractDescriptionText(item) {
  const summary = str(item["itunes:summary"]).trim();
  if (summary) return summary;
  const subtitle = str(item["itunes:subtitle"]).trim();
  if (subtitle) return subtitle;
  const desc = str(item.description);
  if (desc) return extractParagraphText(desc);
  return "";
}

// Extract plain text from an HTML string by discarding everything inside < > delimiters
// and normalising HTML entities. This approach avoids regex-based tag stripping, which
// can be incomplete for adversarial inputs.
function htmlToText(html) {
  let out = "";
  let inTag = false;
  for (const ch of html) {
    if (ch === "<") {
      inTag = true;
    } else if (ch === ">") {
      inTag = false;
      out += " ";
    } else if (!inTag) {
      out += ch;
    }
  }
  return unescapeHTML(out).replace(/\s+/g, " ").trim();
}

function extractParagraphText(rawHTML) {
  const reParagraph = /<p[^>]*?>([\s\S]*?)<\/p>/gi;
  const reAnchorTag = /<a[\s\S]*?<\/a>/gi;
  const reMultiSpace = /\s+/g;

  const parts = [];
  let m;
  reParagraph.lastIndex = 0;
  while ((m = reParagraph.exec(rawHTML)) !== null) {
    const text = htmlToText(m[1].replace(reAnchorTag, ""));
    if (text) parts.push(text);
  }
  if (parts.length > 0) return parts.join(" ");
  return htmlToText(rawHTML.replace(reAnchorTag, "").replace(reMultiSpace, " ").trim());
}

function extractLinksFromHTML(rawHTML) {
  const reLinkTag = /<a\s[^>]*?href=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/a>/gi;

  const seen = new Set();
  const results = [];
  let m;
  reLinkTag.lastIndex = 0;
  while ((m = reLinkTag.exec(rawHTML)) !== null) {
    const href = m[1];
    if (!href.startsWith("http")) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    const linkText = htmlToText(m[2]);
    if (linkText && linkText.toLowerCase() !== href.toLowerCase()) {
      results.push(`- ${linkText}: ${href}`);
    } else {
      results.push(`- ${href}`);
    }
  }
  return results;
}

function unescapeHTML(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// Escape a string for use inside a TOML basic string (double-quoted).
// Handles backslash, double quote, and common control characters.
function escapeTOMLString(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function formatDate(d) {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

// --- Entry point ---

if (resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const contentDir = process.argv[2] ?? DEFAULT_CONTENT_DIR;
  const count = await syncEpisodes(contentDir, RSS_URL);
  if (count === 0) {
    console.log("No new episodes found.");
  } else {
    console.log(`Created ${count} new markdown files.`);
  }
}
