# Expense Tracker

A single-page expense tracker in plain HTML, CSS and JavaScript (no frameworks, no build step).

- Add an expense (amount, category, date, note)
- See the list, newest first
- See the total (follows the current filter)
- Filter by category
- Delete an expense
- Data is saved in your browser's `localStorage`

## Run

Open `index.html` in a browser. That's it.

## Files

- `calc.js` — pure calculation/validation logic (no DOM), shared by the app and the tests
- `app.js` — DOM wiring and storage
- `index.html`, `styles.css` — page and styling
- `tests/calc.test.js` — unit tests for `calc.js`

Amounts are stored as integer cents to avoid floating-point rounding errors.

## Test

Requires Node.js 18+ (no dependencies to install).

```
npm test
```
