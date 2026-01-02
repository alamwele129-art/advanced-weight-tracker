import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity, ScrollView,
  StatusBar, Platform, Alert, I18nManager, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { supabase } from './supabaseClient';

// ========================> ✨ بداية التعديل المطلوب ✨ <========================
// (1) استخدام المفتاح الصحيح لبيانات الاشتراك
const USER_SUBSCRIPTION_DATA_KEY = '@App:userSubscriptionData';
// ========================> 🔚 نهاية التعديل المطلوب 🔚 <========================

const translations = {
  en: {
    profile: 'Profile', settings: 'Settings', aboutApp: 'About App', logout: 'Logout',
    loadingEmail: 'Loading email...', emailNotFound: 'Email not found', errorLoadingData: 'Error loading data',
    userNamePlaceholder: 'User Name', edit: 'Edit', logoutConfirmTitle: 'Logout',
    logoutConfirmMessage: 'Are you sure you want to log out?', logoutErrorTitle: 'Logout Error',
    logoutErrorMessage: 'Could not log out. Please try again.', ok: 'OK', cancel: 'Cancel',
    editProfile: 'Edit Profile', editProfileNotSetup: 'Navigation to edit profile screen is not set up.',
    languageChangeAlertTitle: "Language Change",
    languageChangeAlertMessage: "Please restart the app for language changes to take full effect.",
    loadingProfile: "Loading Profile...",
    upgradeToPremium: 'Upgrade to Premium',
    manageSubscription: 'Manage Subscription',
    premiumMember: 'Premium Member',
  },
  ar: {
    profile: 'الملف الشخصي', settings: 'الإعدادات', aboutApp: 'حول التطبيق', logout: 'تسجيل الخروج',
    loadingEmail: 'جار تحميل البريد...', emailNotFound: 'لم يتم العثور على البريد الإلكتروني', errorLoadingData: 'خطأ في تحميل البيانات',
    userNamePlaceholder: 'اسم المستخدم', edit: 'تعديل', logoutConfirmTitle: 'تسجيل الخروج',
    logoutConfirmMessage: 'هل أنت متأكد أنك تريد تسجيل الخروج؟', logoutErrorTitle: 'خطأ في تسجيل الخروج',
    logoutErrorMessage: 'تعذر تسجيل الخروج. يرجى المحاولة مرة أخرى.', ok: 'موافق', cancel: 'إلغاء',
    editProfile: 'تعديل الملف الشخصي', editProfileNotSetup: 'الانتقال إلى شاشة تعديل الملف الشخصي غير مجهز.',
    languageChangeAlertTitle: "تغيير اللغة",
    languageChangeAlertMessage: "يرجى إعادة تشغيل التطبيق لتطبيق تغييرات اللغة بشكل كامل.",
    loadingProfile: "جار تحميل الملف الشخصي...",
    upgradeToPremium: 'الترقية إلى بريميوم',
    manageSubscription: 'إدارة الاشتراك',
    premiumMember: 'عضو مميز',
  },
};
const colors = {
    primaryGreen: '#4CAF50', white: '#ffffff', black: '#000000', lightGrey: '#f0f0f0', mediumGrey: '#777777', darkGrey: '#333333',
    darkBackground: '#121212', darkCard: '#1e1e1e', darkText: '#e0e0e0', darkSubtleText: '#a0a0a0', lightRed: '#d9534f',
    darkRed: '#ff6b6b', lightPlaceholderBg: '#eeeeee', darkPlaceholderBg: '#444444', premiumIcon: '#F5B041'
};
const lightTheme = {
    background: colors.lightGrey, cardBackground: colors.white, text: colors.darkGrey, subtleText: colors.mediumGrey, primary: colors.primaryGreen,
    headerText: colors.white, iconOnCard: colors.primaryGreen, arrowOnCard: colors.mediumGrey, logoutText: colors.lightRed, statusBar: 'dark-content',
    statusBarBg: colors.primaryGreen, shadow: colors.black, profileBorder: colors.white, placeholderBg: colors.lightPlaceholderBg, headerIconColor: colors.white,
    activityIndicator: colors.primaryGreen,
};
const darkTheme = {
    background: colors.darkBackground, cardBackground: colors.darkCard, text: colors.darkText, subtleText: colors.darkSubtleText, primary: colors.primaryGreen,
    headerText: colors.white, iconOnCard: colors.primaryGreen, arrowOnCard: colors.darkSubtleText, logoutText: colors.darkRed, statusBar: 'light-content',
    statusBarBg: colors.primaryGreen, shadow: colors.black, profileBorder: colors.darkCard, placeholderBg: colors.darkPlaceholderBg, headerIconColor: colors.white,
    activityIndicator: colors.white,
};
const ICON_SIZE = 24;
const HEADER_ICON_SIZE = 28;
const DEFAULT_PROFILE_ASSET = require('./assets/profile.png');
// ========================> ✨ بداية التعديل المطلوب ✨ <========================
// (2) إضافة أيقونة التاج
const CROWN_ICON_ASSET = require('./assets/crown.png');
// ========================> 🔚 نهاية التعديل المطلوب 🔚 <========================
const USER_PROFILE_DATA_KEY = '@Profile:userProfileData';
const LOGGED_IN_EMAIL_KEY = 'loggedInUserEmail';

