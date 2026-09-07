import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { MarketplaceProvider } from './src/hooks/useMarketplace';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <MarketplaceProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </MarketplaceProvider>
    </SafeAreaProvider>
  );
}