const utils = require("../utils/mainUtils");
const { models } = require("../database/index");
const fs = require("fs");
const path = require("path");
const base = process.cwd();
const templatePath = path.join(base, "views");

class ResponseHandler {
  resMethods = [
    "json",
    "jsonp",
    "send",
    "sendFile",
    "end",
    "redirect",
    "render",
  ];
  resMethod = "render"; // json | jsonp | send | sendFile | end | redirect | render | download

  resData = {};
  resObj = {};
  resType = null;
  resMsg = null;
  resErrors = {};

  redirectURI = null;
  renderPage = null;
  pageTemplateBase = null;
  pageTemplate = null;
  pageTitle = null;

  settings = {};
  settingsLoaded = false;

  appUtils = utils;

  constructor(req, res) {
    this.req = req;
    this.res = res;

    this.parser();

    if (
      this.appUtils.config("response_type") == "HTML" ||
      !this.appUtils.config("response_type")
    ) {
      this.setPage(this.renderPage);
    } else if (this.appUtils.config("response_type") == "JSON") {
      this.setToJSON();
    }

    if (
      this.req.session?.["app_session_msg"] &&
      this.req.session["app_session_msg"].msg &&
      this.req.session["app_session_msg"].type
    ) {
      this.setMsg(
        this.req.session["app_session_msg"].msg,
        this.req.session["app_session_msg"].type
      );
      delete this.req.session["app_session_msg"].msg;
      delete this.req.session["app_session_msg"].type;
      this.req.session.save();
    }
  }

  parser() {
    this.pageTemplate = this.pageTemplate ? this.pageTemplate : "landing";
    const parsed_url = new URL(
      this.appUtils.config("home_dir") +
        this.req.originalUrl.substring(1, this.req.originalUrl.length)
    );
    let paths = parsed_url.pathname.split("/");
    this.renderPage = paths[1]
      ? this.pageTemplateBase == paths[1]
        ? paths[2]
          ? paths[2]
          : "index"
        : paths[1]
      : "index";
  }

  printMsg() {
    if (!this.resMsg) return;
    let alert_class = "";
    switch (this.resType) {
      case "success":
        alert_class = "success";
        break;
      case "error":
        alert_class = "danger";
        break;
      case "warning":
        alert_class = "warning";
        break;
      default:
        alert_class = "info";
    }
    return `<div style="display: block;" id="" class="alert alert-block alert-${alert_class} fade in show">
        <button type="button" class="close" data-dismiss="alert">×</button>
        <p><strong><i class="icon-info-sign"></i>  ${this.resMsg} </strong></p>
      </div>`;
  }

  printErrors(title = "Errors encountered") {
    if (!(Object.keys(this.resErrors).length > 0)) return;
    let result = `<div style="display: block;" id="" class="alert alert-block alert-danger">
			<button type="button" class="close" data-dismiss="alert">×</button>
			<p><strong><i class="icon-info-sign"></i> ${title} </strong></p>
			<ul>`;

    for (const field in this.resErrors) {
      if (Object.hasOwnProperty.call(this.resErrors, field)) {
        const error = this.resErrors[field];
        result += `<li> ${error} </li>`;
      }
    }
    result += "</ul></div>";
    return result;
  }

  async doCustom(callback) {
    return callback(this.req, this.res);
  }

  setMsg(msg, type = "info") {
    this.resType = type;
    this.resMsg = msg;
    return this;
  }

  setError(field, error) {
    this.resErrors[field] = error;
  }

  setMethod(method) {
    if (this.resMethods.includes(method)) this.resMethod = method;
    return this;
  }

  assignData(key, val = null) {
    this.resData[key] = val;
    return this;
  }

  bindData(data) {
    this.resData = { ...this.resData, ...data };
  }

  getData(key) {
    if (key) return this.resData[key];
  }

  setPage(page) {
    this.renderPage = page;
    return this;
  }

