import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, spacing, radius } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthContext';

export default function AuthWelcome() {
  const router = useRouter();
  const theme = useTheme();
  const { availableProviders } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.accent }]}>zBhaga</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Split expenses fairly across groups</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={() => router.push('/auth/signin')}><Text style={[styles.buttonText, { color: theme.accentText }]}>Sign In</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]} onPress={() => router.push('/auth/signup')}><Text style={[styles.buttonText, { color: theme.text }]}>Create Account</Text></TouchableOpacity>
        {availableProviders.includes('google') && (<TouchableOpacity style={[styles.oauthButton, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.oauthText, { color: theme.text }]}>Continue with Google</Text></TouchableOpacity>)}
        {availableProviders.includes('microsoft') && (<TouchableOpacity style={[styles.oauthButton, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.oauthText, { color: theme.text }]}>Continue with Microsoft</Text></TouchableOpacity>)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl * 2,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  oauthButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  oauthText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
