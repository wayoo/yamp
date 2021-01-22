import {
    TRUE,
    FALSE,
    START,
    IN_PRE_HEADER,
    IN_HEADER,
    IN_HEADER_ID,
    IN_TEXT,
    IN_OPEN_BRACKET,
    IN_NL,
    IN_HR,
    IN_ESCAPE,
    IN_FLANK_ASTERISK,
    IN_FLANK_UNDERSCORE,

    DONE,

    HEADER,
    TEXT,
    END,

    CHAR,
    FSPACE,
    SPACE,
    TAB,
    ASTERISK,
    UNDERSCORE,
    NL,
    ENDNL,
    BACKTICK,
    LBRACKET,
    RBRACKET,
    LPAREN,
    RPAREN,
    HASH,
    IN_FSPACE,
    BACKSLASH,
    HR,
    HYPHEN,
    MULTINL,
    PUNCTUATION,
    BFLANK,
    LFLANK,
    RFLANK,
    LFLANK_UNDERSCORE,
    RFLANK_UNDERSCORE,
    BFLANK_UNDERSCORE
} from './globals'
import logger from './logger';

const HTMLElement = {
    H1: Symbol('h1'),
    H2: Symbol('h2'),
    H3: Symbol('h3'),
    H4: Symbol('h4'),
    H5: Symbol('h5'),


}


// function getNextChar() {

// }

// let str = "###### 1 ############# 1212 \nsdasd\n--[1212](asasas) 阿萨说 阿萨说";
// let str = "    # foo\n";
// let str = "    # foo\n";
let str = "";
// let str = "####### foo\n";
// let str = "####### foo\n";
// logger.log('Expect: ', '<p>####### foo</p>\n');
// let str = " ### foo\n  ## foo\n   # foo\n";
// let str = "#                  foo                     \n";
let i = 0;
// let preFSpace = true;
let tokenStringIndex = 0;
let currentTokenType;
let nextTokenType = null;
let nextTokenString = null;
let nextState = null;
let isBlockToken = true;


function load(s) {
    str = s;
    i = 0;
    // preFSpace = true;
    tokenStringIndex = 0;
}
// let str = "--";
// let startI = 0;

// function load(s) {
//     str = s;
//     i = 0;
//     startI = 0;
// }

function getNextChar() {
    return {
        // i: i,
        c: str[i++],
    };
}

function ungetNextChar() {
    i--;
}
// @see https://spec.commonmark.org/0.29/#ascii-punctuation-character
// @see https://en.wikipedia.org/wiki/Basic_Latin_(Unicode_block)  ASCII punctuation and symbols
const punctuationCharacter = [
    '!',
    '"',
    '#',
    '$',
    '%',
    '&',
    '\'',
    '(',
    ')',
    '*',
    '+',
    ',',
    '-',
    '.',
    '/',
    ':',
    ';',
    '<',
    '=',
    '>',
    '?',
    '@',
    '[',
    '\\',
    ']',
    '^',
    '_',
    '`',
    '{',
    '|',
    '}',
    '~',
];

const whiteSpace = [
    ' ',
    ' ', // charcode 160
    '\t',
    '\n',
];
console.error(whiteSpace.includes(' '))

function notWhitespace(c) {
    return !whiteSpace.includes(c);
}
function isWhitespace(c) {
    return whiteSpace.includes(c);
}


