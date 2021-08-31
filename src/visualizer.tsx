import React from 'react';
import * as NGL from '@osscar/ngl';
import * as _ from 'underscore';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import UploadButtons from './uploadbuttons';
import Switch from '@material-ui/core/Switch';
import { ColorPalette } from 'material-ui-color';

const palette = {
  black: 'black',
  red: '#ff0000',
  blue: '#0000ff',
  green: '#00ff00',
  yellow: 'yellow',
  cyan: 'cyan',
  lime: 'lime',
  gray: 'gray',
  orange: 'orange',
  purple: 'purple',
  white: 'white',
  pink: 'pink',
  darkblue: 'darkblue',
};

export interface IProps {
  data: string;
}

export interface IState {
  filter?: string;
  value: string;
  spin: boolean;
}

const marks1 = [
  {
    value: 0,
    label: '0%',
  },
  {
    value: 20,
    label: '20%',
  },
  {
    value: 40,
    label: '40%',
  },
  {
    value: 60,
    label: '60%',
  },
  {
    value: 80,
    label: '80%',
  },
  {
    value: 100,
    label: '100%',
  },
];

const marks2 = [
  {
    value: -0.02,
    label: '-0.02',
  },
  {
    value: -0.01,
    label: '-0.01',
  },
  {
    value: 0,
    label: '0',
  },
  {
    value: 0.01,
    label: '0.01',
  },
  {
    value: 0.02,
    label: '0.02',
  },
];

export class Visualizer extends React.Component<IProps, IState> {
  private _stage: any;
  private uuid: string;
  private dark: boolean;

  constructor(props: IProps, context: any) {
    super(props, context);

    this.dark = true;
    this.uuid = _.uniqueId('ngl_');
    this.state = { value: 'black', spin: false };

    window.requestAnimationFrame(() => {
      NGL.DatasourceRegistry.add(
        'data',
        new NGL.StaticDatasource(
          '//cdn.rawgit.com/arose/ngl/v2.0.0-dev.32/data/'
        )
      );

      // Create NGL Stage object
      this._stage = new NGL.Stage(this.uuid, { quality: 'high' });

      const data = this.props.data;
      const stringBlob = new Blob([data], { type: 'text/plain' });

      this._stage.loadFile(stringBlob, { ext: 'cube' }).then((o: any) => {
        o.addRepresentation('surface', {
          name: 'positive_surface',
          visible: true,
          isolevelType: 'value',
          isolevel: 0.01,
          color: 'red',
          opacity: 0.7,
          opaqueBack: false,
        });
        o.addRepresentation('surface', {
          name: 'negative_surface',
          visible: true,
          isolevelType: 'value',
          isolevel: -0.01,
          color: 'blue',
          opacity: 0.7,
          opaqueBack: false,
        });
        o.autoView();
      }),
        function (e: any) {
          console.log('information:' + e);
        };
    });
  }

  toggle_backgroundColor = (): void => {
    if (this.dark) {
      this._stage.setParameters({ backgroundColor: 'white' });
    } else {
      this._stage.setParameters({ backgroundColor: 'black' });
    }
    this.dark = !this.dark;
  };

  handlePaletteSelection = (color: unknown): void => {
    this._stage.setParameters({ backgroundColor: String(color) });
  };

  valuetext(value: number): string {
    return String(value) + '%';
  }

  handleOpacityChange = (
    event: React.ChangeEvent<unknown>,
    value: number | number[]
  ): void => {
    const transparency = (value as number) / 100.0;
    this._stage
      .getRepresentationsByName('positive_surface')
      .setParameters({ opacity: transparency });
    this._stage
      .getRepresentationsByName('negative_surface')
      .setParameters({ opacity: transparency });
  };

  handleIsovalueChange = (
    event: React.ChangeEvent<unknown>,
    value: number | number[]
  ): void => {
    const val = value as number[];

    this._stage
      .getRepresentationsByName('positive_surface')
      .setParameters({ isolevel: val[1] });
    this._stage
      .getRepresentationsByName('negative_surface')
      .setParameters({ isolevel: val[0] });
  };

  loadStructure = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this._stage.loadFile(event.target.files[0]).then((o: any) => {
      o.addRepresentation('ball+stick', {
        name: 'structure',
        visible: true,
      });
    });
  };

  toggleSpin = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ spin: event.target.checked });
    this._stage.toggleSpin();
  };

  render(): JSX.Element {
    return (
      <div className="container">
        <Grid
          container
          spacing={3}
          justify="center"
          style={{ marginTop: '20px' }}
        >
          <Grid item sm={8}>
            <div
              id={this.uuid}
              style={{
                width: '100%',
                height: '400px',
                backgroundColor: 'black',
              }}
            ></div>
          </Grid>
          <Grid item sm={1}>
            <Slider
              orientation="vertical"
              getAriaValueText={this.valuetext}
              valueLabelDisplay="auto"
              defaultValue={70}
              aria-labelledby="vertical-slider"
              min={0}
              max={100}
              marks={marks1}
              onChange={this.handleOpacityChange}
              color={'primary'}
            />
          </Grid>
          <Grid item sm={1}>
            <Slider
              orientation="vertical"
              defaultValue={[0.01, -0.01]}
              aria-labelledby="vertical-slider"
              getAriaValueText={this.valuetext}
              valueLabelDisplay="on"
              marks={marks2}
              min={-0.02}
              max={0.02}
              step={0.001}
              onChange={this.handleIsovalueChange}
              color={'secondary'}
            />
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          style={{ marginTop: '20px' }}
        >
          <ColorPalette
            palette={palette}
            onSelect={this.handlePaletteSelection}
          />
          <UploadButtons onChange={this.loadStructure} />
          <Switch
            checked={this.state.spin}
            onChange={this.toggleSpin}
            name="spin"
            color="secondary"
          />
        </Grid>
      </div>
    );
  }
}
