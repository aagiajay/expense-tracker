// Pure calculation and validation logic for the expense tracker.
// No DOM access, so it can be unit-tested in Node and reused in the browser.
(function (root) {
  'use strict';

  var CATEGORIES = [
    'Food',
    'Transport',
    'Housing',
    'Utilities',
    'Entertainment',
    'Health',
    'Shopping',
    'Other'
  ];

  var NOTE_MAX_LENGTH = 200;

  // Converts a user-entered amount string to integer cents.
  // Returns null for anything that is not a positive amount with at most 2 decimals.
  function parseAmount(str) {
    if (typeof str !== 'string' && typeof str !== 'number') return null;
    var s = String(str).trim();
    var match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
    if (!match) return null;
    var whole = parseInt(match[1], 10);
    var frac = match[2] ? parseInt((match[2] + '0').slice(0, 2), 10) : 0;
    var cents = whole * 100 + frac;
    if (!Number.isSafeInteger(cents) || cents <= 0) return null;
    return cents;
  }

  // True for a real calendar date in YYYY-MM-DD form.
  function isValidDate(str) {
    if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    var parts = str.split('-').map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return (
      d.getUTCFullYear() === parts[0] &&
      d.getUTCMonth() === parts[1] - 1 &&
      d.getUTCDate() === parts[2]
    );
  }

  function validateExpense(input) {
    var errors = [];
    input = input || {};
    if (parseAmount(input.amount) === null) {
      errors.push('Amount must be a positive number with at most 2 decimal places.');
    }
    if (CATEGORIES.indexOf(input.category) === -1) {
      errors.push('Please choose a valid category.');
    }
    if (!isValidDate(input.date)) {
      errors.push('Please enter a valid date.');
    }
    var note = typeof input.note === 'string' ? input.note.trim() : '';
    if (note.length > NOTE_MAX_LENGTH) {
      errors.push('Note must be ' + NOTE_MAX_LENGTH + ' characters or fewer.');
    }
    return { valid: errors.length === 0, errors: errors };
  }

  // Builds a normalized expense object. Assumes input already passed validateExpense.
  function createExpense(input, id) {
    return {
      id: id,
      amountCents: parseAmount(input.amount),
      category: input.category,
      date: input.date,
      note: typeof input.note === 'string' ? input.note.trim() : ''
    };
  }

  function filterByCategory(expenses, category) {
    if (!category || category === 'All') return expenses.slice();
    return expenses.filter(function (e) {
      return e.category === category;
    });
  }

  function calculateTotal(expenses) {
    return expenses.reduce(function (sum, e) {
      return sum + e.amountCents;
    }, 0);
  }

  // Newest first; returns a new array. YYYY-MM-DD strings sort correctly as text.
  function sortByDate(expenses) {
    return expenses.slice().sort(function (a, b) {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });
  }

  function formatCents(cents) {
    var negative = cents < 0;
    var abs = Math.abs(cents);
    var whole = Math.floor(abs / 100);
    var frac = String(abs % 100).padStart(2, '0');
    return (negative ? '-' : '') + whole + '.' + frac;
  }

  var api = {
    CATEGORIES: CATEGORIES,
    NOTE_MAX_LENGTH: NOTE_MAX_LENGTH,
    parseAmount: parseAmount,
    isValidDate: isValidDate,
    validateExpense: validateExpense,
    createExpense: createExpense,
    filterByCategory: filterByCategory,
    calculateTotal: calculateTotal,
    sortByDate: sortByDate,
    formatCents: formatCents
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.ExpenseCalc = api;
  }
})(typeof window !== 'undefined' ? window : this);
