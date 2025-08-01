import Convict from 'convict';

// interface to represent service configuration
export interface ServiceConfig {
  env: string;
  PORT: number;
  REPORTING_DB: {
    DIALECT: string;
    HOST: string;
    PORT: number;
    USER: string;
    PASSWORD: string;
    SCHEMA: string;
  };
  EVENT_STORE_DB: {
    HOST: string;
    PORT: number;
    USER: string;
    PASSWORD: string;
    DATABASE: string;
    PARAMS: Record<string, unknown>;
    SSL_ENABLED: boolean;
    SSL_VERIFY: boolean;
    SSL_CA: string;
  };
  ORY_KETO_READ_URL: string;
  AUTH_CHECK_PARTICIPANTS: boolean;
  USER_ID_HEADER: string;
  CORS_WHITELIST: string[];
  ALLOW_CREDENTIALS: boolean;
  PRISMA_LOGGING_ENABLED: boolean;
}

// Declare configuration schema, default values and bindings to environment variables
export const ConvictConfig = Convict<ServiceConfig>({
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
    PARAMS: {
      doc: 'Additional parameters for MongoDB connection',
      format: function (val) {
        if (typeof val === 'string') {
          try {
            JSON.parse(val);
            return val;
          } catch (e) {
            throw new Error(`EVENT_STORE_DB_PARAMS must be valid JSON: ${e}`);
          }
        } else if (typeof val !== 'object') {
          throw new Error('EVENT_STORE_DB_PARAMS must be an object or a JSON string');
        }
        return val;
      },
      default: {},
      env: 'EVENT_STORE_DB_PARAMS',
    },
    SSL_ENABLED: {
      doc: 'Enable SSL for Event Store DB',
      format: 'Boolean',
      default: false,
      env: 'EVENT_STORE_DB_SSL_ENABLED',
    },
    SSL_VERIFY: {
      doc: 'Verify SSL certificate for Event Store DB',
      format: 'Boolean',
      default: true,
      env: 'EVENT_STORE_DB_SSL_VERIFY',
    },
    SSL_CA: {
      doc: 'CA certificate for Event Store DB SSL connection',
      format: '*',
      default: '',
      env: 'EVENT_STORE_DB_SSL_CA',
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
const env = ConvictConfig.get('env');
const configFile = process.env.CONFIG_FILE || `config/${env}.json`;
ConvictConfig.loadFile(configFile);


if (ConvictConfig.get('EVENT_STORE_DB').SSL_ENABLED || process.env.EVENT_STORE_DB_SSL_ENABLED === 'true') {
  ConvictConfig.set('EVENT_STORE_DB.SSL_ENABLED', true)
  ConvictConfig.set('EVENT_STORE_DB.SSL_VERIFY', process.env.EVENT_STORE_DB_SSL_VERIFY !== 'false')
  if (process.env.EVENT_STORE_DB_SSL_CA) {
    ConvictConfig.set('EVENT_STORE_DB.SSL_CA', process.env.EVENT_STORE_DB_SSL_CA)
  }
}

// Perform configuration validation
ConvictConfig.validate({ allowed: 'strict' });

// extract simplified config from Convict object
const config: ServiceConfig = {
  env: ConvictConfig.get('env'),
  PORT: ConvictConfig.get('PORT'),
  REPORTING_DB: ConvictConfig.get('REPORTING_DB'),
  EVENT_STORE_DB: ConvictConfig.get('EVENT_STORE_DB'),
  ORY_KETO_READ_URL: ConvictConfig.get('ORY_KETO_READ_URL'),
  AUTH_CHECK_PARTICIPANTS: ConvictConfig.get('AUTH_CHECK_PARTICIPANTS'),
  USER_ID_HEADER: ConvictConfig.get('USER_ID_HEADER'),
  CORS_WHITELIST: ConvictConfig.get('CORS_WHITELIST'),
  PRISMA_LOGGING_ENABLED: ConvictConfig.get('PRISMA_LOGGING_ENABLED'),
  ALLOW_CREDENTIALS: ConvictConfig.get('ALLOW_CREDENTIALS'),
};

export default config;
