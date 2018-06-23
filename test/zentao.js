const dotenv = require("./../lib/dotenv/main");
const { createIssue } = require("./../lib/global");

dotenv.config();

createIssue("测试标题", "测试内容");
