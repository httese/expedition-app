const fs = require('fs');
const expect = require('expect');

function walkDir(root) {
  const stat = fs.statSync(root);
  if (stat.isDirectory()) {
      const dirs = fs.readdirSync(root).filter(item => !item.startsWith('.'));
      let results = dirs.map(sub => walkDir(`${root}/${sub}`));
      return [].concat(...results);
  } else {
      return [root];
  }
}

describe('Typescript files', () => {
  it('are always in pairs of *.tsx and *.test.tsx', () => {
    const files = walkDir('./app');

    let count = {};
    for(let f of files) {
      if (f.split('.').pop() === 'tsx') {
        const base = f.split('.')[1]; // "./app/..."
        count[base] = (count[base] || 0) + 1;
      }
    }

    let violations = [];
    for(let k of Object.keys(count)) {
      if (count[k] !== 2) {
        violations.push(k);
      }
    }
    expect(violations).toEqual([]);
  });
})


describe('Dependencies', () => {
  it('are actually used', () => {
    const package = require('./package.json');
    const packageUsage = JSON.stringify(package.scripts) + JSON.stringify(package.cordova);
    const WHITELIST = [
      'cordova-android',
      'cordova-ios',
      '@types/.*',
      'typescript',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-webpack',
      'webpack-cli',
      'node-sass',
      'babel-preset-env',
      'babel-core',
      'react-test-renderer', // Needed for unit tests
      'react-addons-test-utils', // Needed for unit tests
    ];

    let depstrs = Object.keys(package.dependencies);
    Array.prototype.push.apply(depstrs, Object.keys(package.devDependencies));
    depstrs = depstrs.filter((dep) => {
      for (let w of WHITELIST) {
        if (dep.match(w)) {
          return false;
        }
      }
      return true;
    });

    const unused_deps = [];
    const files = walkDir('./app').filter((path) => path.match(/.*\.(tsx|js)/));
    const moreFiles = fs.readdirSync('.').filter(item => item.endsWith('.js'));
    Array.prototype.push.apply(files, moreFiles);
    for (let dep of depstrs) {
      let found = false;
      for (let path of files) {
        if (fs.readFileSync(path, 'utf8').match("[/\"\'!]" + dep)) {
          found = true;
          break;
        }
      }

      // Check for use in package.json sections
      if (!found && packageUsage.indexOf(dep) !== -1) {
        found = true;
      }

      if (!found) {
        unused_deps.push(dep);
      }
    }
    console.log('Found ' + depstrs.length + ' deps (' + unused_deps.length + ' unused)');
    expect(unused_deps).toEqual([]);
  });
})
