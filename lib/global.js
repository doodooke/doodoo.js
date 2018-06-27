const yn = require("yn");
const { URL } = require("url");
const moment = require("moment");
const crypto = require("crypto");
const FormData = require("form-data");
const { exec } = require("child_process");
const axios = require("axios");
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

/**
 * Ding a message
 * @param {string} title - name
 * @param {string} text - message
 * @param {string} url - url
 */
function ding(title, text, url = process.env.DINGDING_URL) {
    try {
        if (yn(process.env.DINGDING) && url) {
            return axios({
                url: url,
                method: "post",
                timeout: 3000,
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
    } catch (error) {
        console.error("Ding Network fail");
    }
}

/**
 * Create git issue
 * @param {String} title title
 * @param {String} body stack
 */
async function createIssue(title, stack) {
    try {
        // git issue
        if (yn(process.env.GIT_ISSUE) && process.env.GIT_ISSUE_URL) {
            await axios({
                url: process.env.GIT_ISSUE_URL,
                method: "post",
                timeout: 3000,
                headers: {
                    "Content-Type": "application/json"
                },
                auth: {
                    username: process.env.GIT_USERNAME,
                    password: process.env.GIT_PASSWORD
                },
                data: {
                    title: title,
                    body: `<pre>${stack || title}</pre>`
                }
            });
        }
    } catch (error) {
        console.error("Git Error Issue Network fail");
    }

    try {
        // zentao issue
        if (yn(process.env.ZENTAO_ISSUE) && process.env.ZENTAO_ISSUE_URL) {
            const zentaoIssueUrl = new URL(process.env.ZENTAO_ISSUE_URL);
            const zentaoUrl = `${zentaoIssueUrl.origin}${
                zentaoIssueUrl.pathname
            }`;

            // zentao getSession
            const session = await axios({
                url: `${zentaoUrl}?m=api&f=getSessionID&t=json`,
                timeout: 3000
            });
            const { sessionName, sessionID } = JSON.parse(session.data.data);

            // zentao login
            await axios({
                url: `${zentaoUrl}?m=user&f=login&t=json&${sessionName}=${sessionID}&account=${
                    process.env.ZENTAO_USERNAME
                }&password=${process.env.ZENTAO_PASSWORD}`,
                timeout: 3000
            });

            // zentao create bug
            const form = new FormData();
            form.append(
                "product",
                zentaoIssueUrl.searchParams.get("productID")
            );
            form.append("module", zentaoIssueUrl.searchParams.get("moduleID"));
            form.append("openedBuild", "trunk");
            form.append("title", title);
            form.append("steps", `<pre>${stack || title}</pre>`);

            await axios({
                url: `${
                    process.env.ZENTAO_ISSUE_URL
                }&t=json&${sessionName}=${sessionID}`,
                method: "post",
                timeout: 3000,
                headers: form.getHeaders(),
                transformRequest: [
                    function() {
                        return form;
                    }
                ]
            });

            // zentao logout
            await axios({
                url: `${zentaoUrl}?m=user&f=logout&t=json&${sessionName}=${sessionID}`,
                timeout: 3000
            });
        }
    } catch (error) {
        console.error("Zentao Error Issue Network fail");
    }
}

/**
 * Get sha256 hmac signature
 * @param {String} data data
 * @param {String} secret secret
 */
function sign(data, secret = process.env.GOGS_SECRET) {
    return crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("hex");
}

/**
 * Exec command
 * @param {String} command command
 * @param {String} options options
 */
function execCommand(command, options) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    stdout: stdout.toString(),
                    stderr: stderr.toString()
                });
            }
        });
    });
}

module.exports = {
    getBookshelf,
    createIssue,
    execCommand,
    ding,
    sign
};
