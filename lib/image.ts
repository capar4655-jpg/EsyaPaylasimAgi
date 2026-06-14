import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/**
 * Bir resmi 700px genişliğe küçültür, JPEG sıkıştırır ve base64 data URI döner.
 * Böylece Firestore dokümanına (1MB sınırı altında) güvenle sığar.
 */
async function compressToDataUri(uri: string): Promise<string | null> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 700 });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.5,
    base64: true,
  });
  return saved.base64 ? `data:image/jpeg;base64,${saved.base64}` : null;
}

/** Galeriden resim seçtirir, küçültüp base64 döner (iptal/izin yoksa null). */
export async function pickImageFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });
  if (result.canceled) return null;
  return compressToDataUri(result.assets[0].uri);
}

/** Kamerayla foto çektirir, küçültüp base64 döner (iptal/izin yoksa null). */
export async function takePhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });
  if (result.canceled) return null;
  return compressToDataUri(result.assets[0].uri);
}
