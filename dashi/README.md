# Dashi
Lightweight web dashboard shell starter code

Note: This is a clone, to be repurposed.

## What is Dashi

Dashi is a fish stock used in Japanese cuisine. Dashi forms the base for miso soup, clear broth soup, noodle broth soup, and many simmering liquids to accentuate the savory flavor known as umami. Dashi is also mixed into flour base of some grilled foods like okonomiyaki and takoyaki. Wikipedia

This Dashi is a dashboard-from-worksheet tool. It's an experiment in generating flexible, mobile, and live dashboard to increase visibility. Also to show the value of experimentation. You can do a lot in a little time.

Check it out live [https://mightyweasel.github.io/Dashi/](https://mightyweasel.github.io/Dashi/)

![alt text](https://mightyweasel.github.io/Dashi/images/dashi.png "Dashi")

## How it was built

Here's what it does:
* Read from google sheets via json api
* Extract rows 1 ... N with cols A ... Z from return
* Generates charts based on summary metrics (both from sheet, and calculated)
* Live updates every 10 mins (configurable)
* Small codebase, vanilla HTML/CSS/JS
* Can run from a desktop, pi attached to a tv, or hosted on github pages and accessed via browser

There's two parts that make this up. The dashboard and the data adapter. 

The dashboard (dashi.js) makes use of [amCharts](https://www.amcharts.com/) to render nice graphs. [Bootstrap 4](https://getbootstrap.com/) for layout and general styling. The rest is light and install free. Probably use Chrome or Firefox though. Haven't tested for IE.

The data adapter (dashisoup.js) is a bit of code to take one format and shape it to fit the other. There's two ways in. One is a direct copy paste out of your sheet and into the dashboard, and the other is via the API calls. Both methods are fed to an adapter than creates an object that the dashboard can consume. The data effectively flows API.json -> tsv -> jsobj. Useful to create offline dashboards.

You can configure some of the common bits in the config (dashispices.js), and the cached data (data\data.js) can be updated manually as a fallback.

## How to use it

Check it out [https://mightyweasel.github.io/Dashi/](https://mightyweasel.github.io/Dashi/)

The data is coming from this google sheet: https://docs.google.com/spreadsheets/d/e/2PACX-1vQkDYKks3-TtyErHQ-JP1NmJLGustcXOUb9t_L-Nv5x5K6_wH30w0aV7wznDJH8k4ZKuwVVrs6SRRas/pubhtml

And the dashboard is consuming the JSON from tabs 1, 2, and 3 from this URL pattern:
https://spreadsheets.google.com/feeds/cells/1GbsuhQWWM0Fyjyh3Ns2TB_TqxWPCewG1jec2v35FbfA/1/public/full?alt=json

There's weird stuff in the sheet, just like real life. It handles most of it well. But you'll have to adjust for your brand of human.

If you want to setup your google sheet to publish, follow this: https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/

Or just clone the repo and tinker away. It can be setup to read from a static file in the /data folder as well. All depends on how you want to adapt it to your purposes.

## Notes/Bugs

Known: If the dashboard refreshes when you're not on page, you might see NaN values. On the next refresh or manual refresh that goes away.
