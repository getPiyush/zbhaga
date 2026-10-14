import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { GroupMember } from '@zbhaga/shared';
import { useTheme, spacing, radius } from '../src/theme';
import { useQuery } from '../src/hooks/useQuery';
import { api } from '../src/api/client';

export default function MembersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const theme = useTheme();

  if (!groupId) return null;

  const { data: group, loading } = useQuery(
    () => api.getGroup(groupId),
    [groupId],
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Members</Text>
        </View>
        <ActivityIndicator size="large" color={theme.accent} style={styles.loader} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Members</Text>
        </View>
        <Text style={[styles.error, { color: theme.text }]}>Group not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.accent }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.text }]}>Members</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {group.members.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textMuted }]}>No members in this group</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={group.members}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => <MemberItem member={item} theme={theme} />}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
          />
        )}
      </View>
    </View>
  );
}

function MemberItem({ member, theme }: { member: GroupMember; theme: any }) {
  return (
    <View style={[styles.memberCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: theme.text }]}>{member.displayName}</Text>
        <Text style={[styles.memberEmail, { color: theme.textMuted }]}>{member.email}</Text>
        <Text style={[styles.memberRole, { color: theme.accent }]}>
          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
        </Text>
      </View>
      <Text style={[styles.joinedDate, { color: theme.textMuted }]}>
        Joined {new Date(member.joinedAt).toLocaleDateString()}
      </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  error: {
    textAlign: 'center',
    marginVertical: spacing.xl,
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    marginVertical: spacing.xl,
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginVertical: spacing.sm,
  },
  memberCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  memberInfo: {
    marginBottom: spacing.sm,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  memberEmail: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinedDate: {
    fontSize: 12,
    textAlign: 'right',
  },
});
