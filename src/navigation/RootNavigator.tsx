import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ShopTabsParamList, MarketplaceStackParamList } from './types';
import { TopBrandsScreen, NearbyStoresScreen } from '../screens/ShopPlaceholders';
import { MarketplaceListScreen } from '../screens/MarketplaceListScreen';
import { MarketplaceDetailScreen } from '../screens/MarketplaceDetailScreen';
import { MarketplaceConfirmationScreen } from '../screens/MarketplaceConfirmationScreen';
import { colors, shadows } from '../theme';

const Tab = createBottomTabNavigator<ShopTabsParamList>();
const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

const MarketplaceStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MarketplaceList" component={MarketplaceListScreen} />
    <Stack.Screen name="MarketplaceDetail" component={MarketplaceDetailScreen} />
    <Stack.Screen
      name="MarketplaceConfirmation"
      component={MarketplaceConfirmationScreen}
    />
  </Stack.Navigator>
);

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ emoji, label, focused }) => (
  <View style={styles.tabIcon}>
    <View
      style={[
        styles.iconBubble,
        focused && styles.iconBubbleActive,
      ]}
    >
      <Text style={[styles.icon, focused && { transform: [{ scale: 1.05 }] }]}>
        {emoji}
      </Text>
    </View>
    <Text
      style={[styles.label, focused && { color: colors.primary, fontWeight: '800' }]}
    >
      {label}
    </Text>
  </View>
);

export const RootNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
    }}
  >
    <Tab.Screen
      name="TopBrands"
      component={TopBrandsScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="🏷️" label="Top Brands" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="NearbyStores"
      component={NearbyStoresScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="📍" label="Nearby" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Marketplace"
      component={MarketplaceStackNavigator}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="🛒" label="1Fi Market" focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.borderSubtle,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    ...shadows.card,
  },
  tabIcon: { alignItems: 'center', justifyContent: 'center' },
  iconBubble: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconBubbleActive: {
    backgroundColor: colors.primaryFaint,
  },
  icon: { fontSize: 22 },
  label: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
});