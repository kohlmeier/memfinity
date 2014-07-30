help:
	@echo '"make deps" installs dev software. Do this first!'
	@echo '"make server" runs the website."'

deps:
	cd webapp && npm install
	echo "TODO(chris): set up virtualenv, install frankenserver packages."

serve:
	cd webapp ; \
	  node_modules/.bin/watchify -t reactify frontend/* -o static/frontend.js & \
	  ../frankenserver/python/dev_appserver.py --host=0.0.0.0 .
