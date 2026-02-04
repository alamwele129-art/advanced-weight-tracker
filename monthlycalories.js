import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// --- الثوابت ---
const CALORIES_PER_STEP = 0.04;
const STEPS_PER_MINUTE = 100;
const STEP_LENGTH_METERS = 0.762;

// --- الترجمة ---
const translations = {
  ar: {
    averageKcal: "متوسط (كالوري)",
    totalKcal: "الإجمالي (كالوري)",
    summaryTitle: "ملخص الشهر",
    calories: "السعرات",
    trends: "الاتجاهات",
    mostActiveTime: "اليوم الأكثر نشاطاً",
    steps: "خطوة",
    distanceUnit: "كم",
    timeUnit: "ساعات",
    noData: "لا توجد بيانات",
    trendHigh: "مرتفع",
    trendLow: "منخفض",
    trendStable: "مستقر",
    averageTooltip: "متوسط:",
  },
  en: {
    averageKcal: "Average (Kcal)",
    totalKcal: "Total (Kcal)",
    summaryTitle: "Monthly Summary",
    calories: "Calories",
    trends: "Trends",
    mostActiveTime: "Most Active Day",
    steps: "Steps",
    distanceUnit: "km",
    timeUnit: "hours",
    noData: "No Data Available",
    trendHigh: "Trending Up",
    trendLow: "Trending Down",
    trendStable: "Stable",
    averageTooltip: "Avg:",
  },
};

// --- دوال مساعدة ---
const formatNumber = (num, lang) => {
    if (num === null || num === undefined) return '';
    const numStr = String(num);
    if (lang === 'ar') {
        const easternNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return numStr.replace(/[0-9.,]/g, (digit) => digit === ',' ? '،' : (digit === '.' ? '٫' : easternNumerals[parseInt(digit)]));
    }
    return numStr;
};

