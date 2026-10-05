# Label text in the browser, keyboard only

A [Lattice Grid](https://www.latticegrid.dev) demo: 5,574 SMS messages to label as
`ham`, `spam` or `unsure`, entirely from the keyboard, with a review queue, live
label counts and a clean CSV export.

## What it shows

- **A validated label column**: a list editor (`lookup` options + the `select`
  editor) plus `validation.oneOf`, so only `ham`, `spam` or `unsure` can be
  committed by typing or pasting in the grid.
- **Keyboard-only flow**: `Tab` into the grid, arrows to the *My label* cell,
  `Enter` opens the list, arrows (or type `h` / `s` / `u`) choose, `Enter`
  commits, `Down` moves to the next message. `Tab` / `Shift+Tab` leave the grid
  for the next or previous control, `Delete` clears a label and `Ctrl+Z` undoes
  (Lattice Grid 1.86.2 and later).
- **Review queue**: *Unlabelled* (no label yet) and *Disagreement* (your label
  differs from the original UCI label) are filters on a computed *Status*
  column (`unlabelled` / `agrees` / `disagrees`).
- **Live KPIs**: counts of messages, unlabelled, ham, spam and unsure over the
  whole dataset (not the filtered view), updated on every edit.
- **Export CSV**: the grid's own `export.csv`, columns `ID, Message, UCI label,
  My label`, rows as filtered. The formula-injection guard is switched off
  (`sanitise: false`) so the text is written verbatim; four messages start with
  `+`/`-`/`=`/`@`. Open the file in a spreadsheet only if you trust it, or import
  it as text. Fields with leading or trailing spaces are quoted (RFC 4180).
- **Storage**: labels are kept **only in this browser**, in `localStorage`
  (key `lattice-demo-labelling-1634`). Every storage access is in `try/catch`;
  if storage is unavailable the page works and says labels last until the tab
  closes. Nothing is uploaded; there are no keys and no analytics.

## Run locally

    python3 -m http.server
    # open http://localhost:8000/   (add ?theme=dark for the dark theme)

## Data

[UCI SMS Spam Collection](https://archive.ics.uci.edu/dataset/228/sms+spam+collection),
Almeida & Gomez Hidalgo (2011), licence **CC BY 4.0**. `sms.json` (640 KB) is the
only precomputed file: the source file converted from Windows-1252 to UTF-8 and
numbered. The source's own `Â£` sequences are kept as they are. Reproduce:

    # download and unzip the dataset, then
    node tools/prepare.mjs SMSSpamCollection > sms.json
