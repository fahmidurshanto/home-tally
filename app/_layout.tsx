import '../global.css';
import { AppProviders } from '../context/AppProviders';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
