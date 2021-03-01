import * as Updates from 'expo-updates'
import { useEffect, useRef, useState } from 'react'
import { Alert, AppState } from 'react-native'

// Update app Over The Fly(OTA) when app publish an update
// get the updated version of App when App appear from Background to Foreground
// Then To show an alert to reload the App to refreshed 

const useAppUpdater = () => {
  const [updated, setUpdated] = useState(false)
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  const updateApp = async () => {
    try {
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync()
        setUpdated(true)
      } else {
        setUpdated(false)
      }
    } catch (e) {
      console.log('error :>> ', e)
    }
  }

  const reloadApp = () => {
    Alert.alert(
      'UPDATE',
      'RELOAD_TO_REFRESH',
      [
        {
          text: 'LATER',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            setUpdated(false)
            Updates.reloadAsync()
          }
        }
      ],
      { cancelable: false }
    )
  }

  const handleAppStateChange = (nextAppState: any) => {
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      updateApp()
    }
    appState.current = nextAppState
    setAppStateVisible(appState.current)
  }

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)

    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
    }
  }, [])

  useEffect(() => {
    if (updated && appStateVisible === 'active') {
      reloadApp()
    }
  }, [updated, appStateVisible])

  return { updated, reloadApp }
}

export default useAppUpdater
