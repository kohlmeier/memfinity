help:
	@echo '"make deps"   installs dev software. Do this first!'
	@echo '"make server" runs the website.'
	@echo '"make test"   runs unit tests.'

deps:
	cd webapp && npm install
	pip install -r requirements.txt
	git submodule sync && git submodule update --init --recursive

server serve:
	cd webapp ; \
	  node_modules/.bin/watchify -t reactify frontend/* -o static/frontend.js & \
	  ../frankenserver/python/dev_appserver.py --host=0.0.0.0 .

test:
	cd webapp ; \
	  nosetests --with-gae --gae-lib=../frankenserver/python
