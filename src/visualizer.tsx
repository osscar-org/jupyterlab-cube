import React from 'react';
import * as NGL from '@osscar/ngl';
import * as _ from 'underscore';

import { PageConfig, URLExt } from '@jupyterlab/coreutils';

import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import ImageIcon from '@material-ui/icons/Image';
import GrainIcon from '@material-ui/icons/Grain';

import UploadButtons from './uploadbuttons';
import StructureSelector from './structureselector';
import { onPathChange, offPathChange, getCurrentPath } from './filebrowseraccess';

/**
 * Background color swatches matching the mol-visualizer pattern.
 */
const BG_COLORS = [
  { color: 'white', label: 'White' },
  { color: '#e0e0e0', label: 'Gray' },
  { color: '#1a1a2e', label: 'Dark' },
  { color: 'black', label: 'Black' },
  { color: '#e8f5e9', label: 'Mint' },
  { color: '#fff3e0', label: 'Warm' },
  { color: '#e3f2fd', label: 'Sky' },
  { color: '#263238', label: 'Slate' }
];

/**
 * Slider marks for opacity (0-100%).
 */
const opacityMarks = [
  { value: 0, label: '0%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100%' }
];

/**
 * Slider marks for isovalue (0 to 0.04).
 */
const isovalueMarks = [
  { value: 0, label: '0' },
  { value: 0.01, label: '0.01' },
  { value: 0.02, label: '0.02' },
  { value: 0.03, label: '0.03' },
  { value: 0.04, label: '0.04' }
];

/**
 * Light colors that need a subtle border to be visible on light backgrounds.
 */
const LIGHT_COLORS = new Set([
  'white',
  '#e0e0e0',
  '#e8f5e9',
  '#fff3e0',
  '#e3f2fd'
]);

export interface IProps {
  data: string;
  theme: string;
}

export interface IState {
  spin: boolean;
  cameraType: string;
  opacity: number;
  isovalue: number;
  bgColor: string;
}

export class Visualizer extends React.Component<IProps, IState> {
  private _stage: any;
  private uuid: string;
  private _currentDirectory: string;
  private _pathChangeHandler: ((path: string) => void) | null = null;

  constructor(props: IProps, context: unknown) {
    super(props, context);

    this.uuid = _.uniqueId('ngl_');

    const isDark = props.theme === 'dark';
    const initialBg = isDark ? '#1a1a2e' : 'white';

    this._currentDirectory = URLExt.join(
      PageConfig.getBaseUrl(),
      'files',
      '/'
    );

    this.state = {
      spin: false,
      cameraType: 'perspective',
      opacity: 70,
      isovalue: 0.01,
      bgColor: initialBg
    };

    window.requestAnimationFrame(() => {
      NGL.DatasourceRegistry.add(
        'data',
        new NGL.StaticDatasource(this._currentDirectory)
      );

      // Create NGL Stage object
      this._stage = new NGL.Stage(this.uuid, {
        quality: 'high',
        cameraType: 'perspective',
        backgroundColor: initialBg
      });

      this._stage.viewer.container.addEventListener('dblclick', () => {
        this._stage.toggleFullscreen();
      });

      const data = this.props.data;
      const stringBlob = new Blob([data], { type: 'text/plain' });

      this._stage.loadFile(stringBlob, { ext: 'cube' }).then(
        (o: any) => {
          o.addRepresentation('surface', {
            name: 'positive_surface',
            visible: true,
            isolevelType: 'value',
            isolevel: 0.01,
            color: 'red',
            opacity: 0.7,
            opaqueBack: false
          });
          o.addRepresentation('surface', {
            name: 'negative_surface',
            visible: true,
            isolevelType: 'value',
            isolevel: -0.01,
            color: 'blue',
            opacity: 0.7,
            opaqueBack: false
          });
          o.autoView();
        },
        (e: any) => {
          console.log('information:' + e);
        }
      );
    });
  }

  handleOpacityChange = (
    _event: React.ChangeEvent<unknown>,
    value: number | number[]
  ): void => {
    const val = value as number;
    const transparency = val / 100.0;
    this.setState({ opacity: val });
    if (this._stage) {
      this._stage
        .getRepresentationsByName('positive_surface')
        .setParameters({ opacity: transparency });
      this._stage
        .getRepresentationsByName('negative_surface')
        .setParameters({ opacity: transparency });
    }
  };

