# Eslint-parse

## Install
- global: `yarn add eslint-parse -g` or `npm install eslint-parse -g`
- local in project: `yarn add eslint-parse -D` or `npm install eslint-parse -g`

## eslintparse: eslint 辅助工具
- `eslintparse -f all`: 格式化全部文件
- `eslintparse -f modify`: 格式化增量文件
- `eslintparse -f vue`: 格式化 vue 文件
  - 默认顺序是 `<script></script><template></template><style></style>`
  - 指定顺序 `-fi [0,1,2]`
    - `0: script`
    - `1: template`
    - `2: style`
  - 示例：`eslintparse -i ./examples/vite-demo/src -f vue -fi "[0, 1, 2]"`
- `eslintparse -c modify`: 增量检查文件
- `eslintparse -c all`: 全量检查文件
- `eslintparse -i ./examples/vite-demo`: 指定格式化项目路径(必选项)
- `eslintparse -i ./examples/vite-demo -c modify`: 校验 vite 示例 demo
- `eslintparse -i ./examples/vite-demo -c all`: 校验全部 vite 示例 demo
- `eslintparse -p -i ./examples/vite-demo`: 解析校验的结果

## TODO
- [x] 移动分析内容 .temp 目录优先到 node_modules/.temp 目录 [2021.6.29]
- [x] 优化格式化队列 [2021.6.28]
