"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvictConfig = void 0;
const convict_1 = __importDefault(require("convict"));
const path_1 = __importDefault(require("path"));
// Declare configuration schema, default values and bindings to environment variables
exports.ConvictConfig = (0, convict_1.default)({
    env: {
        doc: 'The application environment.',
        format: ['default', 'production', 'development', 'test', 'integration', 'e2e'],
        default: 'default',
        env: 'NODE_ENV',
    },
    PORT: {
        doc: 'The port to bind.',
        format: 'port',
        default: 3000,
        env: 'PORT',
    },
    REPORTING_DB: {
        DIALECT: {
            doc: 'DIALECT',
            format: '*',
            default: 'mysql',
            env: 'REPORTING_DB_DIALECT',
        },
        HOST: {
            doc: 'The Hostname/IP address of database',
            format: '*',
            default: 'localhost',
            env: 'REPORTING_DB_HOST',
        },
        PORT: {
            doc: 'The port of database',
            format: 'port',
            default: 3306,
            env: 'REPORTING_DB_PORT',
        },
        USER: {
            doc: 'The username for database',
            format: '*',
            default: 'central_ledger',
            env: 'REPORTING_DB_USER',
        },
        PASSWORD: {
            doc: 'The password for database',
            format: '*',
            default: 'password',
            env: 'REPORTING_DB_PASSWORD',
        },
        SCHEMA: {
            doc: 'The schema in database',
            format: '*',
            default: 'central_ledger',
            env: 'REPORTING_DB_SCHEMA',
        },
    },
    EVENT_STORE_DB: {
        HOST: {
            doc: 'The Hostname/IP address of database',
            format: '*',
            default: 'localhost',
            env: 'EVENT_STORE_DB_HOST',
        },
        PORT: {
            doc: 'The port number of database',
            format: 'port',
            default: 27017,
            env: 'EVENT_STORE_DB_PORT',
        },
        USER: {
            doc: 'The user of database',
            format: '*',
            default: 'test',
            env: 'EVENT_STORE_DB_USER',
        },
        PASSWORD: {
            doc: 'The password of database',
            format: '*',
            default: 'test123',
            env: 'EVENT_STORE_DB_PASSWORD',
        },
        DATABASE: {
            doc: 'The database name in database',
            format: '*',
            default: 'admin',
            env: 'EVENT_STORE_DB_DATABASE',
        },
    },
    ORY_KETO_READ_URL: {
        doc: 'The read URL of Ory Keto',
        format: '*',
        default: '',
        env: 'ORY_KETO_READ_URL',
    },
    AUTH_CHECK_PARTICIPANTS: {
        doc: 'AUTH_CHECK_PARTICIPANTS',
        format: 'Boolean',
        default: false,
        env: 'AUTH_CHECK_PARTICIPANTS',
    },
    USER_ID_HEADER: {
        doc: 'USER_ID_HEADER',
        format: '*',
        default: 'x-user',
        env: 'USER_ID_HEADER',
    },
    PRISMA_LOGGING_ENABLED: {
        doc: 'PRISMA_LOGGING_ENABLED',
        format: 'Boolean',
        default: false,
        env: 'PRISMA_LOGGING_ENABLED',
    },
    CORS_WHITELIST: {
        doc: 'CORS_WHITELIST',
        format: Array,
        default: [],
        env: 'CORS_WHITELIST',
    },
    ALLOW_CREDENTIALS: {
        doc: 'ALLOW_CREDENTIALS',
        format: 'Boolean',
        default: false,
        env: 'ALLOW_CREDENTIALS',
    },
});
// Load environment dependent configuration
const env = exports.ConvictConfig.get('env');
const configFile = process.env.CONFIG_FILE || path_1.default.join(__dirname, `../../config/${env}.json`);
exports.ConvictConfig.loadFile(configFile);
// Perform configuration validation
exports.ConvictConfig.validate({ allowed: 'strict' });
// extract simplified config from Convict object
const config = {
    env: exports.ConvictConfig.get('env'),
    PORT: exports.ConvictConfig.get('PORT'),
    REPORTING_DB: exports.ConvictConfig.get('REPORTING_DB'),
    EVENT_STORE_DB: exports.ConvictConfig.get('EVENT_STORE_DB'),
    ORY_KETO_READ_URL: exports.ConvictConfig.get('ORY_KETO_READ_URL'),
    AUTH_CHECK_PARTICIPANTS: exports.ConvictConfig.get('AUTH_CHECK_PARTICIPANTS'),
    USER_ID_HEADER: exports.ConvictConfig.get('USER_ID_HEADER'),
    PRISMA_LOGGING_ENABLED: exports.ConvictConfig.get('PRISMA_LOGGING_ENABLED'),
    CORS_WHITELIST: exports.ConvictConfig.get('CORS_WHITELIST'),
    ALLOW_CREDENTIALS: exports.ConvictConfig.get('ALLOW_CREDENTIALS'),
};
exports.default = config;
//# sourceMappingURL=config.js.map