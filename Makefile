PORT = 8082

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
	  PORT=$(PORT) babel-node server.js & \
	  ../frankenserver/python/dev_appserver.py --skip_sdk_update_check=yes --host=0.0.0.0 --port $(PORT) .

test:
	cd webapp ; \
	  nosetests --with-gae --gae-lib=../frankenserver/python
