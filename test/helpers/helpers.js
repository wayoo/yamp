// const marked = require('../../marked/src/marked.js');
const marked = require('../../dist/main').default;
const htmlDiffer = require('./html-differ.js');
const assert = require('assert');

beforeEach(() => {
//   marked.setOptions(marked.getDefaults());
    console.log(marked);

  jasmine.addAsyncMatchers({
    toRender: () => {
      return {
        compare: async(spec, expected) => {
          const result = {};
          const actual = marked(spec.markdown);
          result.pass = await htmlDiffer.isEqual(expected, actual);

          if (result.pass) {
            result.message = `${spec.markdown}\n------\n\nExpected: Should Fail`;
          } else {
            const diff = await htmlDiffer.firstDiff(actual, expected);
            result.message = `Expected: ${diff.expected}\n  Actual: ${diff.actual}`;
          }
          return result;
        }
      };
    },
    toEqualHtml: () => {
      return {
        compare: async(actual, expected) => {
          const result = {};
          result.pass = await htmlDiffer.isEqual(expected, actual);

          if (result.pass) {
            result.message = `Expected '${actual}' not to equal '${expected}'`;
          } else {
            const diff = await htmlDiffer.firstDiff(actual, expected);
            result.message = `Expected: ${diff.expected}\n  Actual: ${diff.actual}`;
          }
          return result;
        }
      };
    },
    toRenderExact: () => ({
      compare: async(spec, expected) => {
        const result = {};
        const actual = marked(spec.markdown, spec.options);

        result.pass = assert.strictEqual(expected, actual) === undefined;

        return result;
      }
    })
  });
});
