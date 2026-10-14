import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Expense } from '@zbhaga/shared';
import { useTheme, spacing, radius } from '../../src/theme';
import { useQuery } from '../../src/hooks/useQuery';
import { api } from '../../src/api/client';
import { formatMoney } from '../../src/lib/money';

export default function ExpenseDetailScreen() {
  const { id, groupId } = useLocalSearchParams<{ id: string; groupId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadExpense();
  }, [id, groupId]);

  const loadExpense = async () => {
    try {
      setLoading(true);
      setError(null);
      if (id && groupId) {
        const data = await api.getExpense(groupId, id);
        setExpense(data);
      }
    } catch (err) {
      console.error('Failed to load expense:', err);
      setError('Failed to load expense details');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            if (groupId && id) {
              await api.deleteExpense(groupId, id);
              router.back();
            }
          } catch (error) {
            console.error('Failed to delete expense:', error);
            Alert.alert('Error', 'Failed to delete expense');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Expense Details</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.detail, { color: theme.danger }]}>{error || 'Expense not found'}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{expense.description}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.text }]}>Amount</Text>
        <Text style={[styles.amount, { color: theme.owed }]}>
          {formatMoney(expense.totalMinor)}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Date</Text>
        <Text style={[styles.detail, { color: theme.textMuted }]}>
          {new Date(expense.spentAt).toLocaleDateString()}
        </Text>

        {expense.category && (
          <>
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <Text style={[styles.detail, { color: theme.textMuted }]}>{expense.category}</Text>
          </>
        )}

        {expense.notes && (
          <>
            <Text style={[styles.label, { color: theme.text }]}>Notes</Text>
            <Text style={[styles.detail, { color: theme.textMuted }]}>{expense.notes}</Text>
          </>
        )}

        <View style={styles.splitSection}>
          <Text style={[styles.label, { color: theme.text }]}>Split ({expense.splitMode})</Text>
          {expense.participants.map((participant) => (
            <View key={participant.userId} style={[styles.participantRow, { borderBottomColor: theme.border }]}>
              <View style={styles.participantInfo}>
                <Text style={[styles.participantName, { color: theme.text }]}>
                  {participant.displayName}
                </Text>
                <View style={styles.participantAmounts}>
                  {participant.paidMinor > 0 && (
                    <Text style={[styles.paidText, { color: theme.owed }]}>
                      paid {formatMoney(participant.paidMinor)}
                    </Text>
                  )}
                  {participant.owedMinor > 0 && (
                    <Text style={[styles.owedText, { color: theme.owes }]}>
                      owes {formatMoney(participant.owedMinor)}
                    </Text>
                  )}
                  {participant.paidMinor === 0 && participant.owedMinor === 0 && (
                    <Text style={[styles.evenText, { color: theme.settled }]}>settled</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.danger + '20' }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={[styles.deleteButtonText, { color: theme.danger }]}>
            {deleting ? 'Deleting...' : 'Delete Expense'}
          </Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  detail: {
    fontSize: 16,
    marginBottom: spacing.md,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  splitSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  participantRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  participantInfo: {
    gap: spacing.xs,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantAmounts: {
    gap: spacing.xs,
  },
  paidText: {
    fontSize: 14,
  },
  owedText: {
    fontSize: 14,
  },
  evenText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  deleteButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
