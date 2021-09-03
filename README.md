# jupyterlab-cube

![Github Actions Status](https://github.com/osscar-org/jupyterlab-cube/workflows/Build/badge.svg)
[![npm version](https://badge.fury.io/js/jupyterlab-cube.svg)](https://badge.fury.io/js/jupyterlab-cube)
[![PyPI version](https://badge.fury.io/py/jupyterlab-cube.svg)](https://badge.fury.io/py/jupyterlab-cube)

## Try it with Binder
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/osscar-org/jupyterlab-cube/develop?urlpath=lab)

A JupyterLab extension for rendering [Gaussian cube files](http://paulbourke.net/dataformats/cube). 
Gaussian cube file describes volumetric data for molecular and material systems. 
It can be used to store data for electron densities and molecular orbitals.

This extension is a JupyterLab Gaussian cube file renderer. By double clicking
the cube files in the JupyterLab file browser, it will show the cube file
in a NGL visualizer.

![demo](./binder/demo.gif)

## Requirements

* JupyterLab >= 3.0

## Install

```bash
pip install jupyterlab-cube
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_cube directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Uninstall

```bash
pip uninstall jupyterlab_cube
jupyter labextension uninstall jupyterlab-cube
```

# Acknowledgements

We acknowledge support from the EPFL Open Science Fund via the [OSSCAR](http://www.osscar.org) project.

<img src='http://www.osscar.org/wp-content/uploads/2019/03/OSSCAR-logo.png' width='230'>
