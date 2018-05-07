const glob = require("glob");
const path = require("path");
const _knex = require("knex");
const _bookshelf = require("bookshelf");
const uuid = require("bookshelf-uuid");
const paranoia = require("bookshelf-paranoia");
const cache = require("./../bookshelf/cache");
const pagination = require("./../bookshelf/pagination");

module.exports = class Model {
	constructor(options = {}) {
		this.root = options.root || process.env.APP_ROOT;
		this.connection = options.mysql || {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
			database: process.env.DB_DATABASE,
			charset: process.env.DB_CHARSET
		};
		this.bookshelf = this.getBookshelf({
			client: "mysql",
			connection: this.connection
		});
	}

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

	getModels() {
		const root = path.join(this.root, "model");
		const rootModels = glob.sync("**/*.js", { cwd: root });
		const models = {};
		for (const model of rootModels) {
			models[path.basename(model, ".js")] = require(path.resolve(
				root,
				model
			));
		}
		return models;
	}
};
