import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
var Updates = null;
try { Updates = require('expo-updates'); } catch (e) {}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo: errorInfo });
    console.error('[LIXUM ErrorBoundary] CRASH CAUGHT');
    console.error('[LIXUM ErrorBoundary] Error:', error);
    console.error('[LIXUM ErrorBoundary] Stack:', error && error.stack ? error.stack : 'no stack');
    console.error('[LIXUM ErrorBoundary] Component stack:', errorInfo && errorInfo.componentStack ? errorInfo.componentStack : 'no component stack');
  }

  handleRestart() {
    try {
      if (Updates && Updates.reloadAsync) {
        Updates.reloadAsync();
      } else {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }
    } catch (e) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.hasError) {
      var errorMsg = '';
      var stackLines = '';
      try {
        errorMsg = this.state.error ? this.state.error.message || this.state.error.toString() : 'Unknown error';
        var fullStack = this.state.error && this.state.error.stack ? this.state.error.stack : '';
        stackLines = fullStack.split('\n').slice(0, 5).join('\n');
      } catch (e) {
        errorMsg = 'Error parsing error';
      }

      return (
        React.createElement(View, {
          style: { flex: 1, backgroundColor: '#4A1F1F', justifyContent: 'center', alignItems: 'center', padding: 24 }
        },
          React.createElement(Text, {
            style: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' }
          }, '\u26A0 Erreur LIXUM'),
          React.createElement(Text, {
            style: { color: '#FFB4B4', fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 16 }
          }, errorMsg),
          stackLines ? React.createElement(ScrollView, {
            style: { maxHeight: 160, width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 12, marginBottom: 20 }
          },
            React.createElement(Text, {
              style: { color: '#FF9A9A', fontSize: 11, fontFamily: 'monospace', lineHeight: 16 },
              selectable: true
            }, stackLines)
          ) : null,
          React.createElement(Pressable, {
            onPress: this.handleRestart.bind(this),
            style: function(state) { return {
              backgroundColor: state.pressed ? '#00B871' : '#00D984',
              borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
              marginTop: 8,
            }; }
          },
            React.createElement(Text, {
              style: { color: '#1A2029', fontSize: 16, fontWeight: '700', textAlign: 'center' }
            }, 'Red\u00E9marrer l\'app')
          ),
          React.createElement(Text, {
            style: { color: 'rgba(255,180,180,0.5)', fontSize: 10, marginTop: 16, textAlign: 'center' }
          }, 'Si le probl\u00E8me persiste, fermez et rouvrez l\'application.')
        )
      );
    }
    return this.props.children;
  }
}