const formatHours = (totalMinutes, lang) => {
    if (isNaN(totalMinutes) || totalMinutes < 0) return formatNumber('0.0', lang);
    const hours = totalMinutes / 60;
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
    return hours.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// --- الثيمات ---
const lightTheme = {
    cardBackground: '#FFFFFF', headerText: '#2e7d32',
    mainText: '#388e3c', secondaryText: '#757575', inactiveBar: '#e0e0e0',
    activeBar: '#66bb6a', selectedBar: '#2E7D32', graphLine: '#eee',
    tooltipBg: '#333333', tooltipText: '#FFFFFF', separator: '#eee',
    icon: '#4caf50', iconCircleBg: '#e8f5e9', arrowColor: '#2e7d32',
    arrowDisabled: '#a5d6a7', detailValueColor: '#424242',
    calorieValueColor: '#388e3c',
};
const darkTheme = {
    cardBackground: '#1E1E1E', headerText: '#E0E0E0',
    mainText: '#80CBC4', secondaryText: '#A0A0A0', inactiveBar: '#3E5052',
    activeBar: '#00796B', selectedBar: '#A7FFEB', graphLine: '#333333',
    tooltipBg: '#E0E0E0', tooltipText: '#121212', separator: '#424242',
    icon: '#80CBC4', iconCircleBg: '#2C2C2C', arrowColor: '#E0E0E0',
    arrowDisabled: '#555555', detailValueColor: '#E0E0E0',
    calorieValueColor: '#80CBC4',
};

// --- مكون الرسم البياني ---
const MonthlyChart = ({ aggregatedData, dateRange, total, average, styles, lang, onPrev, onNext, isNextDisabled, formatNumber, language }) => {
    const [selectedBarIndex, setSelectedBarIndex] = useState(null);
    
    // حساب الحد الأقصى للرسم البياني
    const MAX_CHART_VALUE = useMemo(() => {
        const max = Math.max(...aggregatedData.map(d => d.value), 400);
        return max > 0 ? max : 1; 
    }, [aggregatedData]);

    const yAxisLabels = useMemo(() => Array.from({ length: 5 }, (_, i) => formatNumber(Math.round(MAX_CHART_VALUE - i * (MAX_CHART_VALUE / 4)), language)), [MAX_CHART_VALUE, formatNumber, language]);
    
    const getBarHeight = useCallback((value) => `${Math.min((value / MAX_CHART_VALUE) * 100, 100)}%`, [MAX_CHART_VALUE]);
    const handleBarPress = (index) => setSelectedBarIndex(prev => prev === index ? null : index);
    
    // منطق الأسهم (نفس منطق الصفحة الأسبوعية)
    let leftButtonConfig = {};
    let rightButtonConfig = {};

    if (language === 'ar') {
        leftButtonConfig = { icon: "chevron-forward-outline", action: onPrev, disabled: false };
        rightButtonConfig = { icon: "chevron-back-outline", action: onNext, disabled: isNextDisabled };
    } else {
        leftButtonConfig = { icon: "chevron-back-outline", action: onPrev, disabled: false };
        rightButtonConfig = { icon: "chevron-forward-outline", action: onNext, disabled: isNextDisabled };
    }

    return (
        <View style={styles.chartCard}>
            {/* شريط التنقل */}
            <View style={styles.dateNavigator}>
                <TouchableOpacity onPress={leftButtonConfig.action} disabled={leftButtonConfig.disabled}>
                    <Icon name={leftButtonConfig.icon} size={24} color={leftButtonConfig.disabled ? styles.arrowDisabled.color : styles.arrowColor.color} />
                </TouchableOpacity>

                <Text style={styles.dateText}>{dateRange}</Text>

                <TouchableOpacity onPress={rightButtonConfig.action} disabled={rightButtonConfig.disabled}>
                    <Icon name={rightButtonConfig.icon} size={24} color={rightButtonConfig.disabled ? styles.arrowDisabled.color : styles.arrowColor.color} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardSeparator} />
            
            {/* الملخص الرقمي */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryValue}>{formatNumber(Math.round(average), language)}</Text>
                    <Text style={styles.summaryLabel}>{lang.averageKcal}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryValue}>{formatNumber(Math.round(total), language)}</Text>
                    <Text style={styles.summaryLabel}>{lang.totalKcal}</Text>
                </View>
            </View>

            {/* الرسم البياني */}
             <View style={styles.graphContainer}>
                <View style={styles.yAxis}>
                    {yAxisLabels.map((label, i) => (
                        <Text key={i} style={styles.yAxisLabel}>{label}</Text>
                    ))}
                </View>

                <Pressable style={styles.barsAreaWrapper} onPress={() => setSelectedBarIndex(null)}>
                    <View style={styles.barsArea} collapsable={false}>
                        <View style={styles.bars}>
                            {aggregatedData.map((dataPoint, index) => { 
                                const height = getBarHeight(dataPoint.value); 
                                const isSelected = selectedBarIndex === index; 
                                const hasValue = dataPoint.value > 0; 
                                return ( 
                                    <Pressable 
                                        key={index} 
                                        style={styles.barWrapper} 
                                        onPress={() => handleBarPress(index)} 
                                        disabled={!hasValue}
                                    >
                                        {isSelected && ( 
                                            <View style={[styles.tooltipPositioner, { bottom: height }]}>
                                                <View style={styles.tooltipContainer}>
                                                    <Text style={styles.tooltipValueText}>
                                                        {`${lang.averageTooltip} ${formatNumber(Math.round(dataPoint.value), language)}`}
                                                    </Text>
                                                </View>
                                                <View style={styles.tooltipPointer} />
                                            </View> 
                                        )}
                                        <View style={[
                                            styles.bar, 
                                            { height }, 
                                            isSelected ? styles.selectedBar : (hasValue ? styles.activeBar : styles.inactiveBar)
                                        ]} />
                                    </Pressable> 
                                );
                            })}
                        </View>
                        <View style={styles.xAxis}>
                            {aggregatedData.map((dataPoint, index) => (
                                <Text key={index} style={styles.xAxisLabel}>
                                    {formatNumber(dataPoint.label, language)}
                                </Text>
                            ))}
                        </View>
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

// --- مكونات التفاصيل ---
const StatRow = ({label, value, styles, valueStyle}) => ( 
    <View style={styles.summaryStatRow}>
        <Text style={[styles.detailValueSmall, valueStyle]}>{value}</Text>
        <Text style={styles.summaryStatLabel}>{label}</Text>
    </View> 
);

const MetricBlock = ({iconName, value, unit, styles}) => ( 
    <View style={styles.metricBlock}>
        <View style={styles.metricIconCircle}>
            <Icon name={iconName} size={24} color={styles.metricIconCircle.iconColor} />
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
    </View> 
);

const ActivitySummary = ({ stats, styles, lang, theme, formatNumber, language }) => (
    <>
      <Text style={styles.summaryHeaderTitle}>{lang.summaryTitle}</Text>
      
      <View style={styles.detailsCard}>
          <StatRow 
            label={lang.calories} 
            value={formatNumber(Math.round(stats.totalCalories), language)} 
            styles={styles} 
            valueStyle={styles.calorieValue} 
          />
          <View style={styles.divider} />
          <StatRow 
            label={lang.trends} 
            value={stats.trendText} 
            styles={styles} 
            valueStyle={{ color: theme.mainText, fontWeight: 'bold' }}
          />
          <View style={styles.divider} />
          <StatRow 
            label={lang.mostActiveTime} 
            value={stats.mostActiveDayText} 
            styles={styles} 
            valueStyle={{ color: theme.mainText, fontWeight: 'bold' }} 
          />
      </View>

      <View style={[styles.card, styles.metricsCard]}>
          <MetricBlock iconName="walk-outline" value={formatNumber(Math.round(stats.totalSteps), language)} unit={lang.steps} styles={styles} />
          <MetricBlock iconName="location-outline" value={formatNumber(stats.distance.toFixed(1), language)} unit={lang.distanceUnit} styles={styles} />
          <MetricBlock iconName="time-outline" value={stats.duration} unit={lang.timeUnit} styles={styles} />
      </View>
    </>
);

// --- المكون الرئيسي (يعتمد الآن على Props من الأب) ---
const MonthlyCalories = ({ 
    monthlyData = [], 
    formattedMonthRange, 
    onPreviousMonth, 
    onNextMonth, 
    isCurrentMonth, // يستخدم لتحديد هل الزر "التالي" مفعل أم لا
    language = 'ar', 
    isDarkMode = false 
}) => {
    
    const theme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);
    const lang = useMemo(() => translations[language] || translations.ar, [language]);
    const styles = useMemo(() => getStyles(theme, language), [theme, language]);

    // معالجة البيانات القادمة من الأب (monthlyData يحتوي على السعرات اليومية)
    const statsForMonth = useMemo(() => {
        if (!monthlyData || monthlyData.length === 0) return null;

        const totalCalories = monthlyData.reduce((sum, val) => sum + (val || 0), 0);
        
        // استنتاج الخطوات والمسافة من السعرات (للعرض فقط)
        // Steps = Calories / 0.04
        const totalSteps = totalCalories > 0 ? totalCalories / CALORIES_PER_STEP : 0;
        
        const activeDays = monthlyData.filter(val => val > 0);
        const averageCalories = activeDays.length > 0 ? totalCalories / activeDays.length : 0;
        
        // تجميع البيانات للرسم البياني (كل 5 أيام مثلاً)
        const aggregatedChartData = []; 
        const chunkSize = Math.ceil(monthlyData.length / 6); // تقسيم الشهر لـ 6 أعمدة تقريباً
        
        for (let i = 0; i < monthlyData.length; i += chunkSize) { 
            const chunk = monthlyData.slice(i, i + chunkSize); 
            // التسمية (من يوم كذا)
            const chunkLabel = (i + 1).toString();
            
            const chunkActiveDays = chunk.filter(v => v > 0); 
            let avgVal = 0; 
            if (chunkActiveDays.length > 0) { 
                avgVal = chunkActiveDays.reduce((acc, val) => acc + val, 0) / chunkActiveDays.length; 
            } 
            aggregatedChartData.push({ label: chunkLabel, value: avgVal }); 
        }

        // حساب اليوم الأكثر نشاطاً
        const maxCalories = Math.max(...monthlyData);
        let mostActiveDayText = lang.noData;
        
        // ملاحظة: بما أن monthlyData مصفوفة أرقام فقط، لا نملك التاريخ الدقيق لليوم هنا بسهولة
        // لكن يمكننا عرض قيمة اليوم الأعلى كبديل أو اليوم رقم كذا
        if (maxCalories > 0) {
            const dayIndex = monthlyData.indexOf(maxCalories);
            mostActiveDayText = `${lang.averageTooltip} ${dayIndex + 1}`; // مثال: يوم 15
        }

        return { 
            totalCalories, 
            averageCalories, 
            aggregatedChartData, 
            totalSteps, 
            distance: (totalSteps * STEP_LENGTH_METERS) / 1000, 
            duration: formatHours(totalSteps / STEPS_PER_MINUTE, language), 
            mostActiveDayText, 
            trendText: lang.trendStable // يمكن تحسينه إذا مرر الأب بيانات الشهر السابق
        };
    }, [monthlyData, lang, language]);

    if (!statsForMonth) { 
        return (
            <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.secondaryText }}>{lang.noData}</Text>
            </View>
        ); 
    }
    
    // ملاحظة: نستخدم View بدلاً من ScrollView لأن الأب (CaloriesScreen) لديه ScrollView بالفعل
    return (
        <View style={styles.mainContainer}>
            <MonthlyChart 
                aggregatedData={statsForMonth.aggregatedChartData} 
                dateRange={formattedMonthRange} 
                total={statsForMonth.totalCalories} 
                average={statsForMonth.averageCalories} 
                styles={styles} 
                lang={lang} 
                onPrev={onPreviousMonth} 
                onNext={onNextMonth} 
                isNextDisabled={isCurrentMonth}
                formatNumber={formatNumber}
                language={language}
            />
            <ActivitySummary 
                stats={statsForMonth} 
                styles={styles} 
                lang={lang} 
                theme={theme}
                formatNumber={formatNumber}
                language={language}
            />
        </View>
    );
};

