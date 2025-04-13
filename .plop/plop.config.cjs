const DEFAULT_PATH = 'src/modules';

const moduleGenerator = {
  description: 'Creating a new module',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Module name',
      default: 'loader',
    },
    {
      type: 'input',
      name: 'path',
      message: 'The path by which the module will be created',
      default: DEFAULT_PATH,
    },
  ],
  actions: ({ path = DEFAULT_PATH }) => {
    // Слэш в конце всегда убирается что бы избежать ошибок
    path = path.replace(/(.*)(\/)$/, (_, pathWithoutEndSlash) => pathWithoutEndSlash);

    return [
      // copy files
      {
        type: 'add',
        path: `../${path}/{{ properCase name }}.ts`,
        templateFile: './module/moduleName.ts.hbs',
        abortOnFail: true,
      },
      // add imports
      {
        type: 'append',
        path: `../${path}/index.ts`,
        template: `export { default as {{ properCase name }} } from './{{ properCase name }}';\n`,
        abortOnFail: false,
        unique: true,
      },
    ];
  },
};

module.exports = (plop) => {
  plop.setHelper('fullName', (prefix, name) => `${prefix}${name.charAt(0).toUpperCase() + name.slice(1)}`);
  plop.setGenerator('module', moduleGenerator);
};
