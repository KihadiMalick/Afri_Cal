import React from 'react';
import { View, Text } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[LIXUM ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#1E2530', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Something went wrong</Text>
          <Text style={{ color: '#8892A0', fontSize: 12, textAlign: 'center' }}>{this.state.error ? this.state.error.toString() : 'Unknown error'}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
