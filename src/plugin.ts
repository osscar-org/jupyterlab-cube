import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { setFileBrowser } from './filebrowseraccess';

/**
 * Companion plugin that captures the file browser so the MIME renderer
 * can list structure files from the current directory.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-cube:filebrowser-plugin',
  autoStart: true,
  optional: [IDefaultFileBrowser],
  activate: (
    _app: JupyterFrontEnd,
    browser?: IDefaultFileBrowser
  ) => {
    if (browser) {
      setFileBrowser(browser);
      console.log('jupyterlab-cube: file browser captured');
    }
  }
};

export default plugin;
