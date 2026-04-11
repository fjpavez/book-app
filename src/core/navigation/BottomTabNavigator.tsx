import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from './types';
import { LibraryScreen } from '@features/library/LibraryScreen';
import { SettingsScreen } from '@features/settings/SettingsScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Biblioteca' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Tab.Navigator>
  );
}
