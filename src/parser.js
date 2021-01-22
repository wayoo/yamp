import scaner from './scaner';
import logger from './logger';
import {
    TRUE,
    FALSE,
    START,
    IN_PRE_HEADER,
    IN_HEADER,
    IN_HEADER_ID,
    IN_TEXT,
    IN_OPEN_BRACKET,

    DONE,

    HEADER,
    TEXT,
    END,
    PARAGRAPH,
    INLINE,

    SPACE,
    TAB,
    ASTERISK,
    UNDERSCORE,
    NL,
    BACKTICK,
    LBRACKET,
    RBRACKET,
    LPAREN,
    RPAREN,
    HASH,
    FSPACE,
    EM,
    HYPHEN,
    

    CODE,
    CHAR,
    HR,
    STRONG,
    RAW,
    MULTINL,
    BFLANK,
    LFLANK,
    RFLANK,
    LFLANK_UNDERSCORE,
    RFLANK_UNDERSCORE,
    BFLANK_UNDERSCORE,
    PUNCTUATION,
    ENDNL,
} from './globals';

class TreeNode {
    constructor(type, raw) {
        this.type = type;
        this.raw = raw;
        this.child = [];
        this.sibling;
    }
}

let tokenType, tokenString, textCache = [];


class TokenHelper {
    constructor() {
        this.cachedTokenList = [];
        this.useCachedToken = false;
        this.usedCacheTokenIndex = 0;
    }
    getAndCache() {
        this.getToken();
        const token = {tokenType, tokenString};

        this.cachedTokenList.push(token);
        return token;
    }
    useCachedTokens() {
        this.useCachedToken = true;
    }
    getToken() {
        const token = scaner.getToken();

        ({ tokenType, tokenString } = token);
        logger.log('====>:', tokenType, tokenString);
        return token;
    }
    prevToken() {
        return this.cachedTokenList[this.cachedTokenList.length - 2];
    }
    clearCache() {
        this.cachedTokenList = [];
    }
    dump() {
        const str = this.cachedTokenList.map((item) => item.tokenString).join('');
        // const str = this.cachedTokenList.join('');
        this.cachedTokenList = [];
        return str;
    }
    dumpWithoutCurrent() {
        this.cachedTokenList.pop();
        const str = this.cachedTokenList.map((item) => item.tokenString).join('');
        // const str = this.cachedTokenList.join('');
        this.cachedTokenList = [];
        return str;
    }
}

const tokenHelper = new TokenHelper();

function match(expectToken) {
    if (tokenType == expectToken) {
        ({ tokenType, tokenString } = scaner.getToken());
    } else {
        logger.error("[match] unexpected token -> ");
        logger.log(tokenType, tokenString);
    }
}
function matchWithCache(expectToken) {
    if (tokenType == expectToken) {
        ({ tokenType, tokenString } = tokenHelper.getAndCache());
    } else {
        logger.error("[match] unexpected token -> ");
        logger.log(tokenType, tokenString);
    }
}



function stmt_sequence() {
    let t = statement();
    let p = t;

    while (tokenType != END) {
        let q = statement();
        if (q != undefined) {
            if (t === undefined) {
                t = p = q;
            } else {
                p.sibling = q;
                p = q;
            }
        }
    }
    
    return t;
}

function inline_stmt_sequence() {
    let t = inline_statement();
    let p = t;
    while (tokenType != NL && tokenType != END) {
        let q = inline_statement();
        if (q !== undefined) {
            if (t === undefined) {
                t = p = q;
            } else {
                p.sibling = q;
                p = q;
            }
        }
    }
    return t;
}

function p_stmt_sequence() {
    let t = new TreeNode(PARAGRAPH);    
    t.child[0] = p_statement();
    let p = t.child[0], q, prev;
    // add to same paragraph
    while(![HEADER, END, MULTINL, ENDNL].includes(tokenType)) {
        q = p_statement();
        if (q !== undefined) {
            if (p === undefined) {
                t.child[0] = p = q;
            } else {
                p.sibling = q;
                prev = p;
                p = q;
            }
        }
    }
    // remove last newline symbol from child to sibling
    if (tokenType === END) {
        if (q !== undefined && q.type === NL) {
            t.sibling = p;
            prev.sibling = undefined;
        }
    }
    return t;
}

