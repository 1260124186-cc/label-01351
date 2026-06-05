function requirePage(modulePath) {
  const callsBefore = Page.mock.calls.length;
  require(modulePath);
  const calls = Page.mock.calls;
  return calls[calls.length - 1][0];
}

const { createPageInstance, initStorage } = require('../helpers');

module.exports = { requirePage, createPageInstance, initStorage };
