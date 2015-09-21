FROM gaiaadm/result-processing:latest

# Bundle app source
COPY . /src/processors/agm-issue-change-processor

# setup.sh script is temporary workaround until Docker adds support for passing ENV variables
# to docker build command to allow setting up proxy
ADD setup.sh /tmp/setup.sh
RUN chmod +x /tmp/setup.sh
RUN /tmp/setup.sh

RUN grunt --gruntfile /src/processors/agm-issue-change-processor/Gruntfile.js jshint
