import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const texts = {
  en: [
    { heading: "Advanced Weight Tracker", paragraph: "Welcome to Advanced Weight Tracker! Discover amazing features to enhance your daily experience." },
    { heading: "Track Your Diet", paragraph: "Easily log your daily meals and learn about their nutritional value to achieve your health goals." },
    { heading: "Track Your Progress", paragraph: "Visualize your weight loss journey with our interactive charts. Set goals, monitor trends, and celebrate your achievements!" }
  ],
  ar: [
    { heading: "متعقب الوزن المتقدم", paragraph: "مرحبًا بكم في متعقب الوزن المتقدم! اكتشف ميزات مذهلة لتحسين تجربتك اليومية." },
    { heading: "تتبع نظامك الغذائي", paragraph: "سجل وجباتك اليومية بسهولة وتعرف على قيمتها الغذائية لتحقيق أهدافك الصحية." },
    { heading: "تتبع تقدمك", paragraph: "تصور رحلتك في فقدان الوزن باستخدام مخططاتنا التفاعلية. حدد الأهداف، وتابع الاتجاهات، واحتفل بإنجازاتك!" }
  ]
};

const images = [
  'https://i.imgur.com/hfP1V3x.png',
  'https://i.imgur.com/7sxA6Sw.png',
  'https://i.imgur.com/CPLIluy.jpeg'
];

const IndexScreen = ({ language }) => {
  const navigation = useNavigation();
  const [currentSection, setCurrentSection] = useState(0);

  const showSection = (sectionNumber) => {
    if (sectionNumber >= 0 && sectionNumber < texts[language || 'en'].length) {
      setCurrentSection(sectionNumber);
    }
  };

  const handleStart = () => {
      // ✅ هنا التعديل: التوجيه مباشرة للصفحة الرئيسية أو صفحة إعداد البيانات الأولية
      // تأكد أن اسم الشاشة هنا يطابق اسم الـ Tab Navigator أو الصفحة الرئيسية في App.js
      navigation.replace('Weight'); // أو 'WeightTracker' حسب تسميتك
  };

  const currentTexts = texts[language] || texts['en']; 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.lightGreenBackground} />
        <ImageBackground source={{ uri: images[currentSection] }} style={styles.image} resizeMode="cover">
          <View style={styles.fullGreenOverlay} />
          <LinearGradient colors={['transparent', 'rgba(56, 142, 60, 0.4)', 'rgba(56, 142, 60, 0.8)', 'rgba(56, 142, 60, 1)']} locations={[0, 0.5, 0.75, 1]} style={styles.greenOverlay} />

          {(currentSection === 2) ? (
            <>
              <View style={styles.upperContent}>
                <Text style={styles.heading}>{currentTexts[currentSection].heading}</Text>
                <Text style={styles.paragraph}>{currentTexts[currentSection].paragraph}</Text>
              </View>
              {/* ✅ زرار واحد كبير للبدء فوراً */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                  <Text style={styles.startButtonText}>{language === 'en' ? "Get Started" : "ابدأ الآن"}</Text>
                  <MaterialIcons name={language === 'en' ? "arrow-forward" : "arrow-back"} size={20} color="#fff" style={{marginLeft: 10}} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.content}>
              <Text style={styles.heading}>{currentTexts[currentSection]?.heading}</Text>
              <Text style={styles.paragraph}>{currentTexts[currentSection]?.paragraph}</Text>
            </View>
          )}

          <View style={styles.bottomContainer}>
            <TouchableOpacity 
                style={[styles.navButton, styles.leftButton, { opacity: currentSection > 0 ? 1 : 0 }]} 
                onPress={() => showSection(currentSection - 1)}
                disabled={currentSection === 0}
            >
              <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
                {[0, 1, 2].map((index) => (
                  <View key={index} style={[styles.dot, currentSection === index && styles.activeDot]} />
                ))}
            </View>

            <TouchableOpacity 
                style={[styles.navButton, styles.rightButton, { opacity: currentSection < 2 ? 1 : 0 }]} 
                onPress={() => showSection(currentSection + 1)}
                disabled={currentSection === 2}
            >
              <MaterialIcons name="arrow-forward" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightGreenBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#d0f0c0' },
  fullGreenOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 128, 0, 0.2)' },
  image: { flex: 1, width: '100%', height: '100%' },
  greenOverlay: { ...StyleSheet.absoluteFillObject },
  content: { position: 'absolute', bottom: height * 0.13, left: 15, right: 15, alignItems: 'center' },
  upperContent: { position: 'absolute', bottom: height * 0.25, left: 15, right: 15, alignItems: 'center' },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 10 },
  paragraph: { fontSize: 16, color: '#ffffff', textAlign: 'center', lineHeight: 24 },
  
  // ✅ ستايل الزرار الجديد
  buttonContainer: { position: 'absolute', bottom: height * 0.14, width: '100%', alignItems: 'center' },
  startButton: {
    width: '85%',
    backgroundColor: '#4CAF50', // لون أخضر مميز
    borderRadius: 30,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },

  bottomContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pageIndicator: { flexDirection: 'row' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginHorizontal: 5 },
  activeDot: { backgroundColor: '#ffffff' },
  navButton: { justifyContent: 'center', alignItems: 'center', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(76, 175, 80, 1)', position: 'absolute', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  leftButton: { left: 0 },
  rightButton: { right: 0 },
});

export default IndexScreen;