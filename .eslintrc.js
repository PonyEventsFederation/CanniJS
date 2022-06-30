const always = "always";
const error = "error";
const never = "never";
const off = "off";
const warn = "warn";

module.exports = {
	extends: "eslint:recommended",
	env: {
		node: true,
		es6: true
	},
	parserOptions: {
		ecmaVersion: 2020
	},
	rules: {
		"brace-style": [
			error,
			"1tbs",
			{ allowSingleLine: true }
		],
		"comma-dangle": [
			error,
			never
		],
		"comma-spacing": [
			error,
			{ before: false, after: true }
		],
		"comma-style": [
			error,
			"last"
		],
		"curly": [
			error,
			"multi-line"
		],
		"dot-location": [
			error,
			"property"
		],
		"indent": [
			error,
			"tab"
		],
		"max-len": [
			error,
			{
				code: 100,
				tabWidth: 4,
				ignoreRegExpLiterals: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreUrls: true
			}
		],
		"max-nested-callbacks": [
			error,
			{ max: 5 }
		],
		"max-statements-per-line": [
			error,
			{ max: 2 }
		],
		"no-console": warn,
		"no-empty-function": error,
		"no-floating-decimal": error,
		"no-inline-comments": error,
		"no-lonely-if": error,
		"no-multi-spaces": error,
		"no-multiple-empty-lines": [
			error,
			{
				max: 2,
				maxEOF: 0,
				maxBOF: 0
			}
		],
		"no-shadow": off,
		"no-trailing-spaces": error,
		"no-var": error,
		"object-curly-spacing": [
			error,
			always
		],
		"prefer-const": error,
		"quotes": [
			error,
			"double"
		],
		"semi": [
			error,
			always
		],
		"space-before-blocks": [
			error,
			always
		],
		"space-before-function-paren": [
			error,
			{
				anonymous: never,
				named: never,
				asyncArrow: always
			}
		],
		"space-in-parens": [
			error,
			never
		],
		"space-infix-ops": [
			error,
			{ int32Hint: true }
		],
		"space-unary-ops": [
			error,
			{
				words: true,
				nonwords: false
			}
		],
		"spaced-comment": [
			error,
			always
		],
		"yoda": [
			error,
			never
		]
	}
};
