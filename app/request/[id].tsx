import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Celebration } from '@/components/celebration';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { C } from '@/constants/colors';
import { REQUEST_STATUS_COLOR, REQUEST_STATUS_LABELS } from '@/constants/labels';
import { useAuth } from '@/context/auth';
import {
  approveRequest,
  cancelRequest,
  rejectRequest,
  subscribeRequest,
} from '@/lib/firestore';
import type { BorrowRequest } from '@/types';

export default function RequestDetailScreen() {
  const params = useLocalSearchParams<{ id: string; celebrate?: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<BorrowRequest | null | undefined>(
    undefined
  );
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const prevStatus = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireCelebration = () => {
    setCelebrate(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCelebrate(false), 5000);
  };

  useEffect(() => {
    if (!params.id) return;
    const unsub = subscribeRequest(params.id, setRequest);
    return unsub;
  }, [params.id]);

  // QR taramasından dönüldüğünde kutlama
  useEffect(() => {
    if (params.celebrate === '1') fireCelebration();
  }, [params.celebrate]);

  // Karşı taraf izlerken durum 'returned' olduğunda kutlama
  useEffect(() => {
    if (!request) return;
    if (
      prevStatus.current &&
      prevStatus.current !== 'returned' &&
      request.status === 'returned'
    ) {
      fireCelebration();
    }
    prevStatus.current = request.status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.status]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (request === undefined) return <Loading />;
  if (request === null)
    return <EmptyState emoji="🔍" title="Talep bulunamadı" />;

  const isOwner = request.ownerId === user?.uid;
  const other = isOwner ? request.requesterName : request.ownerName;
  const statusColor = REQUEST_STATUS_COLOR[request.status];

  const doApprove = async () => {
    setBusy(true);
    try {
      await approveRequest(request);
    } finally {
      setBusy(false);
    }
  };
  const doReject = async () => {
    setBusy(true);
    try {
      await rejectRequest(request.id);
    } finally {
      setBusy(false);
    }
  };
  const doCancel = async () => {
    setBusy(true);
    try {
      await cancelRequest(request.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Eşya özeti */}
        <View style={styles.summary}>
          <View style={styles.thumb}>
            {request.itemPhotoURL ? (
              <Image
                source={{ uri: request.itemPhotoURL }}
                style={styles.thumbImg}
                contentFit="cover"
              />
            ) : (
              <Text style={{ fontSize: 30 }}>📦</Text>
            )}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.itemTitle}>{request.itemTitle}</Text>
            <Text style={styles.meta}>
              {isOwner ? 'İsteyen: ' : 'Sahip: '}
              {other}
            </Text>
            <View
              style={[styles.pill, { backgroundColor: statusColor + '22' }]}>
              <Text style={[styles.pillText, { color: statusColor }]}>
                {REQUEST_STATUS_LABELS[request.status]}
              </Text>
            </View>
          </View>
        </View>

        {request.message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>Talep mesajı</Text>
            <Text style={styles.messageText}>{request.message}</Text>
          </View>
        ) : null}

        {/* Duruma + role göre aksiyon */}
        {renderAction({
          request,
          isOwner,
          busy,
          doApprove,
          doReject,
          doCancel,
        })}

        {/* Sohbet */}
        <Button
          title="💬 Sohbeti Aç"
          variant="secondary"
          onPress={() => router.push(`/chat/${request.chatId}`)}
        />
      </ScrollView>

      <Celebration visible={celebrate} />
    </View>
  );
}

function renderAction({
  request,
  isOwner,
  busy,
  doApprove,
  doReject,
  doCancel,
}: {
  request: BorrowRequest;
  isOwner: boolean;
  busy: boolean;
  doApprove: () => void;
  doReject: () => void;
  doCancel: () => void;
}) {
  const { status } = request;

  // Tamamlanan / sonlanan durumlar
  if (status === 'returned') {
    return (
      <InfoCard
        emoji="🎉"
        title="İşlem tamamlandı!"
        body="Eşya başarıyla iade edildi. İkinize de eco-puan eklendi."
        tone="success"
      />
    );
  }
  if (status === 'rejected') {
    return (
      <InfoCard
        emoji="🚫"
        title="Talep reddedildi"
        body={isOwner ? 'Bu talebi reddettin.' : 'Sahip bu talebi reddetti.'}
      />
    );
  }
  if (status === 'cancelled') {
    return (
      <InfoCard emoji="↩️" title="Talep iptal edildi" body="Bu talep iptal edildi." />
    );
  }

  // OWNER
  if (isOwner) {
    if (status === 'pending') {
      return (
        <View style={{ gap: 10 }}>
          <InfoCard
            emoji="📬"
            title="Yeni talep"
            body="Komşun bu eşyayı ödünç almak istiyor. Onaylıyor musun?"
          />
          <Button title="Onayla" onPress={doApprove} loading={busy} />
          <Button title="Reddet" variant="danger" onPress={doReject} loading={busy} />
        </View>
      );
    }
    // approved veya picked_up → QR göster
    return (
      <QrPanel
        token={request.qrToken}
        caption={
          status === 'approved'
            ? 'Komşun bu QR kodunu okutarak eşyayı teslim alacak.'
            : 'Eşya teslim edildi. İade sırasında komşun bu QR kodunu tekrar okutacak.'
        }
      />
    );
  }

  // REQUESTER
  if (status === 'pending') {
    return (
      <View style={{ gap: 10 }}>
        <InfoCard
          emoji="⏳"
          title="Onay bekleniyor"
          body="Talebin sahibe iletildi. Onaylandığında bildirim alacaksın."
        />
        <Button title="Talebi İptal Et" variant="ghost" onPress={doCancel} loading={busy} />
      </View>
    );
  }
  // approved veya picked_up → QR tara
  return (
    <View style={{ gap: 10 }}>
      <InfoCard
        emoji={status === 'approved' ? '✅' : '📦'}
        title={status === 'approved' ? 'Talebin onaylandı!' : 'Eşya sende'}
        body={
          status === 'approved'
            ? 'Sahiple buluşup QR kodunu okutarak eşyayı teslim al.'
            : 'İade ederken sahibin QR kodunu tekrar okutman yeterli.'
        }
        tone="success"
      />
      <Button
        title="📷 QR Kodu Tara"
        onPress={() => router.push('/scan')}
      />
    </View>
  );
}

function QrPanel({ token, caption }: { token: string; caption: string }) {
  return (
    <View style={styles.qrPanel}>
      <View style={styles.qrBox}>
        <QRCode value={`EPA:${token}`} size={196} />
      </View>
      <Text style={styles.qrCaption}>{caption}</Text>
    </View>
  );
}

function InfoCard({
  emoji,
  title,
  body,
  tone = 'neutral',
}: {
  emoji: string;
  title: string;
  body: string;
  tone?: 'neutral' | 'success';
}) {
  return (
    <View
      style={[
        styles.infoCard,
        tone === 'success' && {
          backgroundColor: C.primarySoft,
          borderColor: C.primary,
        },
      ]}>
      <Text style={styles.infoEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, paddingBottom: 40 },
  summary: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  itemTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  meta: { fontSize: 14, color: C.muted },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
  messageBox: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 4,
  },
  messageLabel: { fontSize: 12, fontWeight: '700', color: C.muted },
  messageText: { fontSize: 15, color: C.text, lineHeight: 21 },
  qrPanel: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  qrBox: {
    backgroundColor: C.white,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  qrCaption: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  infoEmoji: { fontSize: 28 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  infoBody: { fontSize: 14, color: C.muted, lineHeight: 20, marginTop: 2 },
});
