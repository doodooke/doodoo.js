const test = require("ava");
const assert = require("assert");
const path = require("path");
const supertest = require("supertest");
const Doodoo = require("./../lib/doodoo");
const app = new Doodoo({
    root: "./example/app"
});

let server, request;

test.before(t => {
    server = app.start();
    request = supertest(server);
});

test.after(t => {
    server.close();
});

test(async t => {
    const res = await request.get("/test/index");

    t.is(200, res.status);
    t.is(res.body.data, "Hello Doodoo");
});
