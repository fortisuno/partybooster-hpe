/// <reference types="react-native" />
/// <reference types="nativewind" />

import 'nativewind';

// Make className available on all React Native components
type NativeWindClassName = string;

declare module 'react-native' {
  interface ViewProps {
    className?: NativeWindClassName;
  }
  interface TextProps {
    className?: NativeWindClassName;
  }
  interface ScrollViewProps {
    className?: NativeWindClassName;
  }
  interface TouchableOpacityProps {
    className?: NativeWindClassName;
  }
  interface TextInputProps {
    className?: NativeWindClassName;
  }
  interface ImageProps {
    className?: NativeWindClassName;
  }
  interface PressableProps {
    className?: NativeWindClassName;
  }
}