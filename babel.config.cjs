module.exports = {
  presets: [['@babel/preset-env', {modules: 'umd'}], 'minify'],
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  moduleId: require('./package.json').name
}
