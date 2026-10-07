const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../calc.js');

const sample = [
  { id: '1', amountCents: 1250, category: 'Food', date: '2026-10-01', note: 'Lunch' },
  { id: '2', amountCents: 3000, category: 'Transport', date: '2026-10-05', note: 'Train' },
  { id: '3', amountCents: 799, category: 'Food', date: '2026-09-28', note: '' }
];

test('parseAmount accepts valid amounts and returns cents', () => {
  assert.equal(calc.parseAmount('12'), 1200);
  assert.equal(calc.parseAmount('12.5'), 1250);
  assert.equal(calc.parseAmount('12.50'), 1250);
  assert.equal(calc.parseAmount('0.01'), 1);
  assert.equal(calc.parseAmount('  7.05 '), 705);
  assert.equal(calc.parseAmount('19.99'), 1999);
});

test('parseAmount rejects invalid amounts', () => {
  for (const bad of ['', '   ', 'abc', '-5', '0', '0.00', '1.234', '1.', '.5', '1,000', '1e3', null, undefined]) {
    assert.equal(calc.parseAmount(bad), null, `expected null for ${JSON.stringify(bad)}`);
  }
});

test('calculateTotal sums cents', () => {
  assert.equal(calc.calculateTotal([]), 0);
  assert.equal(calc.calculateTotal(sample), 5049);
});

test('calculateTotal avoids floating-point drift', () => {
  const items = [calc.parseAmount('0.10'), calc.parseAmount('0.20')].map((c) => ({ amountCents: c }));
  assert.equal(calc.calculateTotal(items), 30);
  assert.equal(calc.formatCents(calc.calculateTotal(items)), '0.30');
});

test('filterByCategory', () => {
  assert.equal(calc.filterByCategory(sample, 'All').length, 3);
  assert.deepEqual(calc.filterByCategory(sample, 'Food').map((e) => e.id), ['1', '3']);
  assert.deepEqual(calc.filterByCategory(sample, 'Health'), []);
});

test('filterByCategory + calculateTotal gives per-category total', () => {
  assert.equal(calc.calculateTotal(calc.filterByCategory(sample, 'Food')), 2049);
});

test('validateExpense passes valid input', () => {
  const result = calc.validateExpense({ amount: '10.00', category: 'Food', date: '2026-10-07', note: 'ok' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateExpense reports each invalid field', () => {
  const base = { amount: '10', category: 'Food', date: '2026-10-07', note: '' };
  assert.equal(calc.validateExpense({ ...base, amount: '' }).valid, false);
  assert.equal(calc.validateExpense({ ...base, category: 'Nope' }).valid, false);
  assert.equal(calc.validateExpense({ ...base, date: '' }).valid, false);
  assert.equal(calc.validateExpense({ ...base, date: '2026-02-30' }).valid, false);
  assert.equal(calc.validateExpense({ ...base, note: 'x'.repeat(201) }).valid, false);
  assert.equal(calc.validateExpense({}).errors.length, 3);
});

test('createExpense normalizes input', () => {
  const e = calc.createExpense({ amount: '4.5', category: 'Other', date: '2026-10-07', note: '  hi  ' }, 'abc');
  assert.deepEqual(e, { id: 'abc', amountCents: 450, category: 'Other', date: '2026-10-07', note: 'hi' });
});

test('sortByDate orders newest first without mutating input', () => {
  const before = sample.map((e) => e.id);
  assert.deepEqual(calc.sortByDate(sample).map((e) => e.id), ['2', '1', '3']);
  assert.deepEqual(sample.map((e) => e.id), before);
});

test('formatCents', () => {
  assert.equal(calc.formatCents(0), '0.00');
  assert.equal(calc.formatCents(5), '0.05');
  assert.equal(calc.formatCents(1250), '12.50');
  assert.equal(calc.formatCents(123456), '1234.56');
});
