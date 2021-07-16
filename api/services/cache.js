const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;

    if (typeof options.key != 'string') {
        this.hashKey = options.key || '';
    } else {
        this.key = options.key;
    }

    return this;
};

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    if (this.hashKey) {
        const key = JSON.stringify(
            Object.assign({}, { user: this.hashKey }, { collection: this.mongooseCollection.name })
        );

        const cacheValue = await client.hget(JSON.stringify(this.hashKey), key);

        if (cacheValue) {
            const doc = JSON.parse(cacheValue);

            return Array.isArray(doc)
                ? doc.map(d => new this.model(d))
                : new this.model(doc);
        }
    } else {
        // const key = JSON.stringify(
        //     Object.assign({}, { id: this.key }, { collection: this.mongooseCollection.name })
        // );

        const cacheValue = await client.get(JSON.stringify(this.key));

        console.log(cacheValue);

        if (cacheValue) {
            const doc = JSON.parse(cacheValue);

            return Array.isArray(doc)
                ? doc.map(d => new this.model(d))
                : new this.model(doc);
        }
    }
};

module.exports = {
    replaceKeyValue(key, resource) {
        client.del(JSON.stringify(key));
        client.set(JSON.stringify(key), JSON.stringify(resource));
    },

    replaceHashKeyValue(hashKey, key, resource) {
        client.hdel(JSON.stringify(hashKey), JSON.stringify(key));
        client.hset(JSON.stringify(hashKey), JSON.stringify(key), JSON.stringify(resource));
    }
};