const getStyles = (themeMode) => {
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  return StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: theme.background },
    header: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50, paddingBottom: 20, paddingHorizontal: 15, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.primary },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: theme.headerText, flex: 1, textAlign: 'center' },
    scrollContainer: { flex: 1, marginTop: -30 },
    scrollContentContainer: { paddingHorizontal: 15, paddingBottom: 30, paddingTop: 40 },
    card: { backgroundColor: theme.cardBackground, borderRadius: 20, paddingVertical: 20, paddingHorizontal: 15, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, alignItems: 'center', position: 'relative' },
    cardTopIcons: { position: 'absolute', top: 15, left: 15, right: 15, flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 },
    iconPlaceholder: { width: ICON_SIZE + 10, height: ICON_SIZE + 10 },
    iconButton: { padding: 5 },
    profilePicContainer: { marginTop: 25, marginBottom: 15, width: 110, height: 110, borderRadius: 55, overflow: 'hidden', borderWidth: 3, borderColor: theme.profileBorder, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3, backgroundColor: theme.placeholderBg },
    profilePic: { width: '100%', height: '100%' },
    userInfoContainer: { alignItems: 'center', marginBottom: 25 },
    // ========================> ✨ بداية التعديل المطلوب ✨ <========================
    // (3) تعديل الستايل الخاص باسم المستخدم لدعم الأيقونة بجانبه
    userNameContainer: { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    userName: { fontSize: 20, fontWeight: 'bold', color: theme.text, textAlign: 'center' },
    premiumBadge: { width: 20, height: 20, marginLeft: I18nManager.isRTL ? 0 : 8, marginRight: I18nManager.isRTL ? 8 : 0 },
    // ========================> 🔚 نهاية التعديل المطلوب 🔚 <========================
    userEmail: { fontSize: 14, color: theme.subtleText, textAlign: 'center' },
    menuContainer: { width: '100%' },
    menuItem: { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, width: '100%' },
    menuItemContent: { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', alignItems: 'center' },
    menuIcon: { width: ICON_SIZE, height: ICON_SIZE, marginRight: I18nManager.isRTL ? 0 : 15, marginLeft: I18nManager.isRTL ? 15 : 0 },
    menuText: { fontSize: 16, color: theme.text, textAlign: I18nManager.isRTL ? 'right' : 'left' },
    logoutText: { color: theme.logoutText },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
    loadingText: { fontSize: 18, marginTop: 10, color: theme.text }
  });
};

