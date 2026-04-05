import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CircuitPattern from './CircuitPattern';

export default function MetalCard(props) {
  var children = props.children;
  var width = props.width;
  var height = props.height;
  var borderColor = props.borderColor || 'rgba(0,217,132,0.35)';
  var circuitColor = props.circuitColor || 'rgba(0,217,132,0.05)';
  var style = props.style || {};
  var onPress = props.onPress;
  var Wrapper = onPress ? TouchableOpacity : View;
  var wrapperProps = onPress ? { onPress: onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...wrapperProps} style={[{
      borderRadius: 24,
      padding: 4,
      borderWidth: 2,
      borderTopColor: '#8892A0',
      borderLeftColor: '#6B7B8D',
      borderRightColor: '#3E4855',
      borderBottomColor: '#2A303B',
      backgroundColor: '#2A303B',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 14,
    }, style]}>
      <View style={{
        flex: 1,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: borderColor,
        overflow: 'hidden',
      }}>
        <View style={{ flex: 1, backgroundColor: '#151B23', borderRadius: 18 }}>
          {width && height && (
            <CircuitPattern width={width} height={height} color={circuitColor} />
          )}
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 110,
            borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden',
          }}>
            <LinearGradient
              colors={['#1E2530', '#1A2028', '#151B23']}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={{ flex: 1 }}
            />
          </View>
          <View style={{
            position: 'absolute', top: 0, left: 16, right: 16,
            height: 1, backgroundColor: 'rgba(136,146,160,0.25)',
          }} />
          <View style={{ padding: 16 }}>
            {children}
          </View>
        </View>
      </View>
    </Wrapper>
  );
}
