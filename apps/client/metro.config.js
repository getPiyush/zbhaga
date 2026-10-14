// The app imports `@zbhaga/shared` from outside this folder, with dependencies
// hoisted to the root. Expo's default config detects npm workspaces and sets up
// watchFolders and module resolution for the monorepo on its own.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