function p_statement() {
    let t;
    switch(tokenType) {
        case TEXT:
            t =  text_stmt();
            break;
        case HYPHEN:
        case CHAR:
        case HASH:
            t = raw_stmt();
            break;
        case NL:
            t = newline_stmt()
            break;
        case SPACE:
            t = space_stmt();
            break;
        case BFLANK:
        case LFLANK:
            t = flanking_stmt();            
            break;
        case LFLANK_UNDERSCORE:
            t = underscore_flanking_stmt();
            break;
        case RFLANK:
        case BFLANK_UNDERSCORE:
        case RFLANK_UNDERSCORE:
            t = raw_stmt();
            break;
        case PUNCTUATION:
            t = punctucation_stmt();
            break;
        // case ASTERISK:
        //     t = em_stmt(ASTERISK, '*');
        //     break;
        // case UNDERSCORE:
        //     t = em_stmt(UNDERSCORE, '_');
        //     break;
        default:
            // t = default_inline_stmt();
            logger.error("not handled ", tokenType, tokenString);
            tokenHelper.getAndCache();
            break;
    }
    return t;
}
// block element, doesn't need double NL to start paragraph
// HEADER, 

function statement() {
    let t;
    switch (tokenType) {
        case HEADER:
            t = head_stmt();
            break;
        case NL:
            t = newline_stmt();
            break;
        case MULTINL:
            t = multi_newline_stmt();
            break;
        // case TEXT:
        //     t =  text_stmt();
        //     break;
        // case CHAR:
        // case HYPHEN:
        // case HASH:
        //     t = raw_stmt();
        //     break;
        // case SPACE:
        //     t = space_stmt();
        //     break;
        case FSPACE:
            t = four_space_stmt();
            break;
        case HR:
            t = simple_node(HR);
            break;
        case ENDNL:
            t = raw_stmt();
            break;
        // case ASTERISK:
        //     t = em_stmt(ASTERISK, '*');
        //     break;
        // case UNDERSCORE:
        //     t = em_stmt(UNDERSCORE, '_');
        //     break;
        default:
            console.log("default paragraph");
            t = p_stmt_sequence();
            break;
            // tokenHelper.getAndCache();
            // break;
    }
    return t;
}

function simple_node (n) {
    match(n);
    return new TreeNode(n);
}

function inline_statement() {
    // logger.log('inline state mentl', tokenString);
    let t;
    switch(tokenType) {
        case HASH:
            if (tokenString === '#') {
                t = merge_hash_exp();
            } else {
                t = default_inline_stmt();
            }
            break;
        case SPACE:
            t = space_stmt();
            break;
        case ASTERISK:
            t = em_stmt(ASTERISK, '*');
            break;
        case UNDERSCORE:
            t = em_stmt(UNDERSCORE, '_');
            break;
        default:
            t = default_inline_stmt();
            break;
    }
    return t;
}

function newline_stmt() {
    logger.log("new line ....")
    const t = new TreeNode(NL);
    t.raw = tokenString;
    match(NL);
    
    return t;
}

function multi_newline_stmt() {
    const t = new TreeNode(MULTINL);
    t.raw = tokenString;
    match(MULTINL);
    
    return t;
}

function text_stmt() {
    logger.log(tokenType, tokenString);
    const t = new TreeNode(TEXT);
    let str  = '';
    // tokenHelper.clearCache();
    // at least load one more next token
    do {
        str += tokenString
        tokenHelper.getAndCache();
    } while ([TEXT, UNDERSCORE].includes(tokenType))

    t.raw = str;
    // match(NL);
    return t;
}

function raw_stmt() {
    const t = new TreeNode(RAW);
    let str = '';
    t.raw = tokenString;
    tokenHelper.getAndCache();
    // match(NL);
    return t;
}

function head_stmt() {
    const t = new TreeNode(HEADER);
    t.num = tokenString.trim().length;

    match(HEADER);

    if(tokenType === NL){
        // directly followed by newline element, have no children;
        return t;    
    } else {
        t.child[0] = inline_stmt_sequence();
        t.raw = tokenHelper.dump();
    }
    return t;
}

function multiline_text_stmt() {
    // t = 
};

function default_inline_stmt() {
    const t = new TreeNode("default inline stmt");
    t.raw = tokenString;
    t.rawType = tokenType;
    tokenHelper.getAndCache();
    return t;
}

