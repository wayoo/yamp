import scaner from './scaner';
import parser from './parser';
import analyze from './analyze';
import render from './render';
import { END, TRUE } from './globals';
import logger from './logger';


// import { Parser, HtmlRenderer } from 'commonmark';
import {Parser, HtmlRenderer} from '../commonmark.js/lib/index';

var reader = new Parser();
var writer = new HtmlRenderer();
var parsed = reader.parse("**dfdfdf *88***"); // parsed is a 'Node' tree
// transform parsed if you like...
var result = writer.render(parsed); // result is a String
console.log(result);
console.log('+++ +++ +++ +++ +++');
// window.scanner = scaner;
// while (scaner.getToken().type != END) {
// }

if (typeof window !== "undefined") {
    // window.scaner = scaner;
    window.run = run;
}
function run(str, isDebug) {
    logger.setDebug(isDebug);
    if (isDebug) {
        console.log(str);
    }
    scaner.load(str);
    const ast = parser.parse();
    analyze(ast);
    return render(ast);
}

const spec =   {
    "markdown": "**foo*bar*baz*",
    "html": "<p><strong>foo<em>bar</em>baz</strong></p>\n",
    "example": 428,
    "start_line": 7018,
    "end_line": 7022,
    "section": "Emphasis and strong emphasis"
  };

console.log(`EXpect ${spec.shouldFail ? 'not' : ''}: `, JSON.stringify(spec.html));
// console.log(run("# foo *bar* \\*baz\\*\n"));
console.log(JSON.stringify(run(spec.markdown, true)));




// exports default getToken;
// export default getToken;
export default run;