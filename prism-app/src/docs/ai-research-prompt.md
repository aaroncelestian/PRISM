# PRISM Research — AI Data Collection Prompt

Copy and paste the prompt below into **Claude** or **Gemini** (with web search enabled).
Save the output as a `.json` file, then import it into PRISM Research using the **Open** button.

---

## Prompt Template

```
I need you to search the internet for mineral specimens currently for sale and return the results as a JSON array I can import into my mineral pricing tool.

Search for: [SPECIES] specimens for sale
Optional filters: [LOCALITY], [SIZE], [PRICE RANGE]

For each listing you find, extract the following fields and return them in this exact JSON format:

[
  {
    "species": "exact mineral species name",
    "locality": "Mine name, Region, Country (as specific as possible)",
    "sizeClass": "one of: thumbnail | miniature | small_cab | cabinet | large_cab | museum",
    "condition": "one of: pristine | excellent | good | repaired | damaged",
    "askingPrice": 000,
    "soldPrice": null,
    "source": "Vendor or platform name (e.g. iRocks, eBay, Heritage Auctions)",
    "sourceUrl": "https://direct-link-to-this-specific-listing",
    "notes": "Brief description: crystal habit, color, size in cm, any damage or notable features",
    "photoUrl": "https://direct-link-to-the-main-photo-of-this-specimen"
  }
]

Size class guide:
- thumbnail  = under 2.5 cm
- miniature  = 2.5 – 4.5 cm
- small_cab  = 4.5 – 7.5 cm
- cabinet    = 7.5 – 12 cm
- large_cab  = 12 – 18 cm
- museum     = over 18 cm

Condition guide:
- pristine  = gem, no damage at all
- excellent = display quality, minor wear only
- good      = minor chips or dings visible
- repaired  = restored, glued, or repaired damage
- damaged   = significant breakage

Rules:
- Only include listings that have a visible asking price.
- Include a direct URL to the individual specimen page (not a category page).
- Include a direct URL to the main specimen photo if one is visible on the page.
- Do not include duplicate listings.
- Return only the raw JSON array — no explanation, no markdown fences, no extra text.
- If a field is unknown, use null for numbers or "" for strings.
- Aim for 10–20 listings.
```

---

## Import into PRISM

1. Copy the JSON output from the AI.
2. Paste it into a text editor and save as `my-research.json`.
3. In PRISM → Research tab, click **Open** and select your file.

The listings will import with photos displayed directly from the vendor URLs (labeled "web photo").
You can then click **Score** on any listing to add a PRISM rating.

---

## Notes

- `photoUrl` is a live link to the vendor's image — it requires an internet connection to display.
- You can replace it with a local photo by editing the listing and using the camera/upload button.
- `soldPrice` can be set to a number if the listing shows a sold price (e.g. auction results).
- Sources like Heritage Auctions and Catawiki are good for **sold price** data — ask the AI to include `soldPrice` and set `askingPrice` to null for those.
