// Black-box unit tests for the podcast RSS sync script.
//
// Tests treat syncEpisodesFromXML as a black box: given an RSS XML feed and a
// content directory, verify what markdown files are created (or not created).
// No implementation internals are tested.
//
// Run with: node --test

import { test, describe, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { syncEpisodesFromXML } from "./sync.js";

const REAL_CONTENT_DIR = fileURLToPath(new URL("../../content/fec", import.meta.url));

// A realistic RSS feed for one brand-new episode not present in existing content.
const RSS_ONE_NEW_EPISODE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:spotify="http://www.spotify.com/ns/rss"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Front-End Chronicles</title>
    <item>
      <title>#99 - The Future of Frontend Testing</title>
      <pubDate>Fri, 15 Nov 2024 10:00:00 +0000</pubDate>
      <itunes:summary>A deep dive into modern frontend testing strategies.</itunes:summary>
      <spotify:episodeUri>spotify:episode:FutureTestingEP99ABC</spotify:episodeUri>
      <content:encoded><![CDATA[<p>A deep dive into modern frontend testing strategies.</p><p><a href="https://vitest.dev">Vitest</a></p><p><a href="https://playwright.dev">Playwright</a></p>]]></content:encoded>
    </item>
  </channel>
</rss>`;

// A realistic RSS feed for two new episodes.
const RSS_TWO_NEW_EPISODES = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:spotify="http://www.spotify.com/ns/rss"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Front-End Chronicles</title>
    <item>
      <title>#99 - The Future of Frontend Testing</title>
      <pubDate>Fri, 15 Nov 2024 10:00:00 +0000</pubDate>
      <itunes:summary>A deep dive into modern frontend testing strategies.</itunes:summary>
      <spotify:episodeUri>spotify:episode:FutureTestingEP99ABC</spotify:episodeUri>
      <content:encoded><![CDATA[<p>A deep dive into modern frontend testing strategies.</p>]]></content:encoded>
    </item>
    <item>
      <title>#100 - Web Components in 2025</title>
      <pubDate>Fri, 10 Jan 2025 10:00:00 +0000</pubDate>
      <itunes:summary>Web Components are finally ready for production.</itunes:summary>
      <spotify:episodeUri>spotify:episode:WebComponents100XYZ</spotify:episodeUri>
      <content:encoded><![CDATA[<p>Web Components are finally ready for production.</p>]]></content:encoded>
    </item>
  </channel>
</rss>`;

// An RSS feed whose single item lacks an episode number in the title — should be skipped.
const RSS_NON_EPISODE_ITEM = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Front-End Chronicles</title>
    <item>
      <title>Bonus - Behind the scenes</title>
      <pubDate>Mon, 01 Apr 2024 09:00:00 +0000</pubDate>
      <itunes:summary>A special bonus episode with no number.</itunes:summary>
    </item>
  </channel>
</rss>`;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function makeTempDir() {
  return mkdtemp(join(tmpdir(), "fec-sync-test-"));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("podcast RSS sync — new episodes", () => {
  let dir;

  beforeEach(async () => {
    dir = await makeTempDir();
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test("creates one EN file and one FR file for a new episode", async () => {
    const count = await syncEpisodesFromXML(dir, RSS_ONE_NEW_EPISODE);
    assert.equal(count, 2, "expected 2 new files (EN + FR)");

    const files = await readdir(dir);
    const enFile = files.find((f) => f === "2024-11-15-fec-99.md");
    const frFile = files.find((f) => f === "2024-11-15-fec-99.fr.md");
    assert.ok(enFile, "EN file 2024-11-15-fec-99.md should be created");
    assert.ok(frFile, "FR file 2024-11-15-fec-99.fr.md should be created");
  });

  test("EN file has correct front matter, spotify embed, episode notes and credits", async () => {
    await syncEpisodesFromXML(dir, RSS_ONE_NEW_EPISODE);
    const content = await readFile(join(dir, "2024-11-15-fec-99.md"), "utf-8");

    assert.ok(content.includes('title = "#99 - The Future of Frontend Testing"'), "title");
    assert.ok(content.includes('authors = ["Denis Souron", "Benjamin Auzanneau"]'), "authors");
    assert.ok(content.includes('tags = ["Frontend", "Podcast"]'), "tags");
    assert.ok(content.includes("<!-- more -->"), "read-more separator");
    assert.ok(
      content.includes("_This is a french podcast without translation and transcription._"),
      "french-only disclaimer"
    );
    assert.ok(content.includes('{{ spotify(id="FutureTestingEP99ABC") }}'), "spotify embed");
    assert.ok(content.includes("Episode Notes :"), "episode notes section");
    assert.ok(content.includes("- Vitest: https://vitest.dev"), "Vitest link");
    assert.ok(content.includes("- Playwright: https://playwright.dev"), "Playwright link");
    assert.ok(
      content.includes("Credits music : Welcome to Legacy by Benjamin Auzanneau"),
      "EN credits"
    );
  });

  test("FR file has correct front matter, spotify embed, episode notes and credits", async () => {
    await syncEpisodesFromXML(dir, RSS_ONE_NEW_EPISODE);
    const content = await readFile(join(dir, "2024-11-15-fec-99.fr.md"), "utf-8");

    assert.ok(content.includes('title = "#99 - The Future of Frontend Testing"'), "title");
    assert.ok(content.includes('authors = ["Denis Souron", "Benjamin Auzanneau"]'), "authors");
    assert.ok(content.includes('tags = ["Frontend", "Podcast"]'), "tags");
    assert.ok(content.includes("<!-- more -->"), "read-more separator");
    assert.ok(
      !content.includes("_This is a french podcast without translation and transcription._"),
      "FR file must not contain the english-only disclaimer"
    );
    assert.ok(content.includes('{{ spotify(id="FutureTestingEP99ABC") }}'), "spotify embed");
    assert.ok(content.includes("Notes de l'épisode :"), "FR episode notes section");
    assert.ok(content.includes("- Vitest: https://vitest.dev"), "Vitest link");
    assert.ok(content.includes("- Playwright: https://playwright.dev"), "Playwright link");
    assert.ok(
      content.includes("Musique du générique : Welcome to Legacy par Benjamin Auzanneau"),
      "FR credits"
    );
  });

  test("creates files for every new episode in the feed", async () => {
    const count = await syncEpisodesFromXML(dir, RSS_TWO_NEW_EPISODES);
    assert.equal(count, 4, "expected 4 new files (2 episodes × EN + FR)");

    const files = await readdir(dir);
    assert.ok(files.includes("2024-11-15-fec-99.md"));
    assert.ok(files.includes("2024-11-15-fec-99.fr.md"));
    assert.ok(files.includes("2025-01-10-fec-100.md"));
    assert.ok(files.includes("2025-01-10-fec-100.fr.md"));
  });

  test("skips items that have no episode number in their title", async () => {
    const count = await syncEpisodesFromXML(dir, RSS_NON_EPISODE_ITEM);
    assert.equal(count, 0, "bonus items without an episode number must not create files");

    const files = await readdir(dir);
    assert.equal(files.length, 0, "content directory must remain empty");
  });
});

describe("podcast RSS sync — deduplication against existing content", () => {
  let dir;

  before(async () => {
    // Copy the real content/fec directory (episodes 1–18) into a temp dir
    // so every test in this suite starts with the existing episodes in place.
    dir = await makeTempDir();
    await cp(REAL_CONTENT_DIR, dir, { recursive: true });
  });

  after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test("does not create any files when all RSS episodes already exist", async () => {
    // RSS feed that only contains episode #1 which is already on disk.
    const rssWithExistingEpisode = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:spotify="http://www.spotify.com/ns/rss">
  <channel>
    <title>Front-End Chronicles</title>
    <item>
      <title>#1 - What's new since Angular 5 ?</title>
      <pubDate>Tue, 16 Feb 2021 00:00:00 +0000</pubDate>
      <itunes:summary>Angular episode summary.</itunes:summary>
      <spotify:episodeUri>spotify:episode:2Z8pAWsOzgFuR4aR6r0k2M</spotify:episodeUri>
    </item>
  </channel>
</rss>`;

    const filesBefore = await readdir(dir);
    const count = await syncEpisodesFromXML(dir, rssWithExistingEpisode);

    assert.equal(count, 0, "no files should be created for an already-existing episode");
    const filesAfter = await readdir(dir);
    assert.deepEqual(
      filesBefore.sort(),
      filesAfter.sort(),
      "existing files must be untouched"
    );
  });

  test("creates only the new episode when the feed mixes existing and new episodes", async () => {
    // RSS has episode #1 (exists) and #99 (new).
    const mixedRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:spotify="http://www.spotify.com/ns/rss"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Front-End Chronicles</title>
    <item>
      <title>#1 - What's new since Angular 5 ?</title>
      <pubDate>Tue, 16 Feb 2021 00:00:00 +0000</pubDate>
      <itunes:summary>Already present episode.</itunes:summary>
      <spotify:episodeUri>spotify:episode:2Z8pAWsOzgFuR4aR6r0k2M</spotify:episodeUri>
    </item>
    <item>
      <title>#99 - The Future of Frontend Testing</title>
      <pubDate>Fri, 15 Nov 2024 10:00:00 +0000</pubDate>
      <itunes:summary>A brand new episode.</itunes:summary>
      <spotify:episodeUri>spotify:episode:FutureTestingEP99ABC</spotify:episodeUri>
    </item>
  </channel>
</rss>`;

    const count = await syncEpisodesFromXML(dir, mixedRSS);
    assert.equal(count, 2, "only the new episode should produce 2 files (EN + FR)");

    const files = await readdir(dir);
    assert.ok(files.includes("2024-11-15-fec-99.md"), "new EN file created");
    assert.ok(files.includes("2024-11-15-fec-99.fr.md"), "new FR file created");

    // Verify the pre-existing episode #1 file was not modified.
    const ep1Content = await readFile(join(dir, "2021-02-16-fec-1.md"), "utf-8");
    const realEp1Content = await readFile(
      join(REAL_CONTENT_DIR, "2021-02-16-fec-1.md"),
      "utf-8"
    );
    assert.equal(ep1Content, realEp1Content, "existing episode #1 must be unchanged");

    // Cleanup the newly created files so they don't affect other tests in this suite.
    await rm(join(dir, "2024-11-15-fec-99.md"));
    await rm(join(dir, "2024-11-15-fec-99.fr.md"));
  });
});
