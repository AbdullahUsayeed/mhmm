import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { GlobePhoto } from '../hooks/usePhotos';

interface GlobeViewProps {
  photos: GlobePhoto[];
  onPhotoTap: (id: string) => void;
  onReady?: () => void;
}

let cachedHtmlUri: string | null = null;

async function getGlobeUri(): Promise<string> {
  if (cachedHtmlUri) return cachedHtmlUri;
  const asset = Asset.fromModule(require('../assets/globe.html'));
  await asset.downloadAsync();
  cachedHtmlUri = asset.localUri || asset.uri;
  return cachedHtmlUri;
}

export default function GlobeView({ photos, onPhotoTap, onReady }: GlobeViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [htmlUri, setHtmlUri] = React.useState<string | null>(null);

  useEffect(() => {
    getGlobeUri().then(setHtmlUri);
  }, []);

  const sendPhotos = useCallback(
    (photosList: GlobePhoto[]) => {
      if (photosList.length > 0) {
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'setPhotos', photos: photosList })
        );
      }
    },
    []
  );

  useEffect(() => {
    if (htmlUri) {
      setTimeout(() => sendPhotos(photos), 500);
    }
  }, [photos, htmlUri, sendPhotos]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'photoTap') {
          onPhotoTap(data.id);
        }
      } catch (e) {}
    },
    [onPhotoTap]
  );

  if (!htmlUri) return null;

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: htmlUri }}
      style={styles.webview}
      onMessage={handleMessage}
      onLoadEnd={onReady}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      originWhitelist={['*']}
      mixedContentMode="always"
      allowFileAccess
      allowUniversalAccessFromFileURLs
      cacheEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#1a001a',
  },
});
