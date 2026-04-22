import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from './MockAuthContext';
import { useLang } from './MockLanguageContext';
import { T } from './mockT';

function MockPage() {
  var auth = useAuth();
  var lang = useLang();
  var t = lang.language === 'EN' ? T.en : T.fr;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E14', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>
      <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#1A1D22', borderWidth: 2, borderColor: '#00D984', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 44 }}>{'🧪'}</Text>
      </View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 }}>
        Template Mock Page
      </Text>
      <Text style={{ fontSize: 13, color: '#B8BEC5', textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
        {'Remplacez-moi par votre page à tester.\nUtilisez useAuth() et useLang() pour consommer les mocks.'}
      </Text>
      <View style={{ backgroundColor: '#1A1D22', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2A303B', width: '100%' }}>
        <Text style={{ fontSize: 11, color: '#6B7280', letterSpacing: 1, marginBottom: 6 }}>
          {'CONTEXT SNAPSHOT'}
        </Text>
        <Text style={{ fontSize: 12, color: '#00D984', fontFamily: 'monospace' }}>
          {'userId: ' + auth.userId}
        </Text>
        <Text style={{ fontSize: 12, color: '#00D984', fontFamily: 'monospace' }}>
          {'language: ' + lang.language}
        </Text>
        <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 8, fontStyle: 'italic' }}>
          {t.examplePlaceholder}
        </Text>
      </View>
    </View>
  );
}

export default MockPage;
