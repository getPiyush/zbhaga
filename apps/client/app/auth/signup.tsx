import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, spacing, radius } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const theme = useTheme();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      await signUp(displayName, email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const isValid = displayName && email && password && email.includes('@');

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()}><Text style={[styles.backButton, { color: theme.accent }]}>← Back</Text></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
        {error ? (<View style={[styles.error, { backgroundColor: theme.owes + '20', borderColor: theme.owes }]}><Text style={[styles.errorText, { color: theme.owes }]}>{error}</Text></View>) : null}
        <Text style={[styles.label, { color: theme.text }]}>Display Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Your name"
          placeholderTextColor={theme.textFaint}
          value={displayName}
          onChangeText={setDisplayName}
          editable={!loading}
        />
        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <TextInput
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
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="••••••••"
          placeholderTextColor={theme.textFaint}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent, opacity: !isValid || loading ? 0.5 : 1 }]} onPress={handleSignUp} disabled={!isValid || loading}>{loading ? <ActivityIndicator color={theme.accentText} /> : <Text style={[styles.buttonText, { color: theme.accentText }]}>Create Account</Text>}</TouchableOpacity>
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>Already have an account?{' '}</Text>
          <TouchableOpacity onPress={() => router.push('/auth/signin')}><Text style={[styles.footerLink, { color: theme.accent }]}>Sign in</Text></TouchableOpacity>
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
