import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../src/theme';

export default function SplashScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>zBhaga</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>Split expenses fairly</Text>
      <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  loader: {
    marginTop: 24,
  },
});
