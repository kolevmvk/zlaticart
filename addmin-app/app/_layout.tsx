import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
} from '@expo-google-fonts/cormorant-garamond'
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { useFonts } from 'expo-font'
import { ActivityIndicator, View } from 'react-native'
import { AuthProvider } from '@/auth/AuthProvider'
import { colors } from '@/theme/colors'

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.canvas },
            headerTintColor: colors.ink,
            headerTitleStyle: { fontFamily: 'DMSans_700Bold', fontWeight: '700' },
            contentStyle: { backgroundColor: colors.canvas },
          } as const}
        >
          <Stack.Screen name="index" options={{ title: 'ZlaticArt Admin' }} />
          <Stack.Screen name="login" options={{ title: 'Prijava' }} />
          <Stack.Screen name="works" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  )
}
