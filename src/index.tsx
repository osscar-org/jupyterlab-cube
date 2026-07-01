import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@lumino/widgets';

import { Visualizer } from './visualizer';

import * as ReactDOM from 'react-dom';
import React from 'react';

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'application/osscar.cube';

/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'mimerenderer-cube';

/**
 * Detect the current JupyterLab theme.
 * JupyterLab 4 sets data-jp-theme-light="true"|"false" on <body>.
 * JupyterLab 3 adds a jp-theme-dark CSS class on <body>.
 */
function detectJupyterLabTheme(): string {
  // JupyterLab 4: body has data-jp-theme-light attribute
  const themeLight = document.body.getAttribute('data-jp-theme-light');
  if (themeLight === 'false') {
    return 'dark';
  }
  if (themeLight === 'true') {
    return 'light';
  }

  // JupyterLab 3: body has jp-theme-dark CSS class
  if (document.body.classList.contains('jp-theme-dark')) {
    return 'dark';
  }

  return 'light';
}

/**
 * A widget for rendering cube.
 */
export class CubeFileRenderer extends Widget implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);
  }

  /**
   * Render cube into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const data = model.data[this._mimeType] as string;
    const theme = detectJupyterLabTheme();

    return new Promise<void>((resolve, reject) => {
      ReactDOM.render(
        <Visualizer data={data} theme={theme} />,
        this.node,
        () => {
          resolve();
        }
      );
    });
  }

  private _mimeType: string;
}

/**
 * A mime renderer factory for cube data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE],
  createRenderer: (options) => new CubeFileRenderer(options)
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'jupyterlab-cube:plugin',
  rendererFactory,
  rank: 100,
  dataType: 'string',
  fileTypes: [
    {
      name: 'cube',
      mimeTypes: [MIME_TYPE],
      extensions: ['.cube', '.cub'],
      iconClass: 'jp-MaterialIcon jp-CubeIcon'
    }
  ],
  documentWidgetFactoryOptions: {
    name: 'cube viewer',
    primaryFileType: 'cube',
    fileTypes: ['cube'],
    defaultFor: ['cube']
  }
};

export default extension;
