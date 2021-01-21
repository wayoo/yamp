import scaner from './scaner';
import parser from './parser';
import analyze from './analyze';
import render from './render';
import { END, TRUE } from './globals';
import logger from './logger';

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

const spec =        {
    "markdown": "foo __\\___\n",
    "html": "<p>foo <strong>_</strong></p>\n",
    "example": 451,
    "start_line": 7195,
    "end_line": 7199,
    "section": "Emphasis and strong emphasis"
  };

console.log("EXpect: ", spec.html);
// console.log(run("# foo *bar* \\*baz\\*\n"));
console.log(run(spec.markdown, true));




// exports default getToken;
// export default getToken;
export default run;