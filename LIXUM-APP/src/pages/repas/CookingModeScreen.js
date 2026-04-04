import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, Modal,
  StatusBar, Alert, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';

export default function CookingModeScreen({ visible, onClose, recipe }) {
  var _lc = useLang(); var lang = _lc.lang;

  // === ÉTATS ===
  var _cookingSteps = useState([]); var cookingSteps = _cookingSteps[0]; var setCookingSteps = _cookingSteps[1];
  var _cookingCurrentStep = useState(0); var cookingCurrentStep = _cookingCurrentStep[0]; var setCookingCurrentStep = _cookingCurrentStep[1];
  var _cookingTimers = useState({}); var cookingTimers = _cookingTimers[0]; var setCookingTimers = _cookingTimers[1];
  // cookingTimers = { stepIndex: { remaining: seconds, total: seconds, label: 'Pâtes', running: true/false, finished: false } }
  var _cookingAlarm = useState(null); var cookingAlarm = _cookingAlarm[0]; var setCookingAlarm = _cookingAlarm[1];
  // cookingAlarm = { label: 'Spaghettis', stepIndex: 2 } ou null

  // === INITIALISATION quand visible + recipe changent ===
  useEffect(function() {
    if (visible && recipe) {
      var steps = [];
      if (recipe.detailed_steps && recipe.detailed_steps.length > 0) {
        steps = recipe.detailed_steps;
      } else if (recipe.steps && typeof recipe.steps === 'string') {
        var lines = recipe.steps.split('\n').filter(function(l) { return l.trim().length > 0; });
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].replace(/^\d+\.\s*/, '').trim();
          var timeMatch = line.match(/(\d+)\s*(min|minutes|mn)/i);
          var timerSec = timeMatch ? parseInt(timeMatch[1]) * 60 : null;
          var timerLabel = null;
          if (timerSec) {
            var words = line.split(' ');
            for (var j = 0; j < words.length; j++) {
              var w = words[j].toLowerCase();
              if (w.length > 3 && w !== 'dans' && w !== 'avec' && w !== 'pendant' && w !== 'cuire' && w !== 'laisser' && w !== 'faire') {
                timerLabel = words[j].charAt(0).toUpperCase() + words[j].slice(1);
                break;
              }
            }
            if (!timerLabel) timerLabel = 'Étape ' + (i + 1);
          }
          steps.push({
            text: line,
            timer_seconds: timerSec,
            timer_label: timerLabel,
            parallel: null,
          });
        }
      }

      setCookingSteps(steps);
      setCookingCurrentStep(0);
      setCookingTimers({});
      setCookingAlarm(null);
    }
  }, [visible, recipe]);

  // === TICK des minuteurs (chaque seconde) ===
  useEffect(function() {
    if (!visible) return;

    var interval = setInterval(function() {
      setCookingTimers(function(prev) {
        var updated = {};
        var keys = Object.keys(prev);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var timer = prev[key];
          if (timer.running && timer.remaining > 0) {
            var newRemaining = timer.remaining - 1;
            if (newRemaining <= 0) {
              updated[key] = { remaining: 0, total: timer.total, label: timer.label, running: false, finished: true };
              Vibration.vibrate([0, 500, 200, 500, 200, 500]);
              setCookingAlarm({ label: timer.label, stepIndex: parseInt(key) });
            } else {
              updated[key] = { remaining: newRemaining, total: timer.total, label: timer.label, running: true, finished: false };
            }
          } else {
            updated[key] = timer;
          }
        }
        return updated;
      });
    }, 1000);

    return function() { clearInterval(interval); };
  }, [visible]);

  // === FONCTIONS ===

  var startCookingTimer = function(stepIndex, seconds, label) {
    setCookingTimers(function(prev) {
      var copy = {};
      var keys = Object.keys(prev);
      for (var i = 0; i < keys.length; i++) {
        copy[keys[i]] = prev[keys[i]];
      }
      copy[stepIndex] = { remaining: seconds, total: seconds, label: label, running: true, finished: false };
      return copy;
    });
  };

  var formatTimer = function(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  };

  var dismissAlarm = function() {
    Vibration.cancel();
    setCookingAlarm(null);
  };

  var handleClose = function() {
    var hasActiveTimer = Object.keys(cookingTimers).some(function(k) { return cookingTimers[k].running; });
    if (hasActiveTimer) {
      Alert.alert(
        'Minuteurs en cours',
        'Tu as des minuteurs actifs. Quitter maintenant ?',
        [
          { text: 'Continuer', style: 'cancel' },
          { text: 'Quitter', style: 'destructive', onPress: function() {
            setCookingTimers({});
            onClose();
          }},
        ]
      );
    } else {
      onClose();
    }
  };

  // === JSX (phases suivantes) ===

  return null;
}
