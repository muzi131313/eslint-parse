// https://github.com/commitizen/cz-cli
// https://commitlint.js.org/#/guides-upgrade
let czConfig = require("./cz-config.js")
module.exports = {
    extends: ["@commitlint/config-conventional"],
    parserPreset: {
        parserOpts: {
            // 自定义解析规则
            headerPattern: /^(.*?)\((.*?)\):\s?(.*)$/,
            // headerPattern: /^(:\w*:)(?:\s)(?:\((.*?)\))?\s((?:.*(?=\())|.*)(?:\(#(\d*)\))?/,
            headerCorrespondence: ["type", "scope", "subject"]
        }
    },
    rules: {
        "type-enum": [2, "always", czConfig.types.map(type => type.value)]
    }
}
