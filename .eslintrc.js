module.exports = {
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    "no-unused-vars": 0,
  },
  globals: {
    $: true,
  },
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
  ]
};
