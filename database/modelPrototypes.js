const modelPrototypes = {
  // Meta functions requires the meta field with type text
  getMetas: function () {
    let meta = JSON.parse(this.get("meta"));
    if (this.get("meta") && typeof meta == "object") {
      return meta;
    } else {
      return {};
    }
  },
  getMeta: function (key) {
    let meta = this.getMetas();
    if (meta?.[key]) return meta[key];
    else return "";
  },
  setMeta: async function (key, val) {
    let meta = this.getMetas();
    meta[key] = val;
    meta = JSON.stringify(meta);
    this.update({ meta }).catch(console.trace);
  },
  deleteMeta: async function (key) {
    let meta = this.getMetas();
    if (meta?.[key]) {
      delete meta[key];
      meta = JSON.stringify(meta);
      this.update({ meta }).catch(console.trace);
    }
  },
  hasMeta: function (key) {
    let meta = this.getMetas();
    if (meta?.[key]) return true;
    else return false;
  },
};
module.exports = modelPrototypes;
