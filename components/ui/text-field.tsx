import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { C } from '@/constants/colors';

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
}

export function TextField({ label, hint, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={C.muted}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          styles.input,
          focused && styles.inputFocused,
          props.multiline && styles.multiline,
          style,
        ]}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: C.text },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    paddingHorizontal: 16,
    fontSize: 16,
    color: C.text,
  },
  inputFocused: { borderColor: C.primary },
  multiline: {
    height: 110,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  hint: { fontSize: 12, color: C.muted },
});
