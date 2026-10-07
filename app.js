// DOM wiring for the expense tracker. All calculations live in calc.js.
(function () {
  'use strict';

  var Calc = window.ExpenseCalc;
  var STORAGE_KEY = 'expense-tracker:expenses';

  var state = {
    expenses: loadExpenses(),
    filter: 'All'
  };

  var form = document.getElementById('expense-form');
  var amountInput = document.getElementById('amount');
  var categoryInput = document.getElementById('category');
  var dateInput = document.getElementById('date');
  var noteInput = document.getElementById('note');
  var errorsEl = document.getElementById('form-errors');
  var filterSelect = document.getElementById('filter');
  var listBody = document.getElementById('expense-list');
  var emptyMsg = document.getElementById('empty-message');
  var totalLabel = document.getElementById('total-label');
  var totalAmount = document.getElementById('total-amount');

  function loadExpenses() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveExpenses() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
    } catch (e) {
      // Storage unavailable (private mode, quota); the app still works for this session.
    }
  }

  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function todayString() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function populateCategories() {
    Calc.CATEGORIES.forEach(function (cat) {
      categoryInput.appendChild(new Option(cat, cat));
      filterSelect.appendChild(new Option(cat, cat));
    });
  }

  function showErrors(errors) {
    errorsEl.innerHTML = '';
    errors.forEach(function (msg) {
      var li = document.createElement('li');
      li.textContent = msg;
      errorsEl.appendChild(li);
    });
    errorsEl.hidden = errors.length === 0;
  }

  function cell(text, className) {
    var td = document.createElement('td');
    td.textContent = text;
    if (className) td.className = className;
    return td;
  }

  function render() {
    var visible = Calc.sortByDate(Calc.filterByCategory(state.expenses, state.filter));

    listBody.innerHTML = '';
    visible.forEach(function (e) {
      var tr = document.createElement('tr');

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete';
      del.textContent = 'Delete';
      del.setAttribute('aria-label', 'Delete expense from ' + e.date);
      del.dataset.id = e.id;
      var actTd = document.createElement('td');
      actTd.appendChild(del);

      tr.append(
        cell(e.date),
        cell(e.category),
        cell(e.note, 'note'),
        cell('$' + Calc.formatCents(e.amountCents), 'num'),
        actTd
      );
      listBody.appendChild(tr);
    });

    emptyMsg.hidden = visible.length > 0;
    totalLabel.textContent = 'Total (' + state.filter + ')';
    totalAmount.textContent = '$' + Calc.formatCents(Calc.calculateTotal(visible));
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var input = {
      amount: amountInput.value,
      category: categoryInput.value,
      date: dateInput.value,
      note: noteInput.value
    };
    var result = Calc.validateExpense(input);
    showErrors(result.errors);
    if (!result.valid) return;

    state.expenses.push(Calc.createExpense(input, newId()));
    saveExpenses();
    render();

    amountInput.value = '';
    noteInput.value = '';
    amountInput.focus();
  });

  filterSelect.addEventListener('change', function () {
    state.filter = filterSelect.value;
    render();
  });

  listBody.addEventListener('click', function (event) {
    var btn = event.target.closest('button.delete');
    if (!btn) return;
    state.expenses = state.expenses.filter(function (e) {
      return e.id !== btn.dataset.id;
    });
    saveExpenses();
    render();
  });

  populateCategories();
  dateInput.value = todayString();
  render();
})();
