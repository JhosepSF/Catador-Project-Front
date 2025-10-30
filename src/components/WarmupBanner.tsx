import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type WarmupState = 'idle' | 'warming' | 'ok' | 'error';

type Props = {
  state: WarmupState;
  message?: string;
  onRetry?: () => void;
};

export default function WarmupBanner({ state, message, onRetry }: Props) {
  const slideY = useRef(new Animated.Value(-80)).current;
  const visible = state === 'warming' || state === 'ok' || state === 'error';

  useEffect(() => {
    if (visible) {
      Animated.timing(slideY, { toValue: 0, duration: 220, useNativeDriver: true }).start();
      if (state === 'ok') {
        const t = setTimeout(() => {
          Animated.timing(slideY, { toValue: -80, duration: 220, useNativeDriver: true }).start();
        }, 1600);
        return () => clearTimeout(t);
      }
    } else {
      Animated.timing(slideY, { toValue: -80, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, state, slideY]);

  const bg =
    state === 'warming' ? '#2d3436' :
    state === 'ok'      ? '#2ecc71' :
    state === 'error'   ? '#e74c3c' : '#2d3436';

  const text =
    state === 'warming' ? 'Conectando con el servidor…' :
    state === 'ok'      ? 'Servidor listo ✅' :
    state === 'error'   ? `Error: ${message ?? 'sin conexión'}` : '';

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY: slideY }] }]}>
      <View style={[styles.banner, { backgroundColor: bg }]}>
        <Text numberOfLines={2} style={styles.text}>{text}</Text>
        {state === 'error' && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.btn}>
            <Text style={styles.btnText}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 9999,
    elevation: 10,
  },
  banner: {
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: { color: '#fff', fontSize: 14, flex: 1 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});
