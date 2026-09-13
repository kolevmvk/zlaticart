import { Stack } from 'expo-router'
import { colors } from '@/theme/colors'
// Ekrani sadržaja crtaju sopstveno zaglavlje (Atelje UI).
export default function ContentLayout() { return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} /> }
