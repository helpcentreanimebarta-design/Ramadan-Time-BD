/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './context/AppContext';
import MainScreen from './screens/MainScreen';

export default function App() {
  return (
    <AppProvider>
      <MainScreen />
    </AppProvider>
  );
}
