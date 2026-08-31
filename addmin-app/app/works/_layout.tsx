import { Stack } from 'expo-router'
import { colors } from '@/theme/colors'

export default function WorksLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: 'DMSans_700Bold', fontWeight: '700' },
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Radovi' }} />
      <Stack.Screen name="new" options={{ title: 'Novi rad' }} />
      <Stack.Screen name="[id]" options={{ title: 'Izmena rada' }} />
    </Stack>
  )
}
