import * as migration_20260913_152037_initial from './20260913_152037_initial';

export const migrations = [
  {
    up: migration_20260913_152037_initial.up,
    down: migration_20260913_152037_initial.down,
    name: '20260913_152037_initial'
  },
];
