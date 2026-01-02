import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// نصوص وصور الواجهة تبقى كما هي
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

// الشاشة الآن تستقبل اللغة كـ prop من App.js
const IndexScreen = ({ language }) => {
  const navigation = useNavigation();
  const [currentSection, setCurrentSection] = useState(0);

  const showSection = (sectionNumber) => {
    if (sectionNumber >= 0 && sectionNumber < texts[language].length) {
      setCurrentSection(sectionNumber);
    }
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
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.signInText}>{language === 'en' ? "Sign in" : "تسجيل الدخول"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signUpText}>{language === 'en' ? "Sign up" : "تسجيل"}</Text>
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
              <AntDesign name="arrowleft" size={24} color="#ffffff" />
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
              <AntDesign name="arrowright" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightGreenBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d0f0c0',
  },
  fullGreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 128, 0, 0.2)',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  greenOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  // --- التعديل الأول: رفع النص "حبة صغيرة" في أول صفحتين ---
  content: {
    position: 'absolute',
    bottom: height * 0.13, // <<< --- زيادة طفيفة جداً
    left: 15,
    right: 15,
    alignItems: 'center',
  },
  // --- التعديل الثاني: رفع النص "حبة صغيرة" في الصفحة الثالثة ---
  upperContent: {
    position: 'absolute',
    bottom: height * 0.28, // <<< --- زيادة طفيفة جداً
    left: 15,
    right: 15,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
  },
  // --- التعديل الثالث: رفع الأزرار "حبة صغيرة" في الصفحة الثالثة ---
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.11, // <<< --- زيادة طفيفة جداً
    width: '100%',
    alignItems: 'center',
  },
  signInButton: {
    width: '80%',
    backgroundColor: 'rgba(76, 175, 80, 1)',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  signInText: {
    color: '#ffffff',
    fontSize: 16,
  },
  signUpButton: {
    width: '80%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signUpText: {
    color: '#ffffff',
    fontSize: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicator: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#ffffff',
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'absolute',
  },
  leftButton: {
    left: 0,
  },
  rightButton: {
    right: 0,
  },
});

export default IndexScreen;