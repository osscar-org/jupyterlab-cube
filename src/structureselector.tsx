import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import { getCurrentPath, onPathChange, offPathChange, getFileList } from './filebrowseraccess';

/**
 * File extensions recognised as structure files by NGL.
 */
const STRUCTURE_EXTENSIONS = [
  'pdb',
  'cif',
  'sdf',
  'xyz',
  'mol2',
  'ent',
  'gro',
  'pqr',
  'mol'
];

interface IStructureSelectorProps {
  onSelectFile: (filename: string) => void;
}

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  iconButton: {
    padding: 8,
    height: 40,
    width: 40
  },
  breadcrumbs: {
    fontSize: '0.75rem'
  },
  crumbLink: {
    fontSize: '0.75rem'
  }
}));

/**
 * Break a server path into breadcrumb segments.
 */
function pathToBreadcrumbs(
  dirPath: string
): { label: string; path: string }[] {
  if (!dirPath) {
    return [{ label: '/', path: '' }];
  }
  const normalized = dirPath.startsWith('/') ? dirPath : '/' + dirPath;
  const parts = normalized.split('/').filter(Boolean);
  const crumbs = [{ label: '/', path: '' }];
  let accumulated = '';
  for (const part of parts) {
    accumulated = accumulated ? accumulated + '/' + part : part;
    crumbs.push({ label: part, path: accumulated });
  }
  return crumbs;
}

export default function StructureSelector(
  props: IStructureSelectorProps
): JSX.Element {
  const classes = useStyles();
  const [dirPath, setDirPath] = useState<string>(getCurrentPath());
  const [structureFiles, setStructureFiles] = useState<string[]>([]);
  const [value, setValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  // Refresh the file list when the file-browser directory changes
  const refreshFiles = useCallback((path: string) => {
    const files = getFileList(STRUCTURE_EXTENSIONS);
    setStructureFiles(files);
    if (files.length > 0) {
      setValue(prev => (prev && files.includes(prev) ? prev : files[0]));
    } else {
      setValue('');
    }
    setDirPath(path);
  }, []);

  useEffect(() => {
    // Prime with the current directory
    refreshFiles(getCurrentPath());

    // Subscribe to future changes
    onPathChange(refreshFiles);
    return () => {
      offPathChange(refreshFiles);
    };
  }, [refreshFiles]);

  const handleLoadClick = useCallback((): void => {
    if (value) {
      props.onSelectFile(value);
    }
  }, [value, props.onSelectFile]);

  const crumbs = pathToBreadcrumbs(dirPath);

  return (
    <div className={classes.root}>
      {/* Directory breadcrumb (read-only) */}
      <Breadcrumbs
        aria-label="current directory"
        className={classes.breadcrumbs}
      >
        {crumbs.map((crumb, index) =>
          index === crumbs.length - 1 ? (
            <Typography
              key={crumb.path || 'root'}
              color="textPrimary"
              className={classes.crumbLink}
            >
              {crumb.label}
            </Typography>
          ) : (
            <Typography
              key={crumb.path || 'root'}
              color="textSecondary"
              className={classes.crumbLink}
            >
              {crumb.label}
            </Typography>
          )
        )}
      </Breadcrumbs>

      {/* Autocomplete + load button */}
      <div className={classes.row}>
        <div style={{ flexGrow: 1 }}>
          <Autocomplete
            freeSolo
            value={value}
            onChange={(_event, newValue) => {
              setValue(newValue as string);
            }}
            inputValue={inputValue}
            onInputChange={(_event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            id="structure-file-selector"
            options={structureFiles}
            size="small"
            renderInput={params => (
              <TextField
                {...params}
                label="Structure file"
                variant="outlined"
                size="small"
              />
            )}
          />
        </div>
        <IconButton
          color="primary"
          className={classes.iconButton}
          aria-label="load structure"
          onClick={handleLoadClick}
          size="small"
          disabled={!value}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}
