FROM gaiaadm/result-processing:latest

ARG http_proxy
ARG https_proxy

# Bundle app source
COPY . /src/processors/agm-issue-change-processor

# set work dir
WORKDIR /src/processors/agm-issue-change-processor

# install required modules
RUN npm install

RUN grunt --gruntfile Gruntfile.js jshint