const ProfileScreen = ({
  navigation, language, darkMode,
  navigateToPremium, navigateToSettings, navigateToAbout,
  navigateToEditProfile, goBack,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(language || (I18nManager.isRTL ? 'ar' : 'en'));
  const [currentThemeMode, setCurrentThemeMode] = useState(darkMode ? 'dark' : 'light');
  const [isPremium, setIsPremium] = useState(false);
  const t = useCallback((key) => { return translations[currentLanguage]?.[key] || translations['en']?.[key] || key; }, [currentLanguage]);
  const [displayedUsername, setDisplayedUsername] = useState(() => t('userNamePlaceholder'));
  const [displayedEmail, setDisplayedEmail] = useState(() => t('loadingEmail'));
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (language && language !== currentLanguage) { setCurrentLanguage(language); }
  }, [language, currentLanguage]);

  useEffect(() => {
    const newThemeMode = darkMode ? 'dark' : 'light';
    if (newThemeMode !== currentThemeMode) { setCurrentThemeMode(newThemeMode); }
  }, [darkMode, currentThemeMode]);

  const loadProfileData = useCallback(async () => {
    try {
      // ========================> ✨ بداية التعديل المطلوب ✨ <========================
      // (4) تحديث طريقة قراءة حالة الاشتراك
      const [userProfileDataString, loggedInUserEmail, subscriptionDataString] = await Promise.all([
        AsyncStorage.getItem(USER_PROFILE_DATA_KEY),
        AsyncStorage.getItem(LOGGED_IN_EMAIL_KEY),
        AsyncStorage.getItem(USER_SUBSCRIPTION_DATA_KEY)
      ]);
      const profileData = userProfileDataString ? JSON.parse(userProfileDataString) : {};
      
      let isSubscribed = false;
      if (subscriptionDataString) {
        const subscriptionData = JSON.parse(subscriptionDataString);
        if (subscriptionData && subscriptionData.expiryDate && Date.now() < subscriptionData.expiryDate) {
          isSubscribed = true;
        }
      }
      
      setDisplayedUsername(profileData.username || t('userNamePlaceholder'));
      setDisplayedEmail(loggedInUserEmail || t('emailNotFound'));
      setProfileImageUri(profileData.profileImageUrl || null);
      setIsPremium(isSubscribed);
      // ========================> 🔚 نهاية التعديل المطلوب 🔚 <========================
    } catch (error) {
      console.error("[ProfileScreen] Error loading profile data:", error);
      setDisplayedEmail(t('errorLoadingData'));
    } finally {
        setIsInitialized(true);
    }
  }, [currentLanguage, t]);

  useFocusEffect(useCallback(() => { setIsInitialized(false); loadProfileData(); }, [loadProfileData]));

  const handleUpgradePress = () => { if (navigateToPremium) navigateToPremium(); };
  const handleSettingsPress = () => { if (navigateToSettings) navigateToSettings(); };
  const handleAboutPress = () => { if (navigateToAbout) navigateToAbout(); };
  const handleEditProfilePress = () => { if (navigateToEditProfile) navigateToEditProfile(); };
  const handleGoBack = () => { if (goBack) goBack(); };
  
  const handleLogoutPress = () => {
    Alert.alert(
      t('logoutConfirmTitle'), t('logoutConfirmMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('ok'),
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error; 

              // ========================> ✨ بداية التعديل المطلوب ✨ <========================
              // (5) حذف مفتاح الاشتراك الصحيح عند الخروج
              await AsyncStorage.multiRemove([LOGGED_IN_EMAIL_KEY, USER_PROFILE_DATA_KEY, USER_SUBSCRIPTION_DATA_KEY]);
              // ========================> 🔚 نهاية التعديل المطلوب 🔚 <========================
              
              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Index' }] }));
            } catch (error) {
              console.error("Logout Failed:", error);
              Alert.alert(t('logoutErrorTitle'), t('logoutErrorMessage'));
            }
          },
          style: 'destructive',
        },
      ], { cancelable: true });
  };

  const styles = getStyles(currentThemeMode);
  const currentThemeColors = currentThemeMode === 'dark' ? darkTheme : lightTheme;
  const profileImageSource = profileImageUri ? { uri: profileImageUri } : DEFAULT_PROFILE_ASSET;
  const imageKey = profileImageUri || 'default_asset';

  if (!isInitialized) {
    return (
        <View style={styles.loadingContainer}>
            <StatusBar barStyle={currentThemeColors.statusBar} backgroundColor={currentThemeColors.statusBarBg} />
            <ActivityIndicator size="large" color={currentThemeColors.activityIndicator} />
            <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
        </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle={currentThemeColors.statusBar} backgroundColor={currentThemeColors.statusBarBg} />
      <View style={styles.header}>
         <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
           <Icon name={I18nManager.isRTL ? "arrow-forward-outline" : "arrow-back-outline"} size={HEADER_ICON_SIZE} color={currentThemeColors.headerIconColor} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>{t('profile')}</Text>
         <View style={{ width: HEADER_ICON_SIZE + (styles.backButton?.padding || 0) * 2 }} />
       </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.card}>
           <View style={styles.cardTopIcons}>
             <View style={styles.iconPlaceholder} />
             <TouchableOpacity style={styles.iconButton} onPress={handleEditProfilePress}>
               <Icon name="create-outline" size={ICON_SIZE} color={currentThemeColors.iconOnCard} />
             </TouchableOpacity>
           </View>

           <View style={styles.profilePicContainer}>
             <Image source={profileImageSource} style={styles.profilePic} key={imageKey} resizeMode="cover" onError={() => setProfileImageUri(null)} />
           </View>
           
           {/* ========================> ✨ بداية التعديل المطلوب ✨ <======================== */}
           {/* (6) عرض اسم المستخدم مع أيقونة التاج إذا كان مشتركًا */}
           <View style={styles.userInfoContainer}>
                <View style={styles.userNameContainer}>
                    <Text style={styles.userName} numberOfLines={1}>{displayedUsername}</Text>
                    {isPremium && (
                        <Image
                            source={CROWN_ICON_ASSET}
                            style={styles.premiumBadge}
                            resizeMode="contain"
                        />
                    )}
                </View>
                <Text style={styles.userEmail} numberOfLines={1}>{displayedEmail}</Text>
           </View>
           {/* ========================> 🔚 نهاية التعديل المطلوب 🔚 <======================== */}

           <View style={styles.menuContainer}>
             {/* ========================> ✨ بداية التعديل المطلوب ✨ <======================== */}
             {/* (7) عرض "عضو مميز" أو "الترقية" بناءً على حالة الاشتراك */}
             {isPremium ? (
                <View style={styles.menuItem}>
                    <View style={styles.menuItemContent}>
                        <Icon name="checkmark-circle" size={ICON_SIZE} color={colors.premiumIcon} style={styles.menuIcon} />
                        <Text style={[styles.menuText, { color: colors.premiumIcon, fontWeight: 'bold' }]}>{t('premiumMember')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('PremiumScreen')} activeOpacity={0.6}>
                        <Icon name={I18nManager.isRTL ? "chevron-back-outline" : "chevron-forward-outline"} size={ICON_SIZE - 2} color={currentThemeColors.arrowOnCard} />
                    </TouchableOpacity>
                </View>
             ) : (
                <TouchableOpacity style={styles.menuItem} onPress={handleUpgradePress} activeOpacity={0.6}>
                    <View style={styles.menuItemContent}>
                        <Image source={CROWN_ICON_ASSET} resizeMode="contain" style={[styles.menuIcon, { tintColor: colors.premiumIcon }]} />
                        <Text style={styles.menuText}>{t('upgradeToPremium')}</Text>
                    </View>
                    <Icon name={I18nManager.isRTL ? "chevron-back-outline" : "chevron-forward-outline"} size={ICON_SIZE - 2} color={currentThemeColors.arrowOnCard} />
                </TouchableOpacity>
             )}
             {/* ========================> 🔚 نهاية التعديل المطلوب 🔚 <======================== */}
             
             <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress} activeOpacity={0.6}>
               <View style={styles.menuItemContent}>
                 <Icon name="settings-outline" size={ICON_SIZE} color={currentThemeColors.iconOnCard} style={styles.menuIcon} />
                 <Text style={styles.menuText}>{t('settings')}</Text>
               </View>
               <Icon name={I18nManager.isRTL ? "chevron-back-outline" : "chevron-forward-outline"} size={ICON_SIZE - 2} color={currentThemeColors.arrowOnCard} />
             </TouchableOpacity>

             <TouchableOpacity style={styles.menuItem} onPress={handleAboutPress} activeOpacity={0.6}>
               <View style={styles.menuItemContent}>
                 <Icon name="information-circle-outline" size={ICON_SIZE} color={currentThemeColors.iconOnCard} style={styles.menuIcon} />
                 <Text style={styles.menuText}>{t('aboutApp')}</Text>
               </View>
               <Icon name={I18nManager.isRTL ? "chevron-back-outline" : "chevron-forward-outline"} size={ICON_SIZE - 2} color={currentThemeColors.arrowOnCard} />
             </TouchableOpacity>

             <TouchableOpacity style={styles.menuItem} onPress={handleLogoutPress} activeOpacity={0.6}>
               <View style={styles.menuItemContent}>
                 <Icon name="log-out-outline" size={ICON_SIZE} color={currentThemeColors.logoutText} style={styles.menuIcon} />
                 <Text style={[styles.menuText, styles.logoutText]}>{t('logout')}</Text>
               </View>
               <Icon name={I18nManager.isRTL ? "chevron-back-outline" : "chevron-forward-outline"} size={ICON_SIZE - 2} color={currentThemeColors.arrowOnCard} />
             </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;