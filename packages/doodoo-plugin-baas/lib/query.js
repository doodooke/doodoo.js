const _ = require("lodash");
const hasCamelCaseKey = (keys, _key) => {
    let has = false;
    for (const key in keys) {
        if (_.camelCase(key) === _key) {
            has = true;
            break;
        }
    }
    return has;
};
const hasJoinKey = keys => {
    let has = false;
    for (const key in keys) {
        if (_.includes(Query.joinFilters, _.camelCase(key))) {
            has = true;
            break;
        }
    }
    return has;
};

class Query {
    constructor(ctx, qb, keys) {
        this.qb = qb;

        // 兼容join查询
        if (hasJoinKey(keys)) {
            for (const key in keys) {
                if (_.isEmpty(keys[key])) {
                    continue;
                }
                if (
                    _.includes(Query.filters, _.camelCase(key)) ||
                    _.includes(Query.joinFilters, _.camelCase(key))
                ) {
                    if (_.isArray(keys[key])) {
                        keys[key] = keys[key].map((val, i) => {
                            return _.split(val, ",")
                                .map((val, i) => {
                                    if (
                                        _.includes(
                                            Query.joinFilters,
                                            _.camelCase(key)
                                        )
                                    ) {
                                        return `${qb.client.connectionSettings.database}.${val}`;
                                    } else {
                                        if (key !== "limit") {
                                            if (i === 0) {
                                                return `${qb.client.connectionSettings.database}.${val}`;
                                            } else {
                                                return val;
                                            }
                                        } else {
                                            return val;
                                        }
                                    }
                                })
                                .join();
                        });
                    } else {
                        keys[key] = _.split(keys[key], ",")
                            .map((val, i) => {
                                if (
                                    _.includes(
                                        Query.joinFilters,
                                        _.camelCase(key)
                                    )
                                ) {
                                    return `${qb.client.connectionSettings.database}.${val}`;
                                } else {
                                    if (key !== "limit") {
                                        if (i === 0) {
                                            return `${qb.client.connectionSettings.database}.${val}`;
                                        } else {
                                            return val;
                                        }
                                    } else {
                                        return val;
                                    }
                                }
                            })
                            .join();
                    }
                }
            }

            if (!hasCamelCaseKey(keys, "orderBy")) {
                qb.orderBy(`${qb._single.table}.id`, "desc");
            }
        } else {
            if (!hasCamelCaseKey(keys, "orderBy")) {
                qb.orderBy("id", "desc");
            }
        }

        // 默认配置
        if (!keys.column) {
            qb.column("*");
        }

        // 执行查询
        for (const key in keys) {
            if (
                _.includes(Query.filters, _.camelCase(key)) ||
                _.includes(Query.joinFilters, _.camelCase(key))
            ) {
                if (keys[key]) {
                    this[_.camelCase(key)](keys[key]);
                }
            }
        }
    }

    static get filters() {
        return [
            "where",
            "orWhere",
            "whereNot",
            "orWhereNot",
            "whereIn",
            "orWhereIn",
            "whereNotIn",
            "orWhereNotIn",
            "whereNull",
            "orWhereNull",
            "whereNotNull",
            "orWhereNotNull",
            "whereBetween",
            "whereNotBetween",
            "orWhereBetween",
            "orWhereNotBetween",
            "limit",
            "offset",
            "orderBy",
            "groupBy",
            "column",
            "count",
            "sum",
            "min",
            "max",
            "avg"
        ];
    }

    static get joinFilters() {
        return [
            "join",
            "innerJoin",
            "leftJoin",
            "leftOuterJoin",
            "rightJoin",
            "rightOuterJoin",
            "outerJoin",
            "fullOuterJoin",
            "crossJoin"
        ];
    }

    static toArray(str) {
        if (_.isArray(str)) {
            return str;
        }
        if (_.isPlainObject(str)) {
            return [str];
        }

        try {
            return JSON.parse(str);
        } catch (err) {
            return _.split(str, ",");
        }
    }