  getPage() {
    return this.renderPage;
  }

  setToJSON() {
    this.setMethod("json");
    return this;
  }

  setRedirectURI(url) {
    this.redirectURI = url;
    return this;
  }

  getTitle() {
    return this.pageTitle;
  }

  getFullTitle() {
    return this.pageTitle + this.appUtils.config("title_suffix");
  }

  setTitle(title) {
    this.pageTitle = title;
    return this;
  }

  getTemplate() {
    return this.pageTemplate;
  }

  setTemplate(template) {
    this.pageTemplate = template;
    this.parser();
    return this;
  }

  setTemplateBase(base) {
    this.pageTemplateBase = base;
    this.parser();
    return this;
  }

  getSeoData() {
    return {
      title: this.getFullTitle(),
      app_name: this.appUtils.config("admin_name"),
    };
  }

  getCurrentURI(with_query = false) {
    var originalURI = this.req.originalUrl;
    if (!with_query) {
      originalURI = this.req.originalUrl.split("?").shift();
    }

    return originalURI;
  }

  getCurrentPath() {
    return this.req.path;
  }

  pagination(result_key = "data") {
    let page = this.getData("pager_current_page");
    let total_pages = Math.ceil(this.getData("pager_total_pages"));
    let flex = 7;
    let flex_fixed = true;

    let url_indicator = "page";
    let pager_url = this.getCurrentURI(true);
    let pager_preg = /page\=[0-9]+/;
    let pager_query = url_indicator + "={page}";
    if (pager_url.includes(url_indicator + "=")) {
      pager_url = pager_url.replace(pager_preg, pager_query);
    } else {
      if (!pager_url.includes("?")) {
        pager_url += "?" + pager_query;
      } else {
        pager_url += "&" + pager_query;
      }
    }
    let pagination_start = 0;
    let pagination_end = 0;
    if (flex_fixed) {
      let left_flex = Math.ceil(flex / 2) - 1;
      let right_flex = flex - left_flex - 1;
      pagination_start = Math.min(
        Math.max(1, page - left_flex),
        Math.max(total_pages - flex, 1)
      );
      pagination_end = Math.max(
        Math.min(total_pages, page + right_flex),
        Math.min(flex, total_pages)
      );
    } else {
      pagination_start = page > flex + 1 ? page - flex : 1;
      pagination_end = page < total_pages - flex ? page + flex : total_pages;
    }

    // Pagination summary
    let from = (page - 1) * this.getData("list_per_page") + 1;
    let to = from + this.getData(result_key).length - 1;
    let total = this.getData("total_results");

    let pager = `
      <div class="table-wrapper">
        <div class="table-wrapper__footer">
          <div class="row">
            <div class="table-wrapper__show-result col text-grey">
              <span class="d-none d-sm-inline-block">Showing</span>
                ${from} to ${to}
              <span class="d-none d-sm-inline-block">of ${total} results</span>
            </div>
            <div class="table-wrapper__pagination col-auto">
              <ol class="pagination">
    `;
    if (pagination_start > 1) {
      pager += `
        <li class="pagination__item">
          <a class="pagination__arrow pagination__arrow--prev" href="${pager_url.replace(
            "{page}",
            1
          )}">
            <svg class="icon-icon-keyboard-left">
              <use xlink:href="#icon-keyboard-left"></use>
            </svg>
          </a>
        </li>
      `;
    }
    if (page > 1) {
      pager += `
        <li class="pagination__item">
          <a class="pagination__arrow pagination__arrow--prev" href="${pager_url.replace(
            "{page}",
            page - 1
          )}">
            <svg class="icon-icon-keyboard-left">
              <use xlink:href="#icon-keyboard-left"></use>
            </svg>
          </a>
        </li>
      `;
    }

    for (let i = pagination_start; i <= pagination_end; i++) {
      pager += `
        <li class="pagination__item ${i == page ? "active" : ""}">
          <a class="pagination__link" onclick="()=>{location.href='${pager_url.replace(
            "{page}",
            i
          )}'}" href="${pager_url.replace("{page}", i)}">${i}</a>
      </li>
      `;
    }

    if (page < total_pages) {
      pager += `
        <li class="pagination__item">
          <a class="pagination__arrow pagination__arrow--next" href="${pager_url.replace(
            "{page}",
            page + 1
          )}">
            <svg class="icon-icon-keyboard-right">
              <use xlink:href="#icon-keyboard-right"></use>
            </svg>
          </a>
        </li>
      `;
    }

    if (pagination_end < total_pages) {
      pager += `
        <li class="pagination__item">
          <a class="pagination__arrow pagination__arrow--next" href="${pager_url.replace(
            "{page}",
            Math.ceil(total_pages)
          )}">
            <svg class="icon-icon-keyboard-right">
              <use xlink:href="#icon-keyboard-right"></use>
            </svg>
          </a>
        </li>
      `;
    }

    pager += `
              </ol>
            </div>
          </div>
        </div>
      </div>
    `;
    return pager;
  }

