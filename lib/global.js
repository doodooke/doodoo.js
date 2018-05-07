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
	}
};
