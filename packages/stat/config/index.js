const path = require("path");
const extend = require("extend");

/**
 * 获取配置文件
 * @return {object}      配置详情
 */

module.exports = function config() {
  // 默认开发环境
  const env = process.env.NODE_ENV || "dev";

  console.log("Current NODE_ENV", env);

  const config = {};

  //当前环境配置
  const envPath = path.resolve(__dirname + `/env/${env}.env.js`);
  try {
    extend(config, require(envPath));
  } catch (err) {
    throw JSON.stringify({ text: `Load ${env} Config Error：${envPath}` });
  }

  //外部配置
  try {
    extend(true, config, require(path.resolve(__dirname + "/extend.json")));
  } catch (err) {
    throw JSON.stringify({
      test: `Load Extend Config Error：./config/extend.json`,
    });
  }

  return config;
};
