
import http = require('http')
import { Container } from "typedi";
import { ExpressAppFactory } from "./express-app-factory";

require("./di/bootstrap")

const appFactory = Container.get<ExpressAppFactory>(ExpressAppFactory)
const app = appFactory.create()
const server = http.createServer(app)
server.listen(80)

process.on('uncaughtException', function (err) {
    console.log(err)
    process.exit(1)
})