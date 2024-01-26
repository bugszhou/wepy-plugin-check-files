const chalk = require("chalk");
const { relative, join } = require("path");

/**  @type {string[]} */
let files = [];
let hadNotice = new Set();

class WepyPluginCheckFiles {
  /** @type {{configUrl: string, isClose: boolean, input: string, output: string}} */
  options = {};

  /** @type {{files: string[]}} */
  config = {};

  timer = null;

  constructor(options = {}) {
    this.options = options;
    this.config = require(this.options.configUrl);
  }

  loop() {
    clearTimeout(this.timer);
    this.timer = null;

    this.timer = setTimeout(() => {
      if (files.length >= 5) {
        files = [];
        return;
      }

      this.print();
    }, 500);
  }

  print() {
    const configFiles = this.config.files;

    configFiles.forEach((configFile) => {
      const file = (
        typeof configFile === "object" ? configFile.file : configFile
      ).replace(/\.(wpy)$/, "");
      files.forEach((data) => {
        const relativeUrl = relative(this.options.output, data);
        const srcFile = join(this.options.input, relativeUrl);

        if (srcFile.includes(file) && !hadNotice.has(file)) {
          hadNotice.add(file);
          const warning = chalk.hex("#FFA500");
          console.log(
            warning(
              `您正在修改【${file}】，该文件已迁移至uniapp项目，请前往uniapp项目中修改`,
            ),
          );
        }
      });
    });
    files = [];
    hadNotice.clear();
  }

  /**
   * 插件执行方法
   * @param {{type: IWepyType, code: string, file: string, output: any, next: any, done: any}} data
   * @returns
   */
  apply(data) {
    if (this.options.isClose) {
      data.next();
      return;
    }

    this.loop();
    files.push(data.file);

    data.next();
  }
}

module.exports = WepyPluginCheckFiles;
