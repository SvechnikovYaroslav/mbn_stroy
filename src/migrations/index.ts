import * as migration_20260913_152037_initial from './20260913_152037_initial';
import * as migration_20260915_072232_add_media_prefix from './20260915_072232_add_media_prefix';
import * as migration_20260915_120000_add_lead_privacy_evidence from './20260915_120000_add_lead_privacy_evidence';

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
  {
    up: migration_20260915_120000_add_lead_privacy_evidence.up,
    down: migration_20260915_120000_add_lead_privacy_evidence.down,
    name: '20260915_120000_add_lead_privacy_evidence'
  },
];
