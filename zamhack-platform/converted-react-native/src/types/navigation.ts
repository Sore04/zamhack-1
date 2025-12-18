import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  AdminDashboard: undefined;
  Dashboard: undefined;
  HackathonDetails: undefined;
  Home: undefined;
  Judging: undefined;
  Login: undefined;
  Profile: undefined;
  Registration: undefined;
  Submission: undefined;
  Team: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}