// return token once a time
function getToken() {
    let save = TRUE;
    let state;
    if (nextState) {
        state = nextState;
        nextState = null;
    } else {
        state = START;
    }
    let _di = 0;

    if (nextTokenType !== null) {
        const token = {
            tokenType: nextTokenType,
            tokenString: nextTokenString,
        };
        nextTokenType = null;
        nextTokenString = null;
        return token;
    }

    while (state != DONE && _di < 1000) {
        _di++
        const {
            c
        } = getNextChar();
        // !!!!
        // i pointer to next character's position, not currrent c's position
        switch (state) {
            case START:
                // pre check need IN_NL
                if (i === 1) {
                    // first element. 
                    switch (c) {
                        case '#':
                            state = IN_HEADER;
                            currentTokenType = i - 1;
                            continue;
                            break;
                        case ' ':
                            state = IN_FSPACE;
                            currentTokenType = i - 1;
                            continue;
                            break;
                        case '*':
                            state = IN_HR;
                            currentTokenType = i - 1;
                            continue;
                    }
                }
                // 
                if (c == '\\') { // handle escape mark (backslash);
                    tokenStringIndex = i; // ignore current '\' mark, direct point to next char
                    state = IN_ESCAPE;
                } else if (c == '\n') {
                    state = IN_NL;
                    tokenStringIndex = i - 1;
                    break;
                } else if (c == ' ') {
                    currentTokenType = SPACE;
                    state = DONE;
                    break;
                }else if (c == '\t') {
                    currentTokenType = TAB;
                    state = DONE;
                } else if(!punctuationCharacter.includes(c) && c !== undefined){  
                    state = IN_TEXT;
                } else {
                    // this input are all single character identifier
                    state = DONE;
                    switch (c) {
                        case undefined:
                            currentTokenType = END;
                            break;
                        case '#':
                            currentTokenType = HASH;
                            break;
                        case '*':
                            state = IN_FLANK_ASTERISK;
                            tokenStringIndex = i - 1;
                            // currentTokenType = ASTERISK;
                            break;
                        case '-':
                            currentTokenType = HYPHEN;
                            break;
                        case '_':
                            state = IN_FLANK_UNDERSCORE;
                            tokenStringIndex = i - 1;
                            // currentTokenType = UNDERSCORE;
                            break;
                        case '`':
                            currentTokenType = BACKTICK;
                            break
                        case '[':
                            currentTokenType = LBRACKET;
                            break;
                        case ']':
                            currentTokenType = RBRACKET;
                            break;
                        case '(':
                            currentTokenType = LPAREN;
                            break;
                        case ')':
                            currentTokenType = RPAREN;
                            break;
                        case '\n':
                            currentTokenType = NL;
                            break
                        default:
                            if (punctuationCharacter.includes(c)) {
                                currentTokenType = PUNCTUATION;
                            } else {
                                logger.error('[Scanner]cant handle from START: ' + c);
                            }
                    }
                }
                break;
            case IN_NL:
                // if not first element ( i === 1) , generate new line token first
                if (c === '\n') {
                    continue;
                } else {
                    state = DONE;
                    if (i - tokenStringIndex > 2) {
                        currentTokenType = MULTINL;
                    } else if (c === undefined){
                        currentTokenType = ENDNL;
                    } else {
                        currentTokenType = NL;
                    }
                    // check before
                }
                switch (c) {
                    case ' ':
                        nextState = IN_FSPACE;
                        i--;
                        // i = tokenStringIndex + 1;
                        break;
                    case '#':
                        nextState = IN_HEADER;
                        // set back i to the preused char after determined next State;
                        i--
                        // i = tokenStringIndex + 1;
                        break;
                    case '*':
                        nextState = IN_HR;
                        i--
                        // i = tokenStringIndex + 1;
                        break;
                    case undefined:
                        // no more input, do not handle
                        break;
                    default:
                        // nextState = IN_TEXT;
                        i--
                        // i = tokenStringIndex + 1;
                        break;
                }
                break;
            case IN_HEADER:
                // \n take one position, default gap is 1
                // so need to check five gap to ensure four tab
                if (c === '#' && ((i - tokenStringIndex) <= 7)) {
                    continue;
                } else {
                    if ((i - tokenStringIndex > 7)) {
                        // not valid header token
                        state = IN_TEXT;
                        continue;
                    } else if (c === ' ') {
                        currentTokenType = HEADER;
                        state = DONE;
                    } else if (c === '\n') {
                        ungetNextChar();
                        currentTokenType = HEADER;
                        state = DONE;
                    } else {
                        state = IN_TEXT;
                        continue;
                    }
                }
                break;
            case IN_HR:
                if (c == '*' && ((i-tokenStringIndex) < 4)) {
                    continue;
                } else {
                    if (i - tokenStringIndex === 5) {
                    }
                    if ((i - tokenStringIndex) >= 4) {
                        if (c == ' ' || c == '*') {
                            continue;
                        } else if (c == '\n') {
                            ungetNextChar();
                            currentTokenType = HR;
                            state = DONE;
                            // !!! very important
                            continue;
                        }
                    }
                    // not hr , restore back to normal input 
                    state = IN_FLANK_ASTERISK;
                    // currentTokenType = IN_FLANK;
                    i = tokenStringIndex + 1;
                }
                break;
            case IN_FSPACE:
                if (c == ' ' && ((i - tokenStringIndex) < 5)) {
                    continue
                } else {
                    if (i - tokenStringIndex >= 5) {
                        ungetNextChar();
                        currentTokenType = FSPACE;
                        state = DONE;
                    } else if(c === '#'){
                        // preFSpace = false;
                        state = IN_HEADER;
                        tokenStringIndex = i - 1;
                    } else {
                        state = IN_TEXT;
                    }
                }
                break;
            case IN_TEXT:
                if (punctuationCharacter.includes(c) || c === undefined || c === '\n') {
                    // backup in the input
                    ungetNextChar();
                    save = FALSE;
                    state = DONE;
                    currentTokenType = TEXT;
                }
                break;
            case IN_FLANK_UNDERSCORE:
                if (c === '_') {
                    continue;
                }
                check_flank_token('_', c);
                state = DONE;
                ungetNextChar();
                break;
            case IN_FLANK_ASTERISK:
                if (c === '*') {
                    continue;
                }
                check_flank_token('*', c);
                state = DONE;
                ungetNextChar();
                break;
            case IN_ESCAPE:
                currentTokenType = CHAR;
                state = DONE;
                break;
            default:
                logger.error(state, `State Error input ${c}`);
                state = DONE;
                break;
        }
    }
    let tokenString;
    if (state === DONE) {
        tokenString = str.slice(tokenStringIndex, i);
        tokenStringIndex = i;
    }
    
    return {
        tokenType: currentTokenType,
        tokenString: tokenString,
    };
}

