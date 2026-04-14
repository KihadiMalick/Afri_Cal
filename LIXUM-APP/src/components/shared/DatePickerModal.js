var React = require('react');
var useState = React.useState;
var View = require('react-native').View;
var Text = require('react-native').Text;
var Modal = require('react-native').Modal;
var Pressable = require('react-native').Pressable;
var ScrollView = require('react-native').ScrollView;
var LinearGradient = require('expo-linear-gradient').LinearGradient;

var MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function DatePickerModal(props) {
  var visible = props.visible;
  var onClose = props.onClose;
  var onSelect = props.onSelect;
  var title = props.title || 'Choisir une date';
  var initialDate = props.initialDate;

  var isFuture = props.isFuture;

  var now = new Date();
  var currentYear = now.getFullYear();
  var minYear = props.minYear || (currentYear - 100);
  var maxYear = props.maxYear || (isFuture ? currentYear + 80 : currentYear);
  var initD = initialDate ? new Date(initialDate) : now;
  var _day = useState(initD.getDate());
  var day = _day[0]; var setDay = _day[1];
  var _month = useState(initD.getMonth());
  var month = _month[0]; var setMonth = _month[1];
  var _year = useState(initD.getFullYear());
  var year = _year[0]; var setYear = _year[1];

  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var days = [];
  for (var d = 1; d <= daysInMonth; d++) { days.push(d); }
  // Build years array with current year near the START for easy access
  var years = [];
  if (isFuture) {
    for (var y = currentYear; y <= maxYear; y++) { years.push(y); }
    for (var y2 = currentYear - 1; y2 >= minYear; y2--) { years.unshift(y2); }
  } else {
    // Past dates: current year first, then descending
    for (var y3 = currentYear; y3 >= minYear; y3--) { years.push(y3); }
  }

  var formatDisplay = function() {
    return day + ' ' + MONTHS_FR[month] + ' ' + year;
  };

  var getIso = function() {
    return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  };

  return React.createElement(Modal, { visible: visible, transparent: true, animationType: 'fade', onRequestClose: onClose },
    React.createElement(View, { style: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 } },
      React.createElement(LinearGradient, { colors: ['#2A2F36', '#1E2328', '#252A30'], style: { borderRadius: 20, padding: 24, width: '100%' } },
        React.createElement(Text, { style: { fontSize: 18, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 6 } }, title),
        React.createElement(Text, { style: { fontSize: 14, fontWeight: '600', color: '#00D984', textAlign: 'center', marginBottom: 20 } }, formatDisplay()),

        // Day row
        React.createElement(Text, { style: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 } }, 'Jour'),
        React.createElement(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: { marginBottom: 14 }, contentContainerStyle: { gap: 6 } },
          days.map(function(dd) {
            var active = dd === day;
            return React.createElement(Pressable, { key: dd, onPress: function() { setDay(dd); }, style: { width: 40, height: 40, borderRadius: 10, backgroundColor: active ? '#00D984' : 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: active ? '#00D984' : 'rgba(255,255,255,0.08)' } },
              React.createElement(Text, { style: { fontSize: 14, fontWeight: active ? '700' : '400', color: active ? '#FFF' : 'rgba(255,255,255,0.5)' } }, String(dd))
            );
          })
        ),

        // Month row
        React.createElement(Text, { style: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 } }, 'Mois'),
        React.createElement(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: { marginBottom: 14 }, contentContainerStyle: { gap: 6 } },
          MONTHS_FR.map(function(m, mi) {
            var active = mi === month;
            return React.createElement(Pressable, { key: mi, onPress: function() { setMonth(mi); if (day > new Date(year, mi + 1, 0).getDate()) setDay(new Date(year, mi + 1, 0).getDate()); }, style: { paddingHorizontal: 14, height: 36, borderRadius: 10, backgroundColor: active ? '#00D984' : 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: active ? '#00D984' : 'rgba(255,255,255,0.08)' } },
              React.createElement(Text, { style: { fontSize: 12, fontWeight: active ? '700' : '400', color: active ? '#FFF' : 'rgba(255,255,255,0.5)' } }, m.substring(0, 3))
            );
          })
        ),

        // Year row
        React.createElement(Text, { style: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 } }, 'Année'),
        React.createElement(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: { marginBottom: 20 }, contentContainerStyle: { gap: 6 } },
          years.map(function(yy) {
            var active = yy === year;
            return React.createElement(Pressable, { key: yy, onPress: function() { setYear(yy); }, style: { paddingHorizontal: 14, height: 36, borderRadius: 10, backgroundColor: active ? '#00D984' : 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: active ? '#00D984' : 'rgba(255,255,255,0.08)' } },
              React.createElement(Text, { style: { fontSize: 13, fontWeight: active ? '700' : '400', color: active ? '#FFF' : 'rgba(255,255,255,0.5)' } }, String(yy))
            );
          })
        ),

        // Confirm
        React.createElement(Pressable, { onPress: function() { onSelect(getIso(), formatDisplay()); }, style: { borderRadius: 14, overflow: 'hidden' } },
          React.createElement(LinearGradient, { colors: ['#00D984', '#00B871'], style: { paddingVertical: 14, alignItems: 'center', borderRadius: 14 } },
            React.createElement(Text, { style: { fontSize: 15, fontWeight: '700', color: '#FFF' } }, 'Confirmer')
          )
        ),

        // Cancel
        React.createElement(Pressable, { onPress: onClose, style: { paddingVertical: 12, alignItems: 'center', marginTop: 8 } },
          React.createElement(Text, { style: { fontSize: 14, color: 'rgba(255,255,255,0.35)' } }, 'Annuler')
        )
      )
    )
  );
}

module.exports = DatePickerModal;
