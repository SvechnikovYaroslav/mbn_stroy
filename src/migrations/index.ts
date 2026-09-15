import * as migration_20260913_152037_initial from './20260913_152037_initial';
import * as migration_20260915_072232_add_media_prefix from './20260915_072232_add_media_prefix';

export const migrations = [
  {
    up: migration_20260913_152037_initial.up,
    down: migration_20260913_152037_initial.down,
    name: '20260913_152037_initial',
  },
  {
    up: migration_20260915_072232_add_media_prefix.up,
    down: migration_20260915_072232_add_media_prefix.down,
    name: '20260915_072232_add_media_prefix'
  },
];
