import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, Modal,
  StatusBar, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import LixumModal from '../../components/shared/LixumModal';

export default function CookingModeScreen({ visible, onClose, recipe }) {
  var _lc = useLang(); var lang = _lc.lang;

  var _cookModal = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });
  var cookModal = _cookModal[0]; var setCookModal = _cookModal[1];
  var closeCookModal = function() { setCookModal(function(p) { return Object.assign({}, p, { visible: false }); }); };

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
      setCookModal({ visible: true, type: 'confirm', title: 'Minuteurs en cours', message: 'Tu as des minuteurs actifs. Quitter maintenant ?', confirmText: 'Quitter', cancelText: 'Continuer', onConfirm: function() { closeCookModal(); setCookingTimers({}); onClose(); }, onClose: closeCookModal });
    } else {
      onClose();
    }
  };

  // === JSX ===

  return (
    <View>
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
        <StatusBar barStyle="light-content" />

        {/* ═══ HEADER ═══ */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: wp(16), paddingTop: wp(50), paddingBottom: wp(12),
          backgroundColor: '#151B23', borderBottomWidth: 1, borderBottomColor: '#2A303B',
        }}>
          <Pressable onPress={handleClose}>
            <Text style={{ color: '#FF6B6B', fontSize: fp(13), fontWeight: '700' }}>✕ Fermer</Text>
          </Pressable>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FF8C42', fontSize: fp(12), fontWeight: '800' }}>👨‍🍳 PRÉPARATION</Text>
            <Text style={{ color: '#5A6070', fontSize: fp(9) }}>
              Étape {cookingCurrentStep + 1}/{cookingSteps.length}
            </Text>
          </View>

          <View style={{ width: wp(60) }} />
        </View>

        {/* ═══ BARRE MINUTEURS ACTIFS ═══ */}
        {Object.keys(cookingTimers).length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ maxHeight: wp(50), backgroundColor: '#151B23', borderBottomWidth: 1, borderBottomColor: '#2A303B' }}
            contentContainerStyle={{ paddingHorizontal: wp(12), paddingVertical: wp(8), gap: wp(8) }}
          >
            {Object.keys(cookingTimers).map(function(key) {
              var timer = cookingTimers[key];
              var isActive = timer.running && timer.remaining > 0;
              var isDone = timer.finished;
              var bgColor = isDone ? 'rgba(255,107,107,0.15)' : isActive ? 'rgba(0,217,132,0.1)' : 'rgba(255,255,255,0.03)';
              var borderColor = isDone ? 'rgba(255,107,107,0.4)' : isActive ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.05)';
              var textColor = isDone ? '#FF6B6B' : isActive ? '#00D984' : '#5A6070';

              return (
                <Pressable
                  key={key}
                  onPress={function() { setCookingCurrentStep(parseInt(key)); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: bgColor, borderRadius: wp(10),
                    paddingHorizontal: wp(10), paddingVertical: wp(6),
                    borderWidth: 1, borderColor: borderColor,
                  }}
                >
                  <Text style={{ fontSize: fp(10), marginRight: wp(4) }}>
                    {isDone ? '🔔' : isActive ? '🔥' : '⏸'}
                  </Text>
                  <Text style={{ color: textColor, fontSize: fp(10), fontWeight: '700', marginRight: wp(6) }}>
                    {timer.label}
                  </Text>
                  <Text style={{ color: textColor, fontSize: fp(12), fontWeight: '800', fontVariant: ['tabular-nums'] }}>
                    {isDone ? 'PRÊT !' : formatTimer(timer.remaining)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* ═══ CONTENU ÉTAPE ACTUELLE ═══ */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: wp(20), paddingBottom: wp(120) }}
          showsVerticalScrollIndicator={false}
        >
          {cookingSteps.length > 0 && cookingSteps[cookingCurrentStep] && (
            <View>
              {/* Numéro d'étape */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', marginBottom: wp(16),
              }}>
                <View style={{
                  width: wp(40), height: wp(40), borderRadius: wp(20),
                  backgroundColor: 'rgba(255,140,66,0.1)',
                  justifyContent: 'center', alignItems: 'center',
                  borderWidth: 2, borderColor: '#FF8C42',
                  marginRight: wp(12),
                }}>
                  <Text style={{ color: '#FF8C42', fontSize: fp(16), fontWeight: '900' }}>
                    {cookingCurrentStep + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600', letterSpacing: 1 }}>
                    ÉTAPE {cookingCurrentStep + 1} SUR {cookingSteps.length}
                  </Text>
                </View>
              </View>

              {/* Texte de l'étape — gros et lisible */}
              <Text style={{
                color: '#EAEEF3', fontSize: fp(18), lineHeight: fp(28),
                fontWeight: '500', marginBottom: wp(20),
              }}>
                {cookingSteps[cookingCurrentStep].text}
              </Text>

              {/* ═══ MINUTEUR (si l'étape en a un) ═══ */}
              {cookingSteps[cookingCurrentStep].timer_seconds && (
                <View style={{
                  borderRadius: wp(16), padding: 1, backgroundColor: '#4A4F55',
                  marginBottom: wp(16),
                }}>
                  <LinearGradient
                    colors={['#3A3F46', '#252A30', '#1A1D22']}
                    style={{ borderRadius: wp(15), padding: wp(20), alignItems: 'center' }}
                  >
                    {(function() {
                      var timer = cookingTimers[cookingCurrentStep];
                      var isRunning = timer && timer.running;
                      var isFinished = timer && timer.finished;
                      var remaining = timer ? timer.remaining : cookingSteps[cookingCurrentStep].timer_seconds;
                      var total = cookingSteps[cookingCurrentStep].timer_seconds;
                      var progress = remaining / total;

                      return (
                        <View style={{ alignItems: 'center' }}>
                          {/* Label */}
                          <Text style={{ color: '#FF8C42', fontSize: fp(12), fontWeight: '700', marginBottom: wp(8), letterSpacing: 1 }}>
                            ⏱ {cookingSteps[cookingCurrentStep].timer_label || 'Minuteur'}
                          </Text>

                          {/* Gros timer */}
                          <Text style={{
                            color: isFinished ? '#FF6B6B' : isRunning ? '#00D984' : '#EAEEF3',
                            fontSize: fp(42), fontWeight: '900',
                            fontVariant: ['tabular-nums'],
                            marginBottom: wp(6),
                          }}>
                            {isFinished ? 'TERMINÉ !' : formatTimer(remaining)}
                          </Text>

                          {/* Barre de progression */}
                          <View style={{
                            width: '100%', height: wp(6), borderRadius: wp(3),
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            overflow: 'hidden', marginBottom: wp(14),
                          }}>
                            <View style={{
                              height: '100%', borderRadius: wp(3),
                              backgroundColor: isFinished ? '#FF6B6B' : '#00D984',
                              width: (progress * 100) + '%',
                            }} />
                          </View>

                          {/* Bouton démarrer / en cours / terminé */}
                          {!isRunning && !isFinished && (
                            <Pressable
                              onPress={function() {
                                startCookingTimer(
                                  cookingCurrentStep,
                                  cookingSteps[cookingCurrentStep].timer_seconds,
                                  cookingSteps[cookingCurrentStep].timer_label || 'Minuteur'
                                );
                              }}
                              style={function(state) {
                                return {
                                  paddingVertical: wp(14), paddingHorizontal: wp(40),
                                  borderRadius: wp(14),
                                  backgroundColor: state.pressed ? '#00B572' : '#00D984',
                                };
                              }}
                            >
                              <Text style={{ color: '#0D1117', fontSize: fp(16), fontWeight: '800' }}>
                                ▶ Démarrer le minuteur
                              </Text>
                            </Pressable>
                          )}
                          {isRunning && (
                            <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600', fontStyle: 'italic' }}>
                              En cours... tu peux passer à l'étape suivante
                            </Text>
                          )}
                          {isFinished && (
                            <Pressable
                              onPress={function() { dismissAlarm(); }}
                              style={{
                                paddingVertical: wp(10), paddingHorizontal: wp(30),
                                borderRadius: wp(10), backgroundColor: 'rgba(255,107,107,0.15)',
                                borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)',
                              }}
                            >
                              <Text style={{ color: '#FF6B6B', fontSize: fp(12), fontWeight: '700' }}>
                                ✓ C'est bon, j'ai vérifié
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      );
                    })()}
                  </LinearGradient>
                </View>
              )}

              {/* ═══ TÂCHE PARALLÈLE (si disponible) ═══ */}
              {cookingSteps[cookingCurrentStep].parallel && cookingSteps[cookingCurrentStep].timer_seconds && (
                <View style={{
                  borderRadius: wp(14), padding: wp(16),
                  backgroundColor: 'rgba(0,217,132,0.04)',
                  borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.15)',
                  marginBottom: wp(16),
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
                    <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>⚡</Text>
                    <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '800' }}>
                      PENDANT CE TEMPS
                    </Text>
                  </View>
                  <Text style={{
                    color: '#D1D5DB', fontSize: fp(15), lineHeight: fp(24),
                    fontWeight: '400',
                  }}>
                    {cookingSteps[cookingCurrentStep].parallel}
                  </Text>
                </View>
              )}

              {/* ═══ ATTENTE PASSIVE (minuteur sans parallèle = four, repos) ═══ */}
              {!cookingSteps[cookingCurrentStep].parallel && cookingSteps[cookingCurrentStep].timer_seconds && (
                <View style={{
                  borderRadius: wp(14), padding: wp(16),
                  backgroundColor: 'rgba(77,166,255,0.04)',
                  borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)',
                  marginBottom: wp(16),
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                    <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>☕</Text>
                    <Text style={{ color: '#4DA6FF', fontSize: fp(12), fontWeight: '700' }}>
                      Temps d'attente
                    </Text>
                  </View>
                  <Text style={{ color: '#8892A0', fontSize: fp(12), lineHeight: fp(18) }}>
                    Rien à faire pour le moment ! Détends-toi, ALIXEN te préviendra quand ce sera prêt.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ═══ DERNIÈRE ÉTAPE : BOUTON TERMINER ═══ */}
          {cookingCurrentStep === cookingSteps.length - 1 && (
            <View style={{
              borderRadius: wp(14), padding: wp(20),
              backgroundColor: 'rgba(0,217,132,0.06)',
              borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.2)',
              alignItems: 'center', marginTop: wp(10),
            }}>
              <Text style={{ fontSize: fp(28), marginBottom: wp(8) }}>🎉</Text>
              <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '800', marginBottom: wp(4) }}>
                Dernière étape !
              </Text>
              <Text style={{ color: '#8892A0', fontSize: fp(10), textAlign: 'center' }}>
                Ton plat est presque prêt. Bon appétit !
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ═══ BARRE NAVIGATION BAS ═══ */}
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: wp(20), paddingVertical: wp(16), paddingBottom: wp(30),
          backgroundColor: '#151B23', borderTopWidth: 1, borderTopColor: '#2A303B',
        }}>
          {/* Bouton précédent */}
          <Pressable
            onPress={function() {
              if (cookingCurrentStep > 0) setCookingCurrentStep(cookingCurrentStep - 1);
            }}
            style={function(state) {
              return {
                width: wp(56), height: wp(56), borderRadius: wp(28),
                backgroundColor: cookingCurrentStep > 0
                  ? (state.pressed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)')
                  : 'rgba(255,255,255,0.02)',
                justifyContent: 'center', alignItems: 'center',
                borderWidth: 1, borderColor: cookingCurrentStep > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                opacity: cookingCurrentStep > 0 ? 1 : 0.3,
              };
            }}
            disabled={cookingCurrentStep === 0}
          >
            <Text style={{ color: '#EAEEF3', fontSize: fp(20), fontWeight: '700' }}>←</Text>
          </Pressable>

          {/* Indicateur progression */}
          <View style={{ flexDirection: 'row', gap: wp(4), alignItems: 'center' }}>
            {cookingSteps.map(function(_, idx) {
              var isCurrent = idx === cookingCurrentStep;
              var isPast = idx < cookingCurrentStep;
              var hasTimer = cookingTimers[idx];
              var timerRunning = hasTimer && hasTimer.running;
              var timerDone = hasTimer && hasTimer.finished;

              return (
                <Pressable
                  key={idx}
                  onPress={function() { setCookingCurrentStep(idx); }}
                  style={{
                    width: isCurrent ? wp(20) : wp(8),
                    height: wp(8),
                    borderRadius: wp(4),
                    backgroundColor: timerDone ? '#FF6B6B'
                      : timerRunning ? '#00D984'
                      : isCurrent ? '#FF8C42'
                      : isPast ? 'rgba(0,217,132,0.4)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                />
              );
            })}
          </View>

          {/* Bouton suivant / Terminer */}
          {cookingCurrentStep < cookingSteps.length - 1 ? (
            <Pressable
              onPress={function() {
                setCookingCurrentStep(cookingCurrentStep + 1);
              }}
              style={function(state) {
                return {
                  width: wp(56), height: wp(56), borderRadius: wp(28),
                  backgroundColor: state.pressed ? '#CC7A00' : '#FF8C42',
                  justifyContent: 'center', alignItems: 'center',
                };
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: fp(20), fontWeight: '700' }}>→</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={function() {
                var hasActiveTimer = Object.keys(cookingTimers).some(function(k) { return cookingTimers[k].running; });
                if (hasActiveTimer) {
                  setCookModal({ visible: true, type: 'info', title: 'Minuteurs en cours', message: 'Attends que tous les minuteurs soient terminés.', onClose: closeCookModal });
                } else {
                  setCookingTimers({});
                  onClose();
                  setCookModal({ visible: true, type: 'success', title: '🎉 Bon appétit !', message: 'Ta préparation est terminée. Régale-toi !', onClose: closeCookModal });
                }
              }}
              style={function(state) {
                return {
                  height: wp(56), borderRadius: wp(28),
                  backgroundColor: state.pressed ? '#00B572' : '#00D984',
                  justifyContent: 'center', alignItems: 'center',
                  paddingHorizontal: wp(20),
                };
              }}
            >
              <Text style={{ color: '#0D1117', fontSize: fp(13), fontWeight: '800' }}>Terminer ✓</Text>
            </Pressable>
          )}
        </View>

        {/* ═══ OVERLAY ALARME ═══ */}
        {cookingAlarm && (
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 999,
          }}>
            <View style={{
              backgroundColor: '#1A1D22', borderRadius: wp(24),
              padding: wp(30), alignItems: 'center',
              borderWidth: 2, borderColor: '#FF6B6B',
              width: '80%',
            }}>
              <Text style={{ fontSize: fp(50), marginBottom: wp(12) }}>🔔</Text>
              <Text style={{ color: '#FF6B6B', fontSize: fp(20), fontWeight: '900', marginBottom: wp(8), textAlign: 'center' }}>
                C'est prêt !
              </Text>
              <Text style={{ color: '#EAEEF3', fontSize: fp(15), textAlign: 'center', lineHeight: fp(22), marginBottom: wp(20) }}>
                Chef, vérifie {cookingAlarm.label ? 'tes ' + cookingAlarm.label.toLowerCase() : 'ta cuisson'} — le temps est écoulé !
              </Text>
              <Pressable
                onPress={function() { dismissAlarm(); }}
                style={function(state) {
                  return {
                    paddingVertical: wp(14), paddingHorizontal: wp(40),
                    borderRadius: wp(14),
                    backgroundColor: state.pressed ? '#CC5555' : '#FF6B6B',
                  };
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: fp(15), fontWeight: '800' }}>
                  ✓ J'ai vérifié !
                </Text>
              </Pressable>
            </View>
          </View>
        )}

      </View>
    </Modal>
    <LixumModal visible={cookModal.visible} type={cookModal.type} title={cookModal.title} message={cookModal.message} onConfirm={cookModal.onConfirm} onClose={cookModal.onClose || closeCookModal} confirmText={cookModal.confirmText} cancelText={cookModal.cancelText} />
    </View>
  );
}
