module.exports = {
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  rules: {
    "no-unused-vars": 0,
  },
  globals: {
    $: true,
  },
  env: {
    es6: true,
    browser: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
  ],
};
