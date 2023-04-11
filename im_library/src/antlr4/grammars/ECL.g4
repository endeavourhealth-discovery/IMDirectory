grammar ECL;
ecl :  ws expressionconstraint ws EOF;
expressionconstraint :  ws ( refinedexpressionconstraint | compoundexpressionconstraint | dottedexpressionconstraint | subexpressionconstraint ) ws ;
refinedexpressionconstraint : (subexpressionconstraint | bracketcompoundexpressionconstraint) ws COLON ws eclrefinement;
compoundexpressionconstraint : conjunctionexpressionconstraint | disjunctionexpressionconstraint | exclusionexpressionconstraint ;
conjunctionexpressionconstraint : (subexpressionconstraint | bracketcompoundexpressionconstraint) (ws conjunction ws (subexpressionconstraint | bracketcompoundexpressionconstraint))+;
disjunctionexpressionconstraint : (subexpressionconstraint | bracketcompoundexpressionconstraint) (ws disjunction ws (subexpressionconstraint | bracketcompoundexpressionconstraint))+;
exclusionexpressionconstraint : (subexpressionconstraint | bracketcompoundexpressionconstraint) ws exclusion ws  (subexpressionconstraint | bracketcompoundexpressionconstraint);
bracketcompoundexpressionconstraint : LEFT_PAREN ws (refinedexpressionconstraint | compoundexpressionconstraint | subexpressionconstraint) ws RIGHT_PAREN;
dottedexpressionconstraint : subexpressionconstraint (ws dottedexpressionattribute)+;
dottedexpressionattribute : dot ws subexpressionconstraint;
subexpressionconstraint : (constraintoperator ws)? (memberof ws)? eclfocusconcept ;
eclfocusconcept : eclconceptreference | wildcard;
dot : PERIOD;
memberof : CARAT;
eclconceptreference : conceptid (ws PIPE ws term ws PIPE)? ;
conceptid : sctid ;
term : nonwsnonpipe+  ( sp+ nonwsnonpipe+ )*;
wildcard : ASTERISK;
constraintoperator : childof | descendantorselfof | descendantof | parentof | ancestororselfof | ancestorof;
descendantof : (LESS_THAN | ((D|CAP_D) (E|CAP_E) (S|CAP_S) (C|CAP_C) (E|CAP_E) (N|CAP_N) (D|CAP_D) (A|CAP_A) (N|CAP_N) (T|CAP_T) (O|CAP_O) (F|CAP_F)));
descendantorselfof : ((LESS_THAN LESS_THAN) | ((D|CAP_D) (E|CAP_E) (S|CAP_S) (C|CAP_C) (E|CAP_E) (N|CAP_N) (D|CAP_D) (A|CAP_A) (N|CAP_N) (T|CAP_T) (O|CAP_O) (R|CAP_R) (S|CAP_S) (E|CAP_E) (L|CAP_L) (F|CAP_F) (O|CAP_O) (F|CAP_F)));
childof : ((LESS_THAN EXCLAMATION) | ((C|CAP_C) (H|CAP_H) (I|CAP_I) (L|CAP_L) (D|CAP_D) (O|CAP_O) (F|CAP_F)));
ancestorof : (GREATER_THAN | ((A|CAP_A) (N|CAP_N) (C|CAP_C) (E|CAP_E) (S|CAP_S) (T|CAP_T) (O|CAP_O) (R|CAP_R) (O|CAP_O) (F|CAP_F))) ;
ancestororselfof : ((GREATER_THAN GREATER_THAN) | ((A|CAP_A) (N|CAP_N) (C|CAP_C) (E|CAP_E) (S|CAP_S) (T|CAP_T) (O|CAP_O) (R|CAP_R) (O|CAP_O) (R|CAP_R) (S|CAP_S) (E|CAP_E) (L|CAP_L) (F|CAP_F) (O|CAP_O) (F|CAP_F)));
parentof : ((GREATER_THAN EXCLAMATION) | ((P|CAP_P) (A|CAP_A) (R|CAP_R) (E|CAP_E) (N|CAP_N) (T|CAP_T) (O|CAP_O) (F|CAP_F)));
conjunction : ((A|CAP_A) (N|CAP_N) (D|CAP_D) mws) | COMMA;
disjunction : (O|CAP_O) (R|CAP_R) mws;
exclusion : (M|CAP_M) (I|CAP_I) (N|CAP_N) (U|CAP_U) (S|CAP_S) mws;
eclrefinement : subrefinement | compoundrefinementset;
compoundrefinementset: conjunctionrefinementset | disjunctionrefinementset;
conjunctionrefinementset : (subrefinement | bracketcompoundrefinementset) (ws conjunction ws (subrefinement | bracketcompoundrefinementset))+;
disjunctionrefinementset : (subrefinement | bracketcompoundrefinementset) (ws disjunction ws (subrefinement | bracketcompoundrefinementset))+;
bracketcompoundrefinementset: LEFT_PAREN ws compoundrefinementset ws RIGHT_PAREN;
subrefinement : compoundattributeset | eclattributegroup | bracketsubrefinement | eclattribute;
bracketsubrefinement : LEFT_PAREN ws eclrefinement ws RIGHT_PAREN;
compoundattributeset : conjunctionattributeset | disjunctionattributeset;
conjunctionattributeset : (subattributeset | bracketattributeset) (ws conjunction ws (subattributeset | bracketattributeset))+;
disjunctionattributeset : (subattributeset | bracketattributeset) (ws disjunction ws (subattributeset | bracketattributeset))+;
bracketattributeset: LEFT_PAREN ws compoundattributeset ws RIGHT_PAREN;
subattributeset : eclattribute | bracketattributeset;
eclattributegroup : (cardinality ws)? LEFT_CURLY_BRACE ws (compoundattributeset | eclattribute) ws RIGHT_CURLY_BRACE;
eclattribute : (cardinality ws)? (reverseflag ws)? subexpressionconstraint ws (eclattributeexpressionvalue | eclattributenumbervalue | eclattributestringvalue);
eclattributestringvalue: stringcomparisonoperator ws qm stringvalue qm;
eclattributenumbervalue: numericcomparisonoperator ws POUND numericvalue;
eclattributeexpressionvalue: expressioncomparisonoperator ws (subexpressionconstraint | bracketcompoundexpressionconstraint);
cardinality : LEFT_BRACE minvalue to maxvalue RIGHT_BRACE;
minvalue : nonnegativeintegervalue;
to : (PERIOD PERIOD) | (mws (T | CAP_T) (O | CAP_O) mws);
maxvalue : nonnegativeintegervalue | many;
many : ASTERISK | ((M | CAP_M) (A | CAP_A) (N | CAP_N) (Y | CAP_Y) );
reverseflag : ((R | CAP_R ) (E | CAP_E) (V | CAP_V) (E | CAP_E) (R | CAP_R) (S | CAP_S) (E | CAP_E) (O | CAP_O) (F | CAP_F)) | ((R | CAP_R) mws);
expressioncomparisonoperator : EQUALS | (EXCLAMATION EQUALS) | ((N | CAP_N) (O | CAP_O) (T | CAP_T) mws EQUALS);
numericcomparisonoperator : EQUALS | (EXCLAMATION EQUALS) | ((N | CAP_N) (O | CAP_O) (T | CAP_T) mws EQUALS) | (LESS_THAN EQUALS) | LESS_THAN | (GREATER_THAN EQUALS) | GREATER_THAN;
stringcomparisonoperator : EQUALS | (EXCLAMATION EQUALS) | ((N | CAP_N) (O | CAP_O) (T | CAP_T) mws EQUALS);
numericvalue : ('-'|'+')? (decimalvalue | integervalue);
stringvalue : (anynonescapedchar | escapedchar)+;
integervalue :  (digitnonzero digit*) | zero;
decimalvalue : integervalue PERIOD digit+;
nonnegativeintegervalue : (digitnonzero digit* ) | zero;
sctid :  (H T T P nonspacechar+) |(digitnonzero ( digit ) (digit) (digit) (digit) (digit) ((digit)? | ((digit) (digit)) | ((digit) (digit) (digit)) | ((digit) (digit) (digit) (digit)) | ((digit) (digit) (digit) (digit) (digit)) | ((digit) (digit) (digit) (digit) (digit) (digit)) | ((digit) (digit) (digit) (digit) (digit) (digit) (digit)) | ((digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit)) | ((digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit)) | ((digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit)) | ((digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit)) | ((digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit) (digit))));
ws : ( sp | htab | cr | lf | comment )*; // optional white space
mws : ( sp | htab | cr | lf | comment )+; // mandatory white space
comment : (SLASH ASTERISK) (nonstarchar | starwithnonfslash)* (ASTERISK SLASH);
nonstarchar : sp | htab | cr | lf | (EXCLAMATION | QUOTE | POUND | DOLLAR | PERCENT | AMPERSAND |
      APOSTROPHE | LEFT_PAREN | RIGHT_PAREN) | (PLUS | COMMA | DASH | PERIOD | SLASH | ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE |
      COLON | SEMICOLON | LESS_THAN | EQUALS | GREATER_THAN | QUESTION | AT | CAP_A | CAP_B | CAP_C | CAP_D | CAP_E | CAP_F | CAP_G | CAP_H | CAP_I | CAP_J | CAP_K | CAP_L | CAP_M | CAP_N | CAP_O | CAP_P |
      CAP_Q | CAP_R | CAP_S | CAP_T | CAP_U | CAP_V | CAP_W | CAP_X | CAP_Y | CAP_Z | LEFT_BRACE | BACKSLASH | RIGHT_BRACE | CARAT | UNDERSCORE | ACCENT |
       A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | LEFT_CURLY_BRACE | PIPE | RIGHT_CURLY_BRACE | TILDE) | UTF8_LETTER;