    static toObject(where) {
        const obj = [];
        if (_.isArray(where)) {
            for (const key in where) {
                const field = Query.toArray(where[key]);
                if (field.length === 3 && field[1] === "=") {
                    obj.push([field[0], field[2]]);
                    delete where[key];
                }
                if (field.length === 2) {
                    obj.push(field);
                    delete where[key];
                }
            }
        } else {
            const field = Query.toArray(where);
            if (field.length === 3 && field[1] === "=") {
                obj.push([field[0], field[2]]);
                where = "";
            }
            if (field.length === 2) {
                obj.push(field);
                where = "";
            }
        }

        // 移除where数组中空对象
        if (_.isArray(where)) {
            where = _.compact(where);
        }

        return {
            where: where,
            whereJson: _.fromPairs(obj)
        };
    }

    static getRelateds(query) {
        let relateds = [];
        for (let key in query) {
            if (
                _.camelCase(key) === "related" ||
                _.camelCase(key) === "withRelated" ||
                _.camelCase(key) === "joined" ||
                _.camelCase(key) === "withJoined"
            ) {
                relateds = _.concat(relateds, Query.toArray(query[key]));
            } else if (_.startsWith(key, "related")) {
                // 点号转换成特殊字符
                key = _.replace(key, /\./g, "☉");

                const related = _.split(_.kebabCase(key), "-");
                let relatedTable = related[1];
                const relatedTableKey = _.camelCase(
                    _.slice(related, 2).join("-")
                );

                // 特殊字符转换回点号
                key = _.replace(key, /\☉/g, ".");
                relatedTable = _.replace(relatedTable, /\☉/g, ".");

                relateds.push({
                    [relatedTable]: {
                        [relatedTableKey]: query[key]
                    }
                });
            }
        }
        return relateds;
    }

    join(join) {
        if (_.isArray(join)) {
            for (const key in join) {
                this.qb.join(...Query.toArray(join[key]));
            }
        } else {
            this.qb.join(...Query.toArray(join));
        }
    }

    innerJoin(innerJoin) {
        if (_.isArray(innerJoin)) {
            for (const key in innerJoin) {
                this.qb.innerJoin(...Query.toArray(innerJoin[key]));
            }
        } else {
            this.qb.innerJoin(...Query.toArray(innerJoin));
        }
    }

    leftJoin(leftJoin) {
        if (_.isArray(leftJoin)) {
            for (const key in leftJoin) {
                this.qb.leftJoin(...Query.toArray(leftJoin[key]));
            }
        } else {
            this.qb.leftJoin(...Query.toArray(leftJoin));
        }
    }

    leftOuterJoin(leftOuterJoin) {
        if (_.isArray(leftOuterJoin)) {
            for (const key in leftOuterJoin) {
                this.qb.leftOuterJoin(...Query.toArray(leftOuterJoin[key]));
            }
        } else {
            this.qb.leftOuterJoin(...Query.toArray(leftOuterJoin));
        }
    }

    rightJoin(rightJoin) {
        if (_.isArray(rightJoin)) {
            for (const key in rightJoin) {
                this.qb.rightJoin(...Query.toArray(rightJoin[key]));
            }
        } else {
            this.qb.rightJoin(...Query.toArray(rightJoin));
        }
    }

    rightOuterJoin(rightOuterJoin) {
        if (_.isArray(rightOuterJoin)) {
            for (const key in rightOuterJoin) {
                this.qb.rightOuterJoin(...Query.toArray(rightOuterJoin[key]));
            }
        } else {
            this.qb.rightOuterJoin(...Query.toArray(rightOuterJoin));
        }
    }

