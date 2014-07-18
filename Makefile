help:
	@echo '"make deps" installs dev software. Do this first!'
	@echo '"make server" runs the website."'

deps:
	cd webapp && npm install

serve:
	cd webapp ; \
	node_modules/.bin/watchify -t reactify frontend/* -o static/frontend.js & \
	dev_appserver.py .
