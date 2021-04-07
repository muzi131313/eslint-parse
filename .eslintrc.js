module.exports = {
  rules: {
    "no-unused-vars": 0,
  },
  globals: {
    $: true,
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: 'eslint:recommended',
};
