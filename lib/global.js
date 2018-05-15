const moment = require("moment");
const axios = require("axios");
const _knex = require("knex");
const _bookshelf = require("bookshelf");
const uuid = require("bookshelf-uuid");
const paranoia = require("bookshelf-paranoia");
const cache = require("./bookshelf/cache");
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
    bookshelf.plugin(cache);

    return bookshelf;
}

/**
 * Ding a message
 * @param {string} title - name
 * @param {string} text - message
 * @param {string} url - url
 * @returns bookshelf
 */
function ding(title, text, url = process.env.DINGDING_URL) {
    if (!url) {
        console.error("DINGDING_URL Is Not Defined");
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

/**
 * Create git issue
 * @param {String} title title
 * @param {String} body body
 */
function gitCreateIssue(title, body, url = process.env.GIT_ISSUE_URL) {
    if (!url) {
        console.error("GIT_ISSUE_URL Is Not Defined");
        return;
    }

    return axios({
        url: url,
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        auth: {
            username: process.env.GIT_USERNAME,
            password: process.env.GIT_PASSWORD
        },
        data: {
            title: title,
            body: body
        }
    });
}

module.exports = {
    getBookshelf,
    gitCreateIssue,
    ding
};
