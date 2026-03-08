import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useConnection } from '../context/ConnectionContext';
import { OBDErrorDef, ErrorAction } from '../utils/errors';

interface ErrorViewProps {
  error: OBDErrorDef | null;
  onDismiss?: () => void;        // 'dismiss' action için
  onRetry?: () => void;          // 'retry' action için
  mode?: 'inline' | 'modal';    // inline = sayfa içinde, modal = üstte çıkar
}

export default function ErrorView({ error, onDismiss, onRetry, mode = 'inline' }: ErrorViewProps) {
  const router = useRouter();
  const { connect } = useConnection();

  if (!error) return null;

  const severityColor = {
    error: '#f87171',
    warning: '#facc15',
    info: '#00d2ff',
  }[error.severity];

  const severityBg = {
    error: '#f8717110',
    warning: '#facc1510',
    info: '#00d2ff10',
  }[error.severity];

  const severityIcon = {
    error: '🔴',
    warning: '⚠️',
    info: 'ℹ️',
  }[error.severity];

  // Action handler — hata tanımındaki aksiyonu gerçekleştir
  const handleAction = (action: ErrorAction) => {
    switch (action) {
      case 'reconnect':
        connect();
        onDismiss?.();
        break;
      case 'go_manual':
        router.push('/' as any);           // index'e gider, kullanıcı manuel seçer
        onDismiss?.();
        break;
      case 'go_home':
        router.push('/' as any);
        onDismiss?.();
        break;
      case 'go_settings':
        router.push('/settings' as any);   // ileride eklenecek
        onDismiss?.();
        break;
      case 'retry':
        onRetry?.();
        onDismiss?.();
        break;
      case 'dismiss':
        onDismiss?.();
        break;
    }
  };

  const content = (
    <View style={[
      styles.container,
      { backgroundColor: severityBg, borderColor: severityColor + '44' },
      mode === 'modal' && styles.modalContainer,
    ]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{severityIcon}</Text>
        <Text style={[styles.title, { color: severityColor }]}>{error.title}</Text>
      </View>

      <Text style={styles.message}>{error.message}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: severityColor }]}
          onPress={() => handleAction(error.primaryAction)}
        >
          <Text style={styles.primaryBtnText}>{error.primaryActionLabel}</Text>
        </TouchableOpacity>

        {error.secondaryAction && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => handleAction(error.secondaryAction!)}
          >
            <Text style={styles.secondaryBtnText}>{error.secondaryActionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (mode === 'modal') {
    return (
      <Modal visible={!!error} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {content}
        </View>
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14, padding: 16,
    borderWidth: 1, marginBottom: 16,
  },
  modalContainer: {
    marginHorizontal: 24, borderRadius: 18, padding: 20,
  },
  modalOverlay: {
    flex: 1, backgroundColor: '#000000bb',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 8,
  },
  icon: { fontSize: 18 },
  title: { fontSize: 15, fontWeight: '800' },
  message: { color: '#aaa', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 10 },
  primaryBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 9,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  secondaryBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 9,
    alignItems: 'center', backgroundColor: '#1a1a2e',
    borderWidth: 1, borderColor: '#2a2a3e',
  },
  secondaryBtnText: { color: '#888', fontWeight: '600', fontSize: 13 },
});
