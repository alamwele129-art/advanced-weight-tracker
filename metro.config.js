const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // الضربة القاضية: استبدال مكتبة ws بملفنا البسيط
  ws: require.resolve('./ws-shim.js'),
  
  // الاحتفاظ بالباقي كملفات فارغة
  stream: require.resolve('./shim.js'),
  http: require.resolve('./shim.js'),
  https: require.resolve('./shim.js'),
  net: require.resolve('./shim.js'),
  tls: require.resolve('./shim.js'),
  crypto: require.resolve('./shim.js'),
  fs: require.resolve('./shim.js'),
};

module.exports = config;
