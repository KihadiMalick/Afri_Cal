# INJECTION_POINTS_XP — Cartographie des 7 sources XP (LIXUM V5)

RPC cible : `add_user_xp(user_id, xp_amount, source, bonus_from)` (jamais appelée côté JS
aujourd'hui). Ce document liste, pour chaque source XP prévue, le fichier / fonction / ligne
où l'injection devra avoir lieu JUSTE APRÈS la réussite de l'écriture DB.

Lecture seule — aucun code modifié.

---

## SOURCE 1 : scan meal (+10 XP)

**Statut : ✅ Point clair (3 entry points convergent tous vers la même RPC `add_meal_and_update_summary`)**

Chaque flux d'ajout de repas (scan photo, saisie manuelle, recette) insère via la RPC
`add_meal_and_update_summary`. L'injection XP doit se faire juste après le check `error`.

### 1a — Scan photo / gallery

- Fichier : `src/pages/repas/XscanScreen.js`
- Fonction : `saveMealToSupabase`
- Ligne RPC : 875 (return success confirmé ligne 894)
- Point d'injection suggéré : ligne 900 (après `setSaveSuccess(true)`)
- Contexte :

```js
892	      });
893	
894	      if (error) {
895	        console.error('Erreur sauvegarde Supabase:', error);
896	        alert('Erreur : ' + error.message);
897	        setIsSaving(false);
898	        return;
899	      }
900	
901	      setSaveSuccess(true);
902	
903	      setTimeout(() => {
904	        onMealSaved();
```

### 1b — Saisie manuelle (Meals tab ou Ingredients tab)

- Fichier : `src/pages/repas/ManualEntryScreen.js`
- Fonction : anonyme (handler du bouton "Enregistrer", défini dans `saveManual` implicite)
- Ligne RPC : 269
- Point d'injection suggéré : ligne 295 (après `setSaveManualSuccess(true)`)
- Contexte :

```js
286	      });
287	
288	      if (error) {
289	        console.error('Erreur sauvegarde manuelle:', error);
290	        alert('Erreur : ' + error.message);
291	        setIsSavingManual(false);
292	        return;
293	      }
294	
295	      setSaveManualSuccess(true);
296	      setTimeout(() => {
297	        onMealSaved();
```

### 1c — Ajout depuis une recette

- Fichier : `src/pages/repas/RecettesScreen.js`
- Fonction : handler d'ajout recette (inside `addSelectedRecipeToSlot`-like bloc)
- Ligne INSERT : 360-364 (`supabase.from('meals').insert(mealData)`)
- Ligne RPC summary : 366-376 (`add_meal_and_update_summary`)
- Point d'injection suggéré : ligne 380 (après `if (summaryError) console.warn(...)`)
- Contexte :

```js
360	      const { error: mealError } = await supabase
361	        .from('meals')
362	        .insert(mealData);
363	
364	      if (mealError) throw mealError;
365	
366	      const { error: summaryError } = await supabase.rpc(
367	        'add_meal_and_update_summary', ...
378	      if (summaryError) console.warn('Summary update warning:', summaryError);
379	
380	      setShowAddConfirm(false);
381	      setSelectedSlot(null);
382	      setAddingMeal(false);
```

Note : la source passée à `add_user_xp` devra distinguer `scan_meal` (XscanScreen) vs
`manual_meal` / `recipe_meal` si le spec V5 limite le +10 XP au seul scan. Actuellement
le paramètre `p_source` vaut respectivement `xscan_4` / `gallery`, `manual`, `recipe`.

---

## SOURCE 2 : activity (+kcal brûlées en XP, boostable Ruby Tiger)

**Statut : ✅ Point clair — un seul point d'entrée centralisé**

Tous les flux sport (course, marche, sports de salle, sports custom) passent par la même
fonction `saveActivity` qui appelle la RPC `add_user_activity`.

- Fichier : `src/pages/activity/ActivityPage.js`
- Fonction : `saveActivity`
- Ligne RPC : 305
- Point d'injection suggéré : ligne 314 (après `runPostSaveHooks`, avant `await loadTodayActivities()`)
- Variable kcal disponible : `caloriesBurned` (paramètre)
- Contexte :

```js
305	      const { error } = await supabase.rpc('add_user_activity', {
306	        p_user_id: userId,
307	        p_name: actData.label, p_type: activityType,
308	        p_duration_minutes: safeDuration,
309	        p_calories_burned: Math.round(caloriesBurned),
310	        p_intensity: intensity || 'modere',
311	        p_water_lost_ml: Math.round(waterLost),
312	      });
313	      if (error) { alert('Erreur : ' + error.message); return false; }
314	      if (pagePowers.length > 0) { await runPostSaveHooks(activityType, caloriesBurned, durationMin); } else { setHookResults({}); }
315	      await loadTodayActivities();
316	      fetchSmartData();
317	      fetchWeeklyMinutes();
318	      if (!lixRewardedToday) setLixRewardedToday(true);
319	      return true;
```

Callers confirmés : `handleAddRun` (441), `handleSportSave` (453), bouton marche (650).
`LiveTrackingScreen.js` et `PostReportModal.js` ne contiennent aucun `.insert` / `.rpc` —
ils passent tous par `saveActivity` de la page parente.

---

## SOURCE 3 : mood (+5 XP)

**Statut : ✅ Point clair**

- Fichier : `src/pages/dashboard/MoodModal.js`
- Fonction : handler anonyme du `onPress` du bouton "Valider ✓"
- Ligne INSERT : 400 (`supabase.from('moods').insert(...)`)
- Point d'injection suggéré : ligne 408 (après `onMoodSaved(...)`, avant `catch`)
- Garde-fou existant : si déjà 20 moods dans la journée, early-return sans insert (lignes 392-398) — l'injection XP doit rester à l'intérieur du `else` implicite, après le `.insert` réussi.
- Contexte :

```js
399	                          var moodNumeric = moodResult === 'excited' ? 5 : moodResult === 'happy' ? 4 : moodResult === 'chill' ? 3 : moodResult === 'sad' ? 2 : 1;
400	                          await supabase.from('moods').insert({
401	                            user_id: userId, mood_level: moodNumeric,
402	                            weather: selectedWeather, tap_count: tapCount,
403	                            max_gauge_percent: Math.round(moodLevel),
404	                          });
405	                          await supabase.from('users_profile').update({
406	                            current_mood: moodNumeric, current_weather: selectedWeather, last_mood_at: new Date().toISOString(),
407	                          }).eq('user_id', userId);
408	                          if (onMoodSaved) onMoodSaved(moodResult, selectedWeather);
409	                        } catch (e) {
410	                          console.warn('Mood save error:', e);
```

Note : l'`.insert` ligne 400 n'est pas destructuré (`{ error }`). Le succès est donc
implicite — le try/catch gère les erreurs réseau mais pas les erreurs métier Supabase.
Envisager de wrapper l'insert si on veut ne débiter XP qu'en cas de success strict.

---

## SOURCE 4 : hydration (+3 XP par verre d'eau)

**Statut : ⚠️ Ambigu — 2 points d'écriture (eau pure vs autre boisson) via la même RPC**

La RPC `add_beverage_log` est appelée depuis deux modals distincts. Si le spec restreint
le +3 XP à l'eau pure, cibler HydrationModal uniquement. Si c'est par boisson hydratante
logguée, cibler les deux.

### 4a — Verre d'eau (bouton +50ml / +250ml / +1L depuis HydrationModal)

- Fichier : `src/pages/dashboard/HydrationModal.js`
- Fonction : `confirmDrink`
- Ligne RPC : 69
- Point d'injection suggéré : ligne 81 (après le check `res.error`, avant fetch du logId)
- Contexte :

```js
64	  var confirmDrink = async function() {
65	    if (tempMl <= 0 || isAdding) return;
66	    setIsAdding(true);
67	    var ml = tempMl;
68	    try {
69	      var res = await supabase.rpc('add_beverage_log', {
70	        p_user_id: userId,
71	        p_beverage_name: 'eau',
72	        p_amount_ml: ml,
73	        p_hydration_coeff: 1.0,
74	        p_source: 'manual',
75	        p_kcal: 0,
76	        p_sugar_g: 0,
77	        p_sugar_estimated: false,
78	        p_sugar_cubes: 0,
79	      });
80	      if (res.error) { console.warn('confirmDrink error:', res.error.message); setIsAdding(false); return; }
81	      var logId = null;
```

### 4b — Autre boisson (café, jus, soda…) via BeverageModal

- Fichier : `src/pages/dashboard/BeverageModal.js`
- Fonction : handler `saveBeverage` (inline)
- Ligne RPC : 115
- Point d'injection suggéré : ligne 127 (après la fin du try, avant le `catch`)
- Contexte :

```js
114	    try {
115	      const { error } = await supabase.rpc('add_beverage_log', {
116	        p_user_id: userId,
117	        p_beverage_name: bevName,
118	        p_amount_ml: beverageVolume,
119	        p_hydration_coeff: bevCoeff,
120	        p_source: 'manual',
121	        p_kcal: totals.kcal,
122	        p_sugar_g: totals.sugarG,
123	        p_sugar_estimated: !bevSugarKnown,
124	        p_sugar_cubes: bevSugarKnown ? 0 : sugarCubes,
125	      });
126	      if (error) console.warn('add_beverage_log error:', error.message);
127	    } catch (err) {
```

Note : Coral Dolphin MAX (+15 XP flat hydra) suggère que CHAQUE log hydra donne XP, donc
les deux points sont probablement à brancher. Le paramètre `p_beverage_name` permet de
discriminer `eau` vs autre côté DB si besoin.

---

## SOURCE 5 : ALIXEN chat (+5 XP par message envoyé)

**Statut : ⚠️ Ambigu — 3 entry points "envoi message" dans le chat principal + 2 dans RecettesScreen**

Tous appellent l'edge function `/functions/v1/lixman-chat`. Décider si :
- XP uniquement pour le chat principal ALIXEN (medicai/index.js) — 3 points à brancher
- XP aussi pour l'ALIXEN culinaire (RecettesScreen.js) — 5 points

### 5a — Chat principal texte

- Fichier : `src/pages/medicai/index.js`
- Fonction : `sendMessage`
- Ligne fetch : 1820
- Point d'injection suggéré : ligne 1847 (juste après parsing `data`, avant `if (response.status === 402)` handled ligne 1843 — donc après ligne 1846, une fois `const data` récupéré)
- Contexte :

```js
1820	      const response = await fetch(
1821	        SUPABASE_URL + '/functions/v1/lixman-chat',
...
1843	      if (response.status === 402) {
1844	        var gateData = await response.json();
1845	        setEnergyGateData(gateData); setIsLoading(false); setCardIsLoading(false); return;
1846	      }
1847	      const data = await response.json();
1848	      const replyText = data.message || data.error || "Erreur de connexion.";
```

### 5b — Chat principal image

- Fichier : `src/pages/medicai/index.js`
- Fonction : `sendImageToAlixen`
- Ligne fetch : 1197
- Point d'injection : après la réception réussie de `data` (ligne ~1219+)

### 5c — Chat principal quick reply

- Fichier : `src/pages/medicai/index.js`
- Fonction : `handleQuickReply`
- Ligne fetch : 1329
- Point d'injection : après parsing `data` ligne 1351

### 5d / 5e — ALIXEN culinaire (RecettesScreen)

- Fichier : `src/pages/repas/RecettesScreen.js`
- Lignes fetch : 717, 826 (deux appels distincts à `lixman-chat`)
- Contexte : scope chef/recette ALIXEN, probablement HORS scope "chat ALIXEN" du spec V5.
  À confirmer avec le product.

---

## SOURCE 6 : connexion (+10 XP via RPC séparée `claim_daily_login_xp`)

**Statut : ⚠️ Ambigu — aucun appel actuel, point logique identifié dans AuthContext**

La RPC `claim_daily_login_xp` n'est invoquée NULLE PART dans le code JS actuel
(grep exhaustif → 0 match). L'emplacement logique est le `useEffect` qui s'exécute
quand `userId` devient disponible.

- Fichier : `src/config/AuthContext.js`
- Fonction : `useEffect` avec dependency `[userId, refreshLixFromServer, ...]`
- Lignes : 187-194
- Point d'injection suggéré : ligne 190 (après `refreshLixFromServer()`, en parallèle du
  `check_and_generate_notifications`)
