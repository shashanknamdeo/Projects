// module.exports = {
//   presets: ['module:@react-native/babel-preset'],

//   plugins: [
//     ["module:react-native-dotenv", {
//       "moduleName": "@env",
//       "path": ".env"
//     }]
//   ],

// };


module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'], // 👈 Correct preset for RN CLI
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: false,
        },
      ],
    ],
  };
};
