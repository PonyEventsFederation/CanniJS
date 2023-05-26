const path = require("path");

const always = "always";
const error = "error";
const never = "never";
const off = "off";
const warn = "warn";

module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:@typescript-eslint/strict"
	],
	env: {
		node: true,
		es6: true
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: path.resolve("./tsconfig.json")
	},
	rules: {
		"@typescript-eslint/consistent-type-definitions": [
			error,
			"type"
		],
		"arrow-spacing": [
			error,
			{ before: true, after: true }
		],
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
			"tab",
			{ SwitchCase: 1 }
		],
		"keyword-spacing": [
			error,
			{ before: true, after: true }
		],
		"max-len": [
			error,
			{
				code: 100,
				tabWidth: 3,
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
		"no-inline-comments": [
			error,
			// jsdoc comments
			{ ignorePattern: "@type" }
		],
		"no-lonely-if": error,
		"no-multi-spaces": error,
		"no-multiple-empty-lines": [
			error,
			{
				max: 1,
				maxEOF: 0,
				maxBOF: 0
			}
		],
		"no-shadow": off,
		"no-trailing-spaces": error,
		"no-undef": off,
		"no-unused-vars": [
			error,
			{
				varsIgnorePattern: "^_",
				argsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_"
			}
		],
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
		"switch-colon-spacing": [
			error,
			{ before: false, after: true }
		],
		"yoda": [
			error,
			never
		]
	}
};
