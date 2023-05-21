# a simple makefile for executing docker build:

# Variables
IMAGE_NAME=millsoft/screenerx
IMAGE_VERSION=1.1.1
IMAGE_TAG=$(IMAGE_NAME):$(IMAGE_VERSION)

# Targets
.PHONY: build
build:
	docker build -t $(IMAGE_TAG) .

.PHONY: run
run:
	docker run -it --rm $(IMAGE_TAG)

.PHONY: push
push:
	docker push $(IMAGE_TAG)

.PHONY: clean
clean:
	docker rmi $(IMAGE_TAG)

.PHONE: npm-publish
npm-publish:
	npm publish

.PHONY: all
all: build run push clean

# EOF
