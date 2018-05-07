const moment = require("moment");
const axios = require("axios");
const _knex = require("knex");
const _bookshelf = require("bookshelf");
const uuid = require("bookshelf-uuid");
const paranoia = require("bookshelf-paranoia");
const cache = require("./bookshelf/cache");
const pagination = require("./bookshelf/pagination");

module.exports = {
	getBookshelf(connection) {
		const knex = _knex(connection);
		const bookshelf = _bookshelf(knex);

		bookshelf.plugin("visibility");
		bookshelf.plugin(pagination);
		bookshelf.plugin(paranoia);
		bookshelf.plugin(uuid);
		bookshelf.plugin(cache);

		return bookshelf;
	},

	// 发送钉钉通知
	ding(title, text, url = process.env.DINGDING_DEBUG) {
		if (!url) {
			console.error("Dingding Debug Url Is Not Defined");
			return;
		}

		return axios({
			url: url,
			method: "post",
			headers: {
				"Content-Type": "application/json"
			},
			data: {
				msgtype: "markdown",
				markdown: {
					title: title,
					text: `#### ${title} ####\n${text}\n#### 时间：${moment().format(
						"YYYY-MM-DD HH:mm:ss"
					)} ####`
				}
			}
		});
	}
};
