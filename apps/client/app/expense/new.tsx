import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, spacing, radius } from '../../src/theme';
import { useQuery } from '../../src/hooks/useQuery';
import { useAuth } from '../../src/auth/AuthContext';
import { api } from '../../src/api/client';
import { parseMoneyInput } from '../../src/lib/money';

export default function NewExpenseScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: group } = useQuery(
    () => (groupId ? api.getGroup(groupId) : Promise.resolve(null)),
    [groupId],
  );

  if (!groupId || !group || !user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!description.trim() || !amount.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const totalMinor = parseMoneyInput(amount);
    if (totalMinor === null || totalMinor <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!group.members || group.members.length < 2) {
      setError('Group must have at least 2 members');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create expense with equal split
      await api.createExpense(groupId, {
        description: description.trim(),
        totalMinor,
        payers: [
          {
            userId: user.id,
            paidMinor: totalMinor,
          },
        ],
        split: {
          mode: 'equal',
          participants: group.members.map(member => ({
            userId: member.userId,
          })),
        },
      });

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      console.error('Create expense error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeButton, { color: theme.accent }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Add Expense</Text>
      </View>

      {error && (
        <View style={[styles.error, { backgroundColor: theme.owes + '20', borderColor: theme.owes }]}>
          <Text style={[styles.errorText, { color: theme.owes }]}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="What was this for?"
          placeholderTextColor={theme.textFaint}
          value={description}
          onChangeText={setDescription}
          editable={!loading}
        />

        <Text style={[styles.label, { color: theme.text }]}>Amount ({group.currency})</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="0.00"
          placeholderTextColor={theme.textFaint}
          value={amount}
          onChangeText={setAmount}
          editable={!loading}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: theme.text }]}>Split Method</Text>
        <Text style={[styles.infoText, { color: theme.textMuted }]}>
          This expense will be split equally among all {group.members.length} group members.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accent, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.accentText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.accentText }]}>Add Expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  closeButton: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  error: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    margin: spacing.lg,
  },
  errorText: {
    fontSize: 14,
  },
  content: {
    padding: spacing.lg,
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
  infoText: {
    fontSize: 13,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
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
});