    outerJoin(outerJoin) {
        if (_.isArray(outerJoin)) {
            for (const key in outerJoin) {
                this.qb.outerJoin(...Query.toArray(outerJoin[key]));
            }
        } else {
            this.qb.outerJoin(...Query.toArray(outerJoin));
        }
    }

    fullOuterJoin(fullOuterJoin) {
        if (_.isArray(fullOuterJoin)) {
            for (const key in fullOuterJoin) {
                this.qb.fullOuterJoin(...Query.toArray(fullOuterJoin[key]));
            }
        } else {
            this.qb.fullOuterJoin(...Query.toArray(fullOuterJoin));
        }
    }

    crossJoin(crossJoin) {
        if (_.isArray(crossJoin)) {
            for (const key in crossJoin) {
                this.qb.crossJoin(...Query.toArray(crossJoin[key]));
            }
        } else {
            this.qb.crossJoin(...Query.toArray(crossJoin));
        }
    }

    column(column) {
        if (_.isArray(column)) {
            for (const key in column) {
                this.qb.column(...Query.toArray(column[key]));
            }
        } else {
            this.qb.column(...Query.toArray(column));
        }
    }

    where(where) {
        if (_.isArray(where)) {
            for (const key in where) {
                this.qb.where(...Query.toArray(where[key]));
            }
        } else {
            this.qb.where(...Query.toArray(where));
        }
    }

    orWhere(orWhere) {
        if (_.isArray(orWhere)) {
            for (const key in orWhere) {
                this.qb.orWhere(...Query.toArray(orWhere[key]));
            }
        } else {
            this.qb.orWhere(...Query.toArray(orWhere));
        }
    }

    whereNot(whereNot) {
        if (_.isArray(whereNot)) {
            for (const key in whereNot) {
                this.qb.whereNot(...Query.toArray(whereNot[key]));
            }
        } else {
            this.qb.whereNot(...Query.toArray(whereNot));
        }
    }

    orWhereNot(orWhereNot) {
        if (_.isArray(orWhereNot)) {
            for (const key in orWhereNot) {
                this.qb.orWhereNot(...Query.toArray(orWhereNot[key]));
            }
        } else {
            this.qb.orWhereNot(...Query.toArray(orWhereNot));
        }
    }

    whereIn(whereIn) {
        if (_.isArray(whereIn)) {
            for (const key in whereIn) {
                this.qb.whereIn(...Query.toArray(whereIn[key]));
            }
        } else {
            const _whereIn = Query.toArray(whereIn);
            const _field = _whereIn.shift();
            this.qb.whereIn(_field, Query.toArray(_whereIn));
        }
    }

    orWhereIn(orWhereIn) {
        if (_.isArray(orWhereIn)) {
            for (const key in orWhereIn) {
                this.qb.orWhereIn(...Query.toArray(orWhereIn[key]));
            }
        } else {
            const _orWhereIn = Query.toArray(orWhereIn);
            const _field = _orWhereIn.shift();
            this.qb.orWhereIn(_field, Query.toArray(_orWhereIn));
        }
    }

    whereNotIn(whereNotIn) {
        if (_.isArray(whereNotIn)) {
            for (const key in whereNotIn) {
                this.qb.whereNotIn(...Query.toArray(whereNotIn[key]));
            }
        } else {
            const _whereNotIn = Query.toArray(whereNotIn);
            const _field = _whereNotIn.shift();
            this.qb.whereNotIn(_field, Query.toArray(_whereNotIn));
        }
    }

    orWhereNotIn(orWhereNotIn) {
        if (_.isArray(orWhereNotIn)) {
            for (const key in orWhereNotIn) {
                this.qb.orWhereNotIn(...Query.toArray(orWhereNotIn[key]));
            }
        } else {
            const _orWhereNotIn = Query.toArray(orWhereNotIn);
            const _field = _orWhereNotIn.shift();
            this.qb.orWhereNotIn(_field, Query.toArray(_orWhereNotIn));
        }
    }