nonspacechar : ('#'| POUND | DOLLAR | PERCENT | AMPERSAND | APOSTROPHE | LEFT_PAREN | RIGHT_PAREN) | (PLUS|
COMMA | DASH | PERIOD | SLASH | ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | COLON | SEMICOLON | LESS_THAN | EQUALS | GREATER_THAN | QUESTION | AT |
CAP_A | CAP_B | CAP_C | CAP_D | CAP_E | CAP_F | CAP_G | CAP_H | CAP_I | CAP_J | CAP_K | CAP_L | CAP_M | CAP_N | CAP_O | CAP_P | CAP_Q | CAP_R | CAP_S | CAP_T | CAP_U | CAP_V | CAP_W | CAP_X | CAP_Y | CAP_Z |
LEFT_BRACE | BACKSLASH | RIGHT_BRACE | CARAT | UNDERSCORE | ACCENT | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | LEFT_CURLY_BRACE | PIPE | RIGHT_CURLY_BRACE | TILDE) | UTF8_LETTER;


starwithnonfslash : ASTERISK nonfslash;
nonfslash : sp | htab | cr | lf | (EXCLAMATION | QUOTE | POUND | DOLLAR | PERCENT | AMPERSAND | APOSTROPHE | LEFT_PAREN | RIGHT_PAREN | ASTERISK | PLUS | COMMA | DASH | PERIOD) | (ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | COLON | SEMICOLON | LESS_THAN | EQUALS | GREATER_THAN | QUESTION | AT | CAP_A | CAP_B | CAP_C | CAP_D | CAP_E | CAP_F | CAP_G | CAP_H | CAP_I | CAP_J | CAP_K | CAP_L | CAP_M | CAP_N | CAP_O | CAP_P | CAP_Q | CAP_R | CAP_S | CAP_T | CAP_U | CAP_V | CAP_W | CAP_X | CAP_Y | CAP_Z | LEFT_BRACE | BACKSLASH | RIGHT_BRACE | CARAT | UNDERSCORE | ACCENT | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | LEFT_CURLY_BRACE | PIPE | RIGHT_CURLY_BRACE | TILDE) | UTF8_LETTER;
sp : SPACE; // space
htab : TAB; // tab
cr : CR; // carriage return
lf : LF; // line feed
qm : QUOTE; // quotation mark
bs : BACKSLASH; // back slash
digit : (ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE);
zero : ZERO;
digitnonzero : (ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE);
nonwsnonpipe : (EXCLAMATION | QUOTE | POUND | DOLLAR | PERCENT | AMPERSAND | APOSTROPHE | LEFT_PAREN | RIGHT_PAREN | ASTERISK | PLUS | COMMA | DASH | PERIOD | SLASH | ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | COLON | SEMICOLON | LESS_THAN | EQUALS | GREATER_THAN | QUESTION | AT | CAP_A | CAP_B | CAP_C | CAP_D | CAP_E | CAP_F | CAP_G | CAP_H | CAP_I | CAP_J | CAP_K | CAP_L | CAP_M | CAP_N | CAP_O | CAP_P | CAP_Q | CAP_R | CAP_S | CAP_T | CAP_U | CAP_V | CAP_W | CAP_X | CAP_Y | CAP_Z | LEFT_BRACE | BACKSLASH | RIGHT_BRACE | CARAT | UNDERSCORE | ACCENT | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | LEFT_CURLY_BRACE) | (RIGHT_CURLY_BRACE | TILDE) | UTF8_LETTER;
anynonescapedchar : sp | htab | cr | lf | (SPACE | EXCLAMATION) | (POUND | DOLLAR | PERCENT | AMPERSAND | APOSTROPHE | LEFT_PAREN | RIGHT_PAREN | ASTERISK | PLUS | COMMA | DASH | PERIOD | SLASH | ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | COLON | SEMICOLON | LESS_THAN | EQUALS | GREATER_THAN | QUESTION | AT | CAP_A | CAP_B | CAP_C | CAP_D | CAP_E | CAP_F | CAP_G | CAP_H | CAP_I | CAP_J | CAP_K | CAP_L | CAP_M | CAP_N | CAP_O | CAP_P | CAP_Q | CAP_R | CAP_S | CAP_T | CAP_U | CAP_V | CAP_W | CAP_X | CAP_Y | CAP_Z | LEFT_BRACE) | (RIGHT_BRACE | CARAT | UNDERSCORE | ACCENT | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | LEFT_CURLY_BRACE | PIPE | RIGHT_CURLY_BRACE | TILDE) | UTF8_LETTER;
escapedchar : (bs qm) | (bs bs);