  handleIsovalueChange = (
    _event: React.ChangeEvent<unknown>,
    value: number | number[]
  ): void => {
    const val = value as number;
    this.setState({ isovalue: val });
    if (this._stage) {
      this._stage
        .getRepresentationsByName('positive_surface')
        .setParameters({ isolevel: val });
      this._stage
        .getRepresentationsByName('negative_surface')
        .setParameters({ isolevel: -val });
    }
  };

  loadStructure = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!this._stage) {
      console.warn('Cube viewer: NGL stage not ready yet');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const existing = this._stage.getComponentsByName('struct');
    if (existing && existing.list && existing.list[0]) {
      this._stage.removeComponent(existing.list[0]);
    }

    this._stage
      .loadFile(file, { name: 'struct' })
      .then((o: any) => {
        o.addRepresentation('ball+stick', {
          name: 'structure',
          visible: true
        });
        o.autoView();
      })
      .catch((err: any) => {
        console.error('Cube viewer: failed to load uploaded structure:', err);
      });
  };

  toggleSpin = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ spin: event.target.checked });
    this._stage.toggleSpin();
  };

  toggleCameraType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ cameraType: event.target.value });
    this._stage.setParameters({ cameraType: event.target.value });
  };

  setViewerBgColor = (color: string): void => {
    this.setState({ bgColor: color });
    if (this._stage) {
      this._stage.setParameters({ backgroundColor: color });
    }
  };

  autoCenter = (): void => {
    if (this._stage) {
      this._stage.autoView(1000);
    }
  };

  downloadPNG = (): void => {
    if (!this._stage) {
      return;
    }
    this._stage
      .makeImage({
        factor: 2,
        antialias: true,
        trim: false,
        transparent: false
      })
      .then((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cube-viewer.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  /**
   * Subscribe to file-browser path changes so the datasource stays
   * in sync with the directory the user is browsing.
   */
  componentDidMount(): void {
    // Set the initial directory from the current file-browser path
    const initialPath = getCurrentPath();
    this._currentDirectory = URLExt.join(
      PageConfig.getBaseUrl(),
      'files',
      initialPath ? initialPath + '/' : '/'
    );
    this.updateDatasource();

    // Keep it in sync as the user navigates
    this._pathChangeHandler = (newPath: string) => {
      this._currentDirectory = URLExt.join(
        PageConfig.getBaseUrl(),
        'files',
        newPath ? newPath + '/' : '/'
      );
      this.updateDatasource();
    };
    onPathChange(this._pathChangeHandler);
  }

  componentWillUnmount(): void {
    if (this._pathChangeHandler) {
      offPathChange(this._pathChangeHandler);
    }
  }

  /**
   * Update the NGL datasource to point to a directory on the Jupyter server.
   * Clears any previous 'data' datasource to avoid stale base URLs.
   */
  updateDatasource = (): void => {
    // Registry.add replaces by key, so each call overwrites the previous URL
    NGL.DatasourceRegistry.add(
      'data',
      new NGL.StaticDatasource(this._currentDirectory)
    );
    console.log('Cube viewer: datasource set to', this._currentDirectory);
  };

  /**
   * Load a structure file from the server via the NGL data:// protocol.
   */
  addStructure = (filename: string): void => {
    if (!this._stage) {
      console.warn('Cube viewer: NGL stage not ready yet');
      return;
    }

    // Always sync to the latest file-browser directory before loading
    const currentPath = getCurrentPath();
    this._currentDirectory = URLExt.join(
      PageConfig.getBaseUrl(),
      'files',
      currentPath ? currentPath + '/' : '/'
    );
    this.updateDatasource();

    const existing = this._stage.getComponentsByName('struct');
    if (existing && existing.list && existing.list[0]) {
      this._stage.removeComponent(existing.list[0]);
    }

    console.log('Cube viewer: loading structure file:', filename, 'from', this._currentDirectory);

    this._stage
      .loadFile('data://' + filename, { name: 'struct' })
      .then((o: any) => {
        console.log('Cube viewer: structure file loaded successfully');
        o.addRepresentation('ball+stick', {
          name: 'structure',
          visible: true
        });
        o.autoView();
      })
      .catch((err: any) => {
        console.error('Cube viewer: failed to load structure file:', err);
      });
  };

  render(): JSX.Element {
    const isDark = this.props.theme === 'dark';

    const muiTheme = createTheme({
      palette: {
        type: isDark ? 'dark' : 'light',
        primary: { main: '#4fc3f7' },
        secondary: { main: '#f06292' }
      }
    });

    return (
      <ThemeProvider theme={muiTheme}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: isDark ? '#121212' : '#fafafa',
            color: isDark ? '#e0e0e0' : '#212121'
          }}
        >
          {/* Header */}
          <Paper
            elevation={4}
            style={{
              flexShrink: 0,
              backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5',
              borderRadius: 0,
              padding: '8px 16px'
            }}
          >
            <Box display="flex" alignItems="center">
              <GrainIcon
                style={{
                  width: '28px',
                  height: '28px',
                  color: isDark ? '#4fc3f7' : '#1565c0'
                }}
              />
              <Typography
                variant="h6"
                style={{
                  fontWeight: 600,
                  marginLeft: '12px',
                  color: isDark ? '#e0e0e0' : '#212121'
                }}
              >
                Cube File Viewer
              </Typography>
            </Box>
          </Paper>

          {/* Main content: sidebar + viewer */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              minHeight: 0,
              overflow: 'hidden'
            }}
          >
            {/* Left Sidebar */}
            <div
              style={{
                width: '300px',
                minWidth: '300px',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '12px',
                backgroundColor: isDark ? '#1e1e1e' : '#fafafa',
                borderRight: `1px solid ${isDark ? '#333333' : '#e0e0e0'}`
              }}
            >
              {/* Controls Section */}
              <Paper
                elevation={isDark ? 2 : 1}
                style={{
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: isDark ? '#2c2c2c' : '#ffffff'
                }}
              >
                <Typography
                  variant="overline"
                  display="block"
                  gutterBottom
                  style={{
                    color: isDark ? '#90caf9' : '#1565c0',
                    letterSpacing: '0.5px',
                    lineHeight: 1,
                    fontWeight: 600
                  }}
                >
                  Controls
                </Typography>

                {/* Auto-rotate switch */}
                <List dense disablePadding>
                  <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <ListItemText
                      primary="Auto-rotate"
                      primaryTypographyProps={{
                        style: { fontSize: '0.85rem' }
                      }}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        size="small"
                        checked={this.state.spin}
                        onChange={this.toggleSpin}
                        name="spin"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                {/* Camera type */}
                <Typography
                  variant="caption"
                  style={{
                    color: isDark ? '#b0b0b0' : '#616161',
                    fontWeight: 500,
                    display: 'block',
                    marginTop: '8px'
                  }}
                >
                  Camera
                </Typography>
                <RadioGroup
                  aria-label="camera"
                  name="camera"
                  value={this.state.cameraType}
                  onChange={this.toggleCameraType}
                  row
                >
                  <FormControlLabel
                    value="perspective"
                    control={<Radio size="small" />}
                    label={
                      <span style={{ fontSize: '0.8rem' }}>Perspective</span>
                    }
                  />
                  <FormControlLabel
                    value="orthographic"
                    control={<Radio size="small" />}
                    label={
                      <span style={{ fontSize: '0.8rem' }}>Orthographic</span>
                    }
                  />
                  <FormControlLabel
                    value="stereo"
                    control={<Radio size="small" />}
                    label={<span style={{ fontSize: '0.8rem' }}>Stereo</span>}
                  />
                </RadioGroup>

                {/* Action buttons */}
                <Box mt={1} display="flex" justifyContent="center" gridGap={8}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<CenterFocusStrongIcon />}
                    onClick={this.autoCenter}
                    style={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Auto Centre
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<ImageIcon />}
                    onClick={this.downloadPNG}
                    style={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Save PNG
                  </Button>
                </Box>
              </Paper>

              {/* Display Settings Section */}
              <Paper
                elevation={isDark ? 2 : 1}
                style={{
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: isDark ? '#2c2c2c' : '#ffffff'
                }}
              >
                <Typography
                  variant="overline"
                  display="block"
                  gutterBottom
                  style={{
                    color: isDark ? '#90caf9' : '#1565c0',
                    letterSpacing: '0.5px',
                    lineHeight: 1,
                    fontWeight: 600
                  }}
                >
                  Display Settings
                </Typography>

                {/* Opacity slider */}
                <Box mb={2}>
                  <Typography
                    variant="caption"
                    gutterBottom
                    style={{
                      color: isDark ? '#b0b0b0' : '#616161',
                      fontWeight: 500
                    }}
                  >
                    Opacity
                  </Typography>
                  <Slider
                    value={this.state.opacity}
                    getAriaValueText={v => `${v}%`}
                    valueLabelDisplay="auto"
                    aria-labelledby="opacity-slider"
                    min={0}
                    max={100}
                    marks={opacityMarks}
                    onChange={this.handleOpacityChange}
                    color="primary"
                  />
                </Box>

                {/* Isovalue slider */}
                <Box mb={1}>
                  <Typography
                    variant="caption"
                    gutterBottom
                    style={{
                      color: isDark ? '#b0b0b0' : '#616161',
                      fontWeight: 500
                    }}
                  >
                    Isovalue
                  </Typography>
                  <Slider
                    value={this.state.isovalue}
                    aria-labelledby="isovalue-slider"
                    getAriaValueText={v => `${v}`}
                    valueLabelDisplay="auto"
                    marks={isovalueMarks}
                    min={0}
                    max={0.04}
                    step={0.001}
                    onChange={this.handleIsovalueChange}
                    color="secondary"
                  />
                </Box>
              </Paper>

              {/* Viewer Background Section */}
              <Paper
                elevation={isDark ? 2 : 1}
                style={{
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: isDark ? '#2c2c2c' : '#ffffff'
                }}
              >
                <Typography
                  variant="overline"
                  display="block"
                  gutterBottom
                  style={{
                    color: isDark ? '#90caf9' : '#1565c0',
                    letterSpacing: '0.5px',
                    lineHeight: 1,
                    fontWeight: 600
                  }}
                >
                  Viewer Background
                </Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {BG_COLORS.map(({ color, label }) => {
                    const isActive = this.state.bgColor === color;
                    const isLight = LIGHT_COLORS.has(color);
                    return (
                      <button
                        key={color}
                        title={label}
                        onClick={() => this.setViewerBgColor(color)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: isActive
                            ? '3px solid #4fc3f7'
                            : isLight
                            ? '1px solid #bdbdbd'
                            : '1px solid #555',
                          cursor: 'pointer',
                          padding: 0,
                          outline: 'none',
                          boxShadow: isActive
                            ? '0 0 6px rgba(79,195,247,0.6)'
                            : 'none',
                          transition: 'box-shadow 0.2s, border 0.2s'
                        }}
                      />
                    );
                  })}
                </div>
              </Paper>

              {/* File Selection Section */}
              <Paper
                elevation={isDark ? 2 : 1}
                style={{
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: isDark ? '#2c2c2c' : '#ffffff'
                }}
              >
                <Typography
                  variant="overline"
                  display="block"
                  gutterBottom
                  style={{
                    color: isDark ? '#90caf9' : '#1565c0',
                    letterSpacing: '0.5px',
                    lineHeight: 1,
                    fontWeight: 600
                  }}
                >
                  File Selection
                </Typography>
                <StructureSelector
                  onSelectFile={this.addStructure}
                />
                <Box mt={1.5}>
                  <UploadButtons onChange={this.loadStructure} />
                </Box>
              </Paper>

              {/* Tip */}
              <Typography
                variant="caption"
                align="center"
                display="block"
                style={{
                  color: isDark ? '#9e9e9e' : '#9e9e9e',
                  fontSize: '0.7rem',
                  fontStyle: 'italic',
                  padding: '8px 4px'
                }}
              >
                Double-click the viewer for fullscreen mode.
              </Typography>
            </div>

            {/* Viewer */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                padding: '8px',
                backgroundColor: isDark ? '#121212' : '#e8e8e8'
              }}
            >
              <div
                id={this.uuid}
                style={{
                  flex: 1,
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: isDark
                    ? '0 4px 24px rgba(0,0,0,0.8)'
                    : '0 4px 24px rgba(0,0,0,0.12)'
                }}
              />
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }
}
