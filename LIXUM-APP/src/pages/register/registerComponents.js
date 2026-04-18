import React, { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Platform, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle as SvgCircle, Line } from 'react-native-svg';
import { W, H, C, isValidEmail, isValidFullName } from './registerConstants';

function TechBackground() {
  var gridSpacing = 50; var lines = []; var dots = [];
  for (var y = 0; y < H; y += gridSpacing)
    lines.push(<Line key={'h'+y} x1="0" y1={y} x2={W} y2={y} stroke="rgba(62,72,85,0.25)" strokeWidth="0.5" />);
  for (var x = 0; x < W; x += gridSpacing)
    lines.push(<Line key={'v'+x} x1={x} y1="0" x2={x} y2={H} stroke="rgba(62,72,85,0.25)" strokeWidth="0.5" />);
  for (var x2 = 0; x2 < W; x2 += gridSpacing*2)
    for (var y2 = 0; y2 < H; y2 += gridSpacing*2)
      dots.push(<SvgCircle key={'d'+x2+'-'+y2} cx={x2} cy={y2} r="1.5" fill="rgba(0,217,132,0.14)" />);
  return (
    <Svg width={W} height={H} style={{ position:'absolute', top:0, left:0 }} pointerEvents="none">
      {lines}{dots}
      <Line x1="60" y1={H*0.35} x2="90" y2={H*0.35} stroke="rgba(0,217,132,0.15)" strokeWidth="1" strokeDasharray="4 3" />
      <Line x1={W-90} y1={H*0.35} x2={W-60} y2={H*0.35} stroke="rgba(0,217,132,0.15)" strokeWidth="1" strokeDasharray="4 3" />
    </Svg>
  );
}

function CircuitPattern(props) {
  var w = props.width, h = props.height, color = props.color || 'rgba(0,217,132,0.06)';
  return (
    <Svg width={w} height={h} style={{ position:'absolute', top:0, left:0 }} pointerEvents="none">
      <Line x1="20" y1={h*0.15} x2={w*0.35} y2={h*0.15} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w*0.35} cy={h*0.15} r="2" fill={color} />
      <Line x1={w*0.65} y1={h*0.12} x2={w-20} y2={h*0.12} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w*0.65} cy={h*0.12} r="2" fill={color} />
      <Line x1="15" y1={h*0.50} x2={w*0.20} y2={h*0.60} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w*0.50} cy={h*0.30} r="1" fill={color} />
      <SvgCircle cx={w*0.85} cy={h*0.45} r="1" fill={color} />
    </Svg>
  );
}

function CircularProgress(props) {
  var step = props.step, total = props.total, size = 44, sw = 3;
  var r = (size-sw)/2, circ = 2*Math.PI*r, prog = (step/total)*circ;
  return (
    <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
      <Svg width={size} height={size} style={{ transform:[{rotate:'-90deg'}] }}>
        <SvgCircle cx={size/2} cy={size/2} r={r} stroke="rgba(62,72,85,0.3)" strokeWidth={sw} fill="none" />
        <SvgCircle cx={size/2} cy={size/2} r={r} stroke={C.emerald} strokeWidth={sw} fill="none"
          strokeDasharray={circ} strokeDashoffset={circ-prog} strokeLinecap="round" />
      </Svg>
      <Text style={{ position:'absolute', color:C.emerald, fontSize:13, fontWeight:'800' }}>{step}/{total}</Text>
    </View>
  );
}

function GlassCard(props) {
  return (
    <View style={[{ borderRadius:16, marginBottom:14, borderWidth:1.2, borderTopColor:'rgba(138,146,160,0.2)',
      borderBottomColor:'rgba(26,31,38,0.4)', borderLeftColor:'rgba(107,123,141,0.12)',
      borderRightColor:'rgba(42,48,59,0.25)', backgroundColor:C.bgCard, padding:16 }, props.style]}>
      <View style={{ position:'absolute', top:0, left:14, right:14, height:1, backgroundColor:'rgba(255,255,255,0.05)' }} />
      {props.sectionIcon ? (
        <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 }}>
          <Ionicons name={props.sectionIcon} size={14} color={C.emerald} />
          <Text style={{ color:C.emerald, fontSize:10, fontWeight:'700', letterSpacing:1.5 }}>{props.sectionLabel}</Text>
        </View>
      ) : null}
      {props.children}
    </View>
  );
}

