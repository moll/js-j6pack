NODE = node
NODE_OPTS = --use-strict
MOCHA = ./node_modules/.bin/_mocha
TEST = $$(find test -name "*_test.js" -o -name "*_test.jsx")

love:
	@echo "Feel like makin' love."

test:
	@$(NODE) $(NODE_OPTS) $(MOCHA) -R dot $(TEST)

spec:
	@$(NODE) $(NODE_OPTS) $(MOCHA) -R spec $(TEST)

autotest:
	@$(NODE) $(NODE_OPTS) $(MOCHA) -R dot --watch $(TEST)

autospec:
	@$(NODE) $(NODE_OPTS) $(MOCHA) -R spec --watch $(TEST)

examples/%.jsx: .FORCE
	@$(NODE) --require ./register "$@"

pack:
	@file=$$(npm pack); echo "$$file"; tar tf "$$file"

publish:
	npm publish

tag:
	git tag "v$$($(NODE) -e 'console.log(require("./package").version)')"

.PHONY: love
.PHONY: test spec autotest autospec
.PHONY: pack publish tag
.PHONY: .FORCE
.PRECIOUS: examples/%.jsx
