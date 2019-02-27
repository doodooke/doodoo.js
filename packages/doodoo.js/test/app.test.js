const request = require("supertest");
const Doodoo = require("./../lib/application");

// Change working dir
process.chdir(__dirname);

let app, server;

describe("demo controller", () => {
    beforeEach(async () => {
        app = new Doodoo();
        server = await app.start();
    });

    afterEach(() => {
        server.close();
    });

    it("call http should response 200", done => {
        request(server)
            .get("/test/test/index")
            .expect(200)
            // eslint-disable-next-line quotes
            .expect('{"errmsg":"ok","errcode":0,"data":"Hello Doodoo.js"}')
            .end(done);
    });
});
