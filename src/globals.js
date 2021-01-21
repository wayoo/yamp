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
export const IN_ESCAPE = Symbol('in_escape \\');
export const IN_HR = Symbol('in_hr');
const DONE = Symbol('done');
export const IN_ASTERISK = Symbol('in_asterisk');
export const IN_ASTERISK_DOUBLE = Symbol('in_asterisk_double');
export const IN_FLANK = Symbol('in_flank');
export const IN_FLANK_ASTERISK = Symbol('in_flanking_asterisk');
export const IN_FLANK_UNDERSCORE = Symbol('in_flanking_underscore');


// token
const HEADER = Symbol('header');
const TEXT = Symbol('text');
const END = Symbol('end');
const FSPACE = Symbol('four_space');

// HTML Elemet
export const CODE = Symbol('code');
export const HR = Symbol('hr');
export const EM = Symbol('em');
export const STRONG = Symbol('strong');
export const PARAGRAPH = Symbol('paragraph');
export const INLINE = Symbol('inline');
export const RAW = Symbol('raw');

// special symbols
// *
const ASTERISK = Symbol('asterisk'); 
// _
const UNDERSCORE = Symbol('underscore'); 
// \n
const NL = Symbol('newline');
export const MULTINL = Symbol('multiple newline');
const BACKTICK = Symbol('backtick');
export const IN_OPEN_BRACKET = Symbol('in_open_bracket');
export const LBRACKET = Symbol('left_bracket');
export const RBRACKET = Symbol('right_bracket');
export const LPAREN = Symbol('left_parenthesis');
export const RPAREN = Symbol('right_parentheis');
export const SPACE = Symbol('space');
export const TAB = Symbol('tab');
export const HASH = Symbol('hash_tag');
export const BACKSLASH = Symbol('back_slash');
export const CHAR = Symbol('char');
export const HYPHEN = Symbol('hyphen');
export const PUNCTUATION = Symbol('punctuation');
export const BFLANK = Symbol('both left and right-flanking');
export const LFLANK = Symbol('left flanking');
export const RFLANK = Symbol('right flanking');
export const BFLANK_UNDERSCORE = Symbol('both l&r flankigng underscore');
export const LFLANK_UNDERSCORE = Symbol('left flanking underscore');
export const RFLANK_UNDERSCORE = Symbol('right flanking underscore');

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