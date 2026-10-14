import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Modal,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Expense, Payment } from '@zbhaga/shared';
import { useTheme, spacing, radius } from '../../src/theme';
import { useQuery } from '../../src/hooks/useQuery';
import { api } from '../../src/api/client';
import { formatMoney } from '../../src/lib/money';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [tab, setTab] = useState<'expenses' | 'payments' | 'balances'>('expenses');
  const [showInvite, setShowInvite] = useState(false);

  if (!id) return null;

  const { data: group, loading: groupLoading, refresh } = useQuery(
    () => api.getGroup(id),
    [id],
  );

  const { data: expensesPage, loading: expensesLoading, refresh: refreshExpenses } = useQuery(
    () => api.listExpenses(id),
    [id],
  );

  const { data: paymentsPage, loading: paymentsLoading } = useQuery(
    () => api.listPayments(id),
    [id],
  );

  const { data: balances, loading: balancesLoading } = useQuery(
    () => api.getBalances(id),
    [id],
  );

  const expenses = expensesPage?.items ?? [];
  const payments = paymentsPage?.items ?? [];

  const handleRefresh = async () => {
    await Promise.all([refresh(), refreshExpenses()]);
  };

  if (groupLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Group not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        stickyHeaderIndices={[1]}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={groupLoading} onRefresh={handleRefresh} />}
      >
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{group.name}</Text>
          <View style={styles.headerRow}>
            <Text style={[styles.currency, { color: theme.textMuted }]}>{group.currency}</Text>
            <TouchableOpacity
              onPress={() => router.push(`/members?groupId=${id}`)}
              style={styles.memberCountButton}
            >
              <Text style={[styles.memberCount, { color: theme.accent }]}>
                {group.members.length} member{group.members.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.inviteButton, { backgroundColor: theme.accent + '20' }]}
            onPress={() => setShowInvite(true)}
          >
            <Text style={[styles.inviteButtonText, { color: theme.accent }]}>Invite Code</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tabs, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          {(['expenses', 'payments', 'balances'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tab,
                tab === t && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
              ]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t ? { color: theme.accent } : { color: theme.textMuted }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'expenses' && (
          <View style={styles.content}>
            {expensesLoading && !expenses.length ? (
              <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
            ) : expenses.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textMuted }]}>No expenses yet</Text>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ExpenseItem expense={item} groupId={id} theme={theme} />}
              />
            )}
          </View>
        )}

        {tab === 'payments' && (
          <View style={styles.content}>
            {paymentsLoading && !payments.length ? (
              <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
            ) : payments.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textMuted }]}>No payments recorded</Text>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={payments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PaymentItem payment={item} theme={theme} />}
              />
            )}
          </View>
        )}

        {tab === 'balances' && (
          <View style={styles.content}>
            {balancesLoading ? (
              <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
            ) : balances ? (
              <BalancesView balances={balances} groupId={id} theme={theme} />
            ) : null}
          </View>
        )}
      </ScrollView>

      {tab === 'expenses' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.accent }]}
          onPress={() => router.push(`/expense/new?groupId=${id}`)}
        >
          <Text style={[styles.fabText, { color: theme.accentText }]}>+</Text>
        </TouchableOpacity>
      )}

      {tab === 'payments' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.accent }]}
          onPress={() => router.push(`/payment/new?groupId=${id}`)}
        >
          <Text style={[styles.fabText, { color: theme.accentText }]}>+</Text>
        </TouchableOpacity>
      )}

      {tab === 'balances' && balances?.suggested && balances.suggested.length > 0 ? (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.accent }]}
          onPress={() => router.push(`/settle?groupId=${id}`)}
        >
          <Text style={[styles.fabText, { color: theme.accentText }]}>$</Text>
        </TouchableOpacity>
      ) : null}

      <Modal
        visible={showInvite}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInvite(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowInvite(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Invite Code</Text>
            <View style={[styles.codeBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.code, { color: theme.text }]}>{group.inviteCode}</Text>
            </View>
            <Text style={[styles.codeHelp, { color: theme.textMuted }]}>
              Share this code with others to invite them to the group.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ExpenseItem({ expense, groupId, theme }: { expense: Expense; groupId: string; theme: any }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={() => router.push(`/expense/${expense.id}?groupId=${groupId}`)}
    >
      <View>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{expense.description}</Text>
        <Text style={[styles.itemDate, { color: theme.textMuted }]}>
          {new Date(expense.spentAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.itemAmount, { color: theme.owed }]}>{formatMoney(expense.totalMinor)}</Text>
    </TouchableOpacity>
  );
}

function PaymentItem({ payment, theme }: { payment: Payment; theme: any }) {
  return (
    <View style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View>
        <Text style={[styles.itemTitle, { color: theme.text }]}>
          Payment recorded
        </Text>
        <Text style={[styles.itemDate, { color: theme.textMuted }]}>
          {new Date(payment.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.itemAmount, { color: theme.settled }]}>{formatMoney(payment.amountMinor)}</Text>
    </View>
  );
}

function BalancesView({ balances, groupId, theme }: { balances: any; groupId: string; theme: any }) {
  const router = useRouter();
  return (
    <View>
      {balances.balances.map((balance: any) => (
        <View key={balance.userId} style={[styles.balanceRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.balanceName, { color: theme.text }]}>{balance.displayName}</Text>
            <Text style={[styles.balanceNet, { color: theme.textMuted }]}>
              {balance.netMinor > 0 ? 'gets back' : 'owes'}
            </Text>
          </View>
          <Text style={[styles.balanceAmount, { color: balance.netMinor > 0 ? theme.owed : theme.owes }]}>
            {formatMoney(Math.abs(balance.netMinor))}
          </Text>
        </View>
      ))}
      {balances.suggested && balances.suggested.length > 0 && (
        <>
          <Text style={[styles.settleTitle, { color: theme.text }]}>Suggested Settlements</Text>
          {balances.suggested.map((settlement: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={[styles.settlementRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push(`/payment/new?groupId=${groupId}&from=${settlement.fromUserId}&to=${settlement.toUserId}`)}
            >
              <Text style={[styles.settlementText, { color: theme.text }]}>
                {settlement.fromDisplayName} → {settlement.toDisplayName}
              </Text>
              <Text style={[styles.settlementAmount, { color: theme.accent }]}>{formatMoney(settlement.amountMinor)}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
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
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currency: {
    fontSize: 14,
  },
  memberCountButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  inviteButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    marginVertical: spacing.xl,
    fontSize: 14,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  itemDate: {
    fontSize: 12,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 28,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: spacing.md,
    marginRight: -spacing.sm,
    marginTop: -spacing.md,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '400',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  codeBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  code: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
  },
  codeHelp: {
    fontSize: 14,
    textAlign: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  balanceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  balanceNet: {
    fontSize: 12,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  settleTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  settlementText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