- Contexte :

```js
187	  useEffect(function() {
188	    if (userId) {
189	      refreshLixFromServer();
190	      Promise.resolve(supabase.rpc('check_and_generate_notifications', { p_user_id: userId })).then(null, function(e) { console.warn('check_and_generate_notifications error:', e); });
191	      fetchAlixenNotifications();
192	      fetchLixverseNotifications();
193	    }
194	  }, [userId, refreshLixFromServer, fetchAlixenNotifications, fetchLixverseNotifications]);
```

Note : ce `useEffect` re-run à chaque changement de ses dépendances, pas uniquement au
login initial. La RPC `claim_daily_login_xp` doit être idempotente côté DB (vérifier
`last_login_date = today` avant de créditer) pour éviter les doublons.

Alternative : brancher dans le handler de login réussi (LoginPage). À vérifier si un tel
handler existe avec un "login success event" distinct du flux Supabase session.

---

## SOURCE 7 : streak 7 jours (+50 XP)

**Statut : ❌ Non trouvé côté JS, ❌ aucune trace côté SQL fourni**

Recherches effectuées :
- `grep -ri 'streak' LIXUM-APP/src` → uniquement labels UI (profileConstants.js:96 "+50 XP",
  lixverseConstants.js:28 ALBURAX "streak shield 7j")
