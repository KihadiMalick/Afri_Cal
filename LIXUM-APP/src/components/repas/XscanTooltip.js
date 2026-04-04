import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Svg, { Circle, Line, Defs, Mask, Rect } from 'react-native-svg';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function XscanTooltip({ visible, xButtonY, onDismiss }) {
  var _lc = useLang(); var lang = _lc.lang;
  if (!visible || xButtonY <= 0) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000,
    }}>
      {/* Overlay SVG avec trou circulaire */}
      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        style={{ position: 'absolute' }}
      >
        <Defs>
          <Mask id="spotlightMask">
            <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="white"/>
            <Circle cx={SCREEN_WIDTH / 2} cy={xButtonY + wp(15)} r={wp(55)} fill="black"/>
          </Mask>
        </Defs>
        <Rect
          x="0" y="0"
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          fill="rgba(0,0,0,0.85)"
          mask="url(#spotlightMask)"
        />
        <Circle
          cx={SCREEN_WIDTH / 2}
          cy={xButtonY + wp(15)}
          r={wp(55)}
          fill="none"
          stroke="#00D984"
          strokeWidth={2}
          opacity={0.6}
        />
      </Svg>

      {/* Bulle de texte tooltip */}
      <View style={{
        position: 'absolute',
        top: xButtonY + wp(15) + wp(80),
        left: wp(24),
        right: wp(24),
        backgroundColor: '#1E2530',
        borderRadius: 16,
        padding: wp(18),
        borderWidth: 1,
        borderColor: 'rgba(0,217,132,0.2)',
        shadowColor: '#00D984',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
      }}>
        {/* Flèche vers le haut */}
        <View style={{
          position: 'absolute',
          top: -8,
          alignSelf: 'center',
          width: 0, height: 0,
          borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 8,
          borderLeftColor: 'transparent', borderRightColor: 'transparent',
          borderBottomColor: '#1E2530',
        }}/>

        {/* Icône + Titre */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
          <View style={{ marginRight: 8 }}>
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Circle cx="11" cy="11" r="10" fill="none" stroke="#00D984" strokeWidth={1.3} opacity={0.4}/>
              <Circle cx="11" cy="11" r="6.5" fill="none" stroke="#00D984" strokeWidth={1.3} opacity={0.6}/>
              <Circle cx="11" cy="11" r="3" fill="none" stroke="#00D984" strokeWidth={1.3} opacity={0.8}/>
              <Circle cx="11" cy="11" r="1.2" fill="#00D984"/>
              <Line x1="11" y1="11" x2="11" y2="1" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.7}/>
            </Svg>
          </View>
          <Text style={{
            color: '#00D984', fontSize: fp(15), fontWeight: '800',
          }}>
            {lang === 'fr' ? 'Technologie Xscan' : 'Xscan Technology'}
          </Text>
        </View>

        {/* Description */}
        <Text style={{
          color: '#EAEEF3', fontSize: fp(13), lineHeight: fp(19),
          marginBottom: wp(10),
        }}>
          {lang === 'fr'
            ? 'Testez la technologie de scan alimentaire la plus avancée du marché, de manière Fun.'
            : 'Try the most advanced food scanning technology on the market, in a Fun way.'}
        </Text>

        {/* Badge scan gratuit */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(0,217,132,0.08)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 10,
          alignSelf: 'flex-start',
          marginBottom: wp(12),
        }}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>🎁</Text>
          <Text style={{
            color: '#00D984', fontSize: fp(12), fontWeight: '700',
          }}>
            {lang === 'fr'
              ? '1 scan gratuit offert en bienvenue !'
              : '1 free scan as a welcome gift!'}
          </Text>
        </View>

        {/* Bouton Compris */}
        <Pressable
          onPress={onDismiss}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#00B572' : '#00D984',
            borderRadius: 12,
            paddingVertical: wp(10),
            alignItems: 'center',
          })}
        >
          <Text style={{
            color: '#0D1117', fontSize: fp(14), fontWeight: '800',
          }}>
            {lang === 'fr' ? 'Compris !' : 'Got it!'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
