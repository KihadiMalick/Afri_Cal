import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { wp, fp } from '../../constants/layout';

const MEAL_CARD_WIDTH = wp(160);
const MEAL_CARD_HEIGHT = wp(170);

const MealDayCard = ({ icon, label, meal, meals, lang, onAddMeal, slotKey }) => {

  if (meal) {
    const allMeals = meals || [];
    const hasMultiple = allMeals.length > 1;

    return (
      <View style={{ width: MEAL_CARD_WIDTH }}>
        <View style={{
          borderRadius: 20, padding: 3, borderWidth: 2,
          borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D',
          borderRightColor: '#3E4855', borderBottomColor: '#2A303B',
          backgroundColor: '#2A303B',
          shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
        }}>
          <View style={{
            borderRadius: 16, borderWidth: 1.5,
            borderColor: 'rgba(0,217,132,0.25)', overflow: 'hidden',
            backgroundColor: '#151B23',
          }}>
            <View style={{
              position: 'absolute', top: 0, left: 12, right: 12,
              height: 1, backgroundColor: 'rgba(136,146,160,0.2)',
            }}/>
            <View style={{ height: MEAL_CARD_HEIGHT }}>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: wp(11), paddingHorizontal: wp(11) }}>
              <Text style={{ fontSize: 14 }}>{icon}</Text>
              <Text style={{
                color: '#8892A0', fontSize: fp(9), fontWeight: '700',
                letterSpacing: 1, marginLeft: 4, textTransform: 'uppercase',
              }}>{label}</Text>
              {hasMultiple && (
                <View style={{
                  marginLeft: 'auto',
                  backgroundColor: 'rgba(0,217,132,0.1)',
                  paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
                }}>
                  <Text style={{ color: '#00D984', fontSize: fp(8), fontWeight: '700' }}>{allMeals.length}</Text>
                </View>
              )}
              {!hasMultiple && (
                <Text style={{ color: '#3A4050', fontSize: fp(9), marginLeft: 'auto' }}>{meal.time}</Text>
              )}
            </View>

            {/* Zone scrollable si plusieurs repas */}
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: wp(90), paddingHorizontal: wp(11), flexShrink: 1 }}
              contentContainerStyle={{ paddingBottom: wp(4), paddingTop: wp(6) }}
            >
              {(hasMultiple ? allMeals : [allMeals[0] || {}]).map((m, idx) => {
                const mealData = hasMultiple ? {
                  name: m.food_name,
                  calories: Math.round(m.calories || 0),
                  protein: Math.round(m.protein_g || 0),
                  carbs: Math.round(m.carbs_g || 0),
                  fat: Math.round(m.fat_g || 0),
                } : meal;

                return (
                  <View key={idx} style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingBottom: hasMultiple && idx < allMeals.length - 1 ? wp(6) : 0,
                    marginBottom: hasMultiple && idx < allMeals.length - 1 ? wp(6) : 0,
                    borderBottomWidth: hasMultiple && idx < allMeals.length - 1 ? 0.5 : 0,
                    borderBottomColor: 'rgba(255,255,255,0.05)',
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#EAEEF3', fontSize: fp(11), fontWeight: '700',
                      }} numberOfLines={1}>{mealData.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text style={{
                          color: '#FF8C42', fontSize: fp(11), fontWeight: '700',
                        }}>{mealData.calories} kcal</Text>
                        <View style={{ flexDirection: 'row', marginLeft: wp(6), gap: wp(4) }}>
                          <Text style={{ color: '#FF6B6B', fontSize: fp(8), fontWeight: '600' }}>{mealData.protein}P</Text>
                          <Text style={{ color: '#FFD93D', fontSize: fp(8), fontWeight: '600' }}>{mealData.carbs}G</Text>
                          <Text style={{ color: '#4DA6FF', fontSize: fp(8), fontWeight: '600' }}>{mealData.fat}L</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Indicateur scroll si multiple */}
            {hasMultiple && (
              <View style={{ alignItems: 'center', paddingBottom: wp(2) }}>
                <Svg width={16} height={8} viewBox="0 0 16 8">
                  <Path d="M4 2L8 6L12 2" fill="none" stroke="#5A6070" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            )}

            {/* Bouton Ajouter en bas */}
            <View style={{ paddingHorizontal: wp(11), paddingBottom: wp(8), paddingTop: wp(2), marginTop: 'auto' }}>
              <Pressable delayPressIn={120}
                onPress={() => { if (onAddMeal) onAddMeal(slotKey); }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  paddingVertical: wp(5),
                  borderRadius: 10,
                  backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.04)',
                  borderWidth: 1,
                  borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(0,217,132,0.15)',
                })}
              >
                <Svg width={10} height={10} viewBox="0 0 10 10" style={{ marginRight: 3 }}>
                  <Line x1="5" y1="1" x2="5" y2="9" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round"/>
                  <Line x1="1" y1="5" x2="9" y2="5" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round"/>
                </Svg>
                <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                  {lang === 'fr' ? 'Ajouter' : 'Add'}
                </Text>
              </Pressable>
            </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // CARD VIDE
  return (
    <Pressable delayPressIn={120}
      onPress={() => { if (onAddMeal) onAddMeal(slotKey); }}
      style={({ pressed }) => ({
        width: MEAL_CARD_WIDTH,
        transform: [{ scale: pressed ? 0.975 : 1 }],
      })}
    >
      <View style={{
        borderRadius: 20, padding: 3, borderWidth: 2,
        borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D',
        borderRightColor: '#3E4855', borderBottomColor: '#2A303B',
        backgroundColor: '#2A303B',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
      }}>
        <View style={{
          borderRadius: 16, borderWidth: 1.5,
          borderColor: 'rgba(0,217,132,0.25)', overflow: 'hidden',
          backgroundColor: '#151B23',
        }}>
          <View style={{
            position: 'absolute', top: 0, left: 12, right: 12,
            height: 1, backgroundColor: 'rgba(136,146,160,0.2)',
          }}/>
          <View style={{
            padding: wp(11),
            height: MEAL_CARD_HEIGHT,
            justifyContent: 'center', alignItems: 'center',
          }}>

          {/* Header */}
          <View style={{
            position: 'absolute', top: wp(11), left: wp(11),
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 14 }}>{icon}</Text>
            <Text style={{
              color: '#8892A0', fontSize: fp(9), fontWeight: '700',
              letterSpacing: 1, marginLeft: 4, textTransform: 'uppercase',
            }}>{label}</Text>
          </View>

          {/* Icône emoji selon le créneau */}
          <View style={{
            width: wp(44), height: wp(44), borderRadius: wp(22),
            borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)',
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.03)',
            marginTop: wp(8),
          }}>
            <Text style={{ fontSize: fp(28) }}>
              {slotKey === 'breakfast' ? '🥐' : slotKey === 'lunch' ? '🍽️' : slotKey === 'dinner' ? '🍲' : '🍿'}
            </Text>
          </View>
          <Text style={{ color: '#4A4F55', fontSize: fp(10), textAlign: 'center', marginTop: wp(4) }}>
            {slotKey === 'breakfast' ? (lang === 'fr' ? "Qu'avez-vous mangé ce matin ?" : 'What did you eat this morning?') :
             slotKey === 'lunch' ? (lang === 'fr' ? 'Ajoutez votre déjeuner' : 'Add your lunch') :
             slotKey === 'dinner' ? (lang === 'fr' ? "Qu'y a-t-il au menu ce soir ?" : "What's on the menu tonight?") :
             (lang === 'fr' ? 'Un petit creux ?' : 'Feeling peckish?')}
          </Text>
          <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '600', marginTop: wp(6) }}>
            {lang === 'fr' ? '+ Ajouter' : '+ Add'}
          </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default MealDayCard;