  send() {
    const status = {};
    if (this.redirectURI) status["redirect"] = this.redirectURI;
    if (this.resType && this.resMsg) {
      status["type"] = this.resType;
      status["msg"] = this.resMsg;
    }

    let data = this.resData;

    this.resObj = {
      status,
      data,
      errors: this.resErrors,
    };

    if (this.resMethod == "render" && this.redirectURI) {
      // Check if no message is available
      if (this.resMsg && this.req.session) {
        this.req.session["app_session_msg"] = {
          msg: this.resMsg,
          type: this.resType,
        };
        this.req.session.save();
      }
      this.res.redirect(302, this.redirectURI);
    } else if (this.resMethod == "render") {
      let seo = this.getSeoData();
      let App = this;
      let template = getTemplateFile(this.pageTemplate);

      let page = fs.existsSync(
        path.join(
          base,
          "views",
          this.pageTemplate.split("/")[0],
          "pages",
          `${this.getPage()}.ejs`
        )
      )
        ? this.getPage()
        : "404";
      this.res[this.resMethod](`${template}`, {
        App,
        seo,
        page,

        user: this.req.User,
        utils: this.appUtils,

        User: this.req.User,
        Utils: this.appUtils,
        ...this.resObj,
      });
    } else if (this.resMethod == "json") {
      this.res[this.resMethod](this.resObj);
    } else {
      this.res[this.resMethod]({});
    }
  }

  async loadSettings() {
    let $this = this;
    const data = await models.AppSetting.findAll().catch(console.trace);
    data.forEach((d) => {
      $this.settings[d.setting_key] = d.setting_value;
    });
    this.settingsLoaded = true;
  }

  async getSettings(key) {
    if (this.settingsLoaded == false) await this.loadSettings();
    if (Object.keys(this.settings).contains(key)) return this.settings[key];
  }

  async saveSettings(setting_key, setting_value) {
    const $this = this;
    return models.AppSetting.findOne({ where: { setting_key } })
      .then(async (setting) => {
        let update_or_create_setting;
        if (setting) {
          update_or_create_setting = await setting
            .update({ setting_value })
            .catch(console.trace);
        } else {
          update_or_create_setting = await models.AppSetting.create({
            setting_value,
            setting_key,
          }).catch(console.trace);
        }

        if (update_or_create_setting) {
          await $this.loadSettings();
          return true;
        }
      })
      .catch(console.trace);
  }
}

function getTemplateFile(template) {
  var templateFile = path.join(templatePath, `${template}.ejs`);
  if (fs.existsSync(templateFile)) {
    return template;
  } else if (fs.existsSync(path.join(templatePath, template, "index.ejs"))) {
    return `${template}/index`;
  } else return null;
}

module.exports = ResponseHandler;
