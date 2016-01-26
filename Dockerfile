FROM gaiaadm/result-processing:latest

ARG http_proxy
ARG https_proxy

# Bundle app source
COPY . /src/processors/agm-issue-change-processor

# install required modules
RUN cd /src/processors/agm-issue-change-processor && npm install

RUN grunt --gruntfile /src/processors/agm-issue-change-processor/Gruntfile.js jshint
