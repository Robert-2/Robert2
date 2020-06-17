## Robert2 WebClient: development guide

## Coding standards

Please use the `.editorconfig` file for your IDE.

This project uses __ES lint__ for linting javascript code, with AirBnb's _"recommended"_ config.

## Project setup (dependencies installation)

You can use `npm` or `yarn` (but we recommend `yarn`).

Just `cd` to the root folder and run:

```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Compiles and minifies for production, then create a release in server folder
```
yarn release
```

### Lints and fixes files
```
yarn lint
```

### Run your unit tests
```
yarn test:unit
```

To run tests in watch mode (re-run when a file is saved):
```
yarn test:unit --watch
```

### Customize configuration

This project uses [vue-cli 3.x](https://cli.vuejs.org/). You can read more in
[Configuration Reference](https://cli.vuejs.org/config/).
