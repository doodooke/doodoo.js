const axios = require("axios");
const FormData = require("form-data");
const { URL } = require("url");

/**
 * Uage
 * app.plugin("zentao", {url: "xxx", username: "xxx", password: "xxx"});
 */
module.exports = options => {
    doodoo.hook.add("createIssue", async (err, ctx) => {
        let issueTitle, issueStack;
        if (err instanceof Error) {
            let url = "",
                body = "",
                header = "",
                stack = "";
            if (ctx) {
                url = `Url: ${ctx.method} ${ctx.url} ${ctx.status}`;
                body = `Body: ${_.escape(
                    JSON.stringify(ctx.request.body, null, "\t")
                )}`;
                header = `Headers: ${_.escape(
                    JSON.stringify(ctx.headers, null, "\t")
                )}`;

                if (ctx.method === "POST") {
                    stack = `
${url}
${body}    
${header} 

${err.stack}  
            `;
                } else {
                    stack = `
${url}
${header} 

${err.stack}  
            `;
                }
            }

            issueTitle = `${err.name} - ${err.message}`;
            issueStack = stack;
        }

        if (typeof err === "string") {
            issueTitle = err;
        }

        try {
            // zentao issue
            const zentaoIssueUrl = new URL(options.url);
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
                url: `${zentaoUrl}?m=user&f=login&${sessionName}=${sessionID}&account=${
                    options.username
                }&password=${options.password}`,
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
            form.append("title", issueTitle);
            form.append("steps", `<pre>${issueStack || issueTitle}</pre>`);

            await axios({
                url: `${options.url}&${sessionName}=${sessionID}`,
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
                url: `${zentaoUrl}?m=user&f=logout&${sessionName}=${sessionID}`,
                timeout: 3000
            });
        } catch (error) {
            console.error("Zentao Error Issue Network fail");
        }
    });
};
