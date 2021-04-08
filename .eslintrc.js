module.exports = {
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
  ],
  parserOptions: {        // 指定ESLint可以解析JSX语法
    "ecmaVersion": 2019,
    "sourceType": 'module',
    "ecmaFeatures":{
        jsx:true
    }
  },
};
