const TRUE = Symbol('true');
const FALSE = Symbol('false');
// state
const START = Symbol('start');
const IN_PRE_HEADER = Symbol('in_pre_header');
const IN_HEADER = Symbol('in_header');
const IN_HEADER_ID = Symbol('in_header_id');
const IN_TEXT = Symbol('in_text');
export const IN_NL = Symbol('in_nl');
export const IN_FSPACE = Symbol('in_four_space');
const DONE = Symbol('done');



// token
const HEADER = Symbol('header');
const TEXT = Symbol('text');
const END = Symbol('end');
const FSPACE = Symbol('four_space');

// HTML Elemet
export const CODE = Symbol('code');

// special symbols
// *
const ASTERISK = Symbol('asterisk'); 
// _
const UNDERSCORE = Symbol('underscore'); 
// \n
const NL = Symbol('newline');
const BACKTICK = Symbol('backtick');
export const IN_OPEN_BRACKET = Symbol('in_open_bracket');
export const LBRACKET = Symbol('left_bracket');
export const RBRACKET = Symbol('right_bracket');
export const LPAREN = Symbol('left_parenthesis');
export const RPAREN = Symbol('right_parentheis');
export const SPACE = Symbol('space');
export const TAB = Symbol('tab');
export const HASH = Symbol('hash_tag');

export {
    TRUE,
    FALSE,
    START,
    IN_PRE_HEADER,
    IN_HEADER,
    IN_HEADER_ID,
    IN_TEXT,
    DONE,


    HEADER,
    TEXT,
    END,

    ASTERISK,
    UNDERSCORE,
    NL,
    BACKTICK,
    FSPACE,
}