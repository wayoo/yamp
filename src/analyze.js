import { CODE, SPACE, TEXT,
    NL,

} from "./globals";

let level = 0;

// traverse nodeTree, do semantic analyze
function traverse(t, preProc, postProc) {
    if (t != undefined) {
        preProc(t);
        for (var i = 0, l = t.child.length; i < l; i++) {
            level += 1;
            traverse(t.child[i], preProc, postProc);
            level -= 1;
        }
        postProc(t);
        if (t.sibling) {
            traverse(t.sibling, preProc, postProc);
        }
    }
}

function nullProc() {}

function preProcess(t) {
    mergeTextSibling(t);
    addLevel(t);
    recoverInlineElement(t);
}

function mergeTextSibling(t) {
    if (t.type === TEXT) {
        while([SPACE, TEXT].includes(t.sibling.type)) {
            const sib = t.sibling;
            t.raw += sib.raw;
            t.sibling = sib.sibling;
        }
    }
    // if (t.type === TEXT && [SPACE, TEXT].includes(t.sibling.type)) {
    // } 
}

const  inlineElements = [TEXT, CODE];
function recoverInlineElement(t) {
    // only treat root level element
    if (t.level === 0) {
        if (inlineElements.includes(t.type)) {
            let nextElem = t.sibling;
            let thirdElem = nextElem ? nextElem.sibling : null;            

            while(nextElem && thirdElem && nextElem.type === NL &&
                    [CODE, NL].includes(thirdElem.type)) {
                t.raw = t.raw + '\n' + thirdElem.raw;
                t.sibling = thirdElem.sibling;
                nextElem = t.sibling;
                thirdElem = nextElem ? nextElem.sibling : null;
            }
            if (nextElem && nextElem.type === NL) {
                t.raw = t.raw + '\n';
                t.sibling = nextElem.sibling ? nextElem.sibling : null;
            }

            // while(nextElem && nextElem.type === NL) {
            //     if (thirdElem && [CODE].includes(thirdElem.type)) {
            //         t.raw = t.raw + '\n' + thirdElem.raw;
            //         t.sibling = thirdElem.sibling;
            //         nextElem = t.sibling;
            //         thirdElem = nextElem ? nextElem.sibling : null;
            //     } else {
            //         // t.raw = t.raw + '\n';
            //         // t.sibling = nextElem;
            //         // nextElem = t.sibling;
            //         // thirdElem = nextElem ? nextElem.sibling : null;
            //     }
            // }
        }
        // if [TEXT].includes(t.type && t.sibling.type === NL) {

        // }
    }
}
 
function addLevel (t) {
    t.level = level;
}

function analyze(t) {
    level = 0;
    traverse(t, preProcess, nullProc);
}

export default analyze;