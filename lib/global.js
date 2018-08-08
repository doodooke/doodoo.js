const _knex = require("knex");
const _bookshelf = require("bookshelf");
const uuid = require("bookshelf-uuid");
const paranoia = require("bookshelf-paranoia");
const model = require("./bookshelf/model");
const pagination = require("./bookshelf/pagination");

/**
 * Get bookshelf
 * @param {object} connection - The connection of mysql
 * @returns bookshelf
 */
function getBookshelf(connection) {
    const knex = _knex(connection);
    const bookshelf = _bookshelf(knex);

    bookshelf.plugin("visibility");
    bookshelf.plugin(pagination);
    bookshelf.plugin(paranoia);
    bookshelf.plugin(uuid);
    bookshelf.plugin(model);

    return bookshelf;
}

module.exports = {
    getBookshelf
};