//////////////////////////////////////////////////////////////////////////
// Lexer rules generated for each distinct character in original grammar
// per http://www.unicode.org/charts/PDF/U0000.pdf
//////////////////////////////////////////////////////////////////////////
UTF8_LETTER
   : '\u00C0' .. '\u02FF'
   | '\u0370' .. '\u037D'
   | '\u037F' .. '\u1FFF'
   | '\u200C' .. '\u200D'
   | '\u2070' .. '\u218F'
   | '\u2C00' .. '\u2FEF'
   | '\u3001' .. '\uD7FF'
   | '\uF900' .. '\uFDCF'
   | '\uFDF0' .. '\uFFFD'
   ;

TAB : '\t';
LF : '\n';
CR : '\r';
SPACE : ' ';
EXCLAMATION : '!';
QUOTE : '"';
POUND : '#';
DOLLAR : '$';
PERCENT : '%';
AMPERSAND : '&';
APOSTROPHE : '\'';
LEFT_PAREN : '(';
RIGHT_PAREN : ')';
ASTERISK : '*';
PLUS : '+';
COMMA : ',';
DASH : '-';
PERIOD : '.';
SLASH : '/';
ZERO : '0';
ONE : '1';
TWO : '2';
THREE : '3';
FOUR : '4';
FIVE : '5';
SIX : '6';
SEVEN : '7';
EIGHT : '8';
NINE : '9';
COLON : ':';
SEMICOLON : ';';
LESS_THAN : '<';
EQUALS : '=';
GREATER_THAN : '>';
QUESTION : '?';
AT : '@';
CAP_A : 'A';
CAP_B : 'B';
CAP_C : 'C';
CAP_D : 'D';
CAP_E : 'E';
CAP_F : 'F';
CAP_G : 'G';
CAP_H : 'H';
CAP_I : 'I';
CAP_J : 'J';
CAP_K : 'K';
CAP_L : 'L';
CAP_M : 'M';
CAP_N : 'N';
CAP_O : 'O';
CAP_P : 'P';
CAP_Q : 'Q';
CAP_R : 'R';
CAP_S : 'S';
CAP_T : 'T';
CAP_U : 'U';
CAP_V : 'V';
CAP_W : 'W';
CAP_X : 'X';
CAP_Y : 'Y';
CAP_Z : 'Z';
LEFT_BRACE : '[';
BACKSLASH : '\\';
RIGHT_BRACE : ']';
CARAT : '^';
UNDERSCORE : '_';
ACCENT : '`';
A : 'a';
B : 'b';
C : 'c';
D : 'd';
E : 'e';
F : 'f';
G : 'g';
H : 'h';
I : 'i';
J : 'j';
K : 'k';
L : 'l';
M : 'm';
N : 'n';
O : 'o';
P : 'p';
Q : 'q';
R : 'r';
S : 's';
T : 't';
U : 'u';
V : 'v';
W : 'w';
X : 'x';
Y : 'y';
Z : 'z';
LEFT_CURLY_BRACE : '{';
PIPE : '|';
RIGHT_CURLY_BRACE : '}';
TILDE : '~';

