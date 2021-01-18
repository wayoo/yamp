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

console.log("EXpect: ", '<p>__foo bar __</p>\n');
// console.log(run("# foo *bar* \\*baz\\*\n"));
console.log(run("__foo bar __\n", true));




// exports default getToken;
// export default getToken;
export default run;