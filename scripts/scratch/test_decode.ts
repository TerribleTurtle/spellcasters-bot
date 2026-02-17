import LZString from 'lz-string';

const hash =
  'LYTwzgLglgxg+mGAnKAjApgfAA4Hspi4B2cA5kukQIYAmWAZlBXElVEZlZKwDZxG4AblUz0kuSAgCuSUlggALKtQgTMAWXDQYAAgDKyNOh0ARdDADWQA';

try {
  const decoded = LZString.decompressFromEncodedURIComponent(hash);
  console.log('Decoded (URI Component):', decoded);
} catch (e) {
  console.error('URI Component failed', e);
}

try {
  const decoded = LZString.decompressFromBase64(hash);
  console.log('Decoded (Base64):', decoded);
} catch (e) {
  console.error('Base64 failed', e);
}
