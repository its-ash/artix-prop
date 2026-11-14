.PHONY: build deploy

# Static site → docs/ (GitHub Pages serves main:/docs at https://prop.itsash.in)
build:
	npx nuxt generate

# Build, commit everything with an LLM-written message, push.
deploy: build
	git add -A
	@if git diff --cached --quiet; then echo "Nothing to deploy."; exit 0; fi; \
	msg="$$(node scripts/commit-msg.mjs)"; \
	echo "---- commit message ----"; echo "$$msg"; echo "------------------------"; \
	git commit -q -m "$$msg" && git push
