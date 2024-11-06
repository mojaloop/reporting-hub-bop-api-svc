"use strict";
/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("tsconfig-paths/register");
const server_1 = require("@apollo/server");
const server_plugin_landing_page_graphql_playground_1 = require("@apollo/server-plugin-landing-page-graphql-playground");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const schema_1 = __importDefault(require("./schema"));
const context_1 = require("./context");
const config_1 = __importDefault(require("./lib/config"));
const graphql_middleware_1 = require("graphql-middleware");
const lib_1 = require("@app/lib");
const central_services_logger_1 = __importDefault(require("@mojaloop/central-services-logger"));
const express4_1 = require("@apollo/server/express4");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const authMiddleware = (0, lib_1.createAuthMiddleware)(config_1.default.USER_ID_HEADER, config_1.default.ORY_KETO_READ_URL, config_1.default.AUTH_CHECK_PARTICIPANTS);
const loggerPlugin = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(requestContext) {
        if (requestContext.request.operationName !== 'IntrospectionQuery') {
            central_services_logger_1.default.debug(requestContext.request.query);
        }
    },
};
const startServer = async () => {
    const server = new server_1.ApolloServer({
        schema: (0, graphql_middleware_1.applyMiddleware)(schema_1.default, authMiddleware),
        plugins: [
            (0, server_plugin_landing_page_graphql_playground_1.ApolloServerPluginLandingPageGraphQLPlayground)(),
            loggerPlugin,
            (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
        ],
        // healthCheckPath: '/health',
    });
    await server.start();
    const corsOptions = {
        origin: config_1.default.CORS_WHITELIST,
        credentials: config_1.default.ALLOW_CREDENTIALS,
    };
    app.get('/health', (req, res) => {
        res.json({
            status: 'OK',
        });
    });
    app.use('/', (0, cors_1.default)(corsOptions), 
    // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
    body_parser_1.default.json({ limit: '50mb' }), 
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    (0, express4_1.expressMiddleware)(server, {
        context: context_1.createContext,
    }));
    // Modified server startup
    await new Promise((resolve) => httpServer.listen({ port: config_1.default.PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${config_1.default.PORT}/`);
};
startServer();
//# sourceMappingURL=index.js.map