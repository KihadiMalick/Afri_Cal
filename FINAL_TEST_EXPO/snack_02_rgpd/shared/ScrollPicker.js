import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ScrollPicker unifie — remplace ProfileScrollPicker (ProfilePage inline)
// et ScrollPicker (registerComponents inline).
// Variants :
//   'compact' : picker hydration profil (ITEM_H 40, height 160, unit a cote)
//   'large'   : picker morpho register  (ITEM_H 50, height 260, unit dessous)
// Styles wrapper (bg, border, fades) preserves a l'identique vs l'existant
// pour respecter le critere zero regression visuelle.

function ScrollPicker(props) {
  var values = props.values;
  var selectedValue = props.selectedValue;
  var onSelect = props.onSelect;
  var unit = props.unit || '';
  var color = props.color || '#00D984';
  var variant = props.variant || 'large';

  var defaultItemHeight = variant === 'compact' ? 40 : 50;
  var defaultHeight = variant === 'compact' ? 160 : 260;
  var itemHeight = props.itemHeight || defaultItemHeight;
  var height = props.height || defaultHeight;

  var scrollRef = useRef(null);

  useEffect(function() {
    var idx = values.indexOf(selectedValue);
    if (idx < 0) return;
    var offset = idx * itemHeight;
    var timeoutDelay = variant === 'compact' ? 150 : 100;
    var timer = setTimeout(function() {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: offset, animated: false });
      }
    }, timeoutDelay);
    return function() { clearTimeout(timer); };
  }, [selectedValue, values, itemHeight, variant]);

  var handleScrollEnd = useCallback(function(e) {
    var y = e.nativeEvent.contentOffset.y;
    var idx = Math.round(y / itemHeight);
    if (idx < 0) idx = 0;
    if (idx >= values.length) idx = values.length - 1;
    var val = values[idx];
    if (val !== selectedValue && onSelect) {
      onSelect(val);
    }
  }, [values, selectedValue, onSelect, itemHeight]);

  var handleScrollEndDrag = useCallback(function(e) {
    var vy = e.nativeEvent.velocity && e.nativeEvent.velocity.y;
    if (typeof vy !== 'number' || Math.abs(vy) < 0.1) {
      handleScrollEnd(e);
    }
  }, [handleScrollEnd]);

  // Styles selon variant (reproduction fidele)
  var valueFontSize = variant === 'compact' ? 18 : 22;
  var valueFontWeight = variant === 'compact' ? '800' : '800';
  var nonSelFontSize = variant === 'compact' ? 12 : 15;
  var nonSelColor = variant === 'compact' ? 'rgba(255,255,255,0.15)' : '#555E6C';
  var nonSelOpacity = variant === 'compact' ? 1 : 0.3;
  var unitFontSize = variant === 'compact' ? 10 : 9;
  var borderRadius = variant === 'compact' ? 12 : 14;

  var padding = (height - itemHeight) / 2;

  return (
    <View style={{
      height: height,
      borderRadius: borderRadius,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#0A0E14',
      borderWidth: 1,
      borderColor: color + '18'
    }}>
      {/* Bande de selection centrale */}
      <View style={{
        position: 'absolute',
        left: variant === 'compact' ? 4 : 6,
        right: variant === 'compact' ? 4 : 6,
        top: padding,
        height: itemHeight,
        borderRadius: variant === 'compact' ? 8 : 10,
        backgroundColor: color + '0D',
        zIndex: 0
      }} pointerEvents="none">
        {/* Barre verticale accent a gauche */}
        <View style={{
          position: 'absolute',
          left: 0,
          top: variant === 'compact' ? 4 : 8,
          bottom: variant === 'compact' ? 4 : 8,
          width: 3,
          borderRadius: 2,
          backgroundColor: color
        }} />
      </View>

      {/* Fades top et bottom (preserves identique vs existant) */}
      <LinearGradient
        colors={['#0A0E14', 'rgba(10,14,20,0.5)', 'rgba(10,14,20,0)']}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: height * 0.35,
          zIndex: 3
        }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(10,14,20,0)', 'rgba(10,14,20,0.5)', '#0A0E14']}
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: height * 0.35,
          zIndex: 3
        }}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate={0.92}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled={true}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        contentContainerStyle={{
          paddingTop: padding,
          paddingBottom: padding
        }}
      >
        {values.map(function(v, i) {
          var isSelected = v === selectedValue;
          if (variant === 'compact') {
            return (
              <View
                key={'v_' + i}
                style={{
                  height: itemHeight,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{
                  color: isSelected ? color : nonSelColor,
                  fontSize: isSelected ? valueFontSize : nonSelFontSize,
                  fontWeight: isSelected ? valueFontWeight : '400',
                  opacity: isSelected ? 1 : nonSelOpacity
                }}>
                  {isSelected ? (v + ' ' + unit) : String(v)}
                </Text>
              </View>
            );
          }
          return (
            <View
              key={'v_' + i}
              style={{
                height: itemHeight,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isSelected ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    color: color,
                    fontSize: valueFontSize,
                    fontWeight: valueFontWeight,
                    textAlign: 'center'
                  }}>
                    {v}
                  </Text>
                  {unit ? (
                    <Text style={{
                      color: color,
                      fontSize: unitFontSize,
                      fontWeight: '600',
                      opacity: 0.7,
                      letterSpacing: 1,
                      marginTop: -2
                    }}>
                      {unit}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={{
                  color: nonSelColor,
                  fontSize: nonSelFontSize,
                  fontWeight: '400',
                  opacity: nonSelOpacity,
                  textAlign: 'center'
                }}>
                  {v}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default ScrollPicker;
