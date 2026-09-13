import { Stack } from 'expo-router'
import { colors } from '@/theme/colors'
export default function ContentLayout() { return <Stack screenOptions={{headerStyle:{backgroundColor:colors.canvas},headerTintColor:colors.ink,headerTitleStyle:{fontFamily:'DMSans_700Bold'}}} /> }
