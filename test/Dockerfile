FROM node:carbon

ENV HOME=/home/app
WORKDIR $HOME

COPY package.json package-lock.json $HOME/
RUN npm i
COPY . $HOME

CMD ["npm", "run", "coverage"]
