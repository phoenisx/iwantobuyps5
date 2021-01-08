# I Want To Buy PS5

This is a fun project to create a bot for myself to
put PS5 in Cart on time, on 12th of Jan, 2021

## Local Setup

* Install `yarn` cli tool. `npm` works as well, just that
  in this doc I am using `yarn` for shell commands. If you
  want to work with `npm`, replace all `yarn` (while running)
  and `npm` script, to `npm run`.
* Install [WatchExec](https://github.com/watchexec/watchexec)
  on your system

Run: `yarn install`, to setup local environment.

## How to build the code once

```sh
yarn build
```

## How to run the project in watch mode

This is required for continous development, where
changes in any source file get's reflected in the generated
`./dist/out.js` file.

* First, install [WatchExec](https://github.com/watchexec/watchexec)

Then run:

```sh
yarn build:watch
```

# Run Script

Once you `build` the script, using (one of the) above methods,
run:

```sh
yarn start -- --help
```