- `grep -ri 'momo\|grant_momo_streak_bonus\|streak_bonus'` sur `/home/user/Afri_Cal` →
  0 match (ni JS, ni SQL migration files visibles)
- Aucune fonction `claim_streak_bonus` / `check_streak` dans le code JS

**Recommandation** : à gérer côté DB via cron ou trigger `AFTER INSERT` sur `meals` /
`activities` / `hydration_logs` qui vérifie `streak_days >= 7` et appelle `add_user_xp`
en interne. Ne PAS brancher côté JS (risque de double crédit si le cron existe déjà en
prod mais hors repo). À confirmer avec le DBA avant d'implémenter.

---

## Synthèse

**3/7 points clairs** : scan meal (1), activity (2), mood (3)
**3/7 points ambigus** : hydration (4 — 2 flux), ALIXEN chat (5 — 3 à 5 flux), connexion (6 — point logique mais aucun appel existant)
**1/7 non trouvé** : streak 7j (7 — à gérer côté DB)

### Paramètres pour `add_user_xp` (source à passer)

| Source      | `source` suggéré     | `xp_amount`          | Bonus perso possible           |
|-------------|----------------------|----------------------|--------------------------------|
| scan meal   | `'scan_meal'`        | 10                   | —                              |
| activity    | `'activity'`         | `Math.round(kcal)`   | Ruby Tiger +10/20/30%          |
| mood        | `'mood'`             | 5                    | —                              |
| hydration   | `'hydration'`        | 3                    | Coral Dolphin MAX +15 flat     |
| ALIXEN chat | `'alixen_chat'`      | 5                    | —                              |
| connexion   | `'daily_login'`      | 10 (via RPC dédiée)  | —                              |
| streak 7j   | `'streak_7'`         | 50                   | géré côté DB                   |

Iron Rhino MAX (+15% sur challenges) non pertinent pour ces 7 sources — concerne les
défis LixVerse, scope différent.
