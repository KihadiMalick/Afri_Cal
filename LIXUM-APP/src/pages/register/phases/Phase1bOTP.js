import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../config/supabase';
import { C } from '../registerConstants';
import { GlassCard } from '../registerComponents';

function Phase1bOTP(props) {
  var email = props.email;
  var lang = props.lang;
  var onVerified = props.onVerified;
  var onResendRequested = props.onResendRequested;

  var _otp = useState(['', '', '', '', '', '']), otp = _otp[0], setOtp = _otp[1];
  var _verifying = useState(false), verifying = _verifying[0], setVerifying = _verifying[1];
  var _error = useState(null), error = _error[0], setError = _error[1];
  var _resendCooldown = useState(30), resendCooldown = _resendCooldown[0], setResendCooldown = _resendCooldown[1];
  var _resendLoading = useState(false), resendLoading = _resendLoading[0], setResendLoading = _resendLoading[1];

  var input0Ref = useRef(null);
  var input1Ref = useRef(null);
  var input2Ref = useRef(null);
  var input3Ref = useRef(null);
  var input4Ref = useRef(null);
  var input5Ref = useRef(null);
  var inputRefs = [input0Ref, input1Ref, input2Ref, input3Ref, input4Ref, input5Ref];

  var shakeAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(function() {
    var id = setTimeout(function() { if (inputRefs[0].current) inputRefs[0].current.focus(); }, 500);
    return function() { clearTimeout(id); };
  }, []);

  useEffect(function() {
    if (resendCooldown <= 0) return;
    var id = setTimeout(function() { setResendCooldown(resendCooldown - 1); }, 1000);
    return function() { clearTimeout(id); };
  }, [resendCooldown]);

  var triggerShake = function() {
    RNAnimated.sequence([
      RNAnimated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  var verifyCode = function(code) {
    if (verifying) return;
    setVerifying(true);
    setError(null);
    supabase.auth.verifyOtp({ email: email, token: code, type: 'email' })
      .then(function(result) {
        setVerifying(false);
        if (result.error) {
          setError(result.error.message || 'Code invalide');
          triggerShake();
          setOtp(['', '', '', '', '', '']);
          setTimeout(function() { if (inputRefs[0].current) inputRefs[0].current.focus(); }, 300);
        } else {
          if (onVerified) onVerified();
        }
      })
      .catch(function(err) {
        setVerifying(false);
        setError(err.message || 'Erreur de vérification');
        triggerShake();
      });
  };

  var handleDigitChange = function(index, value) {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    var newOtp = otp.slice();
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);
    if (value && index < 5) {
      if (inputRefs[index + 1].current) inputRefs[index + 1].current.focus();
    }
    if (index === 5 && value) {
      verifyCode(newOtp.join(''));
    }
  };

  var handleKeyPress = function(index, key) {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      if (inputRefs[index - 1].current) inputRefs[index - 1].current.focus();
    }
  };

  var handleResend = function() {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError(null);
    if (onResendRequested) {
      onResendRequested();
    }
    setOtp(['', '', '', '', '', '']);
    setResendCooldown(30);
    setResendLoading(false);
    setTimeout(function() { if (inputRefs[0].current) inputRefs[0].current.focus(); }, 300);
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
      <GlassCard sectionIcon="shield-checkmark-outline" sectionLabel={lang === 'fr' ? 'V\u00e9rification' : 'Verification'}>

        <Text style={{ color: C.textPrimary, fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
          {lang === 'fr' ? 'Un code \u00e0 6 chiffres a \u00e9t\u00e9 envoy\u00e9 \u00e0 :' : 'A 6-digit code has been sent to:'}
        </Text>
        <Text style={{ color: C.emerald, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
          {email}
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 20 }}>
          {lang === 'fr' ? 'V\u00e9rifiez vos spams si vous ne le trouvez pas.' : 'Check your spam folder if you don\'t find it.'}
        </Text>

        <RNAnimated.View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, transform: [{ translateX: shakeAnim }] }}>
          {[0, 1, 2, 3, 4, 5].map(function(i) {
            return (
              <TextInput
                key={i}
                ref={inputRefs[i]}
                value={otp[i]}
                onChangeText={function(v) { handleDigitChange(i, v); }}
                onKeyPress={function(e) { handleKeyPress(i, e.nativeEvent.key); }}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 48,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderWidth: 1.5,
                  borderColor: error ? C.error : (otp[i] ? C.emerald : 'rgba(255,255,255,0.15)'),
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#FFF',
                }}
                editable={!verifying}
              />
            );
          })}
        </RNAnimated.View>

        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            <Ionicons name="alert-circle" size={12} color={C.error} />
            <Text style={{ color: C.error, fontSize: 11, fontWeight: '600' }}>
              {lang === 'fr' ? 'Code incorrect, r\u00e9essayez' : 'Incorrect code, try again'}
            </Text>
          </View>
        ) : null}

        {verifying ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <ActivityIndicator size="small" color={C.textMuted} />
            <Text style={{ color: C.textMuted, fontSize: 12 }}>
              {lang === 'fr' ? 'V\u00e9rification...' : 'Verifying...'}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleResend}
          disabled={resendCooldown > 0 || resendLoading}
          style={{
            marginTop: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: resendCooldown > 0 ? 'rgba(255,255,255,0.1)' : C.emerald,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ color: resendCooldown > 0 ? C.textMuted : C.emerald, fontSize: 12, fontWeight: '600' }}>
            {resendCooldown > 0
              ? (lang === 'fr' ? 'Renvoyer dans ' + resendCooldown + 's' : 'Resend in ' + resendCooldown + 's')
              : (lang === 'fr' ? 'Renvoyer le code \u2192' : 'Resend code \u2192')}
          </Text>
        </TouchableOpacity>

      </GlassCard>
    </View>
  );
}

export default Phase1bOTP;
