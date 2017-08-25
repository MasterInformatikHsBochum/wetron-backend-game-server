NAME = $(shell basename `pwd` | tr '[:upper:]' '[:lower:]')
VERSION = $(shell git rev-parse --abbrev-ref HEAD | rev | cut -d'/' -f 1 | rev)

default: build

build:
	docker build -t $(NAME):$(VERSION) .

run:
	@docker run --rm -it $(NAME):$(VERSION)
