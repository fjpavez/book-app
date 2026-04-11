import { NavigatorScreenParams } from '@react-navigation/native';

export type LibraryTabParamList = {
  LibraryHome: undefined;
  CollectionDetail: { collectionId: string };
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>;
  Reader: { bookId: string };
};

export type BottomTabParamList = {
  Library: NavigatorScreenParams<LibraryTabParamList>;
  Settings: undefined;
};