// --- الأنماط ---
const getStyles = (theme, language) => StyleSheet.create({
    // تم حذف safeArea لأنه مكون داخلي الآن
    mainContainer: { padding: 15, paddingBottom: 20 },
    
    card: { backgroundColor: theme.cardBackground, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 5, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    chartCard: { backgroundColor: theme.cardBackground, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, overflow: 'visible' }, // overflow visible للمساعدة في ظهور الـ tooltip
    
    // شريط التنقل (ثابت row)
    dateNavigator: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 15, 
        paddingBottom: 10 
    },
    dateText: { fontSize: 18, fontWeight: 'bold', color: theme.headerText },
    arrowColor: { color: theme.arrowColor },
    arrowDisabled: { color: theme.arrowDisabled },
    cardSeparator: { height: 1, backgroundColor: theme.separator, marginHorizontal: 15 },
    
    // ملخص (يمين/يسار حسب اللغة)
    summaryContainer: { 
        flexDirection: language === 'ar' ? 'row-reverse' : 'row-reverse', // موحد
        justifyContent: 'space-around', 
        paddingVertical: 20 
    },
    summaryBox: { alignItems: 'center', flex:1 },
    summaryValue: { fontSize: 32, fontWeight: 'bold', color: theme.mainText, fontVariant: ['tabular-nums'] },
    summaryLabel: { fontSize: 14, color: theme.secondaryText, marginTop: 4, textAlign:'center' },
    
    // الرسم البياني (ثابت row)
    graphContainer: { 
        flexDirection: 'row', 
        paddingHorizontal: 15, 
        paddingTop: 10, 
        paddingBottom: 10, 
        height: 300, 
        alignItems: 'stretch'
    },
    
    yAxis: { 
        width: 35, 
        justifyContent: 'space-between', 
        paddingLeft: language === 'ar' ? 8 : 0, 
        paddingRight: language === 'ar' ? 0 : 8, 
        height: '100%', 
        paddingBottom: 25, 
        alignItems: language === 'ar' ? 'flex-end' : 'flex-start' 
    },
    yAxisLabel: { fontSize: 11, color: theme.secondaryText },
    
    barsAreaWrapper: { flex: 1, marginHorizontal: 5 },
    barsArea: { flex: 1, borderBottomWidth: 1, borderBottomColor: theme.graphLine, position: 'relative', marginBottom: 25 },
    
    bars: { 
        position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, 
        flexDirection: language === 'ar' ? 'row' : 'row', // عكسنا الاتجاه للعربي لتبدأ الأيام من اليمين
        justifyContent: 'space-around', alignItems: 'flex-end', paddingHorizontal: '2%' 
    },
    barWrapper: { width: '14%', height: '100%', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' },
    bar: { width: 12, borderTopLeftRadius: 6, borderTopRightRadius: 6 }, 
    inactiveBar: { backgroundColor: theme.inactiveBar, height: 2, minHeight: 2 },
    activeBar: { backgroundColor: theme.activeBar, minHeight: 2, }, 
    selectedBar: { backgroundColor: theme.selectedBar, minHeight: 2, },
    
    xAxis: { 
        position: 'absolute', bottom: -25, left: 0, right: 0, height: 20, 
        flexDirection: language === 'ar' ? 'row' : 'row', 
        justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: '2%' 
    },
    xAxisLabel: { fontSize: 11, color: theme.secondaryText, textAlign: 'center', flex:1, fontWeight: '500' },
    
    // إصلاح الـ Tooltip
    tooltipPositioner: { 
        position: 'absolute', 
        alignItems: 'center', 
        zIndex: 10, 
        marginBottom: 5, 
        left: '50%', 
        marginLeft: -45, // بدلاً من translate
    },
    tooltipContainer: { backgroundColor: theme.tooltipBg, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, minWidth: 90, alignItems: 'center' },
    tooltipValueText: { color: theme.tooltipText, fontSize: 13, fontWeight: 'bold'},
    tooltipPointer: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6, borderStyle: 'solid', backgroundColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: theme.tooltipBg, marginTop: -1 },
    
    summaryHeaderTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: theme.headerText, 
        marginBottom: 15, 
        width: '100%', 
        textAlign: language === 'ar' ? 'left' : 'left' 
    },
    
    detailsCard: { backgroundColor: theme.cardBackground, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    
    summaryStatRow: { 
        flexDirection: language === 'ar' ? 'row-reverse' : 'row-reverse', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 16, 
    },
    summaryStatLabel: { fontSize: 14, color: theme.secondaryText, },
    detailValueSmall: { fontSize: 14, color: theme.detailValueColor, fontWeight: '500', textAlign: language === 'ar' ? 'left' : 'right', },
    calorieValue: { color: theme.calorieValueColor, fontWeight: 'bold', fontSize: 16, },
    divider: { height: 1, backgroundColor: theme.separator, marginHorizontal: -20, },
    
    metricsCard: { 
        flexDirection: language === 'ar' ? 'row' : 'row-reverse', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        paddingVertical: 15, 
    },
    metricBlock: { alignItems: 'center', flex: 1 },
    metricIconCircle: { backgroundColor: theme.iconCircleBg, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 10, iconColor: theme.icon },
    metricValue: { fontSize: 22, fontWeight: 'bold', color: theme.mainText, fontVariant: ['tabular-nums'] },
    metricUnit: { fontSize: 14, color: theme.secondaryText, marginTop: 2 },
});

export default MonthlyCalories;