FROM gaiaadm/result-processing:latest

# Bundle app source
COPY . /src/processors/agm-issue-change-processor

# set work dir
WORKDIR /src/processors/agm-issue-change-processor

# install required modules
RUN npm install

RUN grunt --gruntfile /src/processors/agm-issue-change-processor/Gruntfile.js jshint
