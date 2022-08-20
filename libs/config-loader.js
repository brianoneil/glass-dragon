const
    nconf = require('nconf'),
    debug = require('debug')('app:config'),
    path = require('path'),
    fs = require('fs'),
    main = require('require-main-filename')(),  //this helps resolve pathing problems when using diff loaders (like in server side props)
    appDir = path.dirname(main);



const requiredEnvVars = [
];

nconf.argv().env();


const nodeEnv = nconf.get('ENVIRONMENT') ? nconf.get('ENVIRONMENT').toLowerCase() : 'dev'
let configFile = appDir + `/config/${'config'}.json`
let rawConfig
let config
try {
    if (fs.existsSync(configFile)) {
        rawConfig = fs.readFileSync(configFile).toString()
        config = JSON.parse(rawConfig)
    } else {
        console.error('Config File Not found')
        process.exit(-1)
    }

} catch (error) {
    console.error(error);
    process.exit(-1);
}


nconf.defaults(config[nodeEnv]);
nconf.overrides(config.app);

nconf.isValid = function () {
    let isValid = true;
    requiredEnvVars.forEach(requiredEnvVar => {
        if (nconf.get(requiredEnvVar) === undefined) {
            debug(`config environment variable not found: ${requiredEnvVar}`);
            isValid = false;
            return false;
        }
    });
    return isValid;
};

// extend nconf to get numbers from env
// otherwise return null
nconf.getInteger = function (envVarName) {
    if (isNaN(nconf.get(envVarName))) {
        return null;
    } else {
        return parseInt(nconf.get(envVarName));
    }
};

nconf.getBoolean = function (envVarName) {
    var stringValue = nconf.get(envVarName),
        booleanValue = false;
    if (stringValue === 'true') {
        booleanValue = true;
    } else if (stringValue === null) {
        debug('environment variable ' + envVarName + ' not found');
    } else if (stringValue !== 'false') {
        debug('environment variable ' + envVarName + ' not boolean.  value is ' + stringValue);
    }
    return booleanValue;
};

console.log(`Running with ${nodeEnv} Environment Variables`)
module.exports = nconf;