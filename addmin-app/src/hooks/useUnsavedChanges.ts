import { useRef } from 'react'
import { Alert } from 'react-native'
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation'

export function useUnsavedChanges(dirty: boolean, saving: boolean) {
  const navigation = useNavigation()
  const allowLeave = useRef(false)

  usePreventRemove(dirty || saving, ({ data }) => {
    if (allowLeave.current) {
      navigation.dispatch(data.action)
      return
    }
    if (saving) {
      Alert.alert('Čuvanje je u toku', 'Sačekajte rezultat čuvanja pre izlaska.')
      return
    }
    Alert.alert('Nesačuvane izmene', 'Ako izađete, izmene u ovoj formi neće biti sačuvane.', [
      { text: 'Nastavi izmenu', style: 'cancel' },
      { text: 'Odbaci izmene', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ])
  })

  return () => { allowLeave.current = true }
}