    whereNull(whereNull) {
        if (_.isArray(whereNull)) {
            for (const key in whereNull) {
                if (whereNull[key].indexOf(",") !== -1) {
                    const _whereNull = Query.toArray(whereNull[key]);
                    for (const key in _whereNull) {
                        this.qb.whereNull(...Query.toArray(_whereNull[key]));
                    }
                } else {
                    this.qb.whereNull(whereNull[key]);
                }
            }
        } else {
            if (whereNull.indexOf(",") !== -1) {
                const _whereNull = Query.toArray(whereNull);
                for (const key in _whereNull) {
                    this.qb.whereNull(...Query.toArray(_whereNull[key]));
                }
            } else {
                this.qb.whereNull(whereNull);
            }
        }
    }

    orWhereNull(orWhereNull) {
        if (_.isArray(orWhereNull)) {
            for (const key in orWhereNull) {
                if (orWhereNull[key].indexOf(",") !== -1) {
                    const _orWhereNull = Query.toArray(orWhereNull[key]);
                    for (const key in _orWhereNull) {
                        this.qb.orWhereNull(
                            ...Query.toArray(_orWhereNull[key])
                        );
                    }
                } else {
                    this.qb.orWhereNull(orWhereNull[key]);
                }
            }
        } else {
            if (orWhereNull.indexOf(",") !== -1) {
                const _orWhereNull = Query.toArray(orWhereNull);
                for (const key in _orWhereNull) {
                    this.qb.orWhereNull(...Query.toArray(_orWhereNull[key]));
                }
            } else {
                this.qb.orWhereNull(orWhereNull);
            }
        }
    }

    whereNotNull(whereNotNull) {
        if (_.isArray(whereNotNull)) {
            for (const key in whereNotNull) {
                if (whereNotNull[key].indexOf(",") !== -1) {
                    const _whereNotNull = Query.toArray(whereNotNull[key]);
                    for (const key in _whereNotNull) {
                        this.qb.whereNotNull(
                            ...Query.toArray(_whereNotNull[key])
                        );
                    }
                } else {
                    this.qb.whereNotNull(whereNotNull[key]);
                }
            }
        } else {
            if (whereNotNull.indexOf(",") !== -1) {
                const _whereNotNull = Query.toArray(whereNotNull);
                for (const key in _whereNotNull) {
                    this.qb.whereNotNull(...Query.toArray(_whereNotNull[key]));
                }
            } else {
                this.qb.whereNotNull(whereNotNull);
            }
        }
    }

    orWhereNotNull(orWhereNotNull) {
        if (_.isArray(orWhereNotNull)) {
            for (const key in orWhereNotNull) {
                if (orWhereNotNull[key].indexOf(",") !== -1) {
                    const _orWhereNotNull = Query.toArray(orWhereNotNull[key]);
                    for (const key in _orWhereNotNull) {
                        this.qb.orWhereNotNull(
                            ...Query.toArray(_orWhereNotNull[key])
                        );
                    }
                } else {
                    this.qb.orWhereNotNull(orWhereNotNull[key]);
                }
            }
        } else {
            if (orWhereNotNull.indexOf(",") !== -1) {
                const _orWhereNotNull = Query.toArray(orWhereNotNull);
                for (const key in _orWhereNotNull) {
                    this.qb.orWhereNotNull(
                        ...Query.toArray(_orWhereNotNull[key])
                    );
                }
            } else {
                this.qb.orWhereNotNull(orWhereNotNull);
            }
        }
    }

    whereBetween(whereBetween) {
        if (_.isArray(whereBetween)) {
            for (const key in whereBetween) {
                this.qb.whereBetween(...Query.toArray(whereBetween[key]));
            }
        } else {
            const _whereBetween = Query.toArray(whereBetween);
            const _field = _whereBetween.shift();
            this.qb.whereBetween(_field, Query.toArray(_whereBetween));
        }
    }

