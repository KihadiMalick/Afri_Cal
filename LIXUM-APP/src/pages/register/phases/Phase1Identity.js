import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, SUPABASE_URL, SUPABASE_ANON_KEY, isValidEmail, isValidFullName, getPasswordStrength } from '../registerConstants';
import { GlassCard, PremiumInput } from '../registerComponents';

function Phase1Identity({ formData, setFormData, t, lang }) {
  var fd = formData;
  var validEmail = fd.email ? isValidEmail(fd.email) : false;
  var emailsMatch = validEmail && fd.email === fd.emailConfirm;
  var validName = isValidFullName(fd.fullName);
  var nameStarted = fd.fullName.trim().length > 0;
  var passStrength = getPasswordStrength(fd.password);
  var passMatch = fd.password && fd.password === fd.passwordConfirm;

  var _emailStatus = useState('idle');
  var emailStatus = _emailStatus[0], setEmailStatus = _emailStatus[1];
  var debounceRef = useRef(null);

  function u(k, v) { setFormData(function(prev) { var n = Object.assign({}, prev); n[k] = v; return n; }); }

  var checkEmailAvailable = useCallback(function(email) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!email || !isValidEmail(email)) { setEmailStatus('idle'); u('emailAvailable', null); return; }
    setEmailStatus('checking');
    debounceRef.current = setTimeout(function() {
      fetch(SUPABASE_URL + '/rest/v1/rpc/check_email_available', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_email: email.trim().toLowerCase() }),
      }).then(function(r) { return r.json(); }).then(function(result) {
        if (result && result.available === true) { setEmailStatus('available'); u('emailAvailable', true); }
        else if (result && result.available === false) { setEmailStatus('taken'); u('emailAvailable', false); }
        else { setEmailStatus('idle'); u('emailAvailable', null); }
      }).catch(function() { setEmailStatus('idle'); u('emailAvailable', null); });
    }, 800);
  }, []);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <GlassCard sectionIcon="person-outline" sectionLabel={t.identityLabel}>
        <PremiumInput label={t.fullName} value={fd.fullName} onChangeText={function(v) { u('fullName', v); }}
          placeholder={lang === 'fr' ? 'Pr\u00e9nom Nom' : 'First Last'} valid={validName} />
        {nameStarted && !validName ? (
          <Text style={{ color: '#FF8C42', fontSize: 10, marginTop: -6 }}>
            {lang === 'fr' ? 'Veuillez entrer votre pr\u00e9nom et nom (ex: Jean Dupont)' : 'Please enter first and last name (e.g. John Doe)'}
          </Text>
        ) : null}
        {validName ? (<Text style={{ color: C.emerald, fontSize: 10, marginTop: -6 }}>{'\u2713'}</Text>) : null}
      </GlassCard>

      <GlassCard sectionIcon="mail-outline" sectionLabel={t.emailLabel}>
        <PremiumInput label={t.email} value={fd.email}
          onChangeText={function(v) { u('email', v); checkEmailAvailable(v); }}
          keyboardType="email-address" autoCapitalize="none" placeholder="email@example.com"
          valid={validEmail && emailStatus === 'available'} />
        {fd.email && !validEmail ? (
          <Text style={{ color: C.error, fontSize: 10, marginTop: -6 }}>
            {lang === 'fr' ? 'Adresse email invalide' : 'Invalid email address'}
          </Text>
        ) : emailStatus === 'checking' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -6 }}>
            <ActivityIndicator size={10} color={C.textMuted} />
            <Text style={{ color: C.textMuted, fontSize: 10 }}>{lang === 'fr' ? 'V\u00e9rification...' : 'Checking...'}</Text>
          </View>
        ) : emailStatus === 'taken' ? (
          <View style={{ marginTop: -6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="alert-circle" size={12} color={C.error} />
              <Text style={{ color: C.error, fontSize: 10, fontWeight: '600' }}>
                {lang === 'fr' ? 'Cette adresse est d\u00e9j\u00e0 utilis\u00e9e' : 'This email is already taken'}
              </Text>
            </View>
            <TouchableOpacity onPress={function() { console.log('Navigate to Login'); }} style={{ marginTop: 4 }}>
              <Text style={{ color: C.emerald, fontSize: 10, fontWeight: '700' }}>
                {lang === 'fr' ? 'D\u00e9j\u00e0 un compte ? Se connecter \u2192' : 'Already have an account? Sign in \u2192'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : emailStatus === 'available' && validEmail ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -6 }}>
            <Ionicons name="checkmark-circle" size={12} color={C.emerald} />
            <Text style={{ color: C.emerald, fontSize: 10, fontWeight: '600' }}>
              {lang === 'fr' ? 'Email disponible' : 'Email available'}
            </Text>
          </View>
        ) : null}

        <PremiumInput label={t.emailConfirm} value={fd.emailConfirm} onChangeText={function(v) { u('emailConfirm', v); }}
          keyboardType="email-address" autoCapitalize="none" valid={emailsMatch} />
        {fd.emailConfirm !== '' ? (
          <Text style={{ color: emailsMatch ? C.emerald : C.error, fontSize: 11, marginTop: -6 }}>
            {emailsMatch ? t.emailMatch : (validEmail ? t.emailNoMatch : (lang === 'fr' ? 'Corrigez d\'abord l\'email ci-dessus' : 'Fix the email above first'))}
          </Text>
        ) : null}
      </GlassCard>

      <GlassCard sectionIcon="lock-closed-outline" sectionLabel={t.securityLabel}>
        <PremiumInput label={t.password} value={fd.password} onChangeText={function(v) { u('password', v); }} secureTextEntry />
        {fd.password.length > 0 ? (
          <View style={{ marginTop: -4, marginBottom: 10 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(62,72,85,0.3)', overflow: 'hidden' }}>
              <View style={{ width: passStrength.width + '%', height: '100%', borderRadius: 2, backgroundColor: passStrength.color }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: passStrength.color, fontSize: 10, fontWeight: '600' }}>
                {lang === 'fr' ? passStrength.label : passStrength.labelEn}
              </Text>
              {fd.password.length < 8 ? (
                <Text style={{ color: '#FF8C42', fontSize: 9 }}>
                  {lang === 'fr' ? 'Encore ' + (8 - fd.password.length) + ' caract\u00e8res' : (8 - fd.password.length) + ' more chars'}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={{ color: C.textMuted, fontSize: 10, marginTop: -6, marginBottom: 10 }}>{t.passRules}</Text>
        )}
        <PremiumInput label={t.passwordConfirm} value={fd.passwordConfirm}
          onChangeText={function(v) { u('passwordConfirm', v); }}
          secureTextEntry valid={passMatch && fd.passwordConfirm !== ''} />
        {fd.passwordConfirm !== '' ? (
          <Text style={{ color: passMatch ? C.emerald : C.error, fontSize: 11, marginTop: -6 }}>
            {passMatch ? '\u2713' : (lang === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match')}
          </Text>
        ) : null}
      </GlassCard>
    </ScrollView>
  );
}

export default Phase1Identity;
