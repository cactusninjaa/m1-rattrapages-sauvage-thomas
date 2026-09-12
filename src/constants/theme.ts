import { Platform } from 'react-native';

export const colors = {
    background: '#141215',
    surface: 'rgba(243,237,227,.05)',
    surfaceStrong: 'rgba(243,237,227,.07)',
    border: 'rgba(243,237,227,.08)',
    borderStrong: 'rgba(243,237,227,.16)',
    text: '#F3EDE3',
    textMuted: 'rgba(243,237,227,.45)',
    textFaint: 'rgba(243,237,227,.35)',
    textSoft: 'rgba(243,237,227,.7)',
    accent: '#E4A33C',
    onAccent: '#191512',
    green: '#86A97B',
    track: 'rgba(243,237,227,.14)',
};

export const spacing = {
    screen: 22,
    gap: 12,
};

export const fonts = {
    // No custom font: we fall back to the system families closest to the
    // design's Instrument Serif / IBM Plex Mono.
    display: Platform.select({ ios: 'Georgia', default: 'serif' }),
    mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
};

const COVER_COLORS = [
    '#6C4A3A',
    '#3E5A52',
    '#8A6234',
    '#4A4560',
    '#7A4A4A',
    '#2F4858',
    '#55503F',
    '#3C3A47',
];

/** Typographic cover colour, stable for a given book. */
export const pickCoverColor = (openLibraryId: string) => {
    let hash = 0;
    for (let index = 0; index < openLibraryId.length; index++) {
        hash = (hash * 31 + openLibraryId.charCodeAt(index)) | 0;
    }
    return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
};
