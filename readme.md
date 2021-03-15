# Eslint-parse

## eslint 辅助工具
- `eslint -f vue`: 格式化 vue 文件
  - 默认顺序是 `<script></script><template></template><style></style>`
  - 指定顺序 `-fi [0,1,2]`
    - `0: script`
    - `1: template`
    - `2: style`
- `eslint -c modify`: 增量检查文件
- `eslint -c all`: 全量检查文件
- `eslint -i ../vue-demo`: 指定格式化项目路径(必选项)