function space_stmt() {
    let i = 0;
    do {
        tokenHelper.getAndCache();
        i++;
    } while (tokenType === SPACE);
    const t = new TreeNode(SPACE);
    t.num = i;
    t.raw = ' '.repeat(i);
    // t.raw = tokenHelper.dump();
    // logger.log(i)
    // logger.log(tokenType, tokenString);
    return t;
}

// filter 4 space
function four_space_stmt() {
    do {
        tokenHelper.getAndCache();
    } while (tokenType !== NL && tokenType !== END);
    // tokenType === NL
    const t = new TreeNode(CODE);
    t.value = tokenHelper.dumpWithoutCurrent();
    t.raw = '    ' + t.value;

    return t;
}


function merge_hash_exp() {
    const t = new TreeNode(HASH);
    let s = '';
    do {
        s += tokenString;
        tokenHelper.getAndCache();
    } while(tokenType === HASH)
    t.raw = s;
    t.value = s;
    return t;
}

function link_stmt() {

};
// // rewite em statement 
// tT = ASTERISK
// tS = '*'

function underscore_flanking_stmt(inMiddle) {
    let t = new TreeNode(INLINE);
    let p = t.child[0] = new TreeNode(TEXT, '');
    let q;
    let openS = tokenString;
    tokenHelper.getAndCache();
    let state = 'matching';
    while(openS.length && tokenType !== MULTINL && tokenType !== END && tokenType !== ENDNL) {
        if (tokenType === LFLANK) {
            q = flanking_stmt(true);
        } else if (tokenType === LFLANK_UNDERSCORE) {
            q = underscore_flanking_stmt();
        } else if (inMiddle && tokenType === RFLANK){
            t.child[0].raw = openS;
            return t;
        } else if (tokenType === RFLANK_UNDERSCORE) {
            if (openS.length <= tokenString.length) {
                t = buildEmphasisTree(t, openS.length);
                if (openS.length < tokenString.length) {
                    tokenType = RFLANK_UNDERSCORE;
                    tokenString = tokenString.slice(openS.length);
                } else {
                    match(tokenType);
                }
                return t;
            } else if (openS.length > tokenString.length) {
                // wrap current t as child of em, continue right-flanking matching
                t = buildEmphasisTree(t, tokenString.length);
                q = new TreeNode(INLINE, t);
                q.child[0] = t;
                t = q;
                p = t.child[0];
                openS = openS.slice(0, - tokenString.length);
                match(tokenType)
                continue;
            }
        } else {
            q = new TreeNode(TEXT, tokenString);
            tokenHelper.getAndCache();
        }
        p.sibling = q;
        p = q;
    }

    if (tokenType === END || tokenType === ENDNL) {
        // t = new TreeNode(TEXT);
        // t.raw = openS + s;
        t.type = INLINE;
        q = new TreeNode(TEXT, openS);
        q.sibling = t.child[0];
        t.child[0] = q;
    }
    return t;
        // tokenHelper.ge
}

function flanking_stmt(inMiddle) {
    let t = new TreeNode(INLINE);
    let p = t.child[0] = new TreeNode(TEXT, '');
    let q;
    let openS = tokenString;
    let openToken = tokenType;
    tokenHelper.getAndCache();
    let state = 'matching';
    while(openS.length && tokenType !== MULTINL && tokenType !== END && tokenType !== ENDNL) {
        if (tokenType === LFLANK || (tokenType === BFLANK && openToken !== BFLANK)) {
            console.log("second matching")
            q = flanking_stmt();
        } else if (tokenType === LFLANK_UNDERSCORE) {
            q = underscore_flanking_stmt(true);
        } else if (inMiddle && tokenType === RFLANK_UNDERSCORE){
            t.child[0].raw = openS;
            return t;
        } else if (tokenType === RFLANK || tokenType === BFLANK) {
            if (openS.length <= tokenString.length) {
                t = buildEmphasisTree(t, openS.length);
                // if (openS.length === 1) { t.type = EM }
                // if (openS.length >= 2) { t.type = STRONG }
                if (openS.length < tokenString.length) {
                    tokenType = RFLANK;
                    tokenString = tokenString.slice(openS.length);
                } else {
                    match(tokenType);
                }
                return t;
            } else if (openS.length > tokenString.length) {
                // wrap current t as child of em, continue right-flanking matching
                t = buildEmphasisTree(t, tokenString.length);
                q = new TreeNode(INLINE, t);
                q.child[0] = t;
                t = q;
                p = t.child[0];
                openS = openS.slice(0, - tokenString.length);
                match(tokenType)
                continue;
            }
        } else {
            q = new TreeNode(TEXT, tokenString);
            tokenHelper.getAndCache();
        }
        p.sibling = q;
        p = q;
    }

    if (tokenType === END || tokenType === ENDNL) {
        // t = new TreeNode(TEXT);
        // t.raw = openS + s;
        t.type = INLINE;
        q = new TreeNode(TEXT, openS);
        q.sibling = t.child[0];
        t.child[0] = q;
    }
    return t;
    // tokenHelper.ge
}

