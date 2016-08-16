FROM gaiaadm/result-processing:latest

# set Node to production
ARG NODE=production
ENV NODE_ENV ${NODE}

# Bundle app source
COPY . /src/processors/agm-issue-change-processor

# install required modules
COPY package.json /tmp/package.json
RUN cd /tmp && npm install && mv /tmp/node_modules /src/processors/agm-issue-change-processor && rm -rf /tmp/*