function PremiumInput(props) {
  var borderRef = useRef(null);
  return (
    <View style={{ marginBottom: props.noMargin ? 0 : 12 }}>
      {props.label ? <Text style={s.inputLabel}>{props.label}</Text> : null}
      <View ref={borderRef} style={[s.inputPremium, props.valid && s.inputValid]}>
        <TextInput value={props.value} onChangeText={props.onChangeText} style={s.inputText}
          placeholder={props.placeholder} placeholderTextColor={C.metalBorder}
          keyboardType={props.keyboardType} autoCapitalize={props.autoCapitalize}
          secureTextEntry={props.secureTextEntry}
          onFocus={function(){ if(borderRef.current) borderRef.current.setNativeProps({ style:{ borderColor:C.emerald, borderWidth:1.5 } }); }}
          onBlur={function(){ if(borderRef.current) borderRef.current.setNativeProps({ style:{ borderColor:C.metalBorder, borderWidth:1 } }); }}
        />
      </View>
    </View>
  );
}

var ScrollPicker = function(pp) {
  var values=pp.values, selectedValue=pp.selectedValue, onSelect=pp.onSelect, unit=pp.unit;
  var color=pp.color||'#00D984', pickerH=pp.height||260, ITEM_H=50;
  var scrollRef = useRef(null);
  var padTop = pickerH/2-ITEM_H/2, padBot = pickerH/2-ITEM_H/2;
  var initialIdx = Math.max(0, values.indexOf(selectedValue));

  useEffect(function(){ var t=setTimeout(function(){
    if(scrollRef.current) scrollRef.current.scrollTo({ y:initialIdx*ITEM_H, animated:false });
  },100); return function(){clearTimeout(t)}; },[initialIdx]);

  var snap = useCallback(function(e){
    var y=e.nativeEvent.contentOffset.y, idx=Math.round(y/ITEM_H);
    var cl=Math.max(0,Math.min(idx,values.length-1));
    if(values[cl]!==selectedValue) onSelect(values[cl]);
  },[values,selectedValue,onSelect]);

  return (
    <View style={{ height:pickerH, overflow:'hidden', borderRadius:14, borderWidth:1, borderColor:color+'18', backgroundColor:'#0A0E14' }}>
      <View style={{ position:'absolute', top:pickerH/2-ITEM_H/2, left:6, right:6, height:ITEM_H, borderRadius:10, backgroundColor:color+'0D' }}>
        <View style={{ position:'absolute', left:0, top:8, bottom:8, width:3, borderRadius:2, backgroundColor:color }} />
      </View>
      <LinearGradient colors={['#0A0E14','rgba(10,14,20,0.7)','rgba(10,14,20,0)']}
        style={{ position:'absolute', top:0, left:0, right:0, height:pickerH*0.35, zIndex:3, borderTopLeftRadius:14, borderTopRightRadius:14 }} pointerEvents="none" />
      <LinearGradient colors={['rgba(10,14,20,0)','rgba(10,14,20,0.7)','#0A0E14']}
        style={{ position:'absolute', bottom:0, left:0, right:0, height:pickerH*0.35, zIndex:3, borderBottomLeftRadius:14, borderBottomRightRadius:14 }} pointerEvents="none" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} snapToInterval={ITEM_H}
        decelerationRate={0.92} bounces={false} overScrollMode="never"
        onMomentumScrollEnd={snap} onScrollEndDrag={function(e){ if(!e.nativeEvent.velocity||Math.abs(e.nativeEvent.velocity.y)<0.1) snap(e); }}
        contentContainerStyle={{ paddingTop:padTop, paddingBottom:padBot }}>
        {values.map(function(val,i){
          var isSel = val===selectedValue;
          return <View key={val+'-'+i} style={{ height:ITEM_H, alignItems:'center', justifyContent:'center' }}>
            {isSel ? (
              <View style={{ alignItems:'center' }}>
                <Text style={{ color:color, fontSize:22, fontWeight:'800', textAlign:'center' }}>{val}</Text>
                <Text style={{ color:color, fontSize:9, fontWeight:'600', opacity:0.7, letterSpacing:1, marginTop:-2 }}>{unit}</Text>
              </View>
            ) : (
              <Text style={{ color:'#555E6C', fontSize:15, fontWeight:'400', opacity:0.3, textAlign:'center' }}>{val}</Text>
            )}
          </View>;
        })}
      </ScrollView>
    </View>
  );
};

