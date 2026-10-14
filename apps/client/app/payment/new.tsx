import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, spacing, radius } from '../../src/theme';
import { useQuery } from '../../src/hooks/useQuery';
import { api } from '../../src/api/client';
import { parseMoneyInput } from '../../src/lib/money';

export default function NewPaymentScreen() {
  const { groupId, from, to } = useLocalSearchParams<{ groupId: string; from?: string; to?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [paidBy, setPaidBy] = useState(from || '');
  const [paidByName, setPaidByName] = useState('');
  const [paidTo, setPaidTo] = useState(to || '');
  const [paidToName, setPaidToName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectingFrom, setSelectingFrom] = useState(false);
  const [selectingTo, setSelectingTo] = useState(false);

  const { data: group } = useQuery(
    () => (groupId ? api.getGroup(groupId) : Promise.resolve(null)),
    [groupId],
  );

  if (!groupId || !group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!paidBy || !paidTo || !amount.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (paidBy === paidTo) {
      setError('Cannot pay yourself');
      return;
    }

    const amountMinor = parseMoneyInput(amount);
    if (amountMinor === null || amountMinor <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.recordPayment(groupId, {
        fromUserId: paidBy,
        toUserId: paidTo,
        amountMinor,
      });

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
      console.error('Record payment error:', err);
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
        <Text style={[styles.title, { color: theme.text }]}>Record Payment</Text>
      </View>

      {error && (
        <View style={[styles.error, { backgroundColor: theme.owes + '20', borderColor: theme.owes }]}>
          <Text style={[styles.errorText, { color: theme.owes }]}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.text }]}>Paid By</Text>
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => setSelectingFrom(true)}
        >
          <Text style={[styles.selectButtonText, { color: paidBy ? theme.text : theme.textFaint }]}>
            {paidByName || 'Select person'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.text }]}>Paid To</Text>
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => setSelectingTo(true)}
        >
          <Text style={[styles.selectButtonText, { color: paidTo ? theme.text : theme.textFaint }]}>
            {paidToName || 'Select person'}
          </Text>
        </TouchableOpacity>

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

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accent, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.accentText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.accentText }]}>Record Payment</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={selectingFrom}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectingFrom(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Who paid?</Text>
            <FlatList
              data={group.members}
              keyExtractor={(item) => item.userId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { backgroundColor: item.userId === paidBy ? theme.accent + '20' : 'transparent' }]}
                  onPress={() => {
                    setPaidBy(item.userId);
                    setPaidByName(item.displayName);
                    setSelectingFrom(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: theme.text }]}>
                    {item.displayName}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: theme.accent }]}
              onPress={() => setSelectingFrom(false)}
            >
              <Text style={[styles.modalCloseText, { color: theme.accentText }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectingTo}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectingTo(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Who received it?</Text>
            <FlatList
              data={group.members}
              keyExtractor={(item) => item.userId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { backgroundColor: item.userId === paidTo ? theme.accent + '20' : 'transparent' }]}
                  onPress={() => {
                    setPaidTo(item.userId);
                    setPaidToName(item.displayName);
                    setSelectingTo(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: theme.text }]}>
                    {item.displayName}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: theme.accent }]}
              onPress={() => setSelectingTo(false)}
            >
              <Text style={[styles.modalCloseText, { color: theme.accentText }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  selectButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  selectButtonText: {
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalItemText: {
    fontSize: 16,
  },
  modalClose: {
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
