const _ = require("lodash");

module.exports = function(bookshelf) {
    const modelPrototype = bookshelf.Model.prototype;
    const collectionPrototype = bookshelf.Collection.prototype;

    bookshelf.Collection = bookshelf.Collection.extend({
        initialize: function() {
            collectionPrototype.initialize.call(this);

            this.on("fetching", (collection, columns, options) => {});
            this.on("counting", (collection, options) => {});
        }
    });

    bookshelf.Model = bookshelf.Model.extend({
        initialize: function() {
            modelPrototype.initialize.call(this);

            this.on("fetching", (model, columns, options) => {});
            this.on("counting", (model, options) => {});
        },

        _destroy: function(options = {}) {
            return modelPrototype.destroy.call(this, options);
        },

        destroy: async function(options = {}) {
            if (options.withRedisKey) {
                await qingful.redis.delAll(options.withRedisKey);
            }
            return this._destroy.call(this, options).then(res => {
                return res ? res.toJSON() : "";
            });
        },

        _save: function(options = {}) {
            return modelPrototype.save.call(this, options);
        },

        save: async function(options = {}) {
            if (options.withRedisKey) {
                await qingful.redis.delAll(options.withRedisKey);
            }

            if (this.has("id") && !this.attributes.id) {
                this.unset("id");
            }
            if (this.has("created_at")) {
                this.unset("created_at");
            }
            if (this.has("updated_at")) {
                this.unset("updated_at");
            }
            if (this.has("deleted_at")) {
                this.unset("deleted_at");
            }

            return this._save.call(this, null, options).then(res => {
                return res ? res.toJSON() : "";
            });
        },

        _fetch: function(options = {}) {
            return modelPrototype.fetch.call(this, options);
        },

        fetch: async function(options = {}) {
            if (options.withRedisKey) {
                const cache = await qingful.redis.cache(options.withRedisKey);
                if (!_.isNil(cache)) {
                    return cache;
                } else {
                    return this._fetch
                        .call(this, options)
                        .then(res => {
                            return res ? res.toJSON() : "";
                        })
                        .then(res => {
                            qingful.redis.cache(options.withRedisKey, res);
                            return res;
                        });
                }
            }
            return this._fetch.call(this, options).then(res => {
                return res ? res.toJSON() : "";
            });
        },

        _fetchAll: function(options = {}) {
            return modelPrototype.fetchAll.call(this, options);
        },

        fetchAll: async function(options = {}) {
            if (options.withRedisKey) {
                const cache = await qingful.redis.cache(options.withRedisKey);
                if (!_.isNil(cache)) {
                    return cache;
                } else {
                    return this._fetchAll
                        .call(this, options)
                        .then(res => {
                            return res.toJSON();
                        })
                        .then(res => {
                            qingful.redis.cache(options.withRedisKey, res);
                            return res;
                        });
                }
            }
            return this._fetchAll.call(this, options).then(res => {
                return res.toJSON();
            });
        },

        _fetchPage: function(options = {}) {
            return modelPrototype.fetchPage.call(this, options);
        },

        fetchPage: async function(options = {}) {
            if (options.withRedisKey) {
                const cache = await qingful.redis.cache(options.withRedisKey);
                if (!_.isNil(cache)) {
                    return cache;
                } else {
                    return this._fetchPage
                        .call(this, options)
                        .then(res => {
                            return {
                                data: res.toJSON(),
                                pagination: res.pagination
                            };
                        })
                        .then(res => {
                            qingful.redis.cache(options.withRedisKey, res);
                            return res;
                        });
                }
            }
            return this._fetchPage.call(this, options).then(res => {
                return {
                    data: res.toJSON(),
                    pagination: res.pagination
                };
            });
        }
    });
};