    whereNotBetween(whereNotBetween) {
        if (_.isArray(whereNotBetween)) {
            for (const key in whereNotBetween) {
                this.qb.whereNotBetween(...Query.toArray(whereNotBetween[key]));
            }
        } else {
            const _whereNotBetween = Query.toArray(whereNotBetween);
            const _field = _whereNotBetween.shift();
            this.qb.whereNotBetween(_field, Query.toArray(_whereNotBetween));
        }
    }

    orWhereBetween(orWhereBetween) {
        if (_.isArray(orWhereBetween)) {
            for (const key in orWhereBetween) {
                this.qb.orWhereBetween(...Query.toArray(orWhereBetween[key]));
            }
        } else {
            const _orWhereBetween = Query.toArray(orWhereBetween);
            const _field = _orWhereBetween.shift();
            this.qb.orWhereBetween(_field, Query.toArray(_orWhereBetween));
        }
    }

    orWhereNotBetween(orWhereNotBetween) {
        if (_.isArray(orWhereNotBetween)) {
            for (const key in orWhereNotBetween) {
                this.qb.orWhereNotBetween(
                    ...Query.toArray(orWhereNotBetween[key])
                );
            }
        } else {
            const _orWhereNotBetween = Query.toArray(orWhereNotBetween);
            const _field = _orWhereNotBetween.shift();
            this.qb.orWhereNotBetween(
                _field,
                Query.toArray(_orWhereNotBetween)
            );
        }
    }

    limit(limit) {
        this.qb.limit(parseInt(limit));
    }

    offset(offset) {
        this.qb.offset(parseInt(offset));
    }

    orderBy(orderBy) {
        if (_.isArray(orderBy)) {
            for (const key in orderBy) {
                this.qb.orderBy(...Query.toArray(orderBy[key]));
            }
        } else {
            this.qb.orderBy(...Query.toArray(orderBy));
        }
    }

    groupBy(groupBy) {
        if (_.isArray(groupBy)) {
            for (const key in groupBy) {
                this.qb.groupBy(...Query.toArray(groupBy[key]));
            }
        } else {
            this.qb.groupBy(...Query.toArray(groupBy));
        }
    }

    count(count) {
        if (_.isArray(count)) {
            for (const key in count) {
                this.qb.count(...Query.toArray(count[key]));
            }
        } else {
            this.qb.count(...Query.toArray(count));
        }
    }

    sum(sum) {
        if (_.isArray(sum)) {
            for (const key in sum) {
                this.qb.sum(...Query.toArray(sum[key]));
            }
        } else {
            this.qb.sum(...Query.toArray(sum));
        }
    }

    min(min) {
        if (_.isArray(min)) {
            for (const key in min) {
                this.qb.min(...Query.toArray(min[key]));
            }
        } else {
            this.qb.min(...Query.toArray(min));
        }
    }

    max(max) {
        if (_.isArray(max)) {
            for (const key in max) {
                this.qb.max(...Query.toArray(max[key]));
            }
        } else {
            this.qb.max(...Query.toArray(max));
        }
    }

    avg(avg) {
        if (_.isArray(avg)) {
            for (const key in avg) {
                this.qb.avg(...Query.toArray(avg[key]));
            }
        } else {
            this.qb.avg(...Query.toArray(avg));
        }
    }

    // increment(increment) {
    //     if (_.isArray(increment)) {
    //         for (const key in increment) {
    //             this.qb.increment(...Query.toArray(increment[key]));
    //         }
    //     } else {
    //         this.qb.increment(...Query.toArray(increment));
    //     }
    // }

    // decrement(decrement) {
    //     if (_.isArray(decrement)) {
    //         for (const key in decrement) {
    //             this.qb.decrement(...Query.toArray(decrement[key]));
    //         }
    //     } else {
    //         this.qb.decrement(...Query.toArray(decrement));
    //     }
    // }
}

module.exports = Query;
