// traverse nodeTree, do semantic analyze
function traverse(t, preProc, postProc) {
    if (t != NULL) {
        preProc(t);
        for (var i = 0, l = t.child.length; i < l; i++) {
            traverse(t.child[i], preProc, postProc);
        }
        postProc(t);
        if (t.sibling) {
            traverse(t.sibling, preProc, postProc);
        }
    }
}

function nullProc() {}