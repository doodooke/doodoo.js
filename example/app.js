const Doodoo = require("./../lib/application");

const app = new Doodoo();
app.plugin("dingding");
app.start();
