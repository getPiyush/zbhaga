import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, spacing, radius } from '../src/theme';
import { useQuery } from '../src/hooks/useQuery';
import { api } from '../src/api/client';
import { formatMoney } from '../src/lib/money';

export default function SettleScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const theme = useTheme();

  if (!groupId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Invalid group</Text>
      </View>
    );
  }

  const { data: balances, loading } = useQuery(
    () => api.getBalances(groupId),
    [groupId],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeButton, { color: theme.accent }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settlements</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : !balances || !balances.suggested || balances.suggested.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>All settled up!</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Suggested payments to settle everyone's balances
          </Text>

          <FlatList
            scrollEnabled={false}
            data={balances.suggested}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.settlementCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() =>
                  router.push(
                    `/payment/new?groupId=${groupId}&from=${item.fromUserId}&to=${item.toUserId}`,
                  )
                }
              >
                <View>
                  <Text style={[styles.settlementPeople, { color: theme.text }]}>
                    {item.fromDisplayName} → {item.toDisplayName}
                  </Text>
                  <Text style={[styles.settlementHint, { color: theme.textMuted }]}>
                    Tap to record payment
                  </Text>
                </View>
                <Text style={[styles.settlementAmount, { color: theme.accent }]}>
                  {formatMoney(item.amountMinor)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      )}
    </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  content: {
    padding: spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  settlementCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  settlementPeople: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  settlementHint: {
    fontSize: 12,
  },
  settlementAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
