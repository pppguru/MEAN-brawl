# Book Brawl
## On node.js

This repo is for the Node.js version of Book Brawl.

## To View

_This assumes that you have the latest verion of [Node and NPM](https://www.npmjs.com/get-npm?utm_source=house&utm_medium=homepage&utm_campaign=free%20orgs&utm_term=Install%20npm) installed_

1. Clone the repo
2. In terminal in root directory run `npm install`
3. In same directory run `npm start`
4. Go to localhost:9000 in your browser


## To develop

1. Clone the repo
2. In terminal in root directory run `npm install`
3. In same directory run `npm run dev`
4. Go to localhost:9000 in your browser
5. Start developing!

This project is using Webpack to process and bundle all necessary assets. You can make your life easier by globally installing webpack. (`npm install -g webpack`)

Views are written in [EJS](http://www.embeddedjs.com/) and can be found in the `_views` directory.

All js can be found in the `_js` directory and compiles to the `public/js` directory. JS is written in ES 2017 and compiled with babel.

All styles can be found in `_sass` directory and will be compiled to `public/css`

The development database is a mongo db on [mLab](https://mlab.com/)
