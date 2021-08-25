import React from 'react';
import * as NGL from '@osscar/ngl';
import * as _ from 'underscore';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Button from '@material-ui/core/Button';
// import Switch from '@material-ui/core/Switch';

export interface IProps {
  data: string;
}

export interface IState {
  filter?: string;
  value: string;
}

export class Visualizer extends React.Component<IProps, IState> {
  private _stage: any;
  private uuid: string;
  private dark: boolean;

  constructor(props: IProps, context: any) {
    super(props, context);

    this.dark = true;
    this.uuid = _.uniqueId('ngl_');
    this.state = { value: 'black' };

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
          visible: true,
          isolevelType: 'value',
          isolevel: 0.01,
          color: 'blue',
          opacity: 0.7,
          opaqueBack: false,
        });
        o.addRepresentation('surface', {
          visible: true,
          isolevelType: 'value',
          isolevel: -0.01,
          color: 'red',
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

  handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this._stage.setParameters({ backgroundColor: event.target.value });
    this.setState({ value: event.target.value });
  };

  render(): JSX.Element {
    return (
      <div className="container">
        <div
          id={this.uuid}
          style={{ width: '100%', height: '400px', backgroundColor: 'black' }}
        ></div>
        <Grid container direction="row" justify="center" alignItems="center">
          <RadioGroup
            aria-label="backgroundcolor"
            name="backgroundcolor1"
            value={this.state.value}
            onChange={this.handleRadioChange}
            row
          >
            <FormControlLabel value="black" control={<Radio />} label="Black" />
            <FormControlLabel value="white" control={<Radio />} label="White" />
            <FormControlLabel
              value="yellow"
              control={<Radio />}
              label="Yellow"
            />
          </RadioGroup>
        </Grid>
      </div>
    );
  }
}
