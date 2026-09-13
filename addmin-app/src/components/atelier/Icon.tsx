import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { colors } from '@/theme/colors'

// Jedan stil ikonica: tanka linija 1.6 na 24 mreži (Atelje UI), bez emoji.
export type IconName = 'back' | 'more' | 'search' | 'plus' | 'eye' | 'chevron' | 'image' | 'camera' | 'trash' | 'close' | 'check' | 'quote' | 'list' | 'link' | 'mail' | 'left' | 'right'

export function Icon({ name, size = 24, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  const stroke = { stroke: color, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
  return <Svg width={size} height={size} viewBox="0 0 24 24">
    {name === 'back' ? <Path d="M15 5l-7 7 7 7" {...stroke} /> : null}
    {name === 'left' ? <Path d="M14 7l-5 5 5 5" {...stroke} /> : null}
    {name === 'right' ? <Path d="M10 7l5 5-5 5" {...stroke} /> : null}
    {name === 'chevron' ? <Path d="M9 6l6 6-6 6" {...stroke} /> : null}
    {name === 'more' ? <><Circle cx="5" cy="12" r="1.6" fill={color} /><Circle cx="12" cy="12" r="1.6" fill={color} /><Circle cx="19" cy="12" r="1.6" fill={color} /></> : null}
    {name === 'search' ? <><Circle cx="11" cy="11" r="6.5" {...stroke} /><Path d="M16 16l4 4" {...stroke} /></> : null}
    {name === 'plus' ? <Path d="M12 5v14M5 12h14" {...stroke} strokeWidth={1.8} /> : null}
    {name === 'close' ? <Path d="M6 6l12 12M18 6L6 18" {...stroke} /> : null}
    {name === 'check' ? <Path d="M5 12.5l4.5 4.5L19 7.5" {...stroke} /> : null}
    {name === 'eye' ? <><Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...stroke} /><Circle cx="12" cy="12" r="2.8" {...stroke} /></> : null}
    {name === 'image' ? <><Rect x="3.5" y="5" width="17" height="14" rx="2" {...stroke} /><Path d="M4 16l5-5 4 4 3-3 4 4" {...stroke} /></> : null}
    {name === 'camera' ? <><Path d="M4 8h3l1.5-2h7L17 8h3v11H4z" {...stroke} /><Circle cx="12" cy="13" r="3.5" {...stroke} /></> : null}
    {name === 'trash' ? <Path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" {...stroke} /> : null}
    {name === 'quote' ? <Path d="M7 17h3v-6H6V7h4M15 17h3v-6h-4V7h4" {...stroke} /> : null}
    {name === 'list' ? <><Path d="M9 6h11M9 12h11M9 18h11" {...stroke} /><Circle cx="4.5" cy="6" r="1" fill={color} /><Circle cx="4.5" cy="12" r="1" fill={color} /><Circle cx="4.5" cy="18" r="1" fill={color} /></> : null}
    {name === 'link' ? <Path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" {...stroke} /> : null}
    {name === 'mail' ? <><Rect x="3.5" y="5.5" width="17" height="13" rx="2" {...stroke} /><Path d="M4 7l8 6 8-6" {...stroke} /></> : null}
  </Svg>
}
