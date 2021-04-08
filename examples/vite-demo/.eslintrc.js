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
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: [
    '@typescript-eslint',
  ],
  parserOptions: {        // 指定ESLint可以解析JSX语法
    "ecmaVersion": 2019,
    "sourceType": 'module',
    "ecmaFeatures":{
        jsx:true
    }
  },
};
