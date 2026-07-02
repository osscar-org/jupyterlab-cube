import React, { useRef } from 'react';
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

export default function UploadButtons(props: IInputPros): JSX.Element {
  const classes = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={classes.root}>
      <input
        ref={fileInputRef}
        accept=".pdb, .cif, .ent, .gz, .sdf"
        className={classes.input}
        multiple
        type="file"
        onChange={props.onChange}
      />
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={handleClick}
      >
        Upload Structure
      </Button>
    </div>
  );
}