function NavigationButtons(props) {
  var step = props.step;
  var setStep = props.setStep;
  var totalSteps = props.totalSteps;
  var fd = props.formData;
  var onComplete = props.onComplete;
  var t = props.t;
  var loading = props.loading;
  var onBeforeNext = props.onBeforeNext;
  var onBeforePrevious = props.onBeforePrevious;
  var isPhase1OTP = props.isPhase1OTP;
  var lang = props.lang || 'fr';

  var canNext = function(){
    switch(step){
      case 1: return isValidFullName(fd.fullName)&&isValidEmail(fd.email)&&fd.emailAvailable!==false&&fd.email===fd.emailConfirm&&fd.password&&fd.password.length>=8&&fd.password===fd.passwordConfirm;
      case 2: return fd.weight&&fd.height&&fd.age;
      case 3: return true;
      case 4: return fd.diet!=='';
      case 5: return fd.goal!=='';
      case 6: return true;
      default: return true;
    }
  };
  var enabled = canNext();

  var handleNext = function() {
    if (isPhase1OTP) return;
    if (loading) return;
    if (onBeforeNext) {
      onBeforeNext();
      return;
    }
    if (step < totalSteps) setStep(step + 1);
    else if (onComplete) onComplete();
  };

  var handlePrevious = function() {
    if (loading) return;
    if (onBeforePrevious) {
      var consume = onBeforePrevious();
      if (consume === false) return;
    }
    setStep(step - 1);
  };

  var nextDisabled = !enabled || loading || isPhase1OTP;
  var nextOpacity = nextDisabled ? 0.4 : 1;

  var nextLabel;
  if (isPhase1OTP) {
    nextLabel = lang === 'fr' ? 'Saisissez le code' : 'Enter the code';
  } else if (step === totalSteps) {
    nextLabel = t.createAccount;
  } else {
    nextLabel = t.next;
  }

  return (
    <View style={{ flexDirection:'row', paddingHorizontal:20, paddingTop:8, paddingBottom:Platform.OS==='android'?12:8, gap:10 }}>
      {step>1 || isPhase1OTP ? (
        <TouchableOpacity onPress={handlePrevious} style={{ flex:0.4, paddingVertical:15, borderRadius:12,
          borderWidth:1.2, borderColor:C.metalBorder, backgroundColor:C.bgDeep, alignItems:'center' }}>
          <Ionicons name="arrow-back" size={18} color={C.textSecondary} />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity onPress={handleNext}
        disabled={nextDisabled} activeOpacity={0.7}
        style={{ flex:1, borderRadius:12, overflow:'hidden', opacity:nextOpacity }}>
        {step===totalSteps && !isPhase1OTP ? (
          <LinearGradient colors={['#D4AF37','#C5A028','#A68B1B']} start={{x:0,y:0}} end={{x:1,y:1}}
            style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:15, borderRadius:12 }}>
            {loading ? <ActivityIndicator size="small" color={C.bgDeep} /> : (
              <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                <Text style={{ color:C.bgDeep, fontSize:15, fontWeight:'800', letterSpacing:1 }}>{nextLabel}</Text>
                <Ionicons name="checkmark-done" size={18} color={C.bgDeep} />
              </View>
            )}
          </LinearGradient>
        ) : (
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:15, borderRadius:12,
            backgroundColor:'rgba(0,217,132,0.08)', borderWidth:1.2, borderColor:'rgba(0,217,132,0.3)' }}>
            {loading ? <ActivityIndicator size="small" color={C.emerald} /> : (
              <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                <Text style={{ color:C.emerald, fontSize:15, fontWeight:'700' }}>{nextLabel}</Text>
                {!isPhase1OTP ? <Ionicons name="arrow-forward" size={16} color={C.emerald} /> : null}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

var s = StyleSheet.create({
  phaseIcon: { width:50, height:50, borderRadius:12, backgroundColor:'rgba(0,217,132,0.08)',
    borderWidth:1, borderColor:'rgba(0,217,132,0.2)', alignItems:'center', justifyContent:'center' },
  phaseTitle: { color:'#EAEEF3', fontSize:22, fontWeight:'700', textAlign:'center', marginBottom:4 },
  phaseSubtitle: { color:'#8892A0', fontSize:13, textAlign:'center', marginBottom:20 },
  inputLabel: { color:'#8892A0', fontSize:12, fontWeight:'600', marginBottom:6, letterSpacing:0.5 },
  inputPremium: { borderRadius:10, backgroundColor:'#0A0E14', borderWidth:1, borderColor:'rgba(62,72,85,0.3)' },
  inputValid: { borderColor:'rgba(0,217,132,0.3)' },
  inputText: { color:'#EAEEF3', fontSize:14, paddingHorizontal:14, paddingVertical:12 },
});

export {
  TechBackground,
  CircuitPattern,
  CircularProgress,
  GlassCard,
  PremiumInput,
  ScrollPicker,
  NavigationButtons,
  s as registerStyles,
};
