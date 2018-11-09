const test = require("ava");
const supertest = require("supertest");
const app = require("./entry");

let server, request;

test.before(async t => {
    server = await app.start();
    request = supertest(server);
});

test.after(t => {
    server.close();
});

test(async t => {
    const res = await request.get("/test/test/index");

    t.is(200, res.status);
    t.is(res.body.data, "Hello Doodoo.js");
});