// t root element 
// p t's last child
function buildEmphasisTree(t, num) {
    let p, q;
    if (num === 1) {
        t.type = EM;
        return t;
    } else if (num === 2) {
        t.type = STRONG;
        return t;
    } else {
        t.type = STRONG;
        num -= 2;
        p = t;
        while(num >= 2) {
            q = new TreeNode(STRONG);
            q.child[0] = p;
            p = q;
            num -=2;
        }
        if (num === 1) {
            q = new TreeNode(EM);
            q.child[0] = p;
            p = q;
        }
        return p;
    }
}

function _flanking_stmt(inMiddle) {
    let t = new TreeNode(EM);
    let p = t.child[0] = new TreeNode(TEXT, '');
    let q;
    let openS = tokenString;
    tokenHelper.getAndCache();
    let s = '';
    do {
        if (tokenType === LFLANK || tokenType === BFLANK) {
            q = flanking_stmt();
        } else if (tokenType === LFLANK_UNDERSCORE) {
            q = underscore_flanking_stmt(true);
        } else {
            console.log(tokenString, 'OOOOO');
            q = new TreeNode(TEXT, tokenString);
            tokenHelper.getAndCache();
        }
        p.sibling = q;
        p = q;
    } while(tokenType !== BFLANK 
                && tokenType !== RFLANK 
                && tokenType !== MULTINL 
                && tokenType !== ENDNL
                && tokenType !== END)
    if (tokenType === BFLANK || tokenType === RFLANK) {
        if (tokenString.length === 2) {
            t.type = STRONG;
            // t = new TreeNode(STRONG);
        }
        if (openS.length > tokenString.length) {
            // prepend exceed element
            // q = new TreeNode(TEXT, openS.slice(0, - tokenString.length));
            // q.sibling = t.child[0].sibling;
            // t.child[0] = q;
            p = t;
            t = new TreeNode(INLINE);
            t.child[0] = new TreeNode(TEXT, openS.slice(0, - tokenString.length))
            t.child[0].sibling = p
        }
        // match currentToken
        match(tokenType);
    } else if (tokenType === END || tokenType === ENDNL) {
        // t = new TreeNode(TEXT);
        // t.raw = openS + s;
        t.type = INLINE;
        q = new TreeNode(TEXT, openS);
        q.sibling = t.child[0];
        t.child[0] = q;
    }
    // tokenHelper.getAndCache();
    return t;
}

const escapeMap = {
    '"': '&quot;',
}
function punctucation_stmt() {
    const t = new TreeNode(PUNCTUATION);
    t.raw = tokenString;
    
    t.value = escapeMap[tokenString] || tokenString;

    match(PUNCTUATION);
    return t;
}

function line_exp() {
    const t = new treeNode();
}


let INDENT = 0;
function printTree(treeNode) {
    logger.log(' '.repeat(INDENT), treeNode.type, treeNode);
    let l = treeNode.child.length;
    if (l > 0) {
        INDENT += 4;
        for (let i = 0; i < l; i++) {
            printTree(treeNode.child[i]);
        } 
        INDENT -= 4;
    }


    if (treeNode.sibling) {
        printTree(treeNode.sibling);
    }
}

let rootT;

function parse() {
    ({ tokenType, tokenString } = tokenHelper.getAndCache());
    rootT = null;
    rootT = stmt_sequence();
    if (tokenType != END) {
        logger.error("Code ends before file\n");
        logger.log(tokenType);
    }

    logger.log('=== TTTTTTT ======= :::::')
    printTree(rootT)

    logger.log(rootT);
    return rootT;
}

export default {
    parse
};