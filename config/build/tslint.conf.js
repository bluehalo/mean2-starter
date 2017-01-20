'use strict';

module.exports = {

	configuration: {

		rules: {
			'align': [ true, 'parameters', 'statements' ],
			'class-name': true,
			'comment-format': [ true, 'check-space' ],
			'curly': true,
			'eofline': true,
			'forin': true,
			'indent': [ true, 'tabs' ],
			'interface-name': [ true, 'always-prefix' ],
			'jsdoc-format': true,
			'label-position': true,
			'max-line-length': [ false ],
			'member-access': false,
			'member-ordering': [ true, { 'order': 'fields-first' } ],
			'new-parens': true,
			'arrow-parens': true,
			'no-any': false,
			'no-arg': true,
			'no-bitwise': true,
			'no-conditional-assignment': true,
			'no-consecutive-blank-lines': false,
			'no-console': [ true, 'debug' ],
			'no-construct': true,
			'no-debugger': true,
			'no-duplicate-key': true,
			'no-duplicate-variable': true,
			'no-empty': false,
			'no-eval': true,
			'no-internal-module': true,
			'no-namespace': true,
			'no-reference': true,
			'no-shadowed-variable': true,
			'no-string-literal': false,
			'no-switch-case-fall-through': false,
			'no-trailing-whitespace': true,
			'no-unreachable': true,
			'no-unused-expression': true,
			'no-unused-new': true,
			// deprecated as of v4.0
			'no-unused-variable': false,
			// disable this rule as it is very heavy performance-wise and not that useful
			'no-use-before-declare': false,
			'no-var-keyword': true,
			'no-var-requires': true,
			'object-literal-sort-keys': false,
			'one-line': [ true, 'check-open-brace', 'check-whitespace' ],
			'one-variable-per-declaration': [ true, 'ignore-for-loop' ],
			'quotemark': [ true, 'single' ],
			'radix': true,
			'semicolon': [ true, 'always' ],
			'switch-default': true,
			'trailing-comma': false,
			'triple-equals': [ true, 'allow-null-check' ],
			'typedef': false,
			'typedef-whitespace': [ true,
				{
					'call-signature': 'nospace',
					'index-signature': 'nospace',
					'parameter': 'nospace',
					'property-declaration': 'nospace',
					'variable-declaration': 'nospace'
				}, {
					'call-signature': 'onespace',
					'index-signature': 'onespace',
					'parameter': 'onespace',
					'property-declaration': 'onespace',
					'variable-declaration': 'onespace'
				}
			],
			'use-isnan': true,
			'variable-name': [ true, 'ban-keywords', 'check-format', 'allow-pascal-case', 'allow-leading-underscore' ],
			'whitespace': [ true,
				'check-branch',
				'check-decl',
				'check-operator',
				'check-separator',
				'check-type',
				'check-typecast'
			]
		}
	}
};
