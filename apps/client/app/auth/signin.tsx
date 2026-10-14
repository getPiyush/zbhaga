import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, spacing, radius } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthContext';

export default function SignIn() {
  const router = useRouter();
  const theme = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Sign In</Text>
        {error ? (
          <View style={[styles.error, { backgroundColor: theme.owes + '20', borderColor: theme.owes }]}>
            <Text style={[styles.errorText, { color: theme.owes }]}>{error}</Text>
          </View>
        ) : null}
        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <TextInput
          testID="email-input"
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="you@example.com"
          placeholderTextColor={theme.textFaint}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
        <TextInput
          testID="password-input"
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="••••••••"
          placeholderTextColor={theme.textFaint}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          secureTextEntry
        />
        <TouchableOpacity
          testID="signin-button"
          style={[styles.button, { backgroundColor: theme.accent, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.accentText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.accentText }]}>Sign In</Text>
          )}
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={[styles.footerLink, { color: theme.accent }]}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
