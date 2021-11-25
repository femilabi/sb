const { models, sequelize } = require("../database/index");
const { randomString } = require("./mainUtils");

const getUniqueColumnValue = async function (
  model_name,
  column_name,
  value_generator = null
) {
  if (models[model_name]) {
    let value = randomString(12).toLowerCase();
    if (value_generator instanceof Function) {
      value = value_generator();
    }
    let search = await models[model_name].findOne({
      where: {
        [column_name]: value,
      },
    });
    if (search) {
      if (typeof value_generator == "string") {
        value_generator = function () {
          return randomString(12).toLowerCase();
        };
      }
      return getUniqueColumnValue(model_name, column_name, value_generator);
    } else {
      return value;
    }
  }
};

// To build filter while clause for mysql
const buildSqlQueryFilter = function (filter, table = "", fields = []) {
  let prefix = "";
  if (table) prefix = table + ".";
  let filter_queries = [];
  let filter_params = {};
  if (filter) {
    for (const key in filter) {
      if (Object.hasOwnProperty.call(filter, key)) {
        const val = filter[key];
        if (
          val &&
          /^[a-z0-9_]+$/.test(key) &&
          (!fields || fields.includes(key))
        ) {
          filter_queries.push(`${prefix}${key} = :filter_${prefix}_${key}`);
          filter_params[`filter_${prefix}_${key}`] = val;
          filter_params[`filter_${key}`] = val;
        }
      }
    }
  }
  return {
    query: filter_queries.join(" AND "),
    params: filter_params,
  };
};

// To build search while clause for mysql
const buildSqlQuerySearch = function (q, fields) {
  let search_params = { search_str: `%${q}%`, search_str_original: q };
  let search_queries = [];

  if (typeof fields == "string") {
    return {
      query: `${fields} LIKE :search_str`,
      params: search_params,
    };
  }

  if (Array.isArray(fields)) {
    fields.forEach((key) => {
      if (key && /^[a-z0-9_\.]+$/.test(key)) {
        search_queries.push(`${key} LIKE :search_str`);
      }
    });
  }

  return {
    query: search_queries.join(" OR "),
    params: search_params,
  };
};

const logActivity = function (user_id, description) {
  return models.ActivityLog.create({
    user_id,
    description,
  });
};

module.exports = {
  getUniqueColumnValue,
  buildSqlQuerySearch,
  buildSqlQueryFilter,
  logActivity,
};