function check_flank_token(symbol, c) {
    // For purposes of this definition, the beginning and the end of the line
    // count as Unicode whitespace.
    let isLeftFlank = false, 
        isRightFlank = false;
    // TODO
    const prevC = str[tokenStringIndex - 1];
    if (notWhitespace(c)) {
        if (punctuationCharacter.includes(c)) {
            if ((isWhitespace(prevC) || prevC === undefined) || punctuationCharacter.includes(prevC)) {
                isLeftFlank = true;
            }
        } else if (c !== undefined){
            // not followed by puctuation character
            isLeftFlank = true;
        }
    }
    if (notWhitespace(prevC)) {
        if (punctuationCharacter.includes(prevC)) {
            if ((isWhitespace(c) || c === undefined) || punctuationCharacter.includes(c)) {
                isRightFlank = true;
            }
        } else if(prevC !== undefined){
            isRightFlank = true;
        }
    }

    if (isLeftFlank && isRightFlank) {
        currentTokenType = symbol === '*' ? BFLANK : BFLANK_UNDERSCORE;
    } else if (isLeftFlank) {
        currentTokenType = symbol === '*' ? LFLANK : LFLANK_UNDERSCORE;
    } else if (isRightFlank) {
        currentTokenType = symbol === '*' ? RFLANK : RFLANK_UNDERSCORE;;
    } else {
        currentTokenType = TEXT;
    }
    console.log(currentTokenType)
}

export default {
    getToken,
    load,
}