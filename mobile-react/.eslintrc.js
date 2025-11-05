module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-native/all', 'prettier'],
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-native'],
  env: {
    node: true,
    'react-native/react-native': true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prop-types': 'off',
  },
};
