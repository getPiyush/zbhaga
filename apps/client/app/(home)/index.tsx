import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { GroupSummary } from '@zbhaga/shared';
import { useTheme, spacing, radius } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthContext';
import { useQuery } from '../../src/hooks/useQuery';
import { api } from '../../src/api/client';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const [modalType, setModalType] = useState<'create' | 'join' | null>(null);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: page, loading, refresh } = useQuery(
    () => api.listGroups(),
    [],
  );

  const groups = page?.items ?? [];

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    try {
      setError(null);
      setCreatingGroup(true);
      await api.createGroup({ name: groupName, currency: 'USD' });
      setGroupName('');
      setModalType(null);
      await refresh();
    } catch (error) {
      let message = 'Failed to create group';
      if (error instanceof Error) {
        message = error.message;
        // Provide better error message for auth issues
        if (message.includes('bearer token')) {
          message = 'Session expired. Please sign in again.';
        }
      }
      setError(message);
      console.error('Failed to create group:', error);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    try {
      setError(null);
      setCreatingGroup(true);
      await api.joinGroup(inviteCode);
      setInviteCode('');
      setModalType(null);
      await refresh();
    } catch (error) {
      let message = 'Failed to join group';
      if (error instanceof Error) {
        message = error.message;
        // Provide better error message for auth issues
        if (message.includes('bearer token')) {
          message = 'Session expired. Please sign in again.';
        }
      }
      setError(message);
      console.error('Failed to join group:', error);
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>Hello, {user?.displayName}</Text>
          <Text style={[styles.subtext, { color: theme.textMuted }]}>Your groups</Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: theme.accent }]}
          onPress={signOut}
        >
          <Text style={[styles.profileButtonText, { color: theme.accentText }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loading && !groups.length ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No groups yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textFaint }]}>Create or join a group to get started</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push(`/group/${item.id}`)}
            >
              <View style={styles.groupHeader}>
                <Text style={[styles.groupName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.groupCurrency, { color: theme.textMuted }]}>{item.currency}</Text>
              </View>
              <Text style={[styles.memberCount, { color: theme.textFaint }]}>
                {item.memberCount} member{item.memberCount !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
          onEndReachedThreshold={0.1}
          refreshing={loading}
          onRefresh={refresh}
        />
      )}

      <View style={[styles.actionBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          testID="create-group-button"
          style={[styles.button, { backgroundColor: theme.accent, flex: 1, marginRight: spacing.sm }]}
          onPress={() => setModalType('create')}
        >
          <Text style={[styles.buttonText, { color: theme.accentText }]}>+ Create</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="join-group-button"
          style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.accent, borderWidth: 1, flex: 1 }]}
          onPress={() => setModalType('join')}
        >
          <Text style={[styles.buttonText, { color: theme.accent }]}>Join</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalType !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setModalType(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalType(null);
                setError(null);
              }}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>

            {modalType === 'create' && (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Create Group</Text>
                <TextInput
                  testID="group-name-input"
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Group name"
                  placeholderTextColor={theme.textFaint}
                  value={groupName}
                  onChangeText={setGroupName}
                  editable={!creatingGroup}
                />
                {error && <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>}
                <TouchableOpacity
                  testID="create-group-submit"
                  style={[styles.modalButton, { backgroundColor: theme.accent, opacity: creatingGroup ? 0.7 : 1 }]}
                  onPress={handleCreateGroup}
                  disabled={creatingGroup}
                >
                  {creatingGroup ? (
                    <ActivityIndicator color={theme.accentText} />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: theme.accentText }]}>Create Group</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {modalType === 'join' && (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Join Group</Text>
                <TextInput
                  testID="invite-code-input"
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Invite code"
                  placeholderTextColor={theme.textFaint}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  editable={!creatingGroup}
                  autoCapitalize="characters"
                />
                {error && <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>}
                <TouchableOpacity
                  testID="join-group-submit"
                  style={[styles.modalButton, { backgroundColor: theme.accent, opacity: creatingGroup ? 0.7 : 1 }]}
                  onPress={handleJoinGroup}
                  disabled={creatingGroup}
                >
                  {creatingGroup ? (
                    <ActivityIndicator color={theme.accentText} />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: theme.accentText }]}>Join Group</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  profileButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  groupCurrency: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 14,
  },
  actionBar: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
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
  modal: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
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
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  modalButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
});
