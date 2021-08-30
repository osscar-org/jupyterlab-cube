import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    input: {
      display: 'none',
    },
  })
);

interface IInputPros {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadButtons(Props: IInputPros): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <input
        accept=".pdb, .cif, .ent, .gz, .sdf"
        className={classes.input}
        id="contained-button-file"
        multiple
        type="file"
        onChange={Props.onChange}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" color="primary" component="span">
          Upload Structure
        </Button>
      </label>
    </div>
  );
}
