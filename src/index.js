import scaner from './scaner';
import parser from './parser';
import render from './render';
import { END } from './globals';


// window.scanner = scaner;
// while (scaner.getToken().type != END) {
// }
const ast = parser.parse()
console.log(render(ast));

if (typeof window !== "undefined") {
    // window.scaner = scaner;
    window.run = run;
}
function run(str) {
    console.log(str);
    scaner.load(str);
    const ast = parser.parse();
    return render(ast);
}





// exports default getToken;
// export default getToken;
export default run;