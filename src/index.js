import scaner from './scaner';
import parser from './parser';
import analyze from './analyze';
import render from './render';
import { END } from './globals';


// window.scanner = scaner;
// while (scaner.getToken().type != END) {
// }

if (typeof window !== "undefined") {
    // window.scaner = scaner;
    window.run = run;
}
function run(str) {
    console.log(str);
    scaner.load(str);
    const ast = parser.parse();
    analyze(ast);
    return render(ast);
}

console.log("EXpect: ", '<h3>foo ###</h3>\n<h2>foo ###</h2>\n<h1>foo #</h1>\n');
console.log(run("### foo \\###\n## foo #\\##\n# foo \\#\n"));




// exports default getToken;
// export default getToken;
export default run